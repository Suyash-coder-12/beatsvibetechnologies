import express from "express";
import helmet from "helmet";
import { ZodError } from "zod";
import { requirePermission } from "./permissions.js";
import {
  announcementSchema, employeeSchema, eventSchema, paginationSchema, profileSchema, projectSchema,
  taskSchema, userSchema,
} from "./validation.js";

const apiPrefix = "/api";
const divisionColors = ["blue", "purple", "orange", "green", "cyan", "pink"];
const allowedRoles = ["owner", "cto", "admin", "hr", "team_leader", "employee", "intern"];

function parseBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Please check the submitted fields.",
        details: parsed.error.issues.map(({ path, message }) => ({ field: path.join("."), message })),
      });
    }
    req.validatedBody = parsed.data;
    next();
  };
}

function parsePagination(req, res, next) {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid pagination values." });
  req.pagination = parsed.data;
  next();
}

function recordsFromSnapshot(snapshot) {
  const records = snapshot.val() || {};
  return Object.entries(records)
    .filter(([, value]) => value && typeof value === "object" && !Array.isArray(value))
    .map(([id, value]) => ({ id, ...value }));
}

async function getRecords(database, path) {
  return recordsFromSnapshot(await database.ref(path).get());
}

function compareCreatedAtDescending(left, right) {
  return Date.parse(right.createdAt || 0) - Date.parse(left.createdAt || 0);
}

function pageRecords(records, { limit, offset }) {
  return records.slice(offset, offset + limit);
}

function tokenError(error) {
  return [
    "auth/argument-error",
    "auth/id-token-expired",
    "auth/id-token-revoked",
    "auth/invalid-id-token",
    "auth/invalid-argument",
    "auth/user-disabled",
    "auth/user-not-found",
  ].includes(error.code);
}

function requireAuth(firebaseAuth, database) {
  return async (req, res, next) => {
    const authorization = req.get("authorization") || "";
    const match = /^Bearer\s+(.+)$/i.exec(authorization);
    if (!match) return res.status(401).json({ error: "Firebase sign-in is required." });

    try {
      const decoded = await firebaseAuth.verifyIdToken(match[1], true);
      if (!decoded.uid) return res.status(401).json({ error: "The sign-in token is invalid." });
      const snapshot = await database.ref(`users/${decoded.uid}`).get();
      const profile = snapshot.val();
      if (!profile || profile.isActive === false) {
        return res.status(403).json({ error: "This account is not enabled for the BeatsVibe workspace." });
      }
      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({ error: "This account does not have a workspace role." });
      }
      req.user = {
        id: decoded.uid,
        email: profile.email || decoded.email || "",
        role: profile.role,
        displayName: profile.displayName || "",
        jobTitle: profile.jobTitle || "",
      };
      next();
    } catch (error) {
      if (tokenError(error)) return res.status(401).json({ error: "Your Firebase sign-in has expired. Sign in again." });
      next(error);
    }
  };
}

function addAuditUpdate(updates, database, actor, action, resourceType, resourceId = null, metadata = {}) {
  const auditId = database.ref("auditLogs").push().key;
  updates[`auditLogs/${auditId}`] = {
    actorUserId: actor?.id || null,
    actorEmail: actor?.email || "Firebase system",
    action,
    resourceType,
    resourceId: resourceId || null,
    metadata,
    createdAt: new Date().toISOString(),
  };
}

function eventDate(startAt) {
  const date = new Date(startAt);
  return {
    day: date.toLocaleDateString("en-US", { day: "2-digit", timeZone: "UTC" }),
    month: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }),
  };
}

function activityVerb(action, resourceType = "workspace") {
  const verbs = {
    "project.created": "created a project",
    "task.created": "created a task",
    "employee.created": "added an employee record",
    "event.created": "scheduled a company event",
    "announcement.created": "published an announcement",
    "user.created": "created a workspace account",
    "profile.updated": "updated their profile",
    "auth.login": "signed in",
    "auth.logout": "signed out",
  };
  return verbs[action] || `updated ${String(resourceType).replaceAll("_", " ")}`;
}

function hasOrganizationWideAccess(role) {
  return ["owner", "cto", "admin", "hr"].includes(role);
}

function projectVisibleToUser(project, user) {
  return hasOrganizationWideAccess(user.role) || Boolean(project.members?.[user.id]);
}

function taskVisibleToUser(task, projectsById, user) {
  if (hasOrganizationWideAccess(user.role)) return true;
  if (user.role === "team_leader") {
    return projectsById[task.projectId]?.members?.[user.id] === "lead";
  }
  return task.assignedUserId === user.id;
}

