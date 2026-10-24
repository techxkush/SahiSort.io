import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getAdminDb } from "./admin";

export interface JourneyLog {
  id: string;
  user_id: string;
  discovery_id?: string;
  project_id?: string;
  kind:
    | "discovered"
    | "answered"
    | "corrected"
    | "disposal_computed"
    | "disposal_confirmed"
    | "projects_generated"
    | "step_progress"
    | "project_completed"
    | "saved";
  title: string;
  detail: string;
  created_at: string;
}

export interface DiscoveryDoc {
  id: string;
  user_id: string;
  object_name: string;
  description: string | null;
  image_data: string | null;
  analysis: unknown;
  answers: Record<string, string>;
  disposal: unknown | null;
  disposal_stale: boolean;
  disposal_confirmed_at: string | null;
  saved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectDoc {
  id: string;
  user_id: string;
  discovery_id: string;
  title: string;
  data: unknown;
  completed_steps?: number[];
  completed_at: string | null;
  saved: boolean;
  created_at: string;
  updated_at: string;
}

// Local file-backed storage fallback when GCP service account credentials aren't yet passed in .env
interface LocalStore {
  discoveries: Record<string, DiscoveryDoc>;
  projects: Record<string, ProjectDoc>;
  journeys: Record<string, JourneyLog>;
}

const STORE_DIR = path.resolve(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "sahisort_store.json");

function readLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[Store] Error reading local store:", err);
  }
  return { discoveries: {}, projects: {}, journeys: {} };
}

function writeLocalStore(store: LocalStore) {
  try {
    if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("[Store] Error writing local store:", err);
  }
}

function hasCloudFirestore(): boolean {
  return !!(
    (process.env["FIREBASE_CLIENT_EMAIL"] && process.env["FIREBASE_PRIVATE_KEY"]) ||
    process.env["GOOGLE_APPLICATION_CREDENTIALS"] ||
    process.env["FIRESTORE_EMULATOR_HOST"]
  );
}

