import test from "node:test";
import assert from "node:assert/strict";
import { hasPermission } from "./permissions.js";
import { profileSchema, projectSchema, taskSchema } from "./validation.js";

test("project schema requires a valid division slug and bounded title", () => {
  assert.equal(projectSchema.safeParse({ name: "AI discovery", divisionSlug: "beatsvibe-rd" }).success, true);
  assert.equal(projectSchema.safeParse({ name: "AI", divisionSlug: "BeatsVibe R&D" }).success, false);
});

test("task schema validates project id and email assignee", () => {
  assert.equal(taskSchema.safeParse({
    title: "Review evaluation",
    projectId: "abcdefghijklmnopqrst",
    assigneeEmail: "member@example.com",
  }).success, true);
  assert.equal(taskSchema.safeParse({
    title: "Review evaluation",
    projectId: "not-a-valid-key",
    assigneeEmail: "not-an-email",
  }).success, false);
});

test("profile updates accept only supported personal fields", () => {
  assert.equal(profileSchema.safeParse({ displayName: "Owner Name", jobTitle: "Founder" }).success, true);
  assert.equal(profileSchema.safeParse({ role: "admin" }).success, false);
  assert.equal(profileSchema.safeParse({}).success, false);
});

test("roles have least-privilege user and employee permissions", () => {
  assert.equal(hasPermission("owner", "users:write"), true);
  assert.equal(hasPermission("owner", "settings:write"), true);
  assert.equal(hasPermission("owner", "roles:write"), true);
  assert.equal(hasPermission("owner", "payments:write"), true);
  assert.equal(hasPermission("cto", "users:write"), false);
  assert.equal(hasPermission("cto", "settings:write"), false);
  assert.equal(hasPermission("cto", "projects:write"), true);
  assert.equal(hasPermission("admin", "users:write"), false);
  assert.equal(hasPermission("admin", "announcements:write"), false);
  assert.equal(hasPermission("hr", "employees:write"), true);
  assert.equal(hasPermission("employee", "employees:read"), false);
  assert.equal(hasPermission("employee", "tasks:update_own"), true);
  assert.equal(hasPermission("intern", "projects:write"), false);
  assert.equal(hasPermission("intern", "profile:write"), true);
});
