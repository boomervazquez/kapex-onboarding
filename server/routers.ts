import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { FORM_DEFINITIONS, FORM_PACKAGES, FormTypeId } from "../shared/forms";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createFormAssignments,
  createMagicLink,
  createOnboardingSession,
  createUploadedDocument,
  getDocumentsByFormAssignment,
  getDocumentsBySession,
  getFormById,
  getFormsBySession,
  getMagicLinkBySession,
  getMagicLinkByToken,
  getSessionById,
  getSessionsBySalesperson,
  incrementMagicLinkAccess,
  saveFormFieldData,
  submitForm as dbSubmitForm,
  updateSessionStatus,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";

// ─── Salesperson Procedures ───────────────────────────────────────────────────

const salespersonRouter = router({
  // Create a new onboarding session and send magic link
  createSession: protectedProcedure
    .input(
      z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerCompany: z.string().optional(),
        customerType: z.enum(["importer", "exporter", "both", "custom"]),
        customForms: z.array(z.string()).optional(),
        notes: z.string().optional(),
        origin: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create the session
      const sessionId = await createOnboardingSession({
        salespersonId: ctx.user.id,
        salespersonName: ctx.user.name ?? undefined,
        salespersonEmail: ctx.user.email ?? undefined,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerCompany: input.customerCompany,
        customerType: input.customerType,
        notes: input.notes,
      });

      // Determine which forms to assign
      const packageForms =
        input.customerType === "custom"
          ? (input.customForms ?? []) as FormTypeId[]
          : FORM_PACKAGES[input.customerType].forms;

      // Create form assignments
      const formInserts = packageForms.map((formType, index) => {
        const def = FORM_DEFINITIONS[formType as FormTypeId];
        return {
          sessionId,
          formType,
          formTitle: def.title,
          routingDepartment: def.routingDepartment,
          routingEmail: def.routingEmail,
          sortOrder: index,
        };
      });

      if (formInserts.length > 0) {
        await createFormAssignments(formInserts);
      }

      // Generate magic link token (30-day expiry)
      const token = nanoid(48);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await createMagicLink({
        sessionId,
        token,
        customerEmail: input.customerEmail,
        expiresAt,
      });

      const magicLinkUrl = `${input.origin}/onboard?token=${token}`;

      // Send notification to owner
      await notifyOwner({
        title: `New Onboarding Session: ${input.customerName}`,
        content: `${ctx.user.name ?? "A salesperson"} initiated onboarding for ${input.customerName} (${input.customerEmail}) — ${input.customerType} package.\n\nMagic link: ${magicLinkUrl}`,
      });

      return { sessionId, token, magicLinkUrl };
    }),

  // List all sessions for the logged-in salesperson
  listSessions: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await getSessionsBySalesperson(ctx.user.id);
    // Enrich with form counts
    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const forms = await getFormsBySession(session.id);
        const completedCount = forms.filter((f) => f.status === "completed").length;
        return { ...session, totalForms: forms.length, completedForms: completedCount };
      })
    );
    return enriched;
  }),

  // Get session detail with forms
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      if (session.salespersonId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const forms = await getFormsBySession(input.sessionId);
      const magicLink = await getMagicLinkBySession(input.sessionId);
      const documents = await getDocumentsBySession(input.sessionId);
      return { session, forms, magicLink, documents };
    }),

  // Resend / regenerate magic link
  regenerateMagicLink: protectedProcedure
    .input(z.object({ sessionId: z.number(), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      if (session.salespersonId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const token = nanoid(48);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await createMagicLink({
        sessionId: input.sessionId,
        token,
        customerEmail: session.customerEmail,
        expiresAt,
      });
      const magicLinkUrl = `${input.origin}/onboard?token=${token}`;
      return { token, magicLinkUrl };
    }),
});

// ─── Customer (Magic Link) Procedures ────────────────────────────────────────

