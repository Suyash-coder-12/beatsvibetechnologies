import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "./app.js";

function createTestDatabase() {
  const data = {
    users: {
      employee: {
        email: "employee@example.com",
        displayName: "Sample Employee",
        jobTitle: "Engineer",
        role: "employee",
        isActive: true,
      },
    },
  };
  let nextId = 0;
  const valueAt = (path) => path.split("/").filter(Boolean).reduce((value, part) => value?.[part], data);
  const setAt = (path, value) => {
    const parts = path.split("/").filter(Boolean);
    const key = parts.pop();
    const parent = parts.reduce((value, part) => {
      if (!value[part]) value[part] = {};
      return value[part];
    }, data);
    if (key) parent[key] = value;
  };
  return {
    ref(path = "") {
      return {
        get: async () => ({ val: () => valueAt(path) ?? null }),
        push: () => ({ key: `audit${++nextId}` }),
        update: async (updates) => {
          for (const [updatePath, value] of Object.entries(updates)) setAt(updatePath, value);
        },
        orderByChild() { return this; },
        limitToLast() { return this; },
      };
    },
  };
}

test("Firebase API verifies bearer tokens and enforces the stored workspace role", async (t) => {
  const database = createTestDatabase();
  const firebaseAuth = {
    async verifyIdToken(token) {
      if (token !== "valid-test-token") throw Object.assign(new Error("Invalid token"), { code: "auth/invalid-id-token" });
      return { uid: "employee", email: "token@example.com", role: "owner" };
    },
  };
  const server = createApp({
    firebaseAuth,
    database,
    appOrigins: ["http://localhost:5173"],
    nodeEnv: "test",
  }).listen(0, "127.0.0.1");

  await once(server, "listening");
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const unauthenticated = await fetch(`${baseUrl}/api/me`);
  assert.equal(unauthenticated.status, 401);

  const profile = await fetch(`${baseUrl}/api/me`, {
    headers: { Authorization: "Bearer valid-test-token" },
  });
  assert.equal(profile.status, 200);
  assert.equal((await profile.json()).user.role, "employee");

  const users = await fetch(`${baseUrl}/api/users`, {
    headers: { Authorization: "Bearer valid-test-token" },
  });
  assert.equal(users.status, 403, "the API must not trust a role claim supplied by the token");

  const updatedProfile = await fetch(`${baseUrl}/api/me/profile`, {
    method: "PATCH",
    headers: {
      Authorization: "Bearer valid-test-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName: "Updated Employee" }),
  });
  assert.equal(updatedProfile.status, 200);
  assert.equal((await updatedProfile.json()).user.displayName, "Updated Employee");
});
