import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock all DB helpers ──────────────────────────────────────────────────────
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  createOnboardingSession: vi.fn().mockResolvedValue(42),
  getSessionsBySalesperson: vi.fn().mockResolvedValue([]),
  getSessionById: vi.fn().mockResolvedValue(null),
  updateSessionStatus: vi.fn(),
  createFormAssignments: vi.fn(),
  getFormsBySession: vi.fn().mockResolvedValue([]),
  getFormById: vi.fn().mockResolvedValue(null),
  saveFormFieldData: vi.fn(),
  submitForm: vi.fn(),
  createMagicLink: vi.fn(),
  getMagicLinkByToken: vi.fn().mockResolvedValue(null),
  getMagicLinkBySession: vi.fn().mockResolvedValue(null),
  incrementMagicLinkAccess: vi.fn(),
  createUploadedDocument: vi.fn().mockResolvedValue(1),
  getDocumentsBySession: vi.fn().mockResolvedValue([]),
  getDocumentsByFormAssignment: vi.fn().mockResolvedValue([]),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/file.pdf", key: "test/file.pdf" }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAuthCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test Salesperson",
      email: "sales@kln.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("salesperson.createSession", () => {
  it("creates a session and returns sessionId + magicLinkUrl", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.salesperson.createSession({
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      customerType: "importer",
      origin: "https://test.manus.space",
    });
    expect(result.sessionId).toBe(42);
    expect(result.magicLinkUrl).toContain("/onboard?token=");
    expect(result.token).toBeTruthy();
  });

  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.salesperson.createSession({
        customerName: "Jane",
        customerEmail: "jane@example.com",
        customerType: "importer",
        origin: "https://test.manus.space",
      })
    ).rejects.toThrow();
  });
});

describe("salesperson.listSessions", () => {
  it("returns empty array when no sessions exist", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.salesperson.listSessions();
    expect(result).toEqual([]);
  });
});

describe("customer.validateToken", () => {
  it("throws NOT_FOUND for missing token", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.customer.validateToken({ token: "invalid-token" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("customer.saveFormData", () => {
  it("throws UNAUTHORIZED for expired/missing token", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.customer.saveFormData({ token: "bad-token", formId: 1, fieldData: { name: "test" } })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("customer.submitForm", () => {
  it("throws UNAUTHORIZED for expired/missing token", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.customer.submitForm({
        token: "bad-token",
        formId: 1,
        fieldData: {},
        signatureName: "Jane Doe",
        signatureTitle: "CFO",
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const ctx = makeAuthCtx();
    const clearedCookies: string[] = [];
    (ctx.res as unknown as { clearCookie: (n: string, o: unknown) => void }).clearCookie = (name: string) => {
      clearedCookies.push(name);
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
  });
});
