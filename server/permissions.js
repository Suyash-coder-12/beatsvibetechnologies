const rolePermissions = {
  owner: ["profile:read", "profile:write", "dashboard:read", "employees:read", "employees:write", "projects:read", "projects:write", "tasks:read", "tasks:write", "events:write", "announcements:read", "announcements:write", "users:read", "users:write", "audit:read"],
  cto: ["profile:read", "profile:write", "dashboard:read", "employees:read", "employees:write", "projects:read", "projects:write", "tasks:read", "tasks:write", "events:write", "announcements:read", "announcements:write", "users:read", "users:write", "audit:read"],
  admin: ["profile:read", "profile:write", "dashboard:read", "employees:read", "employees:write", "projects:read", "projects:write", "tasks:read", "tasks:write", "events:write", "announcements:read", "announcements:write", "users:read", "audit:read"],
  hr: ["profile:read", "profile:write", "dashboard:read", "employees:read", "employees:write", "projects:read", "tasks:read", "events:write", "announcements:read", "announcements:write"],
  team_leader: ["profile:read", "profile:write", "dashboard:read", "projects:read", "projects:write", "tasks:read", "tasks:write", "events:write", "announcements:read", "announcements:write"],
  employee: ["profile:read", "profile:write", "dashboard:read", "projects:read", "tasks:read", "announcements:read"],
  intern: ["profile:read", "profile:write", "dashboard:read", "projects:read", "tasks:read", "announcements:read"],
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
