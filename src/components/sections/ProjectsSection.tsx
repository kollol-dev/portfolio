import { ArrowUpRight, Lock } from "lucide-react";
import { featured, type Portfolio, type Project } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { sectionMeta } from "@/config/sections";
import { Reveal } from "@/components/ui/Reveal";
import { TagList } from "@/components/ui/Tag";
import { MissingLink } from "@/components/ui/LinkButton";
import { Value } from "@/components/ui/Value";
import { HangRow, ordinal } from "@/components/ui/Editorial";

/** Source / demo as plain text links; a confidential project says so instead. */
function ProjectLinks({ project }: { project: Project }) {
  if (project.confidential) {
    return (
      <p className="flex items-center gap-2 text-caption text-text-subtle">
        <Lock className="size-3.5" aria-hidden strokeWidth={1.5} />
        Proprietary client work — no public code or demo.
      </p>
    );
  }
  const link = (href: string | undefined, label: string) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex min-h-11 items-center gap-1.5 text-caption text-text underline decoration-line-strong underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent-strong hover:decoration-accent"
      >
        {label}
        <ArrowUpRight
          aria-hidden
          className="size-3.5 transition-transform duration-(--dur-base) ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.75}
        />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      <MissingLink label={label} />
    );
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {link(project.github, "Source")}
      {link(project.live, "Live demo")}
    </div>
  );
}

/** Numbered list (01, 02 …) under a mono label. */
function NumberedList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="eyebrow">{title}</h4>
      <ol className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={item} className="grid grid-cols-[2rem_minmax(0,1fr)] text-text-muted">
            <span aria-hidden className="pt-[0.3em] font-mono text-micro text-text-subtle">
              {ordinal(i)}
            </span>
            <Value text={item} className="text-pretty" />
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The lead project: set large, read as a short case study. */
function FeaturedProject({ project }: { project: Project }) {
  return (
    <Reveal>
      <article aria-labelledby="project-featured">
        <HangRow
          meta={
            <p className="flex gap-2 font-mono text-micro tracking-wider text-accent uppercase md:block">
              {ordinal(0)}
              <span className="block text-text-subtle">Lead</span>
            </p>
          }
        >
          <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">
            <Value text={project.context} />
          </p>
          <h3
            id="project-featured"
            className="mt-4 text-[clamp(1.75rem,1.3rem+1.6vw,2.75rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance text-text"
          >
            <Value text={project.name} />
          </h3>
          <p className="mt-6 max-w-(--body-max) text-lead text-pretty text-text">
            <Value text={project.summary} />
          </p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-caption">
            <div className="flex gap-2">
              <dt className="text-text-subtle">Role</dt>
              <dd className="text-text">
                <Value text={project.role} />
              </dd>
            </div>
          </dl>

          <div className="mt-12 grid max-w-(--body-max) gap-10 border-t border-line pt-10">
            <NumberedList title="Architecture" items={project.architecture} />
            <NumberedList title="Challenges" items={project.challenges} />
          </div>

          <div className="mt-10 space-y-5">
            <TagList items={project.stack} label={`Technologies used in ${project.name}`} />
            <ProjectLinks project={project} />
          </div>
        </HangRow>
      </article>
    </Reveal>
  );
}

/** Compact bulleted list for a supporting project. */
function BriefList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="sr-only">{title}</h4>
      <ul className="space-y-1.5 text-caption text-text-muted">
        {items.map((a) => (
          <li key={a} className="flex gap-3">
            <span aria-hidden className="mt-[0.65em] h-px w-3 shrink-0 bg-line-strong" />
            <Value text={a} className="text-pretty" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A supporting project: one indexed row on the same grid, smaller type. */
function SupportingProject({ project, index }: { project: Project; index: number }) {
  const id = `project-${index}`;
  return (
    <Reveal as="li" className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <article aria-labelledby={id}>
        <HangRow
          meta={
            <span className="font-mono text-micro tracking-wider text-text-subtle" aria-hidden>
              {ordinal(index)}
            </span>
          }
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 id={id} className="text-h3 text-text">
              <Value text={project.name} />
            </h3>
            <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">
              <Value text={project.context} />
            </p>
          </div>
          <p className="mt-3 max-w-(--body-max) text-pretty text-text-muted">
            <Value text={project.summary} />
          </p>
          <p className="mt-3 text-caption text-text-subtle">
            Role: <Value text={project.role} className="text-text-muted" />
          </p>
          <div className="mt-4 max-w-(--body-max) space-y-1.5">
            <BriefList title="Architecture" items={project.architecture} />
            <BriefList title="Challenges" items={project.challenges} />
          </div>
          <div className="mt-5 space-y-3">
            <TagList items={project.stack} label={`Technologies used in ${project.name}`} />
            <ProjectLinks project={project} />
          </div>
        </HangRow>
      </article>
    </Reveal>
  );
}

/** 04 — Projects: one lead case study, then the supporting work as an index. */
export function ProjectsSection({ content }: { content: Portfolio }) {
  const lead = featured(content.projects);
  const rest = content.projects.filter((p) => p !== lead);
  return (
    <Section meta={sectionMeta(content, "projects")}>
      {lead ? <FeaturedProject project={lead} /> : null}
      {rest.length ? (
        <div className="mt-24">
          <p id="projects-more" className="eyebrow md:pl-(--hang)">
            Also built
          </p>
          <ol aria-labelledby="projects-more" className="mt-8">
            {rest.map((project, i) => (
              <SupportingProject key={`${project.name}-${i}`} project={project} index={i + 1} />
            ))}
          </ol>
        </div>
      ) : null}
    </Section>
  );
}
