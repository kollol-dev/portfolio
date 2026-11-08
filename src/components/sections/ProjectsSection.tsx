import { ArrowUpRight, Lock } from "lucide-react";
import { portfolio, type Project } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TagList } from "@/components/ui/Tag";
import { LinkButton, MissingLink } from "@/components/ui/LinkButton";
import { Value } from "@/components/ui/Value";
import { GitHubIcon } from "@/components/ui/BrandIcons";

function ProjectLinks({ project }: { project: Project }) {
  if (project.confidential) {
    return (
      <p className="flex items-center gap-2 text-caption text-text-subtle">
        <Lock className="size-3.5" aria-hidden strokeWidth={1.5} />
        Proprietary client work — no public code or demo.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      {project.github ? (
        <LinkButton href={project.github} external icon={<GitHubIcon className="size-3.5" />}>
          Source
        </LinkButton>
      ) : (
        <MissingLink label="GitHub" />
      )}
      {project.live ? (
        <LinkButton href={project.live} external icon={<ArrowUpRight className="size-4" strokeWidth={1.75} />}>
          Live demo
        </LinkButton>
      ) : (
        <MissingLink label="Live demo" />
      )}
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="eyebrow">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-caption text-text-muted">
            <span aria-hidden className="mt-[0.65em] h-px w-3 shrink-0 bg-line-strong" />
            <Value text={item} className="text-pretty" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 04 — Featured projects. */
export function ProjectsSection() {
  return (
    <Section id="projects">
      <div className="space-y-6">
        {portfolio.projects.map((project, i) => (
          <Reveal key={`${project.name}-${i}`}>
            <article
              aria-labelledby={`project-${i}`}
              className="rounded-md border border-line bg-surface p-6 transition-colors duration-(--dur-base) hover:border-line-strong sm:p-8"
            >
              <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span> <Value text={project.context} />
              </p>
              <h3 id={`project-${i}`} className="mt-3 text-h3 text-text">
                <Value text={project.name} />
              </h3>
              <p className="mt-1 text-caption text-text-subtle">
                Role: <Value text={project.role} />
              </p>
              <p className="mt-4 text-pretty text-text-muted">
                <Value text={project.summary} />
              </p>

              <div className="mt-6 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
                <DetailList title="Architecture" items={project.architecture} />
                <DetailList title="Challenges" items={project.challenges} />
              </div>

              <div className="mt-6">
                <TagList items={project.stack} label={`Technologies used in ${project.name}`} />
              </div>
              <div className="mt-6">
                <ProjectLinks project={project} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
