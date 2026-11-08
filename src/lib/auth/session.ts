import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  SESSION_COOKIE,
  createToken,
  passwordFingerprint,
  readAuthConfig,
  verifyToken,
  type SessionPayload,
} from "./token";

const SHORT_SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours
const LONG_SESSION_MS = 14 * 24 * 60 * 60 * 1000; // "Remember me": 14 days

/** Current admin session, or null. Reads the request cookie (request-time). */
export async function getSession(): Promise<SessionPayload | null> {
  // Per-request: the expiry check reads the clock, which must not be prerendered.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifyToken(token, readAuthConfig());
}

/** For Server Actions and Route Handlers: re-verify on every call. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function startSession(username: string, remember: boolean) {
  const config = readAuthConfig();
  if (!config) throw new Error("Admin login is not configured");
  const ttl = remember ? LONG_SESSION_MS : SHORT_SESSION_MS;
  const token = createToken(
    { u: username, exp: Date.now() + ttl, pv: passwordFingerprint(config.passwordHash) },
    config.secret,
  );
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    ...(remember ? { maxAge: ttl / 1000 } : {}),
  });
}

export async function endSession() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}

/** Best-effort client IP for rate limiting (behind Hostinger's proxy). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}
