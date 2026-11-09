/**
 * Content model: types, validation and helpers. No I/O.
 *
 * The content itself is edited in the admin dashboard (/admin), or by hand in
 * the JSON file it saves (see src/content/store.ts). `parsePortfolio` checks
 * every field, fills in defaults and returns the typed object the site uses.
 * A mistake (missing field, wrong type, unknown value) throws a ContentError
 * naming the exact field, so a bad save is rejected instead of breaking the page.
 *
 * Strings starting with "[PLACEHOLDER]" render as a dashed TBD marker.
 */

export const PLACEHOLDER_PREFIX = "[PLACEHOLDER]";
export const isPlaceholder = (value: string | undefined | null): boolean =>
  !value || value.startsWith(PLACEHOLDER_PREFIX);

/* ------------------------------------------------------------------ types */

export type SocialKind = "github" | "linkedin" | "email";

export interface SocialLink {
  kind: SocialKind;
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  location: string;
  availability: string;
  headline: string;
  summary: string;
  email: string;
  resumePath: string;
  /** Portrait for the ID card, served from /public. */
  photo: string;
  /** Profile links plus an email link added automatically. */
  socials: SocialLink[];
}

export interface Role {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
  stack: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  period: string;
  credentialId: string;
  verifyUrl?: string;
  /** Shown on the framed certificate in 3D. */
  featured: boolean;
}

export interface Project {
  name: string;
  context: string;
  role: string;
  summary: string;
  architecture: string[];
  challenges: string[];
  stack: string[];
  github?: string;
  live?: string;
  /** Private / proprietary work — explains why links are absent. */
  confidential: boolean;
  /** Shown on the 3D laptop. */
  featured: boolean;
  /** What the 3D laptop screen shows; defaults derive from `stack`. */
  screen: { tagline: string; pipeline: string[] };
}

export interface Education {
  institution: string;
  degree: string;
  location: string;
  period: string;
  achievements: string[];
  /** Lettering on the 3D book cover. */
  cover: { title: string; subtitle: string };
}

export type ActivityKind = "leadership" | "volunteering" | "award";

