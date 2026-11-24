import { z } from "zod";

const optionalValue = (schema) => z.preprocess((value) => value === "" ? undefined : value, schema.optional());

const configSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().regex(/^[a-z0-9-]{6,30}$/),
  FIREBASE_DATABASE_URL: z.url().refine((value) => value.startsWith("https://"), "Realtime Database URL must use HTTPS."),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ORIGINS: z.string().default("http://localhost:5173,http://127.0.0.1:5173"),
  BOOTSTRAP_OWNER_EMAIL: optionalValue(z.email()),
  BOOTSTRAP_OWNER_PASSWORD: optionalValue(z.string().min(12).max(128)),
});

export function loadConfig(env = process.env) {
  const parsed = configSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid Firebase backend configuration: ${issues.join("; ")}`);
  }
  if (Boolean(parsed.data.BOOTSTRAP_OWNER_EMAIL) !== Boolean(parsed.data.BOOTSTRAP_OWNER_PASSWORD)) {
    throw new Error("Set both BOOTSTRAP_OWNER_EMAIL and BOOTSTRAP_OWNER_PASSWORD, or leave both unset.");
  }
  if (parsed.data.BOOTSTRAP_OWNER_PASSWORD && Buffer.byteLength(parsed.data.BOOTSTRAP_OWNER_PASSWORD, "utf8") > 128) {
    throw new Error("BOOTSTRAP_OWNER_PASSWORD must not exceed 128 UTF-8 bytes.");
  }
  return {
    firebaseProjectId: parsed.data.FIREBASE_PROJECT_ID,
    firebaseDatabaseUrl: parsed.data.FIREBASE_DATABASE_URL,
    apiPort: parsed.data.API_PORT,
    nodeEnv: parsed.data.NODE_ENV,
    appOrigins: parsed.data.APP_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
    bootstrapOwnerEmail: parsed.data.BOOTSTRAP_OWNER_EMAIL?.toLowerCase(),
    bootstrapOwnerPassword: parsed.data.BOOTSTRAP_OWNER_PASSWORD,
  };
}
