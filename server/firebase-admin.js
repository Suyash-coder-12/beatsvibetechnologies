import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

export function createFirebaseServices({ projectId, databaseUrl }) {
  const app = getApps().find((candidate) => candidate.name === "beatsvibe-one-api")
    || initializeApp({
      credential: applicationDefault(),
      projectId,
      databaseURL: databaseUrl,
    }, "beatsvibe-one-api");
  return {
    auth: getAuth(app),
    database: getDatabase(app),
  };
}
