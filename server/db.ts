import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  FormAssignment,
  InsertFormAssignment,
  InsertMagicLink,
  InsertOnboardingSession,
  InsertUploadedDocument,
  InsertUser,
  MagicLink,
  OnboardingSession,
  UploadedDocument,
  formAssignments,
  magicLinks,
  onboardingSessions,
  uploadedDocuments,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Onboarding Sessions ──────────────────────────────────────────────────────

export async function createOnboardingSession(data: InsertOnboardingSession): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(onboardingSessions).values(data).returning({ id: onboardingSessions.id });
  return result[0].id;
}

export async function getSessionsBySalesperson(salespersonId: number): Promise<OnboardingSession[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(onboardingSessions)
    .where(eq(onboardingSessions.salespersonId, salespersonId))
    .orderBy(desc(onboardingSessions.createdAt));
}

export async function getSessionById(id: number): Promise<OnboardingSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(onboardingSessions).where(eq(onboardingSessions.id, id)).limit(1);
  return result[0];
}

export async function updateSessionStatus(
  id: number,
  status: OnboardingSession["status"],
  completedAt?: Date
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(onboardingSessions)
    .set({ status, ...(completedAt ? { completedAt } : {}) })
    .where(eq(onboardingSessions.id, id));
}

// ─── Form Assignments ─────────────────────────────────────────────────────────

export async function createFormAssignments(forms: InsertFormAssignment[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(formAssignments).values(forms);
}

export async function getFormsBySession(sessionId: number): Promise<FormAssignment[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(formAssignments)
    .where(eq(formAssignments.sessionId, sessionId))
    .orderBy(formAssignments.sortOrder);
}

export async function getFormById(id: number): Promise<FormAssignment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(formAssignments).where(eq(formAssignments.id, id)).limit(1);
  return result[0];
}

export async function saveFormFieldData(
  id: number,
  fieldData: Record<string, unknown>,
  status: FormAssignment["status"] = "in_progress"
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(formAssignments).set({ fieldData, status }).where(eq(formAssignments.id, id));
}

export async function submitForm(
  id: number,
  signatureName: string,
  signatureTitle: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  await db
    .update(formAssignments)
    .set({ status: "completed", signatureName, signatureTitle, signedAt: now, submittedAt: now })
    .where(eq(formAssignments.id, id));
}

// ─── Magic Links ──────────────────────────────────────────────────────────────

export async function createMagicLink(data: InsertMagicLink): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(magicLinks).values(data);
}

export async function getMagicLinkByToken(token: string): Promise<MagicLink | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(magicLinks).where(eq(magicLinks.token, token)).limit(1);
  return result[0];
}

export async function incrementMagicLinkAccess(token: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(magicLinks)
    .set({ accessCount: sql`${magicLinks.accessCount} + 1`, usedAt: new Date() })
    .where(eq(magicLinks.token, token));
}

export async function getMagicLinkBySession(sessionId: number): Promise<MagicLink | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(magicLinks)
    .where(eq(magicLinks.sessionId, sessionId))
    .orderBy(desc(magicLinks.createdAt))
    .limit(1);
  return result[0];
}

// ─── Uploaded Documents ───────────────────────────────────────────────────────

export async function createUploadedDocument(data: InsertUploadedDocument): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(uploadedDocuments).values(data).returning({ id: uploadedDocuments.id });
  return result[0].id;
}

export async function getDocumentsBySession(sessionId: number): Promise<UploadedDocument[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(uploadedDocuments)
    .where(eq(uploadedDocuments.sessionId, sessionId))
    .orderBy(desc(uploadedDocuments.createdAt));
}

export async function getDocumentsByFormAssignment(formAssignmentId: number): Promise<UploadedDocument[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(uploadedDocuments)
    .where(
      and(
        eq(uploadedDocuments.formAssignmentId, formAssignmentId)
      )
    )
    .orderBy(desc(uploadedDocuments.createdAt));
}
