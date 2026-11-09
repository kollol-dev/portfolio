import { type Portfolio } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { sectionMeta } from "@/config/sections";
import { Reveal } from "@/components/ui/Reveal";
import { HangRow, Period } from "@/components/ui/Editorial";

/** 05 — Education. */
export function EducationSection({ content }: { content: Portfolio }) {
  return (
    <Section meta={sectionMeta(content, "education")}>
      {content.education.map((edu) => (
        <Reveal key={edu.institution} className="border-t border-line py-10 first:border-t-0 first:pt-0">
          <article>
            <HangRow meta={<Period text={edu.period} />}>
              <h3 className="max-w-(--body-max) text-h3 text-balance text-text">{edu.degree}</h3>
              <p className="mt-1.5 text-caption text-text-muted">
                {edu.institution} <span className="text-text-faint">·</span> {edu.location}
              </p>
              {edu.achievements.length ? (
                <>
                  <h4 className="eyebrow mt-8">Highlights</h4>
                  <ul className="mt-3 max-w-(--body-max) space-y-2.5">
                    {edu.achievements.map((a) => (
                      <li key={a} className="flex gap-3 text-text-muted">
                        <span aria-hidden className="mt-[0.75em] h-px w-3 shrink-0 bg-line-strong" />
                        <span className="text-pretty">{a}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </HangRow>
          </article>
        </Reveal>
      ))}
    </Section>
  );
}
