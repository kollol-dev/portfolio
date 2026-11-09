import { type Activity, type Portfolio } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { sectionMeta } from "@/config/sections";
import { Reveal } from "@/components/ui/Reveal";
import { Value } from "@/components/ui/Value";
import { HangRow, Period } from "@/components/ui/Editorial";

const kindLabel: Record<Activity["kind"], string> = {
  leadership: "Leadership",
  volunteering: "Volunteering",
  award: "Award",
};

/** 06 — Activities & achievements, ending with the closing statement as a pull quote. */
export function ActivitiesSection({ content }: { content: Portfolio }) {
  return (
    <Section meta={sectionMeta(content, "activities")}>
      <ul>
        {content.activities.map((act, i) => (
          <Reveal
            as="li"
            key={`${act.kind}-${i}`}
            delay={i * 0.06}
            className="border-t border-line py-8 first:border-t-0 first:pt-0"
          >
            <HangRow meta={<Period text={act.period} />}>
              <p className="eyebrow">{kindLabel[act.kind]}</p>
              <h3 className="mt-2 text-h3 text-text">
                <Value text={act.title} />
              </h3>
              <p className="mt-1.5 text-caption text-text-muted">
                <Value text={act.organisation} />
              </p>
              <p className="mt-3 max-w-(--body-max) text-pretty text-text-muted">
                <Value text={act.description} />
              </p>
            </HangRow>
          </Reveal>
        ))}
      </ul>

      {content.closingStatement ? (
        <Reveal className="mt-24">
          <figure className="border-t border-line pt-10">
            <blockquote>
              <p className="editorial max-w-[22ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-[1.15] text-balance text-text">
                {content.closingStatement}
              </p>
            </blockquote>
          </figure>
        </Reveal>
      ) : null}
    </Section>
  );
}
