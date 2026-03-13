import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const customerTypeEnum = pgEnum("customer_type", ["importer", "exporter", "both", "custom"]);
export const sessionStatusEnum = pgEnum("session_status", ["pending", "in_progress", "completed", "expired"]);
export const formStatusEnum = pgEnum("form_status", ["pending", "in_progress", "completed"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Onboarding sessions initiated by salespersons
export const onboardingSessions = pgTable("onboarding_sessions", {
  id: serial("id").primaryKey(),
  // Salesperson who created this session
  salespersonId: integer("salespersonId").notNull(),
  salespersonName: varchar("salespersonName", { length: 255 }),
  salespersonEmail: varchar("salespersonEmail", { length: 320 }),
  // Customer info
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerCompany: varchar("customerCompany", { length: 255 }),
  // Customer type determines which form package is assigned
  customerType: customerTypeEnum("customerType").notNull(),
  // Overall session status
  status: sessionStatusEnum("status").default("pending").notNull(),
  // Notes from salesperson
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type OnboardingSession = typeof onboardingSessions.$inferSelect;
export type InsertOnboardingSession = typeof onboardingSessions.$inferInsert;

// Individual form assignments within a session
export const formAssignments = pgTable("form_assignments", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  // Form type identifier
  formType: varchar("formType", { length: 64 }).notNull(),
  formTitle: varchar("formTitle", { length: 255 }).notNull(),
  // Routing info: where this form goes when completed
  routingDepartment: varchar("routingDepartment", { length: 255 }),
  routingEmail: varchar("routingEmail", { length: 320 }),
  // Display order
  sortOrder: integer("sortOrder").default(0).notNull(),
  // Status of this individual form
  status: formStatusEnum("status").default("pending").notNull(),
  // JSON blob of all field values (saved incrementally)
  fieldData: jsonb("fieldData"),
  // Signature info
  signatureName: varchar("signatureName", { length: 255 }),
  signatureTitle: varchar("signatureTitle", { length: 255 }),
  signedAt: timestamp("signedAt"),
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FormAssignment = typeof formAssignments.$inferSelect;
export type InsertFormAssignment = typeof formAssignments.$inferInsert;

// Magic links for passwordless customer access
export const magicLinks = pgTable("magic_links", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  // How many times the link has been accessed (not one-time use — customers can return)
  accessCount: integer("accessCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MagicLink = typeof magicLinks.$inferSelect;
export type InsertMagicLink = typeof magicLinks.$inferInsert;

// Supporting documents uploaded by customers
export const uploadedDocuments = pgTable("uploaded_documents", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  formAssignmentId: integer("formAssignmentId"),
  uploadedByEmail: varchar("uploadedByEmail", { length: 320 }),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  fileSize: integer("fileSize"),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UploadedDocument = typeof uploadedDocuments.$inferSelect;
export type InsertUploadedDocument = typeof uploadedDocuments.$inferInsert;
