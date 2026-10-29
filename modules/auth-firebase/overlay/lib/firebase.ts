import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Sem config (antes de criar o projeto Firebase) o app roda como "deslogado".
const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let auth: Auth | null = null;

// Inicialização preguiçosa: só no browser e só com config presente.
export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured || typeof window === "undefined") return null;
  if (auth === null) {
    const app: FirebaseApp = getApps()[0] ?? initializeApp(config);
    auth = getAuth(app);
  }
  return auth;
}

// Usado no smoke test do login (MODULE.md).
export async function signInWithGoogle(): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  if (firebaseAuth === null) {
    throw new Error("Firebase is not configured. Fill NEXT_PUBLIC_FIREBASE_* in .env.local.");
  }
  await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
}
