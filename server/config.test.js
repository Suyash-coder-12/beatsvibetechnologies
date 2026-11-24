import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "./config.js";

const baseEnvironment = {
  FIREBASE_PROJECT_ID: "beatsvibe-one",
  FIREBASE_DATABASE_URL: "https://beatsvibe-one-default-rtdb.firebaseio.com",
  BOOTSTRAP_OWNER_EMAIL: "",
  BOOTSTRAP_OWNER_PASSWORD: "",
};

test("configuration accepts the documented empty owner bootstrap fields", () => {
  const config = loadConfig(baseEnvironment);
  assert.equal(config.bootstrapOwnerEmail, undefined);
  assert.equal(config.bootstrapOwnerPassword, undefined);
  assert.equal(config.apiPort, 4000);
});

test("configuration requires owner bootstrap email and password together", () => {
  assert.throws(() => loadConfig({
    ...baseEnvironment,
    BOOTSTRAP_OWNER_EMAIL: "owner@example.com",
  }), /Set both BOOTSTRAP_OWNER_EMAIL and BOOTSTRAP_OWNER_PASSWORD/);
});

test("configuration rejects a non-HTTPS Realtime Database URL", () => {
  assert.throws(() => loadConfig({
    ...baseEnvironment,
    FIREBASE_DATABASE_URL: "http://beatsvibe-one-default-rtdb.firebaseio.com",
  }), /Realtime Database URL must use HTTPS/);
});
