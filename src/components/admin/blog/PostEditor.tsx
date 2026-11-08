"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, ExternalLink, Link2, Plus, Trash2, Upload } from "lucide-react";
import { deletePost, savePost, type PostSaveResult } from "@/app/admin/actions";
import { isLive, postDescription, postTitle, slugify, type Post } from "@/data/blog";
import { renderMarkdown } from "@/content/markdown";
import { analyzeArticle, GROUP_LABELS, type CheckGroup } from "@/content/seoAnalysis";
import { displayUrl } from "@/data/portfolio";
import { Button, Card, IconButton, ScoreRing, TagInput, TextArea, TextInput, Toggle, useIsClient } from "../ui";
import { CheckGroupList, GooglePreview, Meter, textWidth } from "../SeoEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import type { LinkTarget } from "./LinkDialog";
import { uploadImage } from "./upload";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** ISO ⇄ value for <input type="datetime-local"> in the browser's timezone. */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface Suggestion {
  phrase: string;
  target: LinkTarget;
}

/** Internal-link suggestions: phrases in the body that match another page/post and aren't linked yet. */
function suggestLinks(body: string, targets: LinkTarget[], selfUrl: string): Suggestion[] {
  const out: Suggestion[] = [];
  for (const target of targets) {
    if (target.url === selfUrl || body.includes(`](${target.url})`) || body.includes(`](${target.url}){`)) continue;
    for (const phrase of target.keywords) {
      if (phrase.length < 4) continue;
      const re = new RegExp(`(^|[^\\w\\[/#-])(${escapeRe(phrase)})(?=[^\\w\\]]|$)`, "i");
      const m = re.exec(body);
      if (m && !/\]\([^)]*$/.test(body.slice(0, m.index + m[1].length))) {
        out.push({ phrase: m[2], target });
        break;
      }
    }
  }
  return out.slice(0, 6);
}

