import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { parsePortfolio, type Portfolio } from "@/data/portfolio";
import { isLive, parseBlog, type Post } from "@/data/blog";
import { blogFile, blogSeedFile, dataDir } from "./paths";

/**
 * Runtime content store.
 *
 * The dashboard writes content to a JSON file in a data folder, so edits go
 * live without a rebuild. The public page reads it through `getContent()`,
 * which is cached; every save calls updateTag("content") so the next request
 * re-reads it.
 *
 * Data folder: CONTENT_DATA_DIR, or ".data" in the project. On first run it is
 * seeded from content/portfolio.json (the file in the repo). Point
 * CONTENT_DATA_DIR outside the app folder on hosts that replace app files on
 * redeploy, so dashboard edits survive.
 */

export const CONTENT_TAG = "content";
export const REVISIONS_TAG = "revisions";
const MAX_REVISIONS = 20;

const contentFile = () => path.join(dataDir(), "portfolio.json");
const revisionsDir = () => path.join(dataDir(), "revisions");
const seedFile = () => path.join(process.cwd(), "content", "portfolio.json");

/** Raw JSON as stored (dashboard copy, else the repo seed). */
export async function readRawContent(): Promise<Record<string, unknown>> {
  for (const file of [contentFile(), seedFile()]) {
    try {
      return JSON.parse(await fs.readFile(file, "utf8"));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
  }
  throw new Error(`No content found at ${contentFile()} or ${seedFile()}`);
}

/** Raw JSON for the dashboard editors (no defaults filled in). Cached until the next save. */
export async function getRawContent(): Promise<Record<string, unknown>> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return readRawContent();
}

/** Validated content for rendering. Cached until the next dashboard save. */
export async function getContent(): Promise<Portfolio> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return parsePortfolio(await readRawContent());
}

async function writeAtomic(file: string, data: string) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, data, "utf8");
  await fs.rename(tmp, file);
}

/**
 * Validate and save. Throws ContentError (with the field path) if invalid,
 * leaving the stored content untouched. Keeps the previous version as a revision.
 */
export async function saveRawContent(next: Record<string, unknown>): Promise<void> {
  parsePortfolio(next); // throws on invalid content
  const previous = await readRawContent().catch(() => null);
  if (previous) {
    const id = new Date().toISOString().replace(/[:.]/g, "-");
    await writeAtomic(path.join(revisionsDir(), `${id}.json`), JSON.stringify(previous, null, 2));
    await pruneRevisions();
  }
  await writeAtomic(contentFile(), JSON.stringify(next, null, 2) + "\n");
}

async function pruneRevisions() {
  const files = (await fs.readdir(revisionsDir()).catch(() => [] as string[]))
    .filter((f) => f.endsWith(".json"))
    .sort();
  await Promise.all(
    files.slice(0, Math.max(0, files.length - MAX_REVISIONS)).map((f) => fs.rm(path.join(revisionsDir(), f))),
  );
}

export interface RevisionInfo {
  id: string;
  savedAt: string;
}

/** Newest first. */
export async function listRevisions(): Promise<RevisionInfo[]> {
  "use cache";
  cacheTag(REVISIONS_TAG);
  cacheLife("max");
  const files = await fs.readdir(revisionsDir()).catch(() => [] as string[]);
  return files
    .filter((f) => /^[\dT-]+Z\.json$/.test(f))
    .sort()
    .reverse()
    .map((f) => {
      const id = f.replace(/\.json$/, "");
      // 2026-11-08T19-23-49-123Z → 2026-11-08T19:23:49.123Z
      const iso = id.replace(/T(\d\d)-(\d\d)-(\d\d)-(\d+)Z$/, "T$1:$2:$3.$4Z");
      return { id, savedAt: iso };
    });
}

export async function readRevision(id: string): Promise<Record<string, unknown>> {
  if (!/^[\dT-]+Z$/.test(id)) throw new Error("Invalid revision id");
  return JSON.parse(await fs.readFile(path.join(revisionsDir(), `${id}.json`), "utf8"));
}

