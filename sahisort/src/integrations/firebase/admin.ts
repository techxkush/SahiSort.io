import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

export function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const projectId =
    process.env["FIREBASE_PROJECT_ID"] ||
    process.env["VITE_FIREBASE_PROJECT_ID"] ||
    process.env["GCLOUD_PROJECT"] ||
    "sahisort-app";

  const clientEmail = process.env["FIREBASE_CLIENT_EMAIL"];
  const privateKey = process.env["FIREBASE_PRIVATE_KEY"]?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  } else {
    // Allows public token verification with Google's certs when projectId is known
    adminApp = initializeApp({ projectId });
  }

  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
