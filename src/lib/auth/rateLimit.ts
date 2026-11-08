/*
 * In-memory login throttle: 5 failed attempts per 15 minutes per IP.
 * Single-process apps (like a Hostinger Node.js app) need nothing more.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; first: number }>();

export function loginBlockedFor(ip: string): number {
  const entry = failures.get(ip);
  if (!entry) return 0;
  const elapsed = Date.now() - entry.first;
  if (elapsed > WINDOW_MS) {
    failures.delete(ip);
    return 0;
  }
  return entry.count >= MAX_FAILURES ? WINDOW_MS - elapsed : 0;
}

export function recordLoginFailure(ip: string) {
  const entry = failures.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) failures.set(ip, { count: 1, first: Date.now() });
  else entry.count += 1;
}

export function clearLoginFailures(ip: string) {
  failures.delete(ip);
}
