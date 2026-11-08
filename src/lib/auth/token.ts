import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/*
 * Signed session tokens: base64url(JSON payload) + "." + HMAC-SHA256.
 * Shared by the proxy (route guard) and server code. Node runtime only.
 */

export const SESSION_COOKIE = "kc_admin_session";

export interface SessionPayload {
  /** Username */
  u: string;
  /** Expiry, ms since epoch */
  exp: number;
  /** Password-hash fingerprint: changing the password invalidates old sessions. */
  pv: string;
}

export interface AuthConfig {
  username: string;
  passwordHash: string;
  secret: string;
}

/** Admin credentials from the environment, or null if not configured. */
export function readAuthConfig(): AuthConfig | null {
  const username = process.env.ADMIN_USERNAME?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const secret = process.env.SESSION_SECRET?.trim();
  if (!username || !passwordHash || !secret || secret.length < 32) return null;
  return { username, passwordHash, secret };
}

export const passwordFingerprint = (passwordHash: string) =>
  createHash("sha256").update(passwordHash).digest("base64url").slice(0, 12);

const sign = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("base64url");

export function createToken(payload: SessionPayload, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

/** Returns the payload if the signature, expiry and password fingerprint all check out. */
export function verifyToken(token: string | undefined, config: AuthConfig | null): SessionPayload | null {
  if (!token || !config) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = Buffer.from(sign(data, config.secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (payload.u !== config.username || payload.pv !== passwordFingerprint(config.passwordHash)) return null;
    return payload;
  } catch {
    return null;
  }
}
