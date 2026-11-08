import { portfolio } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";

/** 05 — Education. */
export function EducationSection() {
  return (
    <Section
      id="education"
      eyebrow="Education"
      title={
        <>
          Computer science, <em className="text-accent">Sylhet</em>.
        </>
      }
    >
      {portfolio.education.map((edu) => (
        <article key={edu.institution} className="border-y border-line py-8">
          <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">
            {edu.period}
          </p>
          <h3 className="mt-3 text-h3 text-text">{edu.degree}</h3>
          <p className="mt-1 text-caption text-text-muted">
            {edu.institution} <span className="text-text-faint">·</span> {edu.location}
          </p>
          <h4 className="eyebrow mt-8">Highlights</h4>
          <ul className="mt-3 space-y-2.5">
            {edu.achievements.map((a) => (
              <li key={a} className="flex gap-3 text-text-muted">
                <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-line-strong" />
                <span className="text-pretty">{a}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </Section>
  );
}
