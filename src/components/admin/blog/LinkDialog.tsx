"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, FileText, Home, Link2, Search, X } from "lucide-react";
import { Button, TextInput } from "../ui";

export interface LinkTarget {
  label: string;
  url: string;
  kind: "page" | "post";
  /** Phrases that suggest linking to this target (focus keyword, title words…). */
  keywords: string[];
}

interface Props {
  open: boolean;
  initialText: string;
  targets: LinkTarget[];
  onClose: () => void;
  /** Receives ready-to-insert Markdown. */
  onInsert: (markdown: string) => void;
}

const isUrl = (v: string) => /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v.trim());

/** Insert an internal (inbound) or external (outbound) link. */
export function LinkDialog({ open, initialText, targets, onClose, onInsert }: Props) {
  const [tab, setTab] = useState<"internal" | "external">("internal");
  const [text, setText] = useState(initialText);
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [nofollow, setNofollow] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const [newTab, setNewTab] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return targets.filter(
      (t) =>
        !q ||
        t.label.toLowerCase().includes(q) ||
        t.url.includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q)),
    );
  }, [targets, query]);

  const insert = (href: string, label: string, opts: string[]) => {
    const linkText = (text || label).replace(/[[\]]/g, "");
    onInsert(`[${linkText}](${href})${opts.length ? `{${opts.join(" ")}}` : ""}`);
    onClose();
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="link-dialog-title"
      className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-md border border-line-strong bg-surface p-0 text-text backdrop:bg-black/70"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 id="link-dialog-title" className="flex items-center gap-2 text-caption font-medium">
          <Link2 className="size-4 text-accent" aria-hidden /> Insert link
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-8 place-items-center rounded-sm text-text-subtle hover:text-text"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-caption text-text-muted">Link text (anchor)</span>
          <TextInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Descriptive words, not “click here”"
          />
        </label>

        <div className="flex rounded-sm border border-line p-0.5" role="tablist" aria-label="Link type">
          {(
            [
              ["internal", "Internal (inbound)"],
              ["external", "External (outbound)"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex-1 rounded-xs py-1.5 text-caption ${tab === key ? "bg-elevated text-text" : "text-text-subtle hover:text-text"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "internal" ? (
          <div>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-faint"
                aria-hidden
              />
              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your posts and pages"
                className="pl-9"
                autoFocus
              />
            </div>
            <ul className="mt-3 max-h-64 divide-y divide-line overflow-y-auto rounded-sm border border-line">
              {results.map((t) => (
                <li key={t.url}>
                  <button
                    type="button"
                    onClick={() => insert(t.url, t.label, newTab ? ["newtab"] : [])}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-elevated"
                  >
                    {t.kind === "post" ? (
                      <FileText className="size-4 shrink-0 text-accent" aria-hidden />
                    ) : (
                      <Home className="size-4 shrink-0 text-steel" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-caption text-text">{t.label}</span>
                      <span className="block truncate font-mono text-[0.6875rem] text-text-subtle">{t.url}</span>
                    </span>
                  </button>
                </li>
              ))}
              {!results.length ? (
                <li className="px-3 py-4 text-caption text-text-subtle">
                  Nothing matches. Published posts and home page sections appear here.
                </li>
              ) : null}
            </ul>
            <label className="mt-3 flex items-center gap-2 text-caption text-text-muted">
              <input
                type="checkbox"
                checked={newTab}
                onChange={(e) => setNewTab(e.target.checked)}
                className="size-4 accent-[var(--c-accent)]"
              />
              Open in a new tab
            </label>
          </div>
        ) : (
          <div className="grid gap-3">
            <label className="block">
              <span className="mb-1.5 block text-caption text-text-muted">URL</span>
              <TextInput
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                inputMode="url"
                autoFocus
              />
            </label>
            <label className="flex items-start gap-2 text-caption text-text-muted">
              <input
                type="checkbox"
                checked={nofollow}
                onChange={(e) => setNofollow(e.target.checked)}
                className="mt-0.5 size-4 accent-[var(--c-accent)]"
              />
              <span>
                <span className="text-text">nofollow</span> — don&rsquo;t pass ranking credit (untrusted or
                user-submitted links)
              </span>
            </label>
            <label className="flex items-start gap-2 text-caption text-text-muted">
              <input
                type="checkbox"
                checked={sponsored}
                onChange={(e) => setSponsored(e.target.checked)}
                className="mt-0.5 size-4 accent-[var(--c-accent)]"
              />
              <span>
                <span className="text-text">sponsored</span> — paid, affiliate or partner links (required by Google)
              </span>
            </label>
            <p className="flex items-center gap-1.5 text-[0.75rem] text-text-subtle">
              <ExternalLink className="size-3.5" aria-hidden /> External links open in a new tab with
              rel=&ldquo;noopener noreferrer&rdquo;.
            </p>
            <div className="flex justify-end">
              <Button
                variant="primary"
                disabled={!isUrl(url)}
                onClick={() =>
                  insert(url.trim(), url.trim(), [
                    ...(nofollow ? ["nofollow"] : []),
                    ...(sponsored ? ["sponsored"] : []),
                  ])
                }
              >
                Insert link
              </Button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
