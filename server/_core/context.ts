import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const DEMO_OPEN_ID = "demo-user-00000000";

async function getDemoUser(): Promise<User> {
  // Ensure the demo user exists in the database so foreign keys work
  await db.upsertUser({
    openId: DEMO_OPEN_ID,
    name: "Demo User",
    email: "demo@example.com",
    loginMethod: "demo",
    role: "admin",
    lastSignedIn: new Date(),
  });
  const user = await db.getUserByOpenId(DEMO_OPEN_ID);
  if (!user) throw new Error("Failed to create demo user");
  return user;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  if (ENV.demoMode) {
    try {
      user = await getDemoUser();
    } catch (error) {
      console.warn("[Demo] Failed to get demo user:", error);
      user = null;
    }
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
