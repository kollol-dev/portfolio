import type { CSSProperties } from "react";
import { ArrowDown, Download } from "lucide-react";
import type { Portfolio } from "@/data/portfolio";
import { LinkButton } from "@/components/ui/LinkButton";
import { IdBadge } from "@/components/ui/IdBadge";
import { Value } from "@/components/ui/Value";
import { sectionMeta } from "@/config/sections";

/**
 * 01 — Introduction. Holds the page's only <h1>.
 *
 * Composition on the editorial grid: the name hangs on the column edge (line A);
 * metadata, the one headline, the summary and the actions sit on the hang
 * (line B). Socials live in Contact and the footer, so the hero stays quiet.
 */
export function IntroSection({ content }: { content: Portfolio }) {
  const { profile } = content;
  const { index } = sectionMeta(content, "intro");
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
  const meta = [
    { label: "Role", value: profile.title },
    { label: "Based in", value: profile.location },
    { label: "Status", value: profile.availability },
  ];

  return (
    <section
      id="intro"
      data-section="intro"
      aria-labelledby="intro-heading"
      className="relative flex min-h-dvh flex-col pt-[calc(var(--nav-h)+clamp(2.5rem,9vh,6rem))] pb-(--section-py)"
    >
      {/* Technical metadata strip */}
      <div className="rise flex flex-col gap-4 md:grid md:grid-cols-[var(--hang)_minmax(0,1fr)]" style={d(0)}>
        <p className="eyebrow flex items-center gap-3 md:pr-4">
          <span className="text-accent">{index}</span>
          <span aria-hidden className="h-px w-8 bg-line-strong md:w-auto md:flex-1" />
        </p>
        <dl className="grid gap-x-8 gap-y-2 font-mono text-micro tracking-wider uppercase sm:grid-cols-[auto_auto_minmax(0,1fr)]">
          {meta.map(({ label, value }) => (
            <div key={label} className="flex gap-3 sm:flex-col sm:gap-1">
              <dt className="text-text-subtle">{label}</dt>
              <dd className="text-text">
                <Value text={value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <h1 id="intro-heading" className="rise mt-[clamp(3rem,11vh,7.5rem)] text-display text-text" style={d(80)}>
        {profile.firstName}
        <br />
        <em className="editorial text-accent">{profile.lastName}</em>
      </h1>

      <div className="md:pl-(--hang)">
        <p className="rise mt-10 max-w-[24ch] text-h3 text-balance text-text" style={d(200)}>
          {profile.headline}
        </p>
        <p className="rise mt-5 max-w-(--body-max) text-pretty text-text-muted" style={d(260)}>
          {profile.summary}
        </p>

        {/* ID card beside the actions once the column is wide enough (container query). */}
        <div className="@container rise mt-12" style={d(340)}>
          <div className="flex flex-col gap-8 @[26rem]:flex-row @[26rem]:items-end @[26rem]:gap-10">
            <IdBadge />
            <div className="flex flex-col items-start gap-1 @[26rem]:pb-12">
              <LinkButton href="#projects" variant="primary" icon={<ArrowDown className="size-4" strokeWidth={1.75} />}>
                View selected work
              </LinkButton>
              <LinkButton
                href={profile.resumePath}
                download="Kollol-Chakraborty-Resume.pdf"
                variant="text"
                icon={<Download className="size-4" strokeWidth={1.75} />}
                className="mt-2"
              >
                Résumé<span className="sr-only"> (PDF)</span>
              </LinkButton>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#experience"
        className="group absolute bottom-8 left-0 hidden min-h-11 items-center gap-3 font-mono text-micro tracking-wider text-text-subtle uppercase hover:text-text sm:flex"
      >
        <span aria-hidden className="relative h-8 w-px overflow-hidden bg-line">
          <span className="scroll-cue-line absolute inset-0 bg-accent" />
        </span>
        Scroll
        <span className="sr-only"> to experience</span>
      </a>
    </section>
  );
}
