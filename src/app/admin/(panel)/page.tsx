import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleAlert, XCircle } from "lucide-react";
import { getContent, listRevisions } from "@/content/store";
import { EDITORS, findPlaceholders } from "@/content/editors";
import { analyzeSeo } from "@/content/seoAnalysis";
import { SITE_URL } from "@/config/site";
import { Card, ScoreRing } from "@/components/admin/ui";
import { RevisionList } from "@/components/admin/RevisionList";

export const metadata: Metadata = { title: "Overview" };

export default async function Overview() {
  const content = await getContent();
  const report = analyzeSeo(content, SITE_URL);
  const todo = findPlaceholders(content);
  const revisions = await listRevisions();
  const issues = report.checks
    .filter((c) => c.status !== "pass")
    .sort((a, b) => (a.status === "fail" ? -1 : 1) - (b.status === "fail" ? -1 : 1) || b.weight - a.weight);

  const glance = [
    { label: "Roles", count: content.experience.length, slug: "experience" },
    { label: "Projects", count: content.projects.length, slug: "projects" },
    { label: "Skills", count: content.skills.reduce((n, g) => n + g.items.length, 0), slug: "skills" },
    { label: "Certifications", count: content.certifications.length, slug: "certifications" },
    { label: "Education", count: content.education.length, slug: "education" },
    { label: "Activities", count: content.activities.length, slug: "activities" },
  ];

  return (
    <div className="py-6">
      <h1 className="font-display text-h2 text-text">
        Welcome <em className="text-accent">back</em>.
      </h1>
      <p className="mt-1 text-caption text-text-subtle">
        Everything on {SITE_URL.replace(/^https?:\/\//, "")} at a glance.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card
          title="SEO score"
          actions={
            <Link href="/admin/seo" className="text-caption text-accent hover:text-accent-strong">
              Improve
            </Link>
          }
        >
          <div className="flex items-center gap-5">
            <ScoreRing score={report.score} size={88} />
            <div className="text-caption text-text-muted">
              <p>
                {report.checks.filter((c) => c.status === "pass").length} of {report.checks.length} checks passed
              </p>
              <p className="mt-1 text-text-subtle">
                Focus keyword: <span className="text-text">{content.seo.focusKeyword ?? "not set"}</span>
              </p>
            </div>
          </div>
        </Card>

        <Card title="Content to finish">
          <p className="font-display text-[2.5rem] leading-none text-text">{todo.length}</p>
          <p className="mt-2 text-caption text-text-subtle">
            {todo.length
              ? "placeholder items still show as TBD on the site."
              : "Nothing left. Every field is filled in."}
          </p>
        </Card>

        <Card title="At a glance">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {glance.map((g) => (
              <li key={g.label}>
                <Link
                  href={`/admin/edit/${g.slug}`}
                  className="flex items-baseline justify-between gap-2 text-caption text-text-muted hover:text-text"
                >
                  {g.label} <span className="font-mono text-text">{g.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="To do">
          {todo.length ? (
            <ul className="divide-y divide-line">
              {todo.slice(0, 10).map((t) => (
                <li key={t.path}>
                  <Link
                    href={t.editor ? `/admin/edit/${t.editor.slug}` : "/admin"}
                    className="group flex items-center gap-3 py-2.5"
                  >
                    <span className="rounded-xs border border-dashed border-[#e0b45c]/60 px-1.5 font-mono text-[0.625rem] text-[#e0b45c]">
                      TBD
                    </span>
                    <span className="flex-1 text-caption text-text-muted group-hover:text-text">
                      {t.hint || t.path}
                      <span className="ml-2 font-mono text-[0.6875rem] text-text-faint">{t.editor?.label}</span>
                    </span>
                    <ArrowRight className="size-4 text-text-faint group-hover:text-accent" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-caption text-text-subtle">All placeholders are filled in.</p>
          )}
          {todo.length > 10 ? (
            <p className="mt-2 text-[0.75rem] text-text-subtle">…and {todo.length - 10} more.</p>
          ) : null}
        </Card>

        <Card
          title="Top SEO improvements"
          actions={
            <Link href="/admin/seo" className="text-caption text-accent hover:text-accent-strong">
              Open SEO
            </Link>
          }
        >
          {issues.length ? (
            <ul className="grid gap-3">
              {issues.slice(0, 6).map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  {c.status === "fail" ? (
                    <XCircle className="size-4 shrink-0 text-[#d76b6b]" aria-label="Needs fixing" />
                  ) : (
                    <CircleAlert className="size-4 shrink-0 text-[#e0b45c]" aria-label="Could improve" />
                  )}
                  <div>
                    <p className="text-caption text-text">{c.label}</p>
                    <p className="text-[0.75rem] text-text-subtle">{c.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-caption text-text-subtle">Every check passes.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Edit content">
          <ul className="grid gap-1 sm:grid-cols-2">
            {EDITORS.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/admin/edit/${e.slug}`}
                  className="flex min-h-10 items-center justify-between rounded-sm px-3 text-caption text-text-muted hover:bg-elevated hover:text-text"
                >
                  {e.label} <ArrowRight className="size-4 text-text-faint" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card
          title="Recent versions"
          actions={
            <Link href="/admin/settings" className="text-caption text-accent hover:text-accent-strong">
              All
            </Link>
          }
        >
          <RevisionList revisions={revisions} limit={5} />
        </Card>
      </div>
    </div>
  );
}
