import { getApps, initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(config).every((value) => typeof value === "string" && value.length > 0);
export const firebaseApp = firebaseConfigured
  ? getApps()[0] || initializeApp(config)
  : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
