import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Read from client environment or fallback to placeholders so Vite doesn't crash if config is being set up
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment123456",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    (import.meta.env.VITE_FIREBASE_PROJECT_ID
      ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`
      : "sahisort-app.firebaseapp.com"),
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    import.meta.env.FIREBASE_PROJECT_ID ||
    "sahisort-app",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    (import.meta.env.VITE_FIREBASE_PROJECT_ID
      ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`
      : "sahisort-app.appspot.com"),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

export const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function signInWithEmail(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function signUpWithEmail(email: string, pass: string) {
  return await createUserWithEmailAndPassword(auth, email, pass);
}

export async function signOutUser() {
  return await signOut(auth);
}
