"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, CircleAlert, Monitor, Smartphone, XCircle } from "lucide-react";
import { displayUrl, seoDescription, seoTitle, type Portfolio } from "@/data/portfolio";
import { analyzeSeo, GROUP_LABELS, type CheckGroup, type SeoCheck } from "@/content/seoAnalysis";
import { EditorHeader, useContentDraft } from "./ContentEditor";
import { Card, ScoreRing, TagInput, TextArea, TextInput, Toggle, useIsClient } from "./ui";

interface RawSeo {
  title?: string;
  description?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  keywords?: string[];
  noindex?: boolean;
}

const statusIcon = {
  pass: <CheckCircle2 className="size-4 shrink-0 text-[#7fb59a]" aria-label="Passed" />,
  warn: <CircleAlert className="size-4 shrink-0 text-[#e0b45c]" aria-label="Could improve" />,
  fail: <XCircle className="size-4 shrink-0 text-[#d76b6b]" aria-label="Needs fixing" />,
};

/** Text width in px as Google renders titles (≈ 20px Arial, cut-off at 600px). */
let measureCtx: CanvasRenderingContext2D | null | undefined;
export function textWidth(text: string, font = "20px Arial"): number {
  if (measureCtx === undefined) measureCtx = document.createElement("canvas").getContext("2d");
  if (!measureCtx) return text.length * 9;
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

export function Meter({
  value,
  min,
  max,
  hardMax,
  unit,
}: {
  value: number;
  min: number;
  max: number;
  hardMax: number;
  unit: string;
}) {
  const color =
    value >= min && value <= max
      ? "#7fb59a"
      : value > max && value <= hardMax
        ? "#e0b45c"
        : value === 0
          ? "#3a3a42"
          : "#d76b6b";
  return (
    <div className="mt-1.5 flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-inset">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, (value / hardMax) * 100)}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[0.6875rem] text-text-subtle tabular-nums">
        {Math.round(value)} / {max} {unit}
      </span>
    </div>
  );
}

