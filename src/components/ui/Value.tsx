import { isPlaceholder, PLACEHOLDER_PREFIX } from "@/data/portfolio";

/**
 * Renders a content string. Placeholder strings get a dashed, muted style
 * so missing content is obvious in development and review.
 */
export function Value({ text, className = "" }: { text: string; className?: string }) {
  if (!isPlaceholder(text)) return <span className={className}>{text}</span>;
  const hint = text.slice(PLACEHOLDER_PREFIX.length).trim();
  return (
    <span
      className={`${className} rounded-xs border border-dashed border-line-strong px-1.5 text-text-faint`}
      title="Placeholder — content not provided yet"
    >
      <span className="font-mono text-micro uppercase tracking-wider">TBD</span>
      {hint ? ` · ${hint}` : null}
    </span>
  );
}
