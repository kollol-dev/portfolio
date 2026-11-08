import type { ReactNode } from "react";
import type { SectionMeta } from "@/config/sections";
import { Reveal } from "./Reveal";
import { Emphasis } from "./Emphasis";

interface SectionProps {
  meta: SectionMeta;
  children: ReactNode;
  className?: string;
}

/**
 * Editorial section shell. Lives in the left column on desktop; the right
 * half of the viewport is reserved for the fixed 3D stage.
 * `data-section` is what the scroll observer (Phase 6) will watch.
 */
/** Eyebrow and heading come from content/portfolio.json → "sections". */
export function Section({ meta, children, className = "" }: SectionProps) {
  const { id } = meta;
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={headingId}
      className={`flex min-h-dvh flex-col justify-center border-t border-line py-(--section-py) ${className}`}
    >
      <div className="max-w-(--content-max)">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="text-accent">{meta.index}</span>
            <span aria-hidden className="h-px w-8 bg-line-strong" />
            {meta.eyebrow}
          </p>
          <h2 id={headingId} className="mt-6 font-display text-h2 text-balance text-text">
            <Emphasis text={meta.title} />
          </h2>
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
