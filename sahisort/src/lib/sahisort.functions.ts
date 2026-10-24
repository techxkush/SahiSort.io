import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ModelMessage } from "ai";
import { requireFirebaseAuth } from "@/integrations/firebase/auth-middleware";
import { dbService } from "@/integrations/firebase/db.server";
import {
  analysisSchema,
  disposalAiSchema,
  projectsSchema,
  recreatePrefsSchema,
  type Analysis,
  type Disposal,
} from "./schemas";

type Answers = Record<string, string>;

const ANALYSE_SYSTEM = `You are SahiSort's object-intelligence engine. Identify an everyday object from a photo and/or description.
Rules:
- "observations" are only things visibly present or explicitly stated. Never state polymer types, alloys, or coatings as observed unless a label is visible.
- Materials: basis "observed" only when visible/label-confirmed; "inferred" for appearance-based guesses; "user_confirmed" when the user's answers or correction state it.
- Ask questions ONLY when the answer would materially change disposal or reuse (e.g. resin code, contamination, detachable parts, damage, batteries inside). Max 3. Give 2-4 short options each. Return [] when information is sufficient. Never re-ask answered questions.
- If you cannot identify the object, set identifiable=false and ask for what is missing.
- reuse_safe=false for items that are unsafe to repurpose (batteries, medicines, chemicals, broken glass with sharp edges, mercury bulbs, food-contact reuse of degraded plastics). Explain briefly.
- Use plain language. Do not give numeric confidence scores.`;

async function aiDeps() {
  const { runStructured } = await import("./ai.server");
  return runStructured;
}