export function CheckGroupList({ group, checks }: { group: CheckGroup; checks: SeoCheck[] }) {
  const errors = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  const [open, setOpen] = useState(group === "basic" || errors > 0);
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-3 text-left"
      >
        <ChevronDown
          className={`size-4 text-text-subtle transition-transform ${open ? "" : "-rotate-90"}`}
          aria-hidden
        />
        <span className="flex-1 text-caption font-medium text-text">{GROUP_LABELS[group]}</span>
        {errors ? (
          <span className="rounded-full bg-[#d76b6b]/15 px-2 py-0.5 font-mono text-[0.625rem] text-[#f0a3a3]">
            {errors} error{errors > 1 ? "s" : ""}
          </span>
        ) : null}
        {!errors && warnings ? (
          <span className="rounded-full bg-[#e0b45c]/15 px-2 py-0.5 font-mono text-[0.625rem] text-[#e0c38a]">
            {warnings} tip{warnings > 1 ? "s" : ""}
          </span>
        ) : null}
        {!errors && !warnings ? (
          <span className="rounded-full bg-[#7fb59a]/15 px-2 py-0.5 font-mono text-[0.625rem] text-[#b8dcc7]">
            All good
          </span>
        ) : null}
      </button>
      {open ? (
        <ul className="grid gap-3 pb-4 pl-6">
          {checks.map((c) => (
            <li key={c.id} className="flex gap-2.5">
              {statusIcon[c.status]}
              <div>
                <p className="text-caption text-text">{c.label}</p>
                <p className="mt-0.5 text-[0.75rem] leading-snug text-text-subtle">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function GooglePreview({
  title,
  description,
  url,
  mobile,
}: {
  title: string;
  description: string;
  url: string;
  mobile: boolean;
}) {
  const host = displayUrl(url);
  return (
    <div className={`rounded-md bg-white p-4 font-[Arial,sans-serif] ${mobile ? "max-w-[380px]" : "max-w-[600px]"}`}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-full bg-[#f1f3f4] font-mono text-[10px] font-bold text-[#5a7aa3]">
          KC
        </span>
        <div className="leading-tight">
          <p className="text-[14px] text-[#202124]">{host}</p>
          <p className="text-[12px] text-[#4d5156]">{url}</p>
        </div>
      </div>
      <p
        className={`mt-2 line-clamp-1 text-[#1a0dab] ${mobile ? "text-[18px] leading-6 line-clamp-2" : "text-[20px] leading-[1.3]"}`}
      >
        {title}
      </p>
      <p className="mt-1 line-clamp-2 text-[14px] leading-[1.58] text-[#4d5156]">{description}</p>
    </div>
  );
}

export function SeoEditor({ initial, content, siteUrl }: { initial: RawSeo; content: Portfolio; siteUrl: string }) {
  const { values, update, dirty, pending, result, save, discard } = useContentDraft({ seo: initial });
  const seo = values.seo as RawSeo;
  const set = (patch: Partial<RawSeo>) => update("seo", { ...seo, ...patch });
  const [mobile, setMobile] = useState(false);
  const isClient = useIsClient();
  const width = (text: string) => (isClient ? textWidth(text) : text.length * 9);

  const draft: Portfolio = useMemo(
    () => ({
      ...content,
      seo: {
        title: seo.title?.trim() || undefined,
        description: seo.description?.trim() || undefined,
        focusKeyword: seo.focusKeyword?.trim() || undefined,
        secondaryKeywords: seo.secondaryKeywords ?? [],
        keywords: seo.keywords ?? [],
        noindex: seo.noindex === true,
      },
    }),
    [content, seo],
  );
  const report = useMemo(() => analyzeSeo(draft, siteUrl), [draft, siteUrl]);
  const title = seoTitle(draft);
  const description = seoDescription(draft);
  const groups = (Object.keys(GROUP_LABELS) as CheckGroup[]).map((g) => ({
    group: g,
    checks: report.checks.filter((c) => c.group === g),
  }));

  return (
    <div>
      <EditorHeader
        title="SEO"
        description="How your portfolio appears in Google and when shared. The score updates as you type; save to publish."
        dirty={dirty}
        pending={pending}
        result={result}
        onSave={save}
        onDiscard={discard}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 gap-6">
          <Card title="Focus keyword">
            <div className="grid gap-5">
              <label className="block">
                <span className="mb-1.5 block text-caption font-medium text-text">Focus keyword</span>
                <TextInput
                  value={seo.focusKeyword ?? ""}
                  onChange={(e) => set({ focusKeyword: e.target.value })}
                  placeholder="e.g. senior backend engineer"
                />
                <span className="mt-1 block text-[0.75rem] text-text-subtle">
                  The main phrase someone would search to find you.
                </span>
              </label>
              <div>
                <span className="mb-1.5 block text-caption font-medium text-text">Secondary keywords</span>
                <TagInput
                  value={seo.secondaryKeywords ?? []}
                  onChange={(v) => set({ secondaryKeywords: v })}
                  placeholder="e.g. Node.js developer, event-driven architecture"
                />
              </div>
            </div>
          </Card>

          <Card
            title="Search preview"
            actions={
              <div className="flex rounded-sm border border-line p-0.5" role="group" aria-label="Preview device">
                {[
                  { m: false, Icon: Monitor, label: "Desktop" },
                  { m: true, Icon: Smartphone, label: "Mobile" },
                ].map(({ m, Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={mobile === m}
                    onClick={() => setMobile(m)}
                    className={`grid size-7 place-items-center rounded-xs ${mobile === m ? "bg-elevated text-text" : "text-text-subtle hover:text-text"}`}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="sr-only">{label}</span>
                  </button>
                ))}
              </div>
            }
          >
            <GooglePreview title={title} description={description} url={siteUrl} mobile={mobile} />

            <div className="mt-6 grid gap-5">
              <label className="block">
                <span className="mb-1.5 block text-caption font-medium text-text">SEO title</span>
                <TextInput
                  value={seo.title ?? ""}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder={seoTitle({ ...content, seo: { ...content.seo, title: undefined } })}
                />
                <Meter value={width(title)} min={400} max={600} hardMax={680} unit="px" />
                <span className="mt-1 block text-[0.75rem] text-text-subtle">
                  {title.length} characters. Leave empty to use “Name — Title”.
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-caption font-medium text-text">Meta description</span>
                <TextArea
                  value={seo.description ?? ""}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder={seoDescription({ ...content, seo: { ...content.seo, description: undefined } })}
                />
                <Meter value={description.length} min={120} max={160} hardMax={200} unit="chars" />
                <span className="mt-1 block text-[0.75rem] text-text-subtle">
                  Leave empty to use your profile summary.
                </span>
              </label>
            </div>
          </Card>

          <Card title="Social share preview">
            <div className="max-w-[520px] overflow-hidden rounded-md border border-line bg-bg">
              {/* eslint-disable-next-line @next/next/no-img-element -- generated route, not a static asset */}
              <img
                src="/opengraph-image"
                alt="Share image"
                width={1200}
                height={630}
                className="aspect-[1200/630] w-full object-cover"
              />
              <div className="border-t border-line p-3">
                <p className="font-mono text-[0.625rem] tracking-wider text-text-subtle uppercase">
                  {displayUrl(siteUrl)}
                </p>
                <p className="mt-1 line-clamp-1 text-caption font-medium text-text">{title}</p>
                <p className="mt-0.5 line-clamp-2 text-[0.75rem] text-text-muted">{description}</p>
              </div>
            </div>
            <p className="mt-2 text-[0.75rem] text-text-subtle">The image is generated from your saved profile.</p>
          </Card>

          <Card title="Advanced">
            <div className="grid gap-5">
              <div>
                <span className="mb-1.5 block text-caption font-medium text-text">Meta keywords</span>
                <TagInput value={seo.keywords ?? []} onChange={(v) => set({ keywords: v })} />
              </div>
              <div>
                <Toggle
                  checked={seo.noindex === true}
                  onChange={(v) => set({ noindex: v })}
                  label="Hide from search engines (noindex)"
                />
                <p className="mt-1 text-[0.75rem] text-text-subtle">
                  Turn on only while drafting. It removes the site from Google.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <aside className="xl:sticky xl:top-28 xl:self-start">
          <Card>
            <div className="flex items-center gap-4">
              <ScoreRing score={report.score} size={84} />
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
        </aside>
      </div>
    </div>
  );
}
