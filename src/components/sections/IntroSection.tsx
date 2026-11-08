import type { CSSProperties } from "react";
import { ArrowDown, Download } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { LinkButton } from "@/components/ui/LinkButton";
import { SocialLinks } from "@/components/ui/BrandIcons";
import { IdBadge } from "@/components/ui/IdBadge";
import { SECTIONS } from "@/config/sections";

/** 01 — Introduction. Holds the page's only <h1>. */
export function IntroSection() {
  const { profile } = portfolio;
  const index = SECTIONS[0].index;
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

  return (
    <section
      id="intro"
      data-section="intro"
      aria-labelledby="intro-heading"
      className="relative flex min-h-dvh flex-col justify-center pt-[calc(var(--nav-h)+3rem)] pb-(--section-py)"
    >
      <div className="max-w-(--content-max)">
        <p className="rise eyebrow flex items-center gap-3" style={d(0)}>
          <span className="text-accent">{index}</span>
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          {profile.title}
        </p>

        <h1 id="intro-heading" className="rise mt-8 font-display text-display text-text" style={d(80)}>
          {profile.firstName}
          <br />
          <em className="text-accent">{profile.lastName}</em>
        </h1>

        <p className="rise mt-8 text-h3 text-balance text-text" style={d(200)}>
          {profile.headline}
        </p>
        <p className="rise mt-4 text-lead text-pretty text-text-muted" style={d(260)}>
          {profile.summary}
        </p>

        {/* ID card beside the actions once the column is wide enough (container query). */}
        <div className="@container rise mt-10" style={d(340)}>
          <div className="flex flex-col gap-6 @[27rem]:flex-row @[27rem]:items-end @[27rem]:gap-8">
            <IdBadge />
            <div className="flex flex-col items-start gap-3 @[27rem]:pb-14">
              <LinkButton href="#projects" variant="primary" icon={<ArrowDown className="size-4" strokeWidth={1.75} />}>
                View projects
              </LinkButton>
              <LinkButton
                href={profile.resumePath}
                download="Kollol-Chakraborty-Resume.pdf"
                icon={<Download className="size-4" strokeWidth={1.75} />}
              >
                Download resume<span className="sr-only"> (PDF)</span>
              </LinkButton>
              <SocialLinks links={profile.socials} className="-ml-3" />
            </div>
          </div>
        </div>
      </div>

      <a
        href="#experience"
        className="group absolute bottom-8 left-0 hidden items-center gap-3 font-mono text-micro tracking-wider text-text-subtle uppercase hover:text-text sm:flex"
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
