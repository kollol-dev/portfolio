import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";

const variants: Record<Variant, string> = {
  primary:
    "bg-text text-bg hover:bg-accent-strong border border-transparent",
  secondary:
    "border border-line-strong text-text hover:border-accent hover:text-accent-strong",
  text: "text-text-muted hover:text-accent-strong px-0!",
};

interface LinkButtonProps extends ComponentPropsWithoutRef<"a"> {
  variant?: Variant;
  icon?: ReactNode;
  external?: boolean;
}

/** Anchor styled as a button. Use for navigation, downloads and mailto. */
export function LinkButton({
  variant = "secondary",
  icon,
  external,
  className = "",
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <a
      {...rest}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group inline-flex min-h-11 items-center gap-2 rounded-sm px-4 text-caption font-medium transition-colors duration-(--dur-base) ease-out-expo ${variants[variant]} ${className}`}
    >
      {children}
      {icon ? (
        <span aria-hidden className="transition-transform duration-(--dur-base) ease-out-expo group-hover:translate-x-0.5">
          {icon}
        </span>
      ) : null}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}

/** Shown where a link is expected but the URL has not been provided yet. */
export function MissingLink({ label }: { label: string }) {
  return (
    <span
      className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-dashed border-line px-4 text-caption text-text-faint"
      title="Placeholder — URL not provided yet"
    >
      {label} <span className="font-mono text-micro uppercase">TBD</span>
    </span>
  );
}
