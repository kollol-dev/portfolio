import { ArrowUpRight, Download } from "lucide-react";
import { displayUrl, type Portfolio } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { sectionMeta } from "@/config/sections";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/LinkButton";
import { SocialIcon } from "@/components/ui/BrandIcons";

/** 07 — Contact. Real mailto, no form. */
export function ContactSection({ content }: { content: Portfolio }) {
  const { profile } = content;
  const profiles = profile.socials.filter((s) => s.kind !== "email");
  const { intro } = content.sections.contact;

  return (
    <Section meta={sectionMeta(content, "contact")}>
      <Reveal>
        {intro ? <p className="max-w-(--body-max) text-lead text-pretty text-text-muted md:ml-(--hang)">{intro}</p> : null}

        {/* The one large statement in this chapter: the address itself, hanging on the column edge. */}
        <a
          href={`mailto:${profile.email}`}
          className="group mt-12 flex items-end justify-between gap-4 border-b border-line pb-6 text-text transition-colors duration-(--dur-base) hover:border-accent hover:text-accent-strong"
        >
          <span className="min-w-0 truncate text-[clamp(1.5rem,0.9rem+2.4vw,3rem)] leading-none font-medium tracking-[-0.03em]">
            {profile.email}
          </span>
          <ArrowUpRight
            className="size-5 shrink-0 transition-transform duration-(--dur-base) ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
            strokeWidth={1.5}
          />
        </a>

        <ul className="divide-y divide-line border-b border-line md:ml-(--hang)">
          {profiles.map((s) => (
            <li key={s.kind}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-14 items-center justify-between gap-4 py-4 text-text-muted transition-colors duration-(--dur-base) hover:text-text"
              >
                <span className="flex items-center gap-4">
                  <SocialIcon kind={s.kind} />
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
                <span className="truncate font-mono text-micro text-text-subtle">{displayUrl(s.href)}</span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
      <div className="mt-10 md:pl-(--hang)">
        <LinkButton
          href={profile.resumePath}
          download="Kollol-Chakraborty-Resume.pdf"
          variant="primary"
          icon={<Download className="size-4" strokeWidth={1.75} />}
        >
          Download resume<span className="sr-only"> (PDF)</span>
        </LinkButton>
      </div>
    </Section>
  );
}