export interface Activity {
  kind: ActivityKind;
  title: string;
  organisation: string;
  period: string;
  description: string;
  /** Short text inside the badge on the 3D phone. */
  badge: string;
  /** Pill text on the 3D phone. */
  tags: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface SectionCopy {
  navLabel: string;
  /** Small label above the heading. */
  eyebrow: string;
  /** Heading; wrap words in *asterisks* for the Steel Blue serif accent. */
  title: string;
  /** Caption on the 3D stage while this section's prop is shown. */
  stageCaption: string | null;
  /** Experience only: heading above the skills list. */
  toolkitTitle?: string;
  /** Contact only: sentence under the heading. */
  intro?: string;
}

export const SECTION_KEYS = [
  "intro",
  "experience",
  "certifications",
  "projects",
  "education",
  "activities",
  "contact",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export interface PortfolioSeo {
  /** <title>; empty means "Name — Title". */
  title?: string;
  /** Meta description; empty means "Name — Title. Summary". */
  description?: string;
  /** Main phrase you want to rank for (Rank Math-style analysis). */
  focusKeyword?: string;
  secondaryKeywords: string[];
  keywords: string[];
  /** Ask search engines not to index the site (e.g. while drafting). */
  noindex: boolean;
}

export interface Portfolio {
  profile: Profile;
  seo: PortfolioSeo;
  sections: Record<SectionKey, SectionCopy>;
  skills: SkillGroup[];
  experience: Role[];
  certifications: Certification[];
  projects: Project[];
  education: Education[];
  activities: Activity[];
  closingStatement: string;
}

/* ------------------------------------------------------------- validation */

type Obj = Record<string, unknown>;

export class ContentError extends Error {
  constructor(
    /** Field path, e.g. "experience[2].start" — the dashboard highlights it. */
    readonly path: string,
    readonly problem: string,
  ) {
    super(`Content error → ${path} ${problem}`);
    this.name = "ContentError";
  }
}

function obj(v: unknown, path: string): Obj {
  if (typeof v !== "object" || v === null || Array.isArray(v)) throw new ContentError(path, "must be an object { … }");
  return v as Obj;
}
function str(o: Obj, key: string, path: string): string {
  const v = o[key];
  if (typeof v !== "string" || v.trim() === "") throw new ContentError(`${path}.${key}`, "must be non-empty text");
  return v;
}
/** Optional text: missing, null or "" all mean "not set". */
function optStr(o: Obj, key: string, path: string): string | undefined {
  const v = o[key];
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v !== "string") throw new ContentError(`${path}.${key}`, "must be text");
  return v;
}
function bool(o: Obj, key: string, path: string): boolean {
  const v = o[key];
  if (v === undefined) return false;
  if (typeof v !== "boolean") throw new ContentError(`${path}.${key}`, "must be true or false");
  return v;
}
function list<T>(v: unknown, path: string, item: (x: unknown, p: string) => T): T[] {
  if (!Array.isArray(v)) throw new ContentError(path, "must be a list [ … ]");
  return v.map((x, i) => item(x, `${path}[${i}]`));
}
function strList(o: Obj, key: string, path: string, optional = false): string[] {
  if (optional && o[key] === undefined) return [];
  return list(o[key], `${path}.${key}`, (x, p) => {
    if (typeof x !== "string") throw new ContentError(p, "must be text");
    return x;
  });
}
function oneOf<T extends string>(o: Obj, key: string, path: string, allowed: readonly T[]): T {
  const v = str(o, key, path);
  if (!allowed.includes(v as T)) throw new ContentError(`${path}.${key}`, `must be one of: ${allowed.join(", ")}`);
  return v as T;
}

const initials = (text: string) =>
  text
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function parse(data: unknown): Portfolio {
  const root = obj(data, "(root)");

  const p = obj(root.profile, "profile");
  const email = str(p, "email", "profile");
  const socials = list(p.socials, "profile.socials", (x, path) => {
    const s = obj(x, path);
    return {
      kind: oneOf(s, "kind", path, ["github", "linkedin", "email"] as const),
      label: str(s, "label", path),
      href: str(s, "href", path),
    };
  });
  if (!socials.some((s) => s.kind === "email"))
    socials.push({ kind: "email", label: "Email", href: `mailto:${email}` });

  const profile: Profile = {
    name: str(p, "name", "profile"),
    firstName: str(p, "firstName", "profile"),
    lastName: str(p, "lastName", "profile"),
    title: str(p, "title", "profile"),
    location: str(p, "location", "profile"),
    availability: str(p, "availability", "profile"),
    headline: str(p, "headline", "profile"),
    summary: str(p, "summary", "profile"),
    email,
    resumePath: str(p, "resumePath", "profile"),
    photo: str(p, "photo", "profile"),
    socials,
  };

  const seo = obj(root.seo ?? {}, "seo");
  const sectionsRaw = obj(root.sections, "sections");
  const sections = Object.fromEntries(
    SECTION_KEYS.map((key) => {
      const path = `sections.${key}`;
      const s = obj(sectionsRaw[key], path);
      const copy: SectionCopy = {
        navLabel: str(s, "navLabel", path),
        eyebrow: key === "intro" ? profile.title : str(s, "eyebrow", path),
        title: key === "intro" ? profile.name : str(s, "title", path),
        stageCaption: optStr(s, "stageCaption", path) ?? null,
        toolkitTitle: optStr(s, "toolkitTitle", path),
        intro: optStr(s, "intro", path),
      };
      return [key, copy];
    }),
  ) as Record<SectionKey, SectionCopy>;

  const skills = list(root.skills, "skills", (x, path) => {
    const s = obj(x, path);
    return { label: str(s, "label", path), items: strList(s, "items", path) };
  });

  const experience = list(root.experience, "experience", (x, path) => {
    const r = obj(x, path);
    return {
      company: str(r, "company", path),
      role: str(r, "role", path),
      location: str(r, "location", path),
      start: str(r, "start", path),
      end: str(r, "end", path),
      highlights: strList(r, "highlights", path),
      stack: strList(r, "stack", path, true),
    };
  });

  const certifications = list(root.certifications, "certifications", (x, path) => {
    const c = obj(x, path);
    return {
      name: str(c, "name", path),
      issuer: str(c, "issuer", path),
      period: str(c, "period", path),
      credentialId: optStr(c, "credentialId", path) ?? `${PLACEHOLDER_PREFIX} Credential ID`,
      verifyUrl: optStr(c, "verifyUrl", path),
      featured: bool(c, "featured", path),
    };
  });

  const projects = list(root.projects, "projects", (x, path) => {
    const pr = obj(x, path);
    const stack = strList(pr, "stack", path, true);
    const screenPath = `${path}.screen`;
    const screen = pr.screen === undefined ? {} : obj(pr.screen, screenPath);
    const pipeline = strList(screen, "pipeline", screenPath, true).slice(0, 4);
    return {
      name: str(pr, "name", path),
      context: str(pr, "context", path),
      role: str(pr, "role", path),
      summary: str(pr, "summary", path),
      architecture: strList(pr, "architecture", path),
      challenges: strList(pr, "challenges", path),
      stack,
      github: optStr(pr, "github", path),
      live: optStr(pr, "live", path),
      confidential: bool(pr, "confidential", path),
      featured: bool(pr, "featured", path),
      screen: {
        tagline: optStr(screen, "tagline", screenPath) ?? stack.slice(0, 3).join(" · "),
        pipeline: pipeline.length ? pipeline : stack.slice(0, 4),
      },
    };
  });

  const education = list(root.education, "education", (x, path) => {
    const e = obj(x, path);
    const degree = str(e, "degree", path);
    const coverPath = `${path}.cover`;
    const cover = e.cover === undefined ? {} : obj(e.cover, coverPath);
    const [before, after] = degree.split(/\s+in\s+/);
    return {
      institution: str(e, "institution", path),
      degree,
      location: str(e, "location", path),
      period: str(e, "period", path),
      achievements: strList(e, "achievements", path, true),
      cover: {
        title: optStr(cover, "title", coverPath) ?? before,
        subtitle: optStr(cover, "subtitle", coverPath) ?? after ?? "",
      },
    };
  });

  const activities = list(root.activities, "activities", (x, path) => {
    const a = obj(x, path);
    const title = str(a, "title", path);
    return {
      kind: oneOf(a, "kind", path, ["leadership", "volunteering", "award"] as const),
      title,
      organisation: str(a, "organisation", path),
      period: str(a, "period", path),
      description: str(a, "description", path),
      badge: optStr(a, "badge", path) ?? (initials(title) || "★"),
      tags: strList(a, "tags", path, true),
    };
  });

  if (experience.length === 0) throw new ContentError("experience", "needs at least one role");
  if (education.length === 0) throw new ContentError("education", "needs at least one entry");

  return {
    profile,
    seo: {
      title: optStr(seo, "title", "seo"),
      description: optStr(seo, "description", "seo"),
      focusKeyword: optStr(seo, "focusKeyword", "seo"),
      secondaryKeywords: strList(seo, "secondaryKeywords", "seo", true),
      keywords: strList(seo, "keywords", "seo", true),
      noindex: bool(seo, "noindex", "seo"),
    },
    sections,
    skills,
    experience,
    certifications,
    projects,
    education,
    activities,
    closingStatement: str(root, "closingStatement", "(root)"),
  };
}

/** Validate raw JSON content; throws ContentError on the first bad field. */
export const parsePortfolio = (data: unknown): Portfolio => parse(data);

/* ------------------------------------------------------------ selectors */

/** Item marked `"featured": true`, else the first one. */
export const featured = <T extends { featured: boolean }>(items: T[]): T | undefined =>
  items.find((i) => i.featured) ?? items[0];

/** Year the career started (earliest role), e.g. "2019". */
export const careerStartYear = (content: Portfolio): string | undefined =>
  content.experience.at(-1)?.start.match(/\d{4}/)?.[0];

/** Page <title>: the SEO title if set, else "Name — Title". */
export const seoTitle = (content: Portfolio) =>
  content.seo.title ?? `${content.profile.name} — ${content.profile.title}`;

/** Meta description: the SEO description if set, else "Name — Title. Summary". */
export const seoDescription = (content: Portfolio) =>
  content.seo.description ?? `${content.profile.name} — ${content.profile.title}. ${content.profile.summary}`;

/** "github.com/handle" style display text for a profile URL. */
export const displayUrl = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
