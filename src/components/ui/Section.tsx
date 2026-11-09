import type { ReactNode } from "react";
import type { SectionMeta } from "@/config/sections";
import { Reveal } from "./Reveal";
import { Emphasis } from "./Emphasis";
import { Eyebrow } from "./Editorial";

interface SectionProps {
  meta: SectionMeta;
  children: ReactNode;
  className?: string;
}

/**
 * Editorial section shell. Hangs from a top line (not vertically centred), so
 * every chapter starts at the same height: eyebrow, then a headline that
 * hangs on the column edge, then content. On desktop each chapter keeps at
 * least a screen of height so the avatar has time to present its prop.
 * Eyebrow and heading come from content/portfolio.json → "sections".
 */
export function Section({ meta, children, className = "" }: SectionProps) {
  const { id } = meta;
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={headingId}
      className={`border-t border-line py-(--section-py) lg:min-h-dvh ${className}`}
    >
      <Reveal>
        <Eyebrow index={meta.index}>{meta.eyebrow}</Eyebrow>
        <h2 id={headingId} className="mt-8 max-w-(--content-max) text-h2 text-balance text-text">
          <Emphasis text={meta.title} />
        </h2>
      </Reveal>
      <div className="mt-14 md:mt-20">{children}</div>
    </section>
  );
}