/** Where content is stored, for the settings page. */
export async function storageInfo() {
  const usingSeed = await fs
    .access(contentFile())
    .then(() => false)
    .catch(() => true);
  return {
    dataDir: dataDir(),
    usingSeed,
    customDir: Boolean(process.env.CONTENT_DATA_DIR),
  };
}

/* ------------------------------------------------------------------ blog */

export const BLOG_TAG = "blog";

export async function readRawBlog(): Promise<{ posts: unknown[] }> {
  for (const file of [blogFile(), blogSeedFile()]) {
    try {
      const data = JSON.parse(await fs.readFile(file, "utf8"));
      return { posts: Array.isArray(data?.posts) ? data.posts : [] };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
  }
  return { posts: [] };
}

/** All posts (drafts included), newest first. Cached until the next blog save. */
export async function getAllPosts(): Promise<Post[]> {
  "use cache";
  cacheTag(BLOG_TAG);
  cacheLife("max");
  const posts = parseBlog(await readRawBlog());
  return posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

/**
 * Published posts whose publish date has passed, newest first. Refreshed on
 * every blog save, and at least hourly so scheduled posts go live on time.
 */
export async function getLivePosts(): Promise<Post[]> {
  "use cache";
  cacheTag(BLOG_TAG);
  cacheLife("hours");
  return (await getAllPosts()).filter((p) => isLive(p));
}

/** Validate and save all posts; keeps the previous file as a backup. */
export async function saveBlog(posts: unknown[]): Promise<void> {
  parseBlog({ posts });
  const previous = await fs.readFile(blogFile(), "utf8").catch(() => null);
  if (previous) {
    const id = new Date().toISOString().replace(/[:.]/g, "-");
    await writeAtomic(path.join(revisionsDir(), `blog-${id}.json`), previous);
    const files = (await fs.readdir(revisionsDir())).filter((f) => f.startsWith("blog-")).sort();
    await Promise.all(
      files.slice(0, Math.max(0, files.length - MAX_REVISIONS)).map((f) => fs.rm(path.join(revisionsDir(), f))),
    );
  }
  await writeAtomic(blogFile(), JSON.stringify({ posts }, null, 2) + "\n");
}

/* ----------------------------------------------------------------- media */

export const MEDIA_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};
export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const mediaDir = () => path.join(dataDir(), "media");
const MEDIA_NAME = /^[a-z0-9][a-z0-9-]*\.(jpe?g|png|webp|avif|gif)$/;

/** Store an uploaded image under a safe, unique name; returns its public URL. */
export async function saveMedia(originalName: string, data: Buffer): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();
  if (!MEDIA_TYPES[ext]) throw new Error("Only JPG, PNG, WebP, AVIF or GIF images are allowed.");
  if (data.length > MAX_MEDIA_BYTES) throw new Error("Images must be 5 MB or smaller.");
  const base =
    path
      .basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "image";
  const name = `${base}-${Date.now().toString(36)}${ext === ".jpeg" ? ".jpg" : ext}`;
  await fs.mkdir(mediaDir(), { recursive: true });
  await fs.writeFile(path.join(mediaDir(), name), data);
  return `/media/${name}`;
}

export async function readMedia(name: string): Promise<{ data: Buffer; type: string } | null> {
  if (!MEDIA_NAME.test(name)) return null;
  try {
    return { data: await fs.readFile(path.join(mediaDir(), name)), type: MEDIA_TYPES[path.extname(name)] };
  } catch {
    return null;
  }
}

export async function listMedia(): Promise<string[]> {
  const files = await fs.readdir(mediaDir()).catch(() => [] as string[]);
  return files
    .filter((f) => MEDIA_NAME.test(f))
    .sort()
    .reverse()
    .map((f) => `/media/${f}`);
}
