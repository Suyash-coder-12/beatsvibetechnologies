import {
  announcements,
  divisions,
  employeeRows,
  events,
  initialAuditLogs,
  initialDbmClients,
  initialDocuments,
  initialEmails,
  initialInternCohorts,
  initialRoleMatrix,
  initialSettings,
  projectRows,
  taskRows,
} from "./data.js";

const STORAGE_KEY = "beatsvibe_one_workspace_v6";
const SESSION_KEY = "beatsvibe_one_active_session_v6";

export function getInitialWorkspaceState() {
  return {
    divisions: structuredClone(divisions),
    employees: structuredClone(employeeRows),
    projects: structuredClone(projectRows),
    tasks: structuredClone(taskRows),
    events: structuredClone(events),
    announcements: structuredClone(announcements),
    documents: structuredClone(initialDocuments),
    emails: structuredClone(initialEmails),
    dbmClients: structuredClone(initialDbmClients),
    internCohorts: structuredClone(initialInternCohorts),
    auditLogs: structuredClone(initialAuditLogs),
    settings: structuredClone(initialSettings),
    roleMatrix: structuredClone(initialRoleMatrix),
    readNotificationIds: [],
  };
}

export function loadWorkspaceState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialWorkspaceState();
    const parsed = JSON.parse(raw);
    const base = getInitialWorkspaceState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings || {}) },
      roleMatrix: Object.fromEntries(
        Object.entries(base.roleMatrix).map(([roleKey, roleDefaults]) => [
          roleKey,
          { ...roleDefaults, ...(parsed.roleMatrix?.[roleKey] || {}) },
        ]),
      ),
    };
  } catch {
    return getInitialWorkspaceState();
  }
}

export function saveWorkspaceState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in restricted browsers.
  }
}

export function resetWorkspaceState() {
  const fresh = getInitialWorkspaceState();
  saveWorkspaceState(fresh);
  return fresh;
}

export function loadActiveSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveSession(session) {
  try {
    if (!session) {
      window.localStorage.removeItem(SESSION_KEY);
    } else {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage errors.
  }
}

export function authenticateLocalUser(employees, email, password) {
  const normalized = String(email || "").trim().toLowerCase();
  const account = employees.find(
    (emp) => emp.email?.toLowerCase() === normalized && emp.isActive !== false && emp.status !== "Inactive",
  );
  if (!account) {
    return { ok: false, error: "Account not found or inactive. Verify your BeatsVibe One login ID." };
  }
  if (account.password && account.password !== password) {
    return { ok: false, error: "Incorrect password for this account. Contact the Founder or Admin for a reset." };
  }
  return { ok: true, user: toWorkspaceUser(account) };
}

export function toWorkspaceUser(employee) {
  return {
    id: employee.id,
    email: employee.email,
    displayName: employee.name,
    jobTitle: employee.jobTitle || "Team Member",
    role: employee.role || "employee",
    division: employee.division || "BeatsVibe R&D",
    availability: employee.availability || "Available",
    phone: employee.phone || "",
    location: employee.location || "",
    bio: employee.bio || "",
    initials: employee.initials || initialsFromName(employee.name || employee.email),
    color: employee.color || "blue",
  };
}

export function initialsFromName(text = "") {
  const clean = String(text).trim();
  if (!clean) return "BV";
  if (clean.includes("@")) {
    const local = clean.split("@")[0];
    const parts = local.split(/[._-]+/).filter(Boolean);
    return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : local.slice(0, 2)).toUpperCase();
  }
  const words = clean.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0].slice(0, 2)).toUpperCase();
}

export function createAuditEntry(actor, action, detail, tone = "info") {
  return {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    actorEmail: actor?.email || "system@beatsvibe.com",
    actorName: actor?.displayName || actor?.email || "Workspace System",
    detail,
    createdAt: new Date().toISOString(),
    tone,
  };
}

export function downloadFile(filename, content, mimeType = "application/json") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
