import { isPlaceholder, seoDescription, seoTitle, type Portfolio } from "@/data/portfolio";
import type { Post } from "@/data/blog";
import type { RenderedArticle } from "./markdown";

/**
 * Rank Math-style on-page SEO analysis. Pure and synchronous, so the SEO
 * editor can re-run it on every keystroke and the overview can show the
 * score of the saved content.
 */

export type CheckStatus = "pass" | "warn" | "fail";
export type CheckGroup = "basic" | "additional" | "title" | "readability";

export interface SeoCheck {
  id: string;
  group: CheckGroup;
  status: CheckStatus;
  label: string;
  detail: string;
  weight: number;
}

export interface SeoReport {
  score: number;
  rating: "good" | "ok" | "poor";
  checks: SeoCheck[];
  stats: { words: number; density: number; titleLength: number; descriptionLength: number; placeholders: number };
}

export const GROUP_LABELS: Record<CheckGroup, string> = {
  basic: "Basic SEO",
  additional: "Additional",
  title: "Title readability",
  readability: "Content readability",
};

const POWER_WORDS = [
  "proven",
  "expert",
  "senior",
  "lead",
  "build",
  "builds",
  "building",
  "scalable",
  "reliable",
  "real-world",
  "fast",
  "secure",
  "modern",
  "ultimate",
  "essential",
  "trusted",
  "impact",
  "results",
  "portfolio",
  "hire",
];

const stripMarks = (s: string) => s.replace(/\*/g, "");
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const words = (s: string) => s.split(/\s+/).filter(Boolean);
const real = (list: string[]) => list.filter((s) => !isPlaceholder(s));

function occurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return (haystack.match(new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "giu")) ?? []).length;
}

/** All visible copy on the page, roughly in reading order. */
export function pageCopy(c: Portfolio) {
  const intro = `${c.profile.headline} ${c.profile.summary}`;
  const headings = Object.values(c.sections).map((s) => stripMarks(`${s.eyebrow} ${s.title}`));
  const body = [
    intro,
    ...headings,
    ...c.experience.flatMap((r) => [r.role, r.company, ...r.highlights, ...r.stack]),
    ...c.skills.flatMap((g) => g.items),
    ...c.certifications.flatMap((x) => [x.name, x.issuer]),
    ...c.projects.flatMap((p) => [p.name, p.summary, ...p.architecture, ...p.challenges, ...p.stack]),
    ...c.education.flatMap((e) => [e.degree, e.institution, ...e.achievements]),
    ...c.activities.flatMap((a) => [a.title, a.organisation, a.description]),
    c.closingStatement,
    c.sections.contact.intro ?? "",
  ];
  return { intro, headings, body: real(body).join(" ") };
}

function countPlaceholders(value: unknown): number {
  if (typeof value === "string") return isPlaceholder(value) && value !== "" ? 1 : 0;
  if (Array.isArray(value)) return value.reduce((n: number, v) => n + countPlaceholders(v), 0);
  if (value && typeof value === "object")
    return Object.values(value).reduce((n: number, v) => n + countPlaceholders(v), 0);
  return 0;
}

