import { createMiddleware } from "@tanstack/react-start";
import { auth } from "./client";

// Global client functionMiddleware registered in src/start.ts
// Attaches the Firebase Auth bearer ID token to every serverFn call
export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | undefined;

    if (auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
      } catch (err) {
        console.warn("[Firebase] Could not retrieve ID token:", err);
      }
    }

    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
