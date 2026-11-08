"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ContentError } from "@/data/portfolio";
import { randomUUID } from "node:crypto";
import {
  BLOG_TAG,
  CONTENT_TAG,
  REVISIONS_TAG,
  readRawBlog,
  readRawContent,
  readRevision,
  saveBlog,
  saveRawContent,
} from "@/content/store";
import { parsePost, PostError, type Post } from "@/data/blog";
import { EDITORS } from "@/content/editors";
import { clientIp, endSession, requireAdmin, startSession } from "@/lib/auth/session";
import { readAuthConfig } from "@/lib/auth/token";
import { verifyPassword } from "@/lib/auth/password";
import { clearLoginFailures, loginBlockedFor, recordLoginFailure } from "@/lib/auth/rateLimit";

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string; path?: string };

/* ------------------------------------------------------------------ auth */

export interface LoginState {
  error?: string;
  notConfigured?: boolean;
}

const safeNext = (value: FormDataEntryValue | null) => {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("//") && !next.startsWith("/admin/login") ? next : "/admin";
};

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const config = readAuthConfig();
  if (!config) return { notConfigured: true };

  const ip = await clientIp();
  const waitMs = loginBlockedFor(ip);
  if (waitMs > 0) return { error: `Too many attempts. Try again in ${Math.ceil(waitMs / 60000)} minutes.` };

  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const userOk = username === config.username;
  // Always run the hash check so timing doesn't reveal valid usernames.
  const passOk = await verifyPassword(password, config.passwordHash).catch(() => false);

  if (!userOk || !passOk) {
    recordLoginFailure(ip);
    await new Promise((r) => setTimeout(r, 400));
    return { error: "Incorrect username or password." };
  }

  clearLoginFailures(ip);
  await startSession(config.username, form.get("remember") === "on");
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* --------------------------------------------------------------- content */

function refresh() {
  updateTag(CONTENT_TAG);
  updateTag(REVISIONS_TAG);
}

async function save(next: Record<string, unknown>): Promise<SaveResult> {
  try {
    await saveRawContent(next);
    refresh();
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (e) {
    if (e instanceof ContentError) return { ok: false, error: `${e.path} ${e.problem}`, path: e.path };
    console.error("[admin] save failed", e);
    return { ok: false, error: "Couldn't save. Check the server logs and that the data folder is writable." };
  }
}

const EDITABLE_KEYS = new Set([...EDITORS.flatMap((e) => e.keys), "seo"]);

/** Save some top-level keys (one editor's worth); everything else is kept as is. */
export async function saveContent(patch: Record<string, unknown>): Promise<SaveResult> {
  await requireAdmin();
  const keys = Object.keys(patch);
  if (!keys.length || keys.some((k) => !EDITABLE_KEYS.has(k))) return { ok: false, error: "Unknown content section." };
  const current = await readRawContent();
  return save({ ...current, ...patch });
}

/** Replace all content (import). */
export async function importContent(json: string): Promise<SaveResult> {
  await requireAdmin();
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: "Expected a JSON object." };
  return save(data as Record<string, unknown>);
}

export async function restoreRevision(id: string): Promise<SaveResult> {
  await requireAdmin();
  try {
    return save(await readRevision(id));
  } catch {
    return { ok: false, error: "That revision couldn't be read." };
  }
}

/* ------------------------------------------------------------------ blog */

export type PostSaveResult = { ok: true; savedAt: string; post: Post } | { ok: false; error: string; field?: string };

function refreshBlog() {
  updateTag(BLOG_TAG);
}

export async function createPost() {
  await requireAdmin();
  const { posts } = await readRawBlog();
  const id = randomUUID().slice(0, 8);
  const now = new Date().toISOString();
  posts.unshift({
    id,
    slug: `untitled-draft-${id}`,
    title: "Untitled draft",
    excerpt: "",
    body: "## Introduction\n\nStart writing here.\n",
    status: "draft",
    publishedAt: now,
    updatedAt: now,
    category: "Notes",
    tags: [],
    faqs: [],
    seo: { secondaryKeywords: [], noindex: false },
  });
  await saveBlog(posts);
  refreshBlog();
  redirect(`/admin/blog/${id}`);
}

/** Save one post. Publishing for the first time stamps the publish date. */
export async function savePost(
  input: Record<string, unknown>,
  intent: "save" | "publish" | "unpublish" = "save",
): Promise<PostSaveResult> {
  await requireAdmin();
  try {
    const { posts } = await readRawBlog();
    const index = posts.findIndex((p) => (p as { id?: string }).id === input.id);
    if (index < 0) return { ok: false, error: "This post no longer exists." };
    const previous = posts[index] as { status?: string };
    const now = new Date().toISOString();
    const next: Record<string, unknown> = { ...input, updatedAt: now };
    if (intent === "publish") {
      next.status = "published";
      if (previous.status !== "published" && !input.keepDate) next.publishedAt = now;
    }
    if (intent === "unpublish") next.status = "draft";
    delete next.keepDate;
    const post = parsePost(next);
    if (posts.some((p, i) => i !== index && (p as { slug?: string }).slug === post.slug))
      return { ok: false, error: `Another post already uses the URL /blog/${post.slug}.`, field: "slug" };
    posts[index] = post;
    await saveBlog(posts);
    refreshBlog();
    return { ok: true, savedAt: now, post };
  } catch (e) {
    if (e instanceof PostError) return { ok: false, error: e.message, field: e.field };
    console.error("[admin] post save failed", e);
    return { ok: false, error: "Couldn't save. Check that the data folder is writable." };
  }
}

export async function deletePost(id: string) {
  await requireAdmin();
  const { posts } = await readRawBlog();
  await saveBlog(posts.filter((p) => (p as { id?: string }).id !== id));
  refreshBlog();
  redirect("/admin/blog");
}