export function analyzeSeo(c: Portfolio, siteUrl: string): SeoReport {
  const kw = norm(c.seo.focusKeyword ?? "");
  const title = seoTitle(c);
  const description = seoDescription(c);
  const { intro, headings, body } = pageCopy(c);
  const wordCount = words(body).length;
  const hits = occurrences(body, kw);
  const density = kw && wordCount ? (hits * words(kw).length * 100) / wordCount : 0;
  const placeholders = countPlaceholders(c);
  const checks: SeoCheck[] = [];
  const add = (check: SeoCheck) => checks.push(check);
  const needKw = "Set a focus keyword first.";

  /* ---------- Basic SEO */
  add({
    id: "kw-title",
    group: "basic",
    weight: 8,
    label: "Focus keyword in the SEO title",
    status: kw && norm(title).includes(kw) ? "pass" : "fail",
    detail: !kw
      ? needKw
      : norm(title).includes(kw)
        ? "Great, the title uses your focus keyword."
        : "Add the focus keyword to the SEO title.",
  });
  add({
    id: "kw-desc",
    group: "basic",
    weight: 7,
    label: "Focus keyword in the meta description",
    status: kw && norm(description).includes(kw) ? "pass" : "fail",
    detail: !kw
      ? needKw
      : norm(description).includes(kw)
        ? "The meta description mentions it."
        : "Mention the focus keyword in the meta description.",
  });
  const slug = kw.replace(/\s+/g, "-");
  const inUrl =
    kw && (norm(siteUrl).includes(slug) || words(kw).some((w) => w.length > 3 && norm(siteUrl).includes(w)));
  add({
    id: "kw-url",
    group: "basic",
    weight: 4,
    label: "Focus keyword in the URL",
    status: inUrl ? "pass" : "warn",
    detail: inUrl
      ? "Your domain contains part of the keyword."
      : "A single-page portfolio lives at your domain, so this is optional.",
  });
  add({
    id: "kw-intro",
    group: "basic",
    weight: 7,
    label: "Focus keyword at the beginning of the content",
    status: kw && occurrences(intro, kw) ? "pass" : "fail",
    detail: !kw
      ? needKw
      : occurrences(intro, kw)
        ? "It appears in your headline or summary."
        : "Use it in your headline or intro summary.",
  });
  add({
    id: "kw-content",
    group: "basic",
    weight: 6,
    label: "Focus keyword in the content",
    status: hits ? "pass" : "fail",
    detail: !kw
      ? needKw
      : hits
        ? `Used ${hits} time${hits === 1 ? "" : "s"} on the page.`
        : "It doesn't appear in the page content yet.",
  });
  add({
    id: "length",
    group: "basic",
    weight: 8,
    label: "Content length",
    status: wordCount >= 600 ? "pass" : wordCount >= 300 ? "warn" : "fail",
    detail: `${wordCount} words. ${wordCount >= 600 ? "Good depth." : "Aim for 600+ words: add projects, highlights or achievements."}`,
  });

  /* ---------- Additional */
  const inHeadings = kw && headings.some((h) => norm(h).includes(kw));
  add({
    id: "kw-headings",
    group: "additional",
    weight: 6,
    label: "Focus keyword in subheadings",
    status: inHeadings ? "pass" : "warn",
    detail: !kw
      ? needKw
      : inHeadings
        ? "A section heading uses it."
        : "Use it in a section title or eyebrow (Section headings).",
  });
  const alt = norm(`Portrait of ${c.profile.name}`);
  add({
    id: "kw-alt",
    group: "additional",
    weight: 4,
    label: "Focus keyword in image alt text",
    status: kw && alt.includes(kw) ? "pass" : "warn",
    detail: !kw
      ? needKw
      : alt.includes(kw)
        ? "The portrait's alt text includes it."
        : "The ID card photo's alt text is “Portrait of your name”. Your name as the keyword would pass.",
  });
  add({
    id: "density",
    group: "additional",
    weight: 7,
    label: "Keyword density",
    status: !kw || hits === 0 ? "fail" : density > 3.5 ? "fail" : density >= 0.5 && density <= 2.5 ? "pass" : "warn",
    detail: !kw
      ? needKw
      : `${density.toFixed(2)}% (${hits} use${hits === 1 ? "" : "s"}). ${density > 3.5 ? "Too high — it reads as keyword stuffing." : density >= 0.5 && density <= 2.5 ? "In the ideal 0.5–2.5% range." : density < 0.5 ? "A little low; aim for 0.5–2.5%." : "Slightly high; aim for 0.5–2.5%."}`,
  });
  const secondary = real(c.seo.secondaryKeywords).map(norm).filter(Boolean);
  const missing = secondary.filter((k) => !occurrences(body, k));
  add({
    id: "secondary",
    group: "additional",
    weight: 4,
    label: "Secondary keywords used",
    status: !secondary.length ? "warn" : missing.length ? "warn" : "pass",
    detail: !secondary.length
      ? "Add 2–4 related phrases to widen your reach."
      : missing.length
        ? `Not in the content yet: ${missing.join(", ")}.`
        : "All secondary keywords appear on the page.",
  });
  const links = c.profile.socials.filter((s) => s.kind !== "email").length;
  add({
    id: "links",
    group: "additional",
    weight: 4,
    label: "External links",
    status: links ? "pass" : "warn",
    detail: links
      ? `${links} profile link${links === 1 ? "" : "s"} (GitHub, LinkedIn…).`
      : "Add your GitHub or LinkedIn profile.",
  });
  add({
    id: "placeholders",
    group: "additional",
    weight: 6,
    label: "No placeholder content",
    status: placeholders === 0 ? "pass" : "warn",
    detail:
      placeholders === 0
        ? "Everything is filled in."
        : `${placeholders} TBD item${placeholders === 1 ? "" : "s"} still visible on the site.`,
  });
  const urlOk = !/localhost|your-domain\.com/.test(siteUrl);
  add({
    id: "site-url",
    group: "additional",
    weight: 4,
    label: "Site URL configured",
    status: urlOk ? "pass" : "fail",
    detail: urlOk
      ? `Canonical URL: ${siteUrl}`
      : "Set NEXT_PUBLIC_SITE_URL to your real domain (see README → Environment variables).",
  });
  add({
    id: "indexable",
    group: "additional",
    weight: 5,
    label: "Visible to search engines",
    status: c.seo.noindex ? "fail" : "pass",
    detail: c.seo.noindex ? "“Hide from search engines” is on." : "The page can be indexed.",
  });

  /* ---------- Title readability */
  const tl = title.length;
  add({
    id: "title-length",
    group: "title",
    weight: 6,
    label: "SEO title length",
    status: tl >= 30 && tl <= 60 ? "pass" : tl <= 70 && tl > 20 ? "warn" : "fail",
    detail: `${tl} characters. ${tl >= 30 && tl <= 60 ? "Good." : tl > 60 ? "Google may cut it off; aim for 50–60." : "A bit short; aim for 50–60."}`,
  });
  const pos = kw ? norm(title).indexOf(kw) : -1;
  add({
    id: "kw-title-start",
    group: "title",
    weight: 4,
    label: "Focus keyword near the start of the title",
    status: pos >= 0 && pos <= tl / 2 ? "pass" : "warn",
    detail: !kw
      ? needKw
      : pos < 0
        ? "The title doesn't use it."
        : pos <= tl / 2
          ? "It's in the first half of the title."
          : "Move it toward the start of the title.",
  });
  add({
    id: "title-number",
    group: "title",
    weight: 2,
    label: "Number in the title",
    status: /\d/.test(title) ? "pass" : "warn",
    detail: /\d/.test(title) ? "Numbers tend to lift click-through." : "Optional: e.g. “7+ years”.",
  });
  const power = POWER_WORDS.find((w) => occurrences(norm(title), w));
  add({
    id: "power-word",
    group: "title",
    weight: 2,
    label: "Power word in the title",
    status: power ? "pass" : "warn",
    detail: power ? `Uses “${power}”.` : "Optional: words like senior, expert, scalable, proven.",
  });

  /* ---------- Content readability */
  const dl = description.length;
  add({
    id: "desc-length",
    group: "readability",
    weight: 6,
    label: "Meta description length",
    status: dl >= 120 && dl <= 160 ? "pass" : dl >= 70 && dl <= 200 ? "warn" : "fail",
    detail: `${dl} characters. ${dl >= 120 && dl <= 160 ? "Good." : dl > 160 ? "Google will truncate it; aim for 120–160." : "Too short; aim for 120–160."}`,
  });
  const summaryWords = words(c.profile.summary).length;
  const highlights = c.experience.flatMap((r) => r.highlights);
  const avg = highlights.length ? highlights.reduce((n, h) => n + words(h).length, 0) / highlights.length : 0;
  add({
    id: "short-paragraphs",
    group: "readability",
    weight: 4,
    label: "Short, scannable paragraphs",
    status: summaryWords <= 60 && avg <= 30 ? "pass" : "warn",
    detail: `Summary ${summaryWords} words, highlights average ${avg.toFixed(0)} words. ${summaryWords <= 60 && avg <= 30 ? "Easy to scan." : "Keep the summary under 60 words and highlights under 30."}`,
  });

  const total = checks.reduce((n, ch) => n + ch.weight, 0);
  const earned = checks.reduce(
    (n, ch) => n + ch.weight * (ch.status === "pass" ? 1 : ch.status === "warn" ? 0.5 : 0),
    0,
  );
  const score = Math.round((earned / total) * 100);
  return {
    score,
    rating: score >= 80 ? "good" : score >= 50 ? "ok" : "poor",
    checks,
    stats: { words: wordCount, density, titleLength: tl, descriptionLength: dl, placeholders },
  };
}

