import type { ReactNode } from "react";
import type { SectionId } from "@/config/sections";
import { SECTIONS } from "@/config/sections";

interface SectionProps {
  id: SectionId;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Editorial section shell. Lives in the left column on desktop; the right
 * half of the viewport is reserved for the fixed 3D stage.
 * `data-section` is what the scroll observer (Phase 6) will watch.
 */
export function Section({ id, eyebrow, title, children, className = "" }: SectionProps) {
  const meta = SECTIONS.find((s) => s.id === id);
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={headingId}
      className={`flex min-h-dvh flex-col justify-center border-t border-line py-(--section-py) ${className}`}
    >
      <div className="max-w-(--content-max)">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-accent">{meta?.index}</span>
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          {eyebrow}
        </p>
        <h2 id={headingId} className="mt-6 font-display text-h2 text-balance text-text">
          {title}
        </h2>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
