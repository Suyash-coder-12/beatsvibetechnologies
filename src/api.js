import { auth } from "./firebase.js";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const firebaseUser = auth?.currentUser;
  if (firebaseUser) {
    headers.set("Authorization", `Bearer ${await firebaseUser.getIdToken()}`);
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(path, {
    cache: "no-store",
    ...options,
    headers,
    credentials: "same-origin",
  });
  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.error || "The request could not be completed.", response.status, payload.details);
  }
  return payload;
}