/* --------------------------------------------------------------- articles */

function score(checks: SeoCheck[]) {
  const total = checks.reduce((n, ch) => n + ch.weight, 0);
  const earned = checks.reduce(
    (n, ch) => n + ch.weight * (ch.status === "pass" ? 1 : ch.status === "warn" ? 0.5 : 0),
    0,
  );
  return Math.round((earned / total) * 100);
}

/** Rank Math-style analysis for one blog post. */
export function analyzeArticle(post: Post, article: RenderedArticle, siteUrl: string): SeoReport {
  const kw = norm(post.seo.focusKeyword ?? "");
  const title = post.seo.title || post.title;
  const description = post.seo.description || post.excerpt;
  const body = `${post.title} ${article.text}`;
  const wordCount = words(article.text).length;
  const hits = occurrences(article.text, kw);
  const density = kw && wordCount ? (hits * words(kw).length * 100) / wordCount : 0;
  const firstPart = words(article.text)
    .slice(0, Math.max(60, Math.round(wordCount * 0.1)))
    .join(" ");
  const internal = article.links.filter((l) => !l.external);
  const external = article.links.filter((l) => l.external);
  const dofollowExternal = external.filter((l) => !l.rel.includes("nofollow") && !l.rel.includes("sponsored"));
  const h2 = article.headings.filter((h) => h.depth === 2);
  const needKw = "Set a focus keyword first.";
  const checks: SeoCheck[] = [];
  const add = (c: SeoCheck) => checks.push(c);
  const has = (s: string) => Boolean(kw) && norm(s).includes(kw);

  /* Basic */
  add({
    id: "kw-title",
    group: "basic",
    weight: 8,
    label: "Focus keyword in the SEO title",
    status: has(title) ? "pass" : "fail",
    detail: !kw ? needKw : has(title) ? "The title uses it." : "Add the focus keyword to the title.",
  });
  add({
    id: "kw-desc",
    group: "basic",
    weight: 7,
    label: "Focus keyword in the meta description",
    status: has(description) ? "pass" : "fail",
    detail: !kw
      ? needKw
      : has(description)
        ? "The description mentions it."
        : "Mention it in the meta description (or excerpt).",
  });
  const slugHas = kw && post.slug.includes(kw.replace(/\s+/g, "-"));
  add({
    id: "kw-url",
    group: "basic",
    weight: 6,
    label: "Focus keyword in the URL",
    status: slugHas ? "pass" : "fail",
    detail: !kw
      ? needKw
      : slugHas
        ? `${siteUrl}/blog/${post.slug}`
        : `Put it in the slug, e.g. ${siteUrl}/blog/${kw.replace(/\s+/g, "-")}`,
  });
  add({
    id: "kw-intro",
    group: "basic",
    weight: 7,
    label: "Focus keyword at the beginning of the content",
    status: kw && occurrences(firstPart, kw) ? "pass" : "fail",
    detail: !kw ? needKw : occurrences(firstPart, kw) ? "It appears in the opening." : "Use it in the first paragraph.",
  });
  add({
    id: "kw-content",
    group: "basic",
    weight: 6,
    label: "Focus keyword in the content",
    status: hits ? "pass" : "fail",
    detail: !kw
      ? needKw
      : hits
        ? `Used ${hits} time${hits === 1 ? "" : "s"}.`
        : "It doesn't appear in the article yet.",
  });
  add({
    id: "length",
    group: "basic",
    weight: 8,
    label: "Content length",
    status: wordCount >= 1000 ? "pass" : wordCount >= 600 ? "warn" : "fail",
    detail: `${wordCount} words. ${wordCount >= 1000 ? "Good depth." : "Aim for 1,000+ words for competitive keywords."}`,
  });

  /* Additional */
  const inSub = kw && article.headings.some((h) => has(h.text));
  add({
    id: "kw-headings",
    group: "additional",
    weight: 6,
    label: "Focus keyword in subheadings",
    status: inSub ? "pass" : "warn",
    detail: !kw ? needKw : inSub ? "An H2/H3 uses it." : "Use it in at least one H2 or H3.",
  });
  const alts = [...article.images.map((i) => i.alt), post.coverAlt ?? ""];
  const altHas = kw && alts.some((a) => has(a));
  add({
    id: "kw-alt",
    group: "additional",
    weight: 4,
    label: "Focus keyword in image alt text",
    status: altHas ? "pass" : "warn",
    detail: !kw
      ? needKw
      : altHas
        ? "An image's alt text includes it."
        : "Describe an image using the keyword (cover alt counts).",
  });
  add({
    id: "density",
    group: "additional",
    weight: 6,
    label: "Keyword density",
    status: !kw || hits === 0 ? "fail" : density > 3.5 ? "fail" : density >= 0.5 && density <= 2.5 ? "pass" : "warn",
    detail: !kw
      ? needKw
      : `${density.toFixed(2)}% (${hits}). ${density > 3.5 ? "Too high — reads as stuffing." : density >= 0.5 && density <= 2.5 ? "Ideal range." : "Aim for 0.5–2.5%."}`,
  });
  add({
    id: "internal-links",
    group: "additional",
    weight: 7,
    label: "Internal links (inbound to your site)",
    status: internal.length >= 2 ? "pass" : internal.length ? "warn" : "fail",
    detail: `${internal.length} internal link${internal.length === 1 ? "" : "s"}. ${internal.length >= 2 ? "Good." : "Link to 2+ of your pages or posts — use “Link” → Internal."}`,
  });
  add({
    id: "external-links",
    group: "additional",
    weight: 5,
    label: "External links (outbound)",
    status: dofollowExternal.length ? "pass" : external.length ? "warn" : "fail",
    detail: external.length
      ? `${external.length} external (${dofollowExternal.length} followed).${dofollowExternal.length ? "" : " Link at least one trusted source without nofollow."}`
      : "Cite at least one authoritative source.",
  });
  const secondary = post.seo.secondaryKeywords.map(norm);
  const missing = secondary.filter((k) => !occurrences(body, k));
  add({
    id: "secondary",
    group: "additional",
    weight: 4,
    label: "Secondary keywords used",
    status: secondary.length && !missing.length ? "pass" : "warn",
    detail: !secondary.length
      ? "Add 2–4 related phrases."
      : missing.length
        ? `Missing: ${missing.join(", ")}.`
        : "All used.",
  });
  add({
    id: "cover",
    group: "additional",
    weight: 4,
    label: "Cover image with alt text",
    status: post.coverImage && post.coverAlt ? "pass" : post.coverImage ? "warn" : "fail",
    detail: post.coverImage
      ? post.coverAlt
        ? "Shown in search and social previews."
        : "Add alt text to the cover."
      : "Add a cover image for social shares and image search.",
  });
  add({
    id: "toc",
    group: "additional",
    weight: 4,
    label: "Structured with headings (table of contents)",
    status: h2.length >= 2 ? "pass" : "warn",
    detail: `${h2.length} H2 section${h2.length === 1 ? "" : "s"}. ${h2.length >= 2 ? "A table of contents is shown." : "Use 2+ H2 sections."}`,
  });
  add({
    id: "faq",
    group: "additional",
    weight: 4,
    label: "FAQ section (rich results)",
    status: post.faqs.length >= 2 ? "pass" : post.faqs.length ? "warn" : "warn",
    detail: post.faqs.length
      ? `${post.faqs.length} FAQ${post.faqs.length === 1 ? "" : "s"} with FAQPage schema.`
      : "Add 2–5 questions people search for.",
  });
  add({
    id: "slug-length",
    group: "additional",
    weight: 3,
    label: "Short URL",
    status: post.slug.length <= 75 ? "pass" : "warn",
    detail: `${post.slug.length} characters.`,
  });
  add({
    id: "indexable",
    group: "additional",
    weight: 5,
    label: "Visible to search engines",
    status: post.seo.noindex ? "fail" : "pass",
    detail: post.seo.noindex ? "Noindex is on." : "Can be indexed.",
  });

  /* Title readability */
  const tl = title.length;
  add({
    id: "title-length",
    group: "title",
    weight: 6,
    label: "SEO title length",
    status: tl >= 30 && tl <= 60 ? "pass" : tl <= 70 && tl > 20 ? "warn" : "fail",
    detail: `${tl} characters. ${tl >= 30 && tl <= 60 ? "Good." : "Aim for 50–60."}`,
  });
  const pos = kw ? norm(title).indexOf(kw) : -1;
  add({
    id: "kw-title-start",
    group: "title",
    weight: 4,
    label: "Focus keyword near the start of the title",
    status: pos >= 0 && pos <= tl / 2 ? "pass" : "warn",
    detail: !kw
      ? needKw
      : pos < 0
        ? "Not in the title."
        : pos <= tl / 2
          ? "In the first half."
          : "Move it toward the start.",
  });
  add({
    id: "title-number",
    group: "title",
    weight: 2,
    label: "Number in the title",
    status: /\d/.test(title) ? "pass" : "warn",
    detail: /\d/.test(title) ? "Good." : "Optional: “5 patterns…”, “…in 2026”.",
  });
  const power = POWER_WORDS.find((w) => occurrences(norm(title), w));
  add({
    id: "power-word",
    group: "title",
    weight: 2,
    label: "Power word in the title",
    status: power ? "pass" : "warn",
    detail: power ? `Uses “${power}”.` : "Optional: proven, essential, reliable, practical…",
  });

  /* Content readability */
  const dl = description.length;
  add({
    id: "desc-length",
    group: "readability",
    weight: 6,
    label: "Meta description length",
    status: dl >= 120 && dl <= 160 ? "pass" : dl >= 70 && dl <= 200 ? "warn" : "fail",
    detail: `${dl} characters. ${dl >= 120 && dl <= 160 ? "Good." : "Aim for 120–160."}`,
  });
  const paragraphs = post.body.split(/\n{2,}/).filter((p) => p.trim() && !/^\s*(#|>|[-*]|\d+\.|!\[|```)/.test(p));
  const longParas = paragraphs.filter((p) => words(p).length > 120).length;
  add({
    id: "short-paragraphs",
    group: "readability",
    weight: 4,
    label: "Short paragraphs",
    status: longParas ? "warn" : "pass",
    detail: longParas
      ? `${longParas} paragraph${longParas === 1 ? " is" : "s are"} over 120 words — split them.`
      : "Easy to scan.",
  });

  const s = score(checks);
  return {
    score: s,
    rating: s >= 80 ? "good" : s >= 50 ? "ok" : "poor",
    checks,
    stats: { words: wordCount, density, titleLength: tl, descriptionLength: dl, placeholders: 0 },
  };
}