function setStatusError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function createApp({ firebaseAuth, database, appOrigins, nodeEnv = "development" }) {
  if (!firebaseAuth || !database || !Array.isArray(appOrigins)) {
    throw new Error("createApp requires Firebase Auth, Realtime Database, and allowed app origins.");
  }
  const app = express();
  app.disable("x-powered-by");
  app.set("etag", false);
  if (nodeEnv === "production") app.set("trust proxy", 1);
  app.use(helmet());
  app.use((req, res, next) => {
    delete req.headers["if-none-match"];
    delete req.headers["if-modified-since"];
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });
  app.use(express.json({ limit: "32kb", type: "application/json" }));
  app.use((req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin");
    if (origin && !appOrigins.includes(origin)) {
      return res.status(403).json({ error: "Request origin is not allowed." });
    }
    if (req.is("application/json") !== "application/json") {
      return res.status(415).json({ error: "Requests must use application/json." });
    }
    next();
  });

  const authenticated = requireAuth(firebaseAuth, database);

  app.get(`${apiPrefix}/health`, async (req, res, next) => {
    try {
      await database.ref("meta").get();
      res.json({ status: "ok", authentication: "Firebase Auth", database: "Realtime Database connected" });
    } catch (error) {
      next(error);
    }
  });

  app.post(`${apiPrefix}/auth/login`, authenticated, async (req, res, next) => {
    try {
      const updates = {};
      addAuditUpdate(updates, database, req.user, "auth.login", "account");
      await database.ref().update(updates);
      res.json({ user: req.user });
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/auth/session`, authenticated, (req, res) => {
    res.json({ user: req.user });
  });

  app.post(`${apiPrefix}/auth/logout`, authenticated, async (req, res, next) => {
    try {
      const updates = {};
      addAuditUpdate(updates, database, req.user, "auth.logout", "account");
      await database.ref().update(updates);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/me`, authenticated, requirePermission("profile:read"), (req, res) => {
    res.json({ user: req.user });
  });

  app.patch(`${apiPrefix}/me/profile`, authenticated, requirePermission("profile:write"), parseBody(profileSchema), async (req, res, next) => {
    try {
      const { displayName, jobTitle } = req.validatedBody;
      const updates = { [`users/${req.user.id}/updatedAt`]: new Date().toISOString() };
      if (displayName !== undefined) updates[`users/${req.user.id}/displayName`] = displayName;
      if (jobTitle !== undefined) updates[`users/${req.user.id}/jobTitle`] = jobTitle;
      addAuditUpdate(updates, database, req.user, "profile.updated", "user", req.user.id, {
        fields: Object.keys(req.validatedBody),
      });
      await database.ref().update(updates);
      const user = { ...req.user, ...req.validatedBody };
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/dashboard`, authenticated, requirePermission("dashboard:read"), async (req, res, next) => {
    try {
      const [users, divisions, allProjects, allTasks, allEvents, activitySnapshot] = await Promise.all([
        getRecords(database, "users"),
        getRecords(database, "divisions"),
        getRecords(database, "projects"),
        getRecords(database, "tasks"),
        getRecords(database, "events"),
        database.ref("auditLogs").orderByChild("createdAt").limitToLast(100).get(),
      ]);
      const allActivity = recordsFromSnapshot(activitySnapshot);
      const usersById = Object.fromEntries(users.map((user) => [user.id, user]));
      const projectsById = Object.fromEntries(allProjects.map((project) => [project.id, project]));
      const projects = allProjects.filter((project) => projectVisibleToUser(project, req.user));
      const tasks = allTasks.filter((task) => taskVisibleToUser(task, projectsById, req.user));
      const events = allEvents
        .filter((event) => Date.parse(event.startAt) >= Date.now())
        .sort((left, right) => Date.parse(left.startAt) - Date.parse(right.startAt));
      const activity = allActivity
        .filter((item) => hasOrganizationWideAccess(req.user.role) || item.actorUserId === req.user.id)
        .sort(compareCreatedAtDescending)
        .slice(0, 5);
      const employeeRecords = await getRecords(database, "employees");
      const visibleEmployeeRecords = hasOrganizationWideAccess(req.user.role)
        ? employeeRecords
        : employeeRecords.filter((employee) => employee.userId === req.user.id || employee.email?.toLowerCase() === req.user.email.toLowerCase());
      const now = new Date();
      const monthStarts = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1));
      const trends = monthStarts.map((start, index) => {
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        const inRange = (value) => {
          const date = new Date(value);
          return date >= start && date < end;
        };
        return {
          month: start.toLocaleDateString("en-US", { month: "short" }),
          projects: projects.filter((project) => inRange(project.createdAt)).length,
          tasks: tasks.filter((task) => task.status === "done" && task.completedAt && inRange(task.completedAt)).length,
        };
      });
      const divisionData = divisions
        .filter((division) => division.isActive !== false)
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((division, index) => {
          const divisionProjects = projects.filter((project) => project.divisionSlug === division.slug);
          const divisionProjectIds = new Set(divisionProjects.map((project) => project.id));
          const divisionTasks = tasks.filter((task) => divisionProjectIds.has(task.projectId));
          return {
            ...division,
            projects: divisionProjects.length,
            progress: divisionTasks.length
              ? Math.round((divisionTasks.filter((task) => task.status === "done").length / divisionTasks.length) * 100)
              : 0,
            color: divisionColors[index % divisionColors.length],
          };
        });
      const status = {
        completed: projects.filter((project) => project.status === "completed").length,
        inProgress: projects.filter((project) => ["in_progress", "in_review"].includes(project.status)).length,
        pending: projects.filter((project) => ["planning", "on_hold"].includes(project.status)).length,
      };
      const projectTotal = projects.length;
      const percent = (count) => projectTotal ? Math.round((count / projectTotal) * 100) : 0;
      const completedPercent = percent(status.completed);
      const inProgressPercent = percent(status.inProgress);
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const completedTasks = tasks.filter((task) => task.status === "done" && Date.parse(task.completedAt || "") >= cutoff).length;
      res.json({
        stats: {
          totalEmployees: visibleEmployeeRecords.filter((employee) => employee.status === "active").length,
          activeProjects: projects.filter((project) => ["planning", "in_progress", "in_review"].includes(project.status)).length,
          completedTasks,
          upcomingEvents: events.length,
        },
        divisions: divisionData,
        projectStatus: {
          completed: completedPercent,
          inProgress: inProgressPercent,
          pending: projectTotal ? Math.max(0, 100 - completedPercent - inProgressPercent) : percent(status.pending),
        },
        events: events.slice(0, 4).map((event, index) => ({
          id: event.id,
          title: event.title,
          ...eventDate(event.startAt),
          time: `${eventDate(event.startAt).time}${event.location ? ` · ${event.location}` : ""}`,
          color: divisionColors[index % 3],
        })),
        activity: activity.map((item) => ({
          title: item.actorEmail || usersById[item.actorUserId]?.email || "Workspace system",
          text: activityVerb(item.action, item.resourceType),
          time: new Date(item.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
        })),
        trends,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/divisions`, authenticated, requirePermission("dashboard:read"), async (req, res, next) => {
    try {
      const divisions = (await getRecords(database, "divisions"))
        .filter((division) => division.isActive !== false)
        .sort((left, right) => left.name.localeCompare(right.name));
      res.json({ divisions });
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/employees`, authenticated, requirePermission("employees:read"), parsePagination, async (req, res, next) => {
    try {
      const employees = (await getRecords(database, "employees"))
        .sort((left, right) => left.name.localeCompare(right.name))
        .slice(req.pagination.offset, req.pagination.offset + req.pagination.limit);
      res.json({ employees });
    } catch (error) {
      next(error);
    }
  });

  app.post(`${apiPrefix}/employees`, authenticated, requirePermission("employees:write"), parseBody(employeeSchema), async (req, res, next) => {
    try {
      const body = req.validatedBody;
      const division = body.divisionSlug
        ? (await database.ref(`divisions/${body.divisionSlug}`).get()).val()
        : null;
      if (body.divisionSlug && (!division || division.isActive === false)) {
        throw setStatusError("Select an active company division.", 400);
      }
      const employeeRef = database.ref("employees").push();
      const employee = {
        name: body.name,
        email: body.email?.toLowerCase() || "",
        jobTitle: body.jobTitle || "",
        divisionSlug: body.divisionSlug || "",
        division: division?.name || "",
        status: body.status,
        createdAt: new Date().toISOString(),
        createdBy: req.user.id,
      };
      const updates = { [`employees/${employeeRef.key}`]: employee };
      addAuditUpdate(updates, database, req.user, "employee.created", "employee", employeeRef.key);
      await database.ref().update(updates);
      res.status(201).json({ employee: { id: employeeRef.key, ...employee } });
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/projects`, authenticated, requirePermission("projects:read"), parsePagination, async (req, res, next) => {
    try {
      const [allProjects, allTasks] = await Promise.all([
        getRecords(database, "projects"),
        getRecords(database, "tasks"),
      ]);
      const projects = allProjects
        .filter((project) => projectVisibleToUser(project, req.user))
        .sort(compareCreatedAtDescending)
        .map((project) => {
          const projectTasks = allTasks.filter((task) => task.projectId === project.id);
          return {
            ...project,
            progress: projectTasks.length
              ? Math.round((projectTasks.filter((task) => task.status === "done").length / projectTasks.length) * 100)
              : 0,
          };
        });
      res.json({ projects: pageRecords(projects, req.pagination) });
    } catch (error) {
      next(error);
    }
  });

  app.post(`${apiPrefix}/projects`, authenticated, requirePermission("projects:write"), parseBody(projectSchema), async (req, res, next) => {
    try {
      const body = req.validatedBody;
      const division = (await database.ref(`divisions/${body.divisionSlug}`).get()).val();
      if (!division || division.isActive === false) {
        throw setStatusError("Select an active company division.", 400);
      }
      const projectRef = database.ref("projects").push();
      const createdAt = new Date().toISOString();
      const project = {
        name: body.name,
        description: body.description || "",
        division: division.name,
        divisionSlug: division.slug,
        status: "planning",
        dueAt: body.dueAt || "",
        createdBy: req.user.id,
        createdByEmail: req.user.email,
        members: { [req.user.id]: "lead" },
        createdAt,
        updatedAt: createdAt,
      };
      const updates = {
        [`projects/${projectRef.key}`]: project,
        [`projectMembers/${req.user.id}/${projectRef.key}`]: true,
      };
      addAuditUpdate(updates, database, req.user, "project.created", "project", projectRef.key);
      await database.ref().update(updates);
      res.status(201).json({ project: { id: projectRef.key, ...project, progress: 0 } });
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/tasks`, authenticated, requirePermission("tasks:read"), parsePagination, async (req, res, next) => {
    try {
      const [allTasks, projects] = await Promise.all([
        getRecords(database, "tasks"),
        getRecords(database, "projects"),
      ]);
      const projectsById = Object.fromEntries(projects.map((project) => [project.id, project]));
      const users = await getRecords(database, "users");
      const usersById = Object.fromEntries(users.map((user) => [user.id, user]));
      const tasks = allTasks
        .filter((task) => taskVisibleToUser(task, projectsById, req.user))
        .sort(compareCreatedAtDescending)
        .map((task) => ({
          ...task,
          assignee: usersById[task.assignedUserId]?.email || "",
          project: projectsById[task.projectId]?.name || task.project || "Project",
        }));
      res.json({ tasks: pageRecords(tasks, req.pagination) });
    } catch (error) {
      next(error);
    }
  });

  app.post(`${apiPrefix}/tasks`, authenticated, requirePermission("tasks:write"), parseBody(taskSchema), async (req, res, next) => {
    try {
      const body = req.validatedBody;
      const project = (await database.ref(`projects/${body.projectId}`).get()).val();
      if (!project || !(
        ["owner", "cto", "admin"].includes(req.user.role)
        || (req.user.role === "team_leader" && project.members?.[req.user.id] === "lead")
      )) {
        throw setStatusError("Project not found or you cannot assign work to it.", 404);
      }
      let assignee = null;
      if (body.assigneeEmail) {
        const users = await getRecords(database, "users");
        assignee = users.find((user) => user.email?.toLowerCase() === body.assigneeEmail.toLowerCase() && user.isActive !== false);
        if (!assignee) throw setStatusError("Assignee must have an active BeatsVibe One account.", 400);
      }
      const taskRef = database.ref("tasks").push();
      const createdAt = new Date().toISOString();
      const task = {
        title: body.title,
        description: body.description || "",
        projectId: body.projectId,
        project: project.name,
        status: "todo",
        priority: body.priority,
        dueAt: body.dueAt || "",
        assignedUserId: assignee?.id || "",
        createdBy: req.user.id,
        createdAt,
        updatedAt: createdAt,
      };
      const updates = { [`tasks/${taskRef.key}`]: task };
      if (assignee) {
        updates[`projects/${body.projectId}/members/${assignee.id}`] = "member";
        updates[`projectMembers/${assignee.id}/${body.projectId}`] = true;
        updates[`userTasks/${assignee.id}/${taskRef.key}`] = true;
      }
      addAuditUpdate(updates, database, req.user, "task.created", "task", taskRef.key);
      await database.ref().update(updates);
      res.status(201).json({ task: { id: taskRef.key, ...task, assignee: assignee?.email || "" } });
    } catch (error) {
      next(error);
    }
  });

  app.post(`${apiPrefix}/events`, authenticated, requirePermission("events:write"), parseBody(eventSchema), async (req, res, next) => {
    try {
      const body = req.validatedBody;
      const eventRef = database.ref("events").push();
      const event = {
        title: body.title,
        startAt: body.startAt,
        details: body.details || "",
        location: body.location || "",
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
      };
      const updates = { [`events/${eventRef.key}`]: event };
      addAuditUpdate(updates, database, req.user, "event.created", "company_event", eventRef.key);
      await database.ref().update(updates);
      res.status(201).json({ event: { id: eventRef.key, ...event } });
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/events`, authenticated, requirePermission("dashboard:read"), parsePagination, async (req, res, next) => {
    try {
      const events = (await getRecords(database, "events"))
        .filter((event) => Date.parse(event.startAt) >= Date.now())
        .sort((left, right) => Date.parse(left.startAt) - Date.parse(right.startAt));
      res.json({
        events: pageRecords(events, req.pagination).map((event, index) => ({
          ...event,
          ...eventDate(event.startAt),
          time: `${eventDate(event.startAt).time}${event.location ? ` · ${event.location}` : ""}`,
          color: divisionColors[index % 3],
        })),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/announcements`, authenticated, requirePermission("announcements:read"), parsePagination, async (req, res, next) => {
    try {
      const announcements = (await getRecords(database, "announcements"))
        .sort(compareCreatedAtDescending);
      res.json({ announcements: pageRecords(announcements, req.pagination) });
    } catch (error) {
      next(error);
    }
  });

  app.post(`${apiPrefix}/announcements`, authenticated, requirePermission("announcements:write"), parseBody(announcementSchema), async (req, res, next) => {
    try {
      const body = req.validatedBody;
      const announcementRef = database.ref("announcements").push();
      const announcement = {
        title: body.title,
        label: body.label,
        description: body.description,
        authorUserId: req.user.id,
        author: req.user.displayName || req.user.email,
        createdAt: new Date().toISOString(),
      };
      const updates = { [`announcements/${announcementRef.key}`]: announcement };
      addAuditUpdate(updates, database, req.user, "announcement.created", "announcement", announcementRef.key);
      await database.ref().update(updates);
      res.status(201).json({ announcement: { id: announcementRef.key, ...announcement } });
    } catch (error) {
      next(error);
    }
  });

  app.get(`${apiPrefix}/users`, authenticated, requirePermission("users:read"), parsePagination, async (req, res, next) => {
    try {
      const users = (await getRecords(database, "users"))
        .sort((left, right) => left.email.localeCompare(right.email));
      res.json({ users: pageRecords(users, req.pagination) });
    } catch (error) {
      next(error);
    }
  });

  app.post(`${apiPrefix}/users`, authenticated, requirePermission("users:write"), parseBody(userSchema), async (req, res, next) => {
    let createdUser;
    try {
      const { email, password, role } = req.validatedBody;
      createdUser = await firebaseAuth.createUser({ email: email.toLowerCase(), password, disabled: false });
      await firebaseAuth.setCustomUserClaims(createdUser.uid, { role });
      const now = new Date().toISOString();
      const user = {
        email: createdUser.email,
        displayName: "",
        jobTitle: "",
        role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      const updates = { [`users/${createdUser.uid}`]: user };
      addAuditUpdate(updates, database, req.user, "user.created", "user", createdUser.uid, { role });
      await database.ref().update(updates);
      res.status(201).json({ user: { id: createdUser.uid, ...user } });
    } catch (error) {
      if (createdUser?.uid) {
        try {
          await firebaseAuth.deleteUser(createdUser.uid);
        } catch (cleanupError) {
          console.error("Could not remove incomplete Firebase account:", cleanupError.code || "unknown");
        }
      }
      next(error);
    }
  });

  app.get(`${apiPrefix}/audit-logs`, authenticated, requirePermission("audit:read"), parsePagination, async (req, res, next) => {
    try {
      const { limit, offset } = req.pagination;
      const snapshot = await database.ref("auditLogs").orderByChild("createdAt").limitToLast(limit + offset).get();
      const auditLogs = recordsFromSnapshot(snapshot)
        .sort(compareCreatedAtDescending)
        .slice(offset, offset + limit);
      res.json({ auditLogs });
    } catch (error) {
      next(error);
    }
  });

  app.use((req, res) => res.status(404).json({ error: "API route not found." }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof ZodError) return res.status(400).json({ error: "Invalid request." });
    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "An account with that email already exists." });
    }
    if (error.code === "auth/invalid-email" || error.code === "auth/weak-password") {
      return res.status(400).json({ error: "Firebase rejected the submitted account details." });
    }
    console.error("API request failed:", error.code || error.message);
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
    res.status(status).json({ error: status === 500 ? "The request could not be completed." : error.message });
  });

  return app;
}
