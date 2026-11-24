export const ROLE_TIERS = {
  owner: {
    tier: 1,
    rank: 100,
    label: "Owner (Founder & CEO)",
    shortLabel: "Tier 1 · Founder Supreme",
    badge: "Supreme Executive",
    summary: "Unrestricted company governance, RBAC control, payments oversight, divisions, executives & system settings.",
    tone: "navy",
  },
  cto: {
    tier: 2,
    rank: 85,
    label: "CTO",
    shortLabel: "Tier 2 · Tech Executive",
    badge: "Technology Lead",
    summary: "Full R&D, VedaIQ & engineering delivery, team leads, audit view & technical docs. Cannot alter Founder settings or RBAC.",
    tone: "purple",
  },
  admin: {
    tier: 3,
    rank: 70,
    label: "Admin",
    shortLabel: "Tier 3 · Ops Admin",
    badge: "Workspace Admin",
    summary: "Day-to-day user onboarding (below executives), projects, DBM ops & audit reading. No system settings or RBAC edits.",
    tone: "blue",
  },
  hr: {
    tier: 4,
    rank: 55,
    label: "HR Lead",
    shortLabel: "Tier 4 · People & Career",
    badge: "People Ops",
    summary: "Employee status, onboarding, Career & Internships cohorts, certificates & HR announcements. No Admin/Payments/Audit.",
    tone: "peach",
  },
  team_leader: {
    tier: 5,
    rank: 40,
    label: "Team Leader",
    shortLabel: "Tier 5 · Division Lead",
    badge: "Division Lead",
    summary: "Leads division projects, assigns tasks, runs meetings & monitors team analytics. Scoped to division execution.",
    tone: "mint",
  },
  employee: {
    tier: 6,
    rank: 25,
    label: "Employee",
    shortLabel: "Tier 6 · Core Contributor",
    badge: "Contributor",
    summary: "Updates assigned tasks, reads/writes division docs, RSVPs meetings & sends 1:1 Outlook messages. No Admin/Analytics.",
    tone: "slate",
  },
  intern: {
    tier: 7,
    rank: 10,
    label: "Intern",
    shortLabel: "Tier 7 · Intern Cohort",
    badge: "Trainee Scope",
    summary: "Assigned training tasks, Career cohort progress, 1:1 mentor Outlook & read-only shared resources.",
    tone: "amber",
  },
};

export function getRoleTier(role = "employee") {
  return ROLE_TIERS[role] || ROLE_TIERS.employee;
}

export function roleRank(role = "employee") {
  return getRoleTier(role).rank;
}

export function isFounder(user) {
  return user?.role === "owner";
}

function matrixFlag(workspace, role, key, fallback = false) {
  if (role === "owner") return true;
  const entry = workspace?.roleMatrix?.[role];
  if (entry && typeof entry[key] === "boolean") return entry[key];
  return fallback;
}

const ANALYTICS_PAGES = new Set([
  "Reports",
  "Project Analytics",
  "Employee Analytics",
  "Division Performance",
]);

export function canViewPage(user, page, workspace) {
  const role = user?.role || "employee";
  if (role === "owner") return true;

  if (page === "Company Settings") return false;
  if (page === "BeatsVibe Payments") return ["cto", "admin"].includes(role);
  if (["User Management", "Roles & Permissions", "Security & Audit Logs"].includes(page)) {
    return ["cto", "admin"].includes(role);
  }
  if (ANALYTICS_PAGES.has(page)) {
    return ["cto", "admin", "hr", "team_leader"].includes(role);
  }
  if (role === "intern") {
    return [
      "Dashboard",
      "Career & Internships",
      "Projects",
      "Tasks",
      "Outlook",
      "Calendar",
      "Meetings",
      "Announcements",
      "Documents",
      "My Profile",
    ].includes(page);
  }
  if (page === "DBM System" && role === "hr") return false;
  return true;
}

export function getAssignableRoles(actor) {
  const role = actor?.role || "employee";
  if (role === "owner") {
    return [
      { value: "cto", label: "CTO (Tier 2)" },
      { value: "admin", label: "Admin (Tier 3)" },
      { value: "hr", label: "HR Lead (Tier 4)" },
      { value: "team_leader", label: "Team Leader (Tier 5)" },
      { value: "employee", label: "Employee (Tier 6)" },
      { value: "intern", label: "Intern (Tier 7)" },
    ];
  }
  if (role === "cto") {
    return [
      { value: "team_leader", label: "Team Leader (Tier 5)" },
      { value: "employee", label: "Employee (Tier 6)" },
      { value: "intern", label: "Intern (Tier 7)" },
    ];
  }
  if (role === "admin") {
    return [
      { value: "hr", label: "HR Lead (Tier 4)" },
      { value: "team_leader", label: "Team Leader (Tier 5)" },
      { value: "employee", label: "Employee (Tier 6)" },
      { value: "intern", label: "Intern (Tier 7)" },
    ];
  }
  if (role === "hr") {
    return [
      { value: "employee", label: "Employee (Tier 6)" },
      { value: "intern", label: "Intern (Tier 7)" },
    ];
  }
  return [];
}

