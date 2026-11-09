import type { ReactNode } from "react";
import { isPlaceholder } from "@/data/portfolio";
import { Value } from "./Value";

/*
 * The editorial grid has two vertical lines:
 *   A — the column edge: indices, dates, metadata (Geist Mono), hanging headlines
 *   B — the hang (--hang, 88px from md): all running text
 * On phones --hang is 0 and everything stacks on line A.
 */

/** Eyebrow: index on line A, a rule measuring out to the hang, label on line B. */
export function Eyebrow({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-3 md:grid md:grid-cols-[var(--hang)_minmax(0,1fr)] md:gap-0">
      <span className="flex items-center gap-3 md:pr-4">
        <span className="text-accent">{index}</span>
        <span aria-hidden className="h-px w-8 bg-line-strong md:w-auto md:flex-1" />
      </span>
      <span>{children}</span>
    </p>
  );
}

/** Two-track row: metadata on line A, content on line B. Stacks on phones. */
export function HangRow({
  meta,
  children,
  className = "",
}: {
  meta: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-y-3 md:grid-cols-[var(--hang)_minmax(0,1fr)] ${className}`}>
      <div className="md:pt-1.5 md:pr-4">{meta}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * A period such as "Oct 2017 – Feb 2018", stacked on line A from md up.
 * An open-ended period ("… – Present") marks its end in the accent colour.
 */
export function Period({ text, className = "" }: { text: string; className?: string }) {
  const base = `font-mono text-micro tracking-wider text-text-subtle uppercase ${className}`;
  if (isPlaceholder(text)) return <Value text={text} className={base} />;
  const [start, end] = text.split(/\s+[–—-]\s+/);
  if (!end) return <span className={`block ${base}`}>{start}</span>;
  const now = /^present$/i.test(end);
  return (
    <span className={`flex gap-1.5 md:flex-col md:gap-0.5 ${base}`}>
      <time>{start}</time>
      <span aria-hidden className="md:hidden">
        —
      </span>
      <span className="sr-only"> to </span>
      <time className={now ? "text-accent" : undefined}>{end}</time>
    </span>
  );
}

/** Small numbered marker, e.g. 01, for ordered editorial lists. */
export const ordinal = (i: number) => String(i + 1).padStart(2, "0");