const customerRouter = router({
  // Validate magic link token and return session info
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const link = await getMagicLinkByToken(input.token);
      if (!link) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired link." });
      if (link.expiresAt < new Date()) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "This link has expired. Please contact your K-APEX representative." });
      }
      const session = await getSessionById(link.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      const forms = await getFormsBySession(link.sessionId);
      const documents = await getDocumentsBySession(link.sessionId);
      await incrementMagicLinkAccess(input.token);
      return { session, forms, documents };
    }),

  // Save partial form data (auto-save)
  saveFormData: publicProcedure
    .input(
      z.object({
        token: z.string(),
        formId: z.number(),
        fieldData: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ input }) => {
      const link = await getMagicLinkByToken(input.token);
      if (!link || link.expiresAt < new Date()) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired link." });
      }
      const form = await getFormById(input.formId);
      if (!form || form.sessionId !== link.sessionId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await saveFormFieldData(input.formId, input.fieldData);
      // Mark session as in_progress
      await updateSessionStatus(link.sessionId, "in_progress");
      return { success: true };
    }),

  // Submit a completed form with signature
  submitForm: publicProcedure
    .input(
      z.object({
        token: z.string(),
        formId: z.number(),
        fieldData: z.record(z.string(), z.unknown()),
        signatureName: z.string().min(1),
        signatureTitle: z.string().optional().default(""),
      })
    )
    .mutation(async ({ input }) => {
      const link = await getMagicLinkByToken(input.token);
      if (!link || link.expiresAt < new Date()) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired link." });
      }
      const form = await getFormById(input.formId);
      if (!form || form.sessionId !== link.sessionId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      // Save final field data
      await saveFormFieldData(input.formId, input.fieldData, "completed");
      await dbSubmitForm(input.formId, input.signatureName, input.signatureTitle);

      // Check if all forms are now complete
      const allForms = await getFormsBySession(link.sessionId);
      const allComplete = allForms.every((f) => f.status === "completed");

      if (allComplete) {
        await updateSessionStatus(link.sessionId, "completed", new Date());
        const session = await getSessionById(link.sessionId);
        await notifyOwner({
          title: `Onboarding Complete: ${session?.customerName}`,
          content: `All forms have been submitted by ${session?.customerName} (${session?.customerEmail}). The onboarding session is now complete.\n\nForms submitted:\n${allForms.map((f) => `• ${f.formTitle} → ${f.routingDepartment}`).join("\n")}`,
        });
      } else {
        await updateSessionStatus(link.sessionId, "in_progress");
      }

      return { success: true, allComplete };
    }),

  // Upload a supporting document
  uploadDocument: publicProcedure
    .input(
      z.object({
        token: z.string(),
        formId: z.number().optional(),
        fileName: z.string(),
        fileBase64: z.string(),
        mimeType: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const link = await getMagicLinkByToken(input.token);
      if (!link || link.expiresAt < new Date()) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired link." });
      }

      // Decode base64 and upload to S3
      const buffer = Buffer.from(input.fileBase64, "base64");
      const fileSize = buffer.length;
      if (fileSize > 10 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File size must be under 10MB." });
      }

      const suffix = nanoid(8);
      const fileKey = `onboarding/${link.sessionId}/${suffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      const docId = await createUploadedDocument({
        sessionId: link.sessionId,
        formAssignmentId: input.formId,
        uploadedByEmail: link.customerEmail,
        fileName: input.fileName,
        fileKey,
        fileUrl: url,
        mimeType: input.mimeType,
        fileSize,
        description: input.description,
      });

      return { success: true, docId, fileUrl: url };
    }),

  // Get documents for a specific form
  getFormDocuments: publicProcedure
    .input(z.object({ token: z.string(), formId: z.number() }))
    .query(async ({ input }) => {
      const link = await getMagicLinkByToken(input.token);
      if (!link || link.expiresAt < new Date()) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return getDocumentsByFormAssignment(input.formId);
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  salesperson: salespersonRouter,
  customer: customerRouter,
});

export type AppRouter = typeof appRouter;