export const dbService = {
  async addJourneyLog(entry: Omit<JourneyLog, "id" | "created_at">): Promise<JourneyLog> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const log: JourneyLog = { ...entry, id, created_at };

    if (hasCloudFirestore()) {
      try {
        const firestore = getAdminDb();
        await firestore.collection("journeys").doc(id).set(log);
        return log;
      } catch (e) {
        console.warn("[Firestore] Failed to write journey log, falling back to local store:", e);
      }
    }

    const store = readLocalStore();
    store.journeys[id] = log;
    writeLocalStore(store);
    return log;
  },

  async listJourneyLogs(userId: string): Promise<JourneyLog[]> {
    if (hasCloudFirestore()) {
      try {
        const firestore = getAdminDb();
        const snap = await firestore.collection("journeys").where("user_id", "==", userId).get();
        const logs = snap.docs.map((d) => d.data() as JourneyLog);
        return logs.sort((a, b) => b.created_at.localeCompare(a.created_at));
      } catch (e) {
        console.warn("[Firestore] Failed to read journey logs, falling back to local store:", e);
      }
    }

    const store = readLocalStore();
    return Object.values(store.journeys)
      .filter((j) => j.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async createDiscovery(data: {
    userId: string;
    objectName: string;
    description: string | null;
    imageData: string | null;
    analysis: unknown;
  }): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const discovery: DiscoveryDoc = {
      id,
      user_id: data.userId,
      object_name: data.objectName,
      description: data.description,
      image_data: data.imageData,
      analysis: data.analysis,
      answers: {},
      disposal: null,
      disposal_stale: false,
      disposal_confirmed_at: null,
      saved: false,
      created_at: now,
      updated_at: now,
    };

    if (hasCloudFirestore()) {
      try {
        const firestore = getAdminDb();
        await firestore.collection("discoveries").doc(id).set(discovery);
      } catch (e) {
        console.warn("[Firestore] createDiscovery fallback:", e);
        const store = readLocalStore();
        store.discoveries[id] = discovery;
        writeLocalStore(store);
      }
    } else {
      const store = readLocalStore();
      store.discoveries[id] = discovery;
      writeLocalStore(store);
    }

    // Record journey entry
    await this.addJourneyLog({
      user_id: data.userId,
      discovery_id: id,
      kind: "discovered",
      title: `Discovered "${data.objectName}"`,
      detail: data.description || "Uploaded photo for material intelligence",
    });

    return id;
  },

  async getDiscovery(
    id: string,
    userId: string,
  ): Promise<{ discovery: DiscoveryDoc; projects: ProjectDoc[] }> {
    let discovery: DiscoveryDoc | null = null;
    let projects: ProjectDoc[] = [];

    if (hasCloudFirestore()) {
      try {
        const firestore = getAdminDb();
        const docSnap = await firestore.collection("discoveries").doc(id).get();
        if (docSnap.exists) {
          discovery = docSnap.data() as DiscoveryDoc;
        }
        const projSnap = await firestore
          .collection("projects")
          .where("discovery_id", "==", id)
          .get();
        projects = projSnap.docs.map((d) => d.data() as ProjectDoc);
      } catch (e) {
        console.warn("[Firestore] getDiscovery fallback:", e);
      }
    }

    if (!discovery) {
      const store = readLocalStore();
      discovery = store.discoveries[id] || null;
      projects = Object.values(store.projects).filter((p) => p.discovery_id === id);
    }

    if (!discovery) throw new Error("Discovery not found");

    projects.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { discovery, projects };
  },

  async refineDiscovery(data: {
    id: string;
    userId: string;
    analysis: unknown;
    objectName: string;
    answers: Record<string, string>;
    correction: string | null;
    disposalStale: boolean;
  }): Promise<void> {
    const now = new Date().toISOString();
    const patch = {
      analysis: data.analysis,
      object_name: data.objectName,
      answers: data.answers,
      disposal_stale: data.disposalStale,
      updated_at: now,
    };

    if (hasCloudFirestore()) {
      try {
        const firestore = getAdminDb();
        await firestore.collection("discoveries").doc(data.id).update(patch);
      } catch (e) {
        console.warn("[Firestore] refineDiscovery fallback:", e);
        const store = readLocalStore();
        if (store.discoveries[data.id]) {
          Object.assign(store.discoveries[data.id], patch);
          writeLocalStore(store);
        }
      }
    } else {
      const store = readLocalStore();
      if (store.discoveries[data.id]) {
        Object.assign(store.discoveries[data.id], patch);
        writeLocalStore(store);
      }
    }

    if (data.correction) {
      await this.addJourneyLog({
        user_id: data.userId,
        discovery_id: data.id,
        kind: "corrected",
        title: `Corrected identification of "${data.objectName}"`,
        detail: `User correction: "${data.correction}"`,
      });
    }

    const answerCount = Object.keys(data.answers).length;
    if (answerCount > 0 && !data.correction) {
      await this.addJourneyLog({
        user_id: data.userId,
        discovery_id: data.id,
        kind: "answered",
        title: `Answered clarifying questions for "${data.objectName}"`,
        detail: Object.values(data.answers).join(" • "),
      });
    }
  },

  async updateDisposal(data: { id: string; userId: string; disposal: unknown }): Promise<void> {
    const now = new Date().toISOString();
    const patch = {
      disposal: data.disposal,
      disposal_stale: false,
      updated_at: now,
    };

    if (hasCloudFirestore()) {
      try {
        const firestore = getAdminDb();
        await firestore.collection("discoveries").doc(data.id).update(patch);
      } catch (e) {
        console.warn("[Firestore] updateDisposal fallback:", e);
        const store = readLocalStore();
        if (store.discoveries[data.id]) {
          Object.assign(store.discoveries[data.id], patch);
          writeLocalStore(store);
        }
      }
    } else {
      const store = readLocalStore();
      if (store.discoveries[data.id]) {
        Object.assign(store.discoveries[data.id], patch);
        writeLocalStore(store);
      }
    }
  },

  async createProjects(data: {
    userId: string;
    discoveryId: string;
    objectName: string;
    projects: { title: string; data: unknown }[];
    prefs: unknown;
  }): Promise<number> {
    const now = new Date().toISOString();
    const docs: ProjectDoc[] = data.projects.map((p) => ({
      id: crypto.randomUUID(),
      user_id: data.userId,
      discovery_id: data.discoveryId,
      title: p.title,
      data: p.data,
      completed_steps: [],
      completed_at: null,
      saved: false,
      created_at: now,
      updated_at: now,
    }));

    if (hasCloudFirestore()) {
      try {
        const firestore = getAdminDb();
        const batch = firestore.batch();
        for (const doc of docs) {
          batch.set(firestore.collection("projects").doc(doc.id), doc);
        }
        await batch.commit();
      } catch (e) {
        console.warn("[Firestore] createProjects fallback:", e);
        const store = readLocalStore();
        for (const doc of docs) store.projects[doc.id] = doc;
        writeLocalStore(store);
      }
    } else {
      const store = readLocalStore();
      for (const doc of docs) store.projects[doc.id] = doc;
      writeLocalStore(store);
    }

    const prefsObj = data.prefs as { time?: string; difficulty?: string; tools?: string };
    await this.addJourneyLog({
      user_id: data.userId,
      discovery_id: data.discoveryId,
      kind: "projects_generated",
      title: `Drafted ${docs.length} reuse projects for "${data.objectName}"`,
      detail: `Time: ${prefsObj?.time || "Any"} • Difficulty: ${prefsObj?.difficulty || "Any"} • Tools: ${prefsObj?.tools || "Standard"}`,
    });

    return docs.length;
  },

  async getProject(
    id: string,
  ): Promise<
    ProjectDoc & { discoveries?: { id: string; object_name: string; image_data: string | null } }
  > {
    let project: ProjectDoc | null = null;
    let discovery: DiscoveryDoc | null = null;

    if (hasCloudFirestore()) {
      try {
        const firestore = getAdminDb();
        const pSnap = await firestore.collection("projects").doc(id).get();
        if (pSnap.exists) {
          project = pSnap.data() as ProjectDoc;
          const dSnap = await firestore.collection("discoveries").doc(project.discovery_id).get();
          if (dSnap.exists) discovery = dSnap.data() as DiscoveryDoc;
        }
      } catch (e) {
        console.warn("[Firestore] getProject fallback:", e);
      }
    }

    if (!project) {
      const store = readLocalStore();
      project = store.projects[id] || null;
      if (project) {
        discovery = store.discoveries[project.discovery_id] || null;
      }
    }

    if (!project) throw new Error("Project not found");

    return {
      ...project,
      discoveries: discovery
        ? {
            id: discovery.id,
            object_name: discovery.object_name,
            image_data: discovery.image_data,
          }
        : undefined,
    };
  },

  async listMine(userId: string): Promise<{
    discoveries: DiscoveryDoc[];
    projects: ProjectDoc[];
  }> {
    let discoveries: DiscoveryDoc[] = [];
    let projects: ProjectDoc[] = [];

    if (hasCloudFirestore()) {
      try {
        const firestore = getAdminDb();
        const [dSnap, pSnap] = await Promise.all([
          firestore.collection("discoveries").where("user_id", "==", userId).get(),
          firestore.collection("projects").where("user_id", "==", userId).get(),
        ]);
        discoveries = dSnap.docs.map((d) => d.data() as DiscoveryDoc);
        projects = pSnap.docs.map((p) => p.data() as ProjectDoc);
      } catch (e) {
        console.warn("[Firestore] listMine fallback:", e);
      }
    }

    if (discoveries.length === 0 && projects.length === 0) {
      const store = readLocalStore();
      discoveries = Object.values(store.discoveries).filter((d) => d.user_id === userId);
      projects = Object.values(store.projects).filter((p) => p.user_id === userId);
    }

    discoveries.sort((a, b) => b.created_at.localeCompare(a.created_at));
    projects.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return { discoveries, projects };
  },

  async updateFlags(data: {
    userId: string;
    table: "discoveries" | "projects";
    id: string;
    saved?: boolean;
    confirmDisposal?: boolean;
    completed?: boolean;
    completedSteps?: number[];
  }): Promise<void> {
    const now = new Date().toISOString();

    if (data.table === "discoveries") {
      const patch: Partial<DiscoveryDoc> = { updated_at: now };
      if (data.saved !== undefined) patch.saved = data.saved;
      if (data.confirmDisposal !== undefined) {
        patch.disposal_confirmed_at = data.confirmDisposal ? now : null;
      }

      if (hasCloudFirestore()) {
        try {
          const firestore = getAdminDb();
          await firestore.collection("discoveries").doc(data.id).update(patch);
        } catch (e) {
          console.warn("[Firestore] updateFlags discoveries fallback:", e);
          const store = readLocalStore();
          if (store.discoveries[data.id]) {
            Object.assign(store.discoveries[data.id], patch);
            writeLocalStore(store);
          }
        }
      } else {
        const store = readLocalStore();
        if (store.discoveries[data.id]) {
          Object.assign(store.discoveries[data.id], patch);
          writeLocalStore(store);
        }
      }

      if (data.confirmDisposal) {
        const store = readLocalStore();
        const objName = store.discoveries[data.id]?.object_name || "item";
        await this.addJourneyLog({
          user_id: data.userId,
          discovery_id: data.id,
          kind: "disposal_confirmed",
          title: `Followed disposal guidance for "${objName}"`,
          detail: `Confirmed responsible sorting and disposal according to verified guidelines`,
        });
      }
    } else {
      const patch: Partial<ProjectDoc> = { updated_at: now };
      if (data.saved !== undefined) patch.saved = data.saved;
      if (data.completed !== undefined) {
        patch.completed_at = data.completed ? now : null;
      }
      if (data.completedSteps !== undefined) {
        patch.completed_steps = data.completedSteps;
      }

      if (hasCloudFirestore()) {
        try {
          const firestore = getAdminDb();
          await firestore.collection("projects").doc(data.id).update(patch);
        } catch (e) {
          console.warn("[Firestore] updateFlags projects fallback:", e);
          const store = readLocalStore();
          if (store.projects[data.id]) {
            Object.assign(store.projects[data.id], patch);
            writeLocalStore(store);
          }
        }
      } else {
        const store = readLocalStore();
        if (store.projects[data.id]) {
          Object.assign(store.projects[data.id], patch);
          writeLocalStore(store);
        }
      }

      if (data.completed) {
        const store = readLocalStore();
        const title = store.projects[data.id]?.title || "project";
        await this.addJourneyLog({
          user_id: data.userId,
          project_id: data.id,
          kind: "project_completed",
          title: `Completed RE:CREATE project "${title}"`,
          detail: `Successfully repurposed object into a new creation!`,
        });
      }
    }
  },
};
