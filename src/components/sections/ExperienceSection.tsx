import { type Portfolio } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { sectionMeta } from "@/config/sections";
import { Reveal } from "@/components/ui/Reveal";
import { TagList } from "@/components/ui/Tag";
import { HangRow, Period } from "@/components/ui/Editorial";

/** 02 — Experience: dates on the column edge, the work on the hang. Then the toolkit. */
export function ExperienceSection({ content }: { content: Portfolio }) {
  return (
    <Section meta={sectionMeta(content, "experience")}>
      <ol>
        {content.experience.map((job) => (
          <Reveal
            as="li"
            key={`${job.company}-${job.start}`}
            className="border-t border-line py-10 first:border-t-0 first:pt-0"
          >
            <HangRow meta={<Period text={`${job.start} – ${job.end}`} />}>
              <h3 className="text-h3 text-text">{job.role}</h3>
              <p className="mt-1.5 text-caption text-text-muted">
                {job.company} <span className="text-text-faint">·</span> {job.location}
              </p>
              <ul className="mt-6 max-w-(--body-max) space-y-2.5">
                {job.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-text-muted">
                    <span aria-hidden className="mt-[0.75em] h-px w-3 shrink-0 bg-line-strong" />
                    <span className="text-pretty">{h}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <TagList items={job.stack} label={`Technologies used at ${job.company}`} />
              </div>
            </HangRow>
          </Reveal>
        ))}
      </ol>

      {content.skills.length ? (
        <Reveal className="mt-20 md:pl-(--hang)">
          <h3 className="eyebrow">{content.sections.experience.toolkitTitle ?? "Toolkit"}</h3>
          <dl className="mt-6 max-w-(--body-max) border-t border-line">
            {content.skills.map((group) => (
              <div key={group.label} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
                <dt className="text-caption text-text">{group.label}</dt>
                <dd className="text-caption text-pretty text-text-muted">{group.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      ) : null}
    </Section>
  );
}
