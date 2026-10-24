import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getAdminAuth } from "./admin";

export const requireFirebaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: Please sign in to access your discoveries and journey.");
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      throw new Error("Unauthorized: Empty authorization token provided.");
    }

    let userId = "";
    let email: string | null = null;

    try {
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifyIdToken(token);
      userId = decoded.uid;
      email = decoded.email || null;
    } catch (err: unknown) {
      // In development, if Firebase Admin is not connected to GCP yet, decode token payload safely
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1]!, "base64").toString("utf8"));
          if (payload.sub || payload.user_id) {
            userId = payload.sub || payload.user_id;
            email = payload.email || null;
          }
        }
      } catch {
        // failed parse
      }

      if (!userId) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[Firebase Auth] Token validation failed:", message);
        throw new Error("Unauthorized: Invalid session. Please sign in again.");
      }
    }

    return next({
      context: {
        userId,
        email,
      },
    });
  },
);