export function canModifyTargetEmployee(actor, target, workspace) {
  if (!actor || !target) return false;
  const actorRole = actor.role || "employee";
  const targetRole = target.role || "employee";
  if (actorRole === "owner") return target.id !== actor.id || true;
  if (targetRole === "owner") return false;
  if (!matrixFlag(workspace, actorRole, "canEditEmployees", false)) return false;

  if (actorRole === "cto") return ["hr", "team_leader", "employee", "intern"].includes(targetRole);
  if (actorRole === "admin") return ["hr", "team_leader", "employee", "intern"].includes(targetRole);
  if (actorRole === "hr") return ["employee", "intern"].includes(targetRole);
  return false;
}

export function canDeleteTargetEmployee(actor, target, workspace) {
  if (!actor || !target || actor.id === target.id) return false;
  const actorRole = actor.role || "employee";
  const targetRole = target.role || "employee";
  if (targetRole === "owner") return false;
  if (actorRole === "owner") return true;
  if (!matrixFlag(workspace, actorRole, "canManageUsers", false)) return false;
  if (actorRole === "cto") return ["team_leader", "employee", "intern"].includes(targetRole);
  if (actorRole === "admin") return ["hr", "team_leader", "employee", "intern"].includes(targetRole);
  return false;
}

export function canDo(user, action, workspace, target) {
  const role = user?.role || "employee";
  if (role === "owner") return true;

  switch (action) {
    case "edit_role_matrix":
    case "manage_settings":
    case "reset_workspace":
    case "create_division":
    case "manage_payments":
    case "export_audit":
    case "clear_audit":
    case "change_exec_roles":
      return false;

    case "manage_users":
      return ["cto", "admin"].includes(role) && matrixFlag(workspace, role, "canManageUsers", true);

    case "add_employee":
      return ["cto", "admin", "hr"].includes(role) && matrixFlag(workspace, role, "canEditEmployees", true);

    case "create_project":
    case "edit_project": {
      if (target?.division === "BeatsVibe Payments") return false;
      if (!matrixFlag(workspace, role, "canEditProjects", false)) return false;
      if (role === "cto" || role === "admin") return true;
      if (role === "team_leader") return !target?.division || target.division === user.division;
      if (role === "hr") return ["BeatsVibe Career", "BeatsVibe Employees"].includes(target?.division);
      return false;
    }

    case "delete_project":
      return role === "cto" && target?.division !== "BeatsVibe Payments";

    case "assign_task":
      return ["cto", "admin", "hr", "team_leader"].includes(role)
        && matrixFlag(workspace, role, "canAssignTasks", ["cto", "admin", "team_leader"].includes(role));

    case "update_task": {
      if (["cto", "admin"].includes(role)) return true;
      if (role === "team_leader") return true;
      return Boolean(
        target
        && (target.assigneeEmail?.toLowerCase() === user?.email?.toLowerCase()
          || target.assignee === user?.displayName),
      );
    }

    case "delete_task":
      return ["cto", "admin"].includes(role);

    case "schedule_event":
      return ["cto", "admin", "hr", "team_leader"].includes(role)
        && matrixFlag(workspace, role, "canPublishNotices", ["cto", "admin", "hr", "team_leader"].includes(role));

    case "delete_event":
      return ["cto", "admin"].includes(role) || (target?.organizer && target.organizer.includes(user?.displayName));

    case "publish_announcement":
      return ["cto", "admin", "hr"].includes(role)
        && matrixFlag(workspace, role, "canPublishNotices", ["cto", "admin", "hr"].includes(role));

    case "delete_announcement":
      return role === "cto" && target?.authorEmail !== "rathodsuyash52@gmail.com";

    case "create_document":
      return role !== "intern";

    case "download_document":
      return role !== "intern";

    case "delete_document":
      return ["cto", "admin"].includes(role);

    case "export_reports":
      return ["cto", "admin"].includes(role) && matrixFlag(workspace, role, "canExportReports", true);

    case "verify_intern_cert":
      return role === "hr";

    case "manage_dbm_clients":
      return ["cto", "admin"].includes(role) || (role === "team_leader" && user?.division === "DBM System");

    case "broadcast_email":
      return ["cto", "admin", "hr", "team_leader"].includes(role);

    case "delete_email":
      return role !== "intern";

    default:
      return false;
  }
}

export function getPermittedCapabilityCount(user, workspace) {
  const checks = [
    "manage_settings",
    "edit_role_matrix",
    "manage_payments",
    "create_division",
    "export_audit",
    "manage_users",
    "add_employee",
    "create_project",
    "delete_project",
    "assign_task",
    "publish_announcement",
    "create_document",
    "export_reports",
    "verify_intern_cert",
    "manage_dbm_clients",
    "broadcast_email",
  ];
  return checks.filter((cap) => canDo(user, cap, workspace)).length;
}
