import { Award, HandHeart, Users } from "lucide-react";
import { portfolio, type Activity } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Value } from "@/components/ui/Value";

const kindMeta: Record<Activity["kind"], { label: string; Icon: typeof Users }> = {
  leadership: { label: "Leadership", Icon: Users },
  volunteering: { label: "Volunteering", Icon: HandHeart },
  award: { label: "Award", Icon: Award },
};

/** 06 — Activities & achievements, ending with the closing statement. */
export function ActivitiesSection() {
  return (
    <Section id="activities">
      <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line">
        {portfolio.activities.map((act, i) => {
          const { label, Icon } = kindMeta[act.kind];
          return (
            <Reveal as="li" key={`${act.kind}-${i}`} delay={i * 0.06} className="bg-bg p-6">
              <p className="eyebrow flex items-center gap-2">
                <Icon className="size-3.5 text-accent" aria-hidden strokeWidth={1.5} />
                {label}
                <span aria-hidden className="text-text-faint">
                  ·
                </span>
                <Value text={act.period} />
              </p>
              <h3 className="mt-3 text-h3 text-text">
                <Value text={act.title} />
              </h3>
              <p className="mt-1 text-caption text-text-muted">
                <Value text={act.organisation} />
              </p>
              <p className="mt-3 text-pretty text-text-muted">
                <Value text={act.description} />
              </p>
            </Reveal>
          );
        })}
      </ul>

      <Reveal>
        <blockquote className="mt-16 border-l border-accent pl-6">
          <p className="font-display text-h3 text-balance text-text italic sm:text-[1.75rem] sm:leading-snug">
            {portfolio.closingStatement}
          </p>
        </blockquote>
      </Reveal>
    </Section>
  );
}
