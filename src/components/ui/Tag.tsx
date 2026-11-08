export function TagList({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-xs border border-line px-2 py-0.5 font-mono text-micro text-text-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