function buildAnalyseMessages(input: {
  description?: string | null;
  image?: string | null;
  answers: Answers;
  correction?: string | null;
}): ModelMessage[] {
  const text = [
    input.description ? `User description: ${input.description}` : "No description given.",
    input.correction ? `USER CORRECTION (authoritative): ${input.correction}` : "",
    Object.keys(input.answers).length
      ? `Answers to earlier questions (authoritative): ${JSON.stringify(input.answers)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  const content: Exclude<ModelMessage["content"], string> = [{ type: "text", text }] as never;
  if (input.image)
    (content as unknown[]).push({
      type: "image",
      image: new URL(input.image),
    });
  return [{ role: "user", content } as ModelMessage];
}

export const analyseObject = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        description: z.string().max(1000).nullable(),
        image: z.string().startsWith("data:image/").max(4_000_000).nullable(),
      })
      .refine(
        (v) => v.image || (v.description && v.description.trim().length > 2),
        "Add a photo or a description.",
      )
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const run = await aiDeps();
    const analysis = await run(
      analysisSchema,
      ANALYSE_SYSTEM,
      buildAnalyseMessages({ ...data, answers: {} }),
    );

    const id = await dbService.createDiscovery({
      userId: context.userId,
      description: data.description,
      imageData: data.image,
      objectName: analysis.object_name,
      analysis,
    });

    return { id };
  });

/** Apply answers or a correction, re-run analysis, and mark dependent results stale. */
export const refineDiscovery = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().min(1),
        answers: z.record(z.string(), z.string().max(300)),
        correction: z.string().max(500).nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { discovery: disc } = await dbService.getDiscovery(data.id, context.userId);
    const answers = { ...(disc.answers as Answers), ...data.answers };
    if (data.correction) answers["correction"] = data.correction;

    const run = await aiDeps();
    const analysis = await run(
      analysisSchema,
      ANALYSE_SYSTEM,
      buildAnalyseMessages({
        description: disc.description,
        image: disc.image_data,
        answers,
        correction: data.correction,
      }),
    );

    await dbService.refineDiscovery({
      id: data.id,
      userId: context.userId,
      analysis,
      objectName: analysis.object_name,
      answers,
      correction: data.correction,
      disposalStale: disc.disposal != null,
    });

    return { ok: true };
  });

const DISPOSAL_SYSTEM = `You are SahiSort's evidence-assisted disposal reasoner.
You receive an object analysis and a set of GUIDE PASSAGES (with ids). Base the recommendation ONLY on these passages.
- status "verified": passages clearly cover this material and conditions, and no open question changes the outcome.
- status "conditional": the outcome depends on an unresolved question or a condition (e.g. clean vs contaminated).
- status "insufficient": passages do not adequately cover the item.
- Cite passage ids only in the citations array — never write ids or brackets in prose fields. Never invent passages, rules, facilities, schedules or collection services.
- The guide is national-level; do not claim municipal specifics. Add that to limitations when relevant.
- general_advice: optional general (non-guide) tips, clearly general. Keep everything concise and plain.`;

export const computeDisposal = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { buildQuery, retrieveScored, MIN_RETRIEVAL_SCORE, GUIDE } = await import(
      "./guide"
    );
    const { validateDisposal } = await import("./disposal-rules");
    const { discovery: disc } = await dbService.getDiscovery(data.id, context.userId);

    const analysis = disc.analysis as unknown as Analysis;
    const answers = disc.answers as Answers;
    const query = buildQuery([
      analysis.object_name,
      ...analysis.materials.map((m) => `${m.component} ${m.material}`),
      ...Object.values(answers),
    ]);

    const scored = retrieveScored(query);
    const qualifying = scored.filter((s) => s.score >= MIN_RETRIEVAL_SCORE);

    // If retrieval returns no passage above MIN_RETRIEVAL_SCORE, skip the LLM call entirely
    if (qualifying.length === 0) {
      const disposal: Disposal = {
        status: "not_covered",
        category: "Not covered by this guide",
        explanation:
          "Not covered by this guide. No statutory rule or campus directive in this guide covers this item. Please contact your local municipal ward office or campus facilities management for specialized disposal instructions.",
        preparation: [],
        conditions: [],
        exceptions: [],
        limitations: ["Item not covered by current local or national guide rules"],
        citations: [],
        missing_information: [
          "Item or material is outside the scope of current waste guide",
        ],
        general_advice:
          "Contact your local municipal body or campus waste management authority.",
        evidence: [],
        query,
        downgraded_reason: "Not covered by this guide",
        generated_at: new Date().toISOString(),
      };

      await dbService.updateDisposal({
        id: data.id,
        userId: context.userId,
        disposal,
      });

      return { ok: true };
    }

    const passages = qualifying.slice(0, 5).map((s) => s.p);
    const seg = GUIDE.find((p) => p.id === "swm-segregation");
    if (seg && !passages.some((p) => p.id === seg.id)) passages.push(seg);

    const unanswered = analysis.questions.filter((q) => !(q.id in answers)).length;
    const run = await aiDeps();
    const ai = await run(disposalAiSchema, DISPOSAL_SYSTEM, [
      {
        role: "user",
        content: `OBJECT ANALYSIS:\n${JSON.stringify({ ...analysis, answers })}\n\nOPEN QUESTIONS: ${unanswered}\n\nGUIDE PASSAGES:\n${
          passages.length
            ? passages.map((p) => `[${p.id}] (${p.source} — ${p.section}) ${p.text}`).join("\n")
            : "(none matched)"
        }`,
      },
    ]);
    const v = validateDisposal({
      ai,
      retrievedIds: passages.map((p) => p.id),
      unansweredQuestions: unanswered,
      retrievedPassages: passages,
    });
    const disposal: Disposal = {
      ...v,
      evidence: v.citations.map((c) => {
        const p =
          passages.find((x) => x.id === c.passage_id) ||
          GUIDE.find((x) => x.id === c.passage_id)!;
        return {
          id: p.id,
          source: p.source,
          section: p.section,
          url: p.url,
          topic: p.topic ?? p.title,
          text: p.text, // Verbatim statutory text from guide.ts
          relevance: c.relevance,
        };
      }),
      query,
      generated_at: new Date().toISOString(),
    };

    await dbService.updateDisposal({
      id: data.id,
      userId: context.userId,
      disposal,
    });

    return { ok: true };
  });

const RECREATE_SYSTEM = `You are SahiSort's RE:CREATE studio. Generate 3 practical, genuinely useful reuse projects for the given object, adapted to the user's constraints.
- Respect available time, difficulty, tools, intended use and whether they will buy materials (if not, materials should mostly be common household items; mark have_it honestly).
- Steps must be concrete and ordered (4-8 steps). Include real safety notes (sharp edges, adhesives, heat, food contact).
- Never suggest reusing unsafe items (batteries, medicines, chemicals, mercury bulbs). If the object is unsafe to repurpose, return projects: [].
- Do not claim environmental impact numbers.`;

export const generateProjects = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((d: unknown) =>
    z.object({ id: z.string().min(1), prefs: recreatePrefsSchema }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { discovery: disc } = await dbService.getDiscovery(data.id, context.userId);
    const analysis = disc.analysis as unknown as Analysis;
    if (!analysis.reuse_safe) return { count: 0, unsafe: analysis.reuse_safety_note };

    const run = await aiDeps();
    const out = await run(projectsSchema, RECREATE_SYSTEM, [
      {
        role: "user",
        content: `OBJECT:\n${JSON.stringify({ ...analysis, answers: disc.answers })}\n\nPREFERENCES:\n${JSON.stringify(data.prefs)}`,
      },
    ]);
    if (!out.projects.length)
      return {
        count: 0,
        unsafe: "SahiSort couldn't find a safe reuse for this item.",
      };

    const projectPayloads = out.projects.map((p) => ({
      title: p.title,
      data: { ...p, prefs: data.prefs },
    }));

    const count = await dbService.createProjects({
      userId: context.userId,
      discoveryId: data.id,
      objectName: analysis.object_name,
      projects: projectPayloads,
      prefs: data.prefs,
    });

    return { count, unsafe: null };
  });

export const getDiscovery = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    return await dbService.getDiscovery(data.id, context.userId);
  });

export const getProject = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    return await dbService.getProject(data.id);
  });

export const listMine = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    return await dbService.listMine(context.userId);
  });

export const getJourneyLogs = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    return await dbService.listJourneyLogs(context.userId);
  });

export const updateFlags = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        table: z.enum(["discoveries", "projects"]),
        id: z.string().min(1),
        saved: z.boolean().optional(),
        confirmDisposal: z.boolean().optional(),
        completed: z.boolean().optional(),
        completedSteps: z.array(z.number()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await dbService.updateFlags({
      userId: context.userId,
      table: data.table,
      id: data.id,
      saved: data.saved,
      confirmDisposal: data.confirmDisposal,
      completed: data.completed,
      completedSteps: data.completedSteps,
    });
    return { ok: true };
  });
