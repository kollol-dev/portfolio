// Plain JavaScript on purpose: Next.js must compile a next.config.ts with its
// native SWC binary, which can't load on hosts with an old glibc (Hostinger).
// A .mjs config loads directly in Node, no compiler needed.

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
