import { ArrowDown, Download, MapPin } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { LinkButton } from "@/components/ui/LinkButton";
import { SocialLinks } from "@/components/ui/BrandIcons";
import { Value } from "@/components/ui/Value";
import { SECTIONS } from "@/config/sections";

/** 01 — Introduction. Holds the page's only <h1>. */
export function IntroSection() {
  const { profile } = portfolio;
  const index = SECTIONS[0].index;

  return (
    <section
      id="intro"
      data-section="intro"
      aria-labelledby="intro-heading"
      className="flex min-h-dvh flex-col justify-center pt-[calc(var(--nav-h)+3rem)] pb-(--section-py)"
    >
      <div className="max-w-(--content-max)">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-accent">{index}</span>
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          {profile.title}
        </p>

        <h1 id="intro-heading" className="mt-8 font-display text-display text-text">
          {profile.firstName}
          <br />
          <em className="text-accent">{profile.lastName}</em>
        </h1>

        <p className="mt-8 text-h3 text-balance text-text">{profile.headline}</p>
        <p className="mt-4 text-lead text-pretty text-text-muted">{profile.summary}</p>

        <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
          <div className="bg-bg px-4 py-3">
            <dt className="eyebrow">Based in</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-caption text-text">
              <MapPin className="size-3.5 text-text-subtle" aria-hidden strokeWidth={1.5} />
              {profile.location}
            </dd>
          </div>
          <div className="bg-bg px-4 py-3">
            <dt className="eyebrow">Availability</dt>
            <dd className="mt-1 text-caption text-text">
              <Value text={profile.availability} />
            </dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-3">
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
        </div>

        <SocialLinks links={profile.socials} className="mt-6 -ml-3" />
      </div>
    </section>
  );
}
