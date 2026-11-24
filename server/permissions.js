const rolePermissions = {
  owner: [
    "profile:read",
    "profile:write",
    "dashboard:read",
    "employees:read",
    "employees:write",
    "projects:read",
    "projects:write",
    "projects:delete",
    "tasks:read",
    "tasks:write",
    "tasks:update_own",
    "events:write",
    "announcements:read",
    "announcements:write",
    "users:read",
    "users:write",
    "roles:write",
    "settings:write",
    "divisions:write",
    "payments:write",
    "audit:read",
    "audit:manage",
  ],
  cto: [
    "profile:read",
    "profile:write",
    "dashboard:read",
    "employees:read",
    "employees:write",
    "projects:read",
    "projects:write",
    "projects:delete",
    "tasks:read",
    "tasks:write",
    "tasks:update_own",
    "events:write",
    "announcements:read",
    "announcements:write",
    "users:read",
    "audit:read",
  ],
  admin: [
    "profile:read",
    "profile:write",
    "dashboard:read",
    "employees:read",
    "employees:write",
    "projects:read",
    "projects:write",
    "tasks:read",
    "tasks:write",
    "tasks:update_own",
    "events:write",
    "announcements:read",
    "users:read",
    "audit:read",
  ],
  hr: [
    "profile:read",
    "profile:write",
    "dashboard:read",
    "employees:read",
    "employees:write",
    "projects:read",
    "tasks:read",
    "events:write",
    "announcements:read",
    "announcements:write",
  ],
  team_leader: [
    "profile:read",
    "profile:write",
    "dashboard:read",
    "employees:read",
    "projects:read",
    "projects:write",
    "tasks:read",
    "tasks:write",
    "tasks:update_own",
    "events:write",
    "announcements:read",
  ],
  employee: [
    "profile:read",
    "profile:write",
    "dashboard:read",
    "projects:read",
    "tasks:read",
    "tasks:update_own",
    "announcements:read",
  ],
  intern: [
    "profile:read",
    "profile:write",
    "dashboard:read",
    "projects:read",
    "tasks:read",
    "tasks:update_own",
    "announcements:read",
  ],
};

export function hasPermission(role, permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}
