import { z } from "zod";

const passwordSchema = z.string().min(12).max(128).refine((value) => Buffer.byteLength(value, "utf8") <= 128, "Password must not exceed 128 UTF-8 bytes.");

export const employeeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  divisionSlug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  status: z.enum(["active", "on_leave", "inactive"]).default("active"),
}).strict();

export const projectSchema = z.object({
  name: z.string().trim().min(3).max(140),
  description: z.string().trim().max(4000).optional(),
  divisionSlug: z.string().regex(/^[a-z0-9-]+$/),
  dueAt: z.iso.date().optional(),
}).strict();

export const taskSchema = z.object({
  title: z.string().trim().min(2).max(180),
  projectId: z.string().regex(/^[A-Za-z0-9_-]{20}$/),
  description: z.string().trim().max(4000).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueAt: z.iso.date().optional(),
  assigneeEmail: z.email().max(254).optional(),
}).strict();

export const eventSchema = z.object({
  title: z.string().trim().min(3).max(180),
  startAt: z.iso.datetime(),
  details: z.string().trim().max(4000).optional(),
  location: z.string().trim().max(240).optional(),
}).strict();

export const announcementSchema = z.object({
  title: z.string().trim().min(3).max(180),
  label: z.string().trim().min(2).max(40),
  description: z.string().trim().min(1).max(4000),
}).strict();

export const userSchema = z.object({
  email: z.email().max(254),
  password: passwordSchema,
  role: z.enum(["cto", "admin", "hr", "team_leader", "employee", "intern"]),
}).strict();

export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one profile field.");

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
});