export function PostEditor({
  initial,
  linkTargets,
  siteUrl,
}: {
  initial: Post;
  linkTargets: LinkTarget[];
  siteUrl: string;
}) {
  const [saved, setSaved] = useState(initial);
  const [post, setPost] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(
    initial.status === "published" || !initial.slug.startsWith("untitled-draft"),
  );
  const [result, setResult] = useState<PostSaveResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [mobile, setMobile] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);
  const isClient = useIsClient();
  // Captured once on mount: render must not read the clock (React compiler purity rule).
  const [now] = useState(() => Date.now());

  const dirty = useMemo(() => JSON.stringify(post) !== JSON.stringify(saved), [post, saved]);
  const set = (patch: Partial<Post>) => {
    setPost((p) => ({ ...p, ...patch }));
    setResult(null);
  };
  const setSeo = (patch: Partial<Post["seo"]>) => set({ seo: { ...post.seo, ...patch } });

  const article = useMemo(() => renderMarkdown(post.body, siteUrl), [post.body, siteUrl]);
  const report = useMemo(() => analyzeArticle(post, article, siteUrl), [post, article, siteUrl]);
  const suggestions = useMemo(
    () => suggestLinks(post.body, linkTargets, `/blog/${post.slug}`),
    [post.body, post.slug, linkTargets],
  );
  const errorField = result && !result.ok ? result.field : undefined;

  const scheduled = post.status === "published" && Date.parse(post.publishedAt) > now;
  const live = isClient && isLive(saved);

  const save = useCallback(
    (intent: "save" | "publish" | "unpublish" = "save") => {
      if (pending) return;
      startTransition(async () => {
        const keepDate = intent === "publish" && Date.parse(post.publishedAt) > Date.now();
        const res = await savePost({ ...post, keepDate }, intent);
        setResult(res);
        if (res.ok) {
          setSaved(res.post);
          setPost(res.post);
        }
      });
    },
    [pending, post],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [save, dirty]);

  const addSuggestion = (s: Suggestion) => {
    const re = new RegExp(`(^|[^\\w\\[/#-])(${escapeRe(s.phrase)})(?=[^\\w\\]]|$)`);
    set({ body: post.body.replace(re, `$1[$2](${s.target.url})`) });
  };

  const internal = article.links.filter((l) => !l.external);
  const external = article.links.filter((l) => l.external);
  const groups = (Object.keys(GROUP_LABELS) as CheckGroup[]).map((g) => ({
    group: g,
    checks: report.checks.filter((c) => c.group === g),
  }));
  const title = postTitle(post);
  const description = postDescription(post) || "Add an excerpt or meta description.";
  const statusLabel =
    saved.status === "draft" ? "Draft" : Date.parse(saved.publishedAt) > now ? "Scheduled" : "Published";

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-line bg-bg/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">
              Blog post ·{" "}
              <span
                className={
                  statusLabel === "Published"
                    ? "text-[#b8dcc7]"
                    : statusLabel === "Scheduled"
                      ? "text-steel"
                      : "text-[#e0c38a]"
                }
              >
                {statusLabel}
              </span>
            </p>
            <h1 className="truncate font-display text-h3 text-text">{post.title || "Untitled"}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="hidden font-mono text-micro tracking-wider text-text-subtle uppercase sm:inline"
              aria-live="polite"
            >
              {pending ? "Saving…" : dirty ? "Unsaved changes" : result?.ok ? "Saved" : ""}
            </span>
            {live ? (
              <a
                href={`/blog/${saved.slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-sm px-3 text-caption text-text-muted hover:bg-elevated hover:text-text"
              >
                View <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            ) : null}
            {saved.status === "published" ? (
              <>
                <Button variant="ghost" disabled={pending} onClick={() => save("unpublish")}>
                  Unpublish
                </Button>
                <Button variant="primary" disabled={pending || !dirty} onClick={() => save("save")}>
                  {pending ? "Saving…" : "Update"}
                </Button>
              </>
            ) : (
              <>
                <Button disabled={pending || !dirty} onClick={() => save("save")}>
                  Save draft
                </Button>
                <Button variant="primary" disabled={pending} onClick={() => save("publish")}>
                  {scheduled ? "Schedule" : "Publish"}
                </Button>
              </>
            )}
          </div>
        </div>
        {result ? (
          <div
            role={result.ok ? "status" : "alert"}
            className={`mt-3 flex items-start gap-2 rounded-sm border px-3 py-2 text-caption ${
              result.ok
                ? "border-[#7fb59a]/40 bg-[#7fb59a]/10 text-[#b8dcc7]"
                : "border-[#c45b5b]/50 bg-[#c45b5b]/10 text-[#f0a3a3]"
            }`}
          >
            {result.ok ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            {result.ok
              ? result.post.status === "published"
                ? Date.parse(result.post.publishedAt) > now
                  ? "Scheduled. It goes live on the publish date."
                  : "Saved. The article is live."
                : "Draft saved. Only you can see it."
              : `Not saved: ${result.error}`}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        {/* Main column */}
        <div className="grid min-w-0 content-start gap-6">
          <div>
            <label className="sr-only" htmlFor="post-title">
              Title
            </label>
            <input
              id="post-title"
              value={post.title}
              onChange={(e) => {
                const t = e.target.value;
                set(slugTouched ? { title: t } : { title: t, slug: slugify(t) || post.slug });
              }}
              placeholder="Article title (your H1)"
              className={`w-full border-b bg-transparent pb-2 font-display text-[clamp(1.75rem,1.4rem+1.5vw,2.5rem)] leading-tight text-text placeholder:text-text-faint focus:outline-none ${
                errorField === "title" ? "border-[#c45b5b]" : "border-line focus:border-accent"
              }`}
            />
            <div className="mt-3 flex flex-wrap items-center gap-1 text-caption">
              <span className="font-mono text-text-subtle">{displayUrl(siteUrl)}/blog/</span>
              <input
                value={post.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                }}
                aria-label="URL slug"
                className={`min-w-48 flex-1 rounded-sm border bg-inset px-2 py-1 font-mono text-text focus:border-accent focus:outline-none ${
                  errorField === "slug" ? "border-[#c45b5b]" : "border-line"
                }`}
              />
              {saved.status === "published" && post.slug !== saved.slug ? (
                <span className="w-full text-[0.75rem] text-[#e0c38a]">
                  Changing a live URL breaks existing links to it.
                </span>
              ) : null}
            </div>
          </div>

          <MarkdownEditor
            value={post.body}
            onChange={(body) => set({ body })}
            previewHtml={article.html}
            linkTargets={linkTargets}
            invalid={errorField === "body"}
          />

          <Card title="Excerpt">
            <TextArea
              value={post.excerpt}
              onChange={(e) => set({ excerpt: e.target.value })}
              placeholder="One or two sentences shown on the blog list and used as the meta description."
            />
            <p className="mt-1 text-[0.75rem] text-text-subtle">{post.excerpt.length} characters · aim for 120–160.</p>
          </Card>

          <Card
            title={`FAQ (${post.faqs.length})`}
            actions={<span className="text-[0.75rem] text-text-subtle">Adds FAQPage schema for rich results</span>}
          >
            <div className="grid gap-3">
              {post.faqs.map((f, i) => (
                <div key={i} className="grid gap-2 rounded-md border border-line bg-bg p-3">
                  <div className="flex items-center gap-2">
                    <TextInput
                      value={f.question}
                      onChange={(e) =>
                        set({ faqs: post.faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)) })
                      }
                      placeholder="Question people search for"
                      aria-label={`Question ${i + 1}`}
                    />
                    <IconButton
                      label="Remove question"
                      onClick={() => set({ faqs: post.faqs.filter((_, j) => j !== i) })}
                      className="hover:text-[#f0a3a3]"
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                  <TextArea
                    value={f.answer}
                    rows={2}
                    onChange={(e) =>
                      set({ faqs: post.faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)) })
                    }
                    placeholder="A direct, complete answer in 1–3 sentences"
                    aria-label={`Answer ${i + 1}`}
                  />
                </div>
              ))}
              <div>
                <Button variant="ghost" onClick={() => set({ faqs: [...post.faqs, { question: "", answer: "" }] })}>
                  <Plus className="size-4" aria-hidden /> Add question
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6 [&>*]:min-w-0">
          <Card title="Publish">
            <div className="grid gap-4 text-caption">
              <label className="block">
                <span className="mb-1.5 block text-text-muted">Publish date</span>
                <TextInput
                  type="datetime-local"
                  value={isClient ? toLocalInput(post.publishedAt) : ""}
                  onChange={(e) => e.target.value && set({ publishedAt: new Date(e.target.value).toISOString() })}
                />
                <span className="mt-1 block text-[0.75rem] text-text-subtle">
                  A future date schedules the post. “Updated” is stamped automatically on each save.
                </span>
              </label>
              <form
                action={() => deletePost(post.id)}
                onSubmit={(e) => {
                  if (!confirm(`Delete “${post.title}”? A backup copy of the blog is kept in the data folder.`))
                    e.preventDefault();
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-[0.75rem] text-[#f0a3a3] hover:underline"
                >
                  <Trash2 className="size-3.5" aria-hidden /> Delete post
                </button>
              </form>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <ScoreRing score={report.score} size={76} />
              <div>
                <p className="font-display text-h3 text-text">
                  {report.rating === "good" ? "Good" : report.rating === "ok" ? "Needs work" : "Poor"}
                </p>
                <p className="text-[0.75rem] text-text-subtle">
                  {report.stats.words} words · density {report.stats.density.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-line">
              {groups.map(({ group, checks }) => (
                <CheckGroupList key={group} group={group} checks={checks} />
              ))}
            </div>
          </Card>

          <Card
            title="Search appearance"
            actions={
              <button
                type="button"
                onClick={() => setMobile((m) => !m)}
                className="text-[0.75rem] text-accent hover:text-accent-strong"
              >
                {mobile ? "Desktop" : "Mobile"} view
              </button>
            }
          >
            <div className="grid gap-4">
              <GooglePreview
                title={title}
                description={description}
                url={`${siteUrl}/blog/${post.slug}`}
                mobile={mobile}
              />
              <label className="block">
                <span className="mb-1.5 block text-caption font-medium text-text">Focus keyword</span>
                <TextInput
                  value={post.seo.focusKeyword ?? ""}
                  onChange={(e) => setSeo({ focusKeyword: e.target.value })}
                  placeholder="e.g. event-driven backend"
                />
              </label>
              <div>
                <span className="mb-1.5 block text-caption font-medium text-text">Secondary keywords</span>
                <TagInput value={post.seo.secondaryKeywords} onChange={(v) => setSeo({ secondaryKeywords: v })} />
              </div>
              <label className="block">
                <span className="mb-1.5 block text-caption font-medium text-text">SEO title</span>
                <TextInput
                  value={post.seo.title ?? ""}
                  onChange={(e) => setSeo({ title: e.target.value })}
                  placeholder={post.title}
                />
                <Meter
                  value={isClient ? textWidth(title) : title.length * 9}
                  min={400}
                  max={600}
                  hardMax={680}
                  unit="px"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-caption font-medium text-text">Meta description</span>
                <TextArea
                  value={post.seo.description ?? ""}
                  onChange={(e) => setSeo({ description: e.target.value })}
                  placeholder={post.excerpt || "Defaults to the excerpt"}
                />
                <Meter value={postDescription(post).length} min={120} max={160} hardMax={200} unit="chars" />
              </label>
              <details className="text-caption">
                <summary className="cursor-pointer text-text-muted hover:text-text">Advanced</summary>
                <div className="mt-3 grid gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-text-muted">Canonical URL</span>
                    <TextInput
                      value={post.seo.canonical ?? ""}
                      onChange={(e) => setSeo({ canonical: e.target.value })}
                      placeholder="Only if this was first published elsewhere"
                      invalid={errorField === "seo.canonical"}
                    />
                  </label>
                  <Toggle
                    checked={post.seo.noindex}
                    onChange={(v) => setSeo({ noindex: v })}
                    label="Hide from search engines (noindex)"
                  />
                </div>
              </details>
            </div>
          </Card>

          <Card title={`Links · ${internal.length} internal · ${external.length} outbound`}>
            {article.links.length ? (
              <ul className="grid max-h-48 gap-1.5 overflow-y-auto">
                {article.links.map((l, i) => (
                  <li key={`${l.href}-${i}`} className="flex items-center gap-2 text-[0.75rem]">
                    {l.external ? (
                      <ExternalLink className="size-3.5 shrink-0 text-steel" aria-label="Outbound" />
                    ) : (
                      <Link2 className="size-3.5 shrink-0 text-accent" aria-label="Internal" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-text-muted" title={l.href}>
                      {l.text} <span className="font-mono text-text-faint">{l.href}</span>
                    </span>
                    {l.rel
                      .filter((r) => r === "nofollow" || r === "sponsored")
                      .map((r) => (
                        <span
                          key={r}
                          className="rounded-xs border border-line px-1 font-mono text-[0.625rem] text-text-subtle"
                        >
                          {r}
                        </span>
                      ))}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-caption text-text-subtle">No links yet. Use the link button (⌘K) in the editor.</p>
            )}
            {suggestions.length ? (
              <div className="mt-4 border-t border-line pt-3">
                <p className="eyebrow">Suggested internal links</p>
                <ul className="mt-2 grid gap-2">
                  {suggestions.map((s) => (
                    <li key={s.target.url} className="flex items-center gap-2 text-[0.75rem]">
                      <span className="min-w-0 flex-1 text-text-muted">
                        “{s.phrase}” → <span className="text-text">{s.target.label}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => addSuggestion(s)}
                        className="shrink-0 text-accent hover:text-accent-strong"
                      >
                        Add link
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>

          <Card title="Organize">
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-caption font-medium text-text">Category</span>
                <TextInput
                  value={post.category}
                  onChange={(e) => set({ category: e.target.value })}
                  placeholder="e.g. Backend Engineering"
                />
              </label>
              <div>
                <span className="mb-1.5 block text-caption font-medium text-text">Tags</span>
                <TagInput value={post.tags} onChange={(tags) => set({ tags })} />
              </div>
            </div>
          </Card>

          <Card title="Cover image">
            <div className="grid gap-3">
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin preview of a user-supplied URL
                <img
                  src={post.coverImage}
                  alt=""
                  className="aspect-[1200/630] w-full rounded-sm border border-line object-cover"
                />
              ) : (
                <div className="grid aspect-[1200/630] place-items-center rounded-sm border border-dashed border-line text-[0.75rem] text-text-subtle">
                  1200 × 630 works best
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => coverInput.current?.click()}>
                  <Upload className="size-4" aria-hidden /> Upload
                </Button>
                {post.coverImage ? (
                  <Button variant="ghost" onClick={() => set({ coverImage: undefined })}>
                    Remove
                  </Button>
                ) : null}
              </div>
              <TextInput
                value={post.coverImage ?? ""}
                onChange={(e) => set({ coverImage: e.target.value || undefined })}
                placeholder="…or paste an image URL"
              />
              <TextInput
                value={post.coverAlt ?? ""}
                onChange={(e) => set({ coverAlt: e.target.value || undefined })}
                placeholder="Alt text (describe the image)"
              />
              <input
                ref={coverInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  try {
                    set({ coverImage: await uploadImage(f) });
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Upload failed.");
                  }
                }}
              />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
