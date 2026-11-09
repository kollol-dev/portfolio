/**
 * Technology list as a quiet line of mono text separated by slashes, not chips:
 * the names carry the information, a box around each would only add noise.
 */
export function TagList({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <ul
      aria-label={label}
      className="flex flex-wrap gap-y-1 font-mono text-micro tracking-wide text-text-subtle [&>li+li]:before:mx-2 [&>li+li]:before:text-text-faint [&>li+li]:before:content-['/']"
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
