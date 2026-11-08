import { type Portfolio } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { sectionMeta } from "@/config/sections";
import { Reveal } from "@/components/ui/Reveal";
import { TagList } from "@/components/ui/Tag";

/** 02 — Experience, as a vertical timeline. */
export function ExperienceSection({ content }: { content: Portfolio }) {
  return (
    <Section meta={sectionMeta(content, "experience")}>
      <ol className="relative space-y-14 border-l border-line pl-8">
        {content.experience.map((job) => (
          <Reveal as="li" key={`${job.company}-${job.start}`} className="relative">
            <span
              aria-hidden
              className={`absolute top-2 -left-[calc(2rem+4.5px)] size-2 rounded-full border ${
                job.end === "Present" ? "border-accent bg-accent" : "border-line-strong bg-bg"
              }`}
            />
            <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">
              <time>{job.start}</time> — <time>{job.end}</time>
            </p>
            <h3 className="mt-2 text-h3 text-text">{job.role}</h3>
            <p className="mt-1 text-caption text-text-muted">
              {job.company} <span className="text-text-faint">·</span> {job.location}
            </p>
            <ul className="mt-5 space-y-2.5">
              {job.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-text-muted">
                  <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-line-strong" />
                  <span className="text-pretty">{h}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <TagList items={job.stack} label={`Technologies used at ${job.company}`} />
            </div>
          </Reveal>
        ))}
      </ol>

      {content.skills.length ? (
        <Reveal className="mt-20">
          <h3 className="eyebrow">{content.sections.experience.toolkitTitle ?? "Toolkit"}</h3>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {content.skills.map((group) => (
              <div key={group.label} className="grid gap-3 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="text-caption text-text-muted">{group.label}</dt>
                <dd>
                  <TagList items={group.items} label={group.label} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      ) : null}
    </Section>
  );
}
