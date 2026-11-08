/**
 * Blog model: types, validation and helpers. No I/O.
 * Posts are written in Markdown in the dashboard (/admin/blog).
 */

export type PostStatus = "draft" | "published";

export interface PostSeo {
  /** <title>; empty means the post title. */
  title?: string;
  /** Meta description; empty means the excerpt. */
  description?: string;
  focusKeyword?: string;
  secondaryKeywords: string[];
  /** Point search engines at another URL (e.g. if republished elsewhere). */
  canonical?: string;
  noindex: boolean;
}

export interface PostFaq {
  question: string;
  answer: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown */
  body: string;
  status: PostStatus;
  /** ISO date; a published post with a future date stays hidden until then. */
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  coverImage?: string;
  coverAlt?: string;
  faqs: PostFaq[];
  seo: PostSeo;
}

export class PostError extends Error {
  constructor(
    readonly field: string,
    readonly problem: string,
  ) {
    super(`${field} ${problem}`);
    this.name = "PostError";
  }
}

type Obj = Record<string, unknown>;
const str = (o: Obj, k: string, required = true): string => {
  const v = o[k];
  if (v === undefined || v === null || v === "") {
    if (required) throw new PostError(k, "is required");
    return "";
  }
  if (typeof v !== "string") throw new PostError(k, "must be text");
  return v;
};
const opt = (o: Obj, k: string) => str(o, k, false) || undefined;
const strList = (o: Obj, k: string): string[] => {
  const v = o[k];
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) throw new PostError(k, "must be a list of text");
  return (v as string[]).map((s) => s.trim()).filter(Boolean);
};
const isoDate = (o: Obj, k: string, fallback: string) => {
  const v = str(o, k, false) || fallback;
  if (Number.isNaN(Date.parse(v))) throw new PostError(k, "must be a valid date");
  return new Date(v).toISOString();
};

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Validate one post (throws PostError naming the field). */
export function parsePost(raw: unknown): Post {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new PostError("post", "must be an object");
  const o = raw as Obj;
  const now = new Date().toISOString();
  const title = str(o, "title").trim();
  const slug = (str(o, "slug", false) || slugify(title)).trim();
  if (!SLUG_RE.test(slug)) throw new PostError("slug", "may only use lowercase letters, numbers and single hyphens");
  const status = str(o, "status", false) || "draft";
  if (status !== "draft" && status !== "published") throw new PostError("status", "must be draft or published");
  const seo = (o.seo && typeof o.seo === "object" ? o.seo : {}) as Obj;
  const faqsRaw = o.faqs ?? [];
  if (!Array.isArray(faqsRaw)) throw new PostError("faqs", "must be a list");
  const canonical = opt(seo, "canonical");
  if (canonical && !/^https?:\/\//.test(canonical))
    throw new PostError("seo.canonical", "must be a full URL starting with https://");

  return {
    id: str(o, "id"),
    slug,
    title,
    excerpt: str(o, "excerpt", false).trim(),
    body: str(o, "body", false),
    status,
    publishedAt: isoDate(o, "publishedAt", now),
    updatedAt: isoDate(o, "updatedAt", now),
    category: str(o, "category", false).trim() || "Notes",
    tags: strList(o, "tags"),
    coverImage: opt(o, "coverImage"),
    coverAlt: opt(o, "coverAlt"),
    faqs: (faqsRaw as Obj[])
      .map((f, i) => {
        if (!f || typeof f !== "object") throw new PostError(`faqs[${i}]`, "must be an object");
        return { question: String(f.question ?? "").trim(), answer: String(f.answer ?? "").trim() };
      })
      .filter((f) => f.question && f.answer),
    seo: {
      title: opt(seo, "title"),
      description: opt(seo, "description"),
      focusKeyword: opt(seo, "focusKeyword"),
      secondaryKeywords: strList(seo, "secondaryKeywords"),
      canonical,
      noindex: seo.noindex === true,
    },
  };
}

/** Validate the whole blog and check slugs are unique. */
export function parseBlog(raw: unknown): Post[] {
  const list =
    raw && typeof raw === "object" && Array.isArray((raw as Obj).posts) ? ((raw as Obj).posts as unknown[]) : [];
  const posts = list.map((p, i) => {
    try {
      return parsePost(p);
    } catch (e) {
      if (e instanceof PostError) throw new PostError(`posts[${i}].${e.field}`, e.problem);
      throw e;
    }
  });
  const seen = new Set<string>();
  for (const p of posts) {
    if (seen.has(p.slug)) throw new PostError("slug", `“${p.slug}” is used by more than one post`);
    seen.add(p.slug);
  }
  return posts;
}

/** Published and not scheduled for later. */
export const isLive = (p: Post, now = Date.now()) => p.status === "published" && Date.parse(p.publishedAt) <= now;

export const postTitle = (p: Post) => p.seo.title || p.title;
export const postDescription = (p: Post) => p.seo.description || p.excerpt;
export const postPath = (p: Post) => `/blog/${p.slug}`;

export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/[#>*_`[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Related posts: shared tags/category first, then newest. */
export function relatedPosts(post: Post, all: Post[], limit = 2): Post[] {
  const score = (p: Post) =>
    p.tags.filter((t) => post.tags.includes(t)).length * 2 + (p.category === post.category ? 1 : 0);
  return all
    .filter((p) => p.id !== post.id)
    .sort((a, b) => score(b) - score(a) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit);
}
