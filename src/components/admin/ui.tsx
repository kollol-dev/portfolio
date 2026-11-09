"use client";

import {
  useId,
  useState,
  useSyncExternalStore,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { X } from "lucide-react";

/* Dashboard UI primitives, styled with the site's design tokens. */

const noopSubscribe = () => () => {};
/** True after hydration, so the server render and the first client render match. */
export const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

/** Local date/time, rendered after hydration (server and browser timezones differ). */
export function LocalTime({ iso }: { iso: string }) {
  const isClient = useIsClient();
  return (
    <time dateTime={iso}>
      {isClient
        ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
        : iso.slice(0, 16).replace("T", " ")}
    </time>
  );
}

export function Card({
  title,
  actions,
  children,
  className = "",
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-md border border-line bg-surface ${className}`}>
      {title || actions ? (
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 className="text-caption font-medium text-text">{title}</h2>
          {actions}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-bg hover:bg-accent-strong disabled:opacity-50",
  secondary: "border border-line-strong text-text hover:border-accent hover:text-accent-strong disabled:opacity-50",
  ghost: "text-text-muted hover:bg-elevated hover:text-text disabled:opacity-40",
  danger: "text-[#f0a3a3] hover:bg-[#3a1717]",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-sm px-3 text-caption font-medium transition-colors duration-(--dur-fast) disabled:cursor-not-allowed ${buttonStyles[variant]} ${className}`}
    />
  );
}

export function IconButton({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      {...props}
      className={`grid size-8 place-items-center rounded-sm text-text-subtle transition-colors hover:bg-elevated hover:text-text disabled:opacity-30 ${className}`}
    >
      {children}
    </button>
  );
}

const inputBase =
  "w-full min-w-0 rounded-sm border bg-inset px-3 py-2 text-caption text-text placeholder:text-text-faint transition-colors focus:border-accent focus:outline-none";

export function TextInput({
  invalid,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      className={`${inputBase} min-h-9 ${invalid ? "border-[#c45b5b]" : "border-line-strong"} ${className}`}
    />
  );
}

export function TextArea({
  invalid,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      rows={3}
      {...props}
      className={`${inputBase} field-sizing-content min-h-20 resize-y leading-relaxed ${invalid ? "border-[#c45b5b]" : "border-line-strong"} ${className}`}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-3 text-caption text-text-muted"
    >
      <span
        className={`relative h-5 w-9 rounded-full border transition-colors ${checked ? "border-accent bg-accent/30" : "border-line-strong bg-inset"}`}
      >
        <span
          className={`absolute top-0.5 size-3.5 rounded-full transition-all ${checked ? "left-[1.1rem] bg-accent" : "left-0.5 bg-text-subtle"}`}
        />
      </span>
      {label}
    </button>
  );
}

/** Chip list: type and press Enter (or comma) to add. */
export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const id = useId();
  const commit = () => {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft("");
  };
  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-sm border border-line-strong bg-inset px-2 py-1.5 focus-within:border-accent">
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-xs border border-line bg-elevated py-0.5 pr-1 pl-2 font-mono text-micro text-text-muted"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="rounded-xs p-0.5 hover:text-text"
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={commit}
        placeholder={value.length ? "" : (placeholder ?? "Type and press Enter")}
        className="min-w-24 flex-1 bg-transparent px-1 text-caption text-text placeholder:text-text-faint focus:outline-none"
      />
    </div>
  );
}

const ratingColor = (score: number) => (score >= 80 ? "#7fb59a" : score >= 50 ? "#e0b45c" : "#d76b6b");

/** Rank Math-style score ring. */
export function ScoreRing({ score, size = 72, label = true }: { score: number; size?: number; label?: boolean }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const color = ratingColor(score);
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute text-center leading-none">
        <span className="block font-mono font-medium text-text" style={{ fontSize: size * 0.26 }}>
          {score}
        </span>
        {label ? <span className="block font-mono text-[0.55rem] text-text-subtle">/ 100</span> : null}
      </span>
      <span className="sr-only">SEO score {score} out of 100</span>
    </div>
  );
}

export function ScorePill({ score }: { score: number }) {
  return (
    <span
      className="inline-flex min-w-9 justify-center rounded-full px-1.5 py-0.5 font-mono text-[0.625rem] font-medium text-bg"
      style={{ background: ratingColor(score) }}
    >
      {score}
    </span>
  );
}
