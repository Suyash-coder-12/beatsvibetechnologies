import "dotenv/config";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createFirebaseServices } from "./firebase-admin.js";

const config = loadConfig();
const { auth, database } = createFirebaseServices({
  projectId: config.firebaseProjectId,
  databaseUrl: config.firebaseDatabaseUrl,
});

const divisions = [
  { slug: "beatsvibe-rd", name: "BeatsVibe R&D", description: "AI research & development" },
  { slug: "beatsvibe-career", name: "BeatsVibe Career", description: "Internships & learning" },
  { slug: "beatsvibe-payments", name: "BeatsVibe Payments", description: "Payment gateway project · planned" },
  { slug: "beatsvibe-employees", name: "BeatsVibe Employees", description: "People & operations" },
  { slug: "dbm-system", name: "DBM System", description: "Business & client services" },
  { slug: "vedaiq-veda", name: "VedaIQ – Veda", description: "AI product development" },
];

async function seedDivisions() {
  const updates = {};
  const existing = (await database.ref("divisions").get()).val() || {};
  for (const division of divisions) {
    if (!existing[division.slug]) {
      updates[`divisions/${division.slug}`] = { ...division, isActive: true };
    }
  }
  if (Object.keys(updates).length) await database.ref().update(updates);
}

async function createBootstrapOwner() {
  if (!config.bootstrapOwnerEmail) return;
  const claimRef = database.ref("meta/bootstrapOwner");
  const claim = await claimRef.transaction((current) => {
    const claimedAt = Date.parse(current?.startedAt || current?.completedAt || "");
    if (Number.isFinite(claimedAt) && Date.now() - claimedAt < 10 * 60 * 1000) return undefined;
    return {
      email: config.bootstrapOwnerEmail,
      startedAt: new Date().toISOString(),
    };
  });
  if (!claim.committed) {
    console.info("Owner bootstrap was already claimed; no additional owner was created.");
    return;
  }

  let createdUser;
  try {
    const users = (await database.ref("users").get()).val() || {};
    if (Object.keys(users).length) {
      await claimRef.remove();
      console.info("Bootstrap owner was not created because workspace users already exist.");
      return;
    }
    createdUser = await auth.createUser({
      email: config.bootstrapOwnerEmail,
      password: config.bootstrapOwnerPassword,
      disabled: false,
    });
    await auth.setCustomUserClaims(createdUser.uid, { role: "owner" });
    const now = new Date().toISOString();
    await database.ref().update({
      [`users/${createdUser.uid}`]: {
        email: createdUser.email,
        displayName: "",
        jobTitle: "",
        role: "owner",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      "meta/bootstrapOwner": {
        email: createdUser.email,
        uid: createdUser.uid,
        completedAt: now,
      },
    });
    console.info(`Created initial owner account for ${createdUser.email}. Remove bootstrap values from the environment after sign-in.`);
  } catch (error) {
    if (createdUser?.uid) {
      try {
        await auth.deleteUser(createdUser.uid);
      } catch (cleanupError) {
        console.error("Could not remove incomplete bootstrap account:", cleanupError.code || "unknown");
      }
    }
    await claimRef.remove();
    throw error;
  }
}

try {
  await seedDivisions();
  await createBootstrapOwner();
  const app = createApp({
    firebaseAuth: auth,
    database,
    appOrigins: config.appOrigins,
    nodeEnv: config.nodeEnv,
  });
  const server = app.listen(config.apiPort, () => {
    console.info(`BeatsVibe One API listening on http://127.0.0.1:${config.apiPort}`);
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error) {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
}
