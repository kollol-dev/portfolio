/**
 * Public site origin, used for canonical URLs, Open Graph and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://kollol.dev).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Make a forgotten placeholder obvious in production build logs.
if (
  process.env.NODE_ENV === "production" &&
  /localhost|your-domain\.com/.test(SITE_URL) &&
  typeof window === "undefined"
) {
  console.warn(`[site] NEXT_PUBLIC_SITE_URL is "${SITE_URL}". Set your real domain in .env.production.`);
}
