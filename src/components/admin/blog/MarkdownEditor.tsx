"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  Bold,
  Code,
  Columns2,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  PenLine,
  Quote,
  Table,
} from "lucide-react";
import { LinkDialog, type LinkTarget } from "./LinkDialog";
import { uploadImage } from "./upload";

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Pre-rendered HTML of `value` (same renderer as the live site). */
  previewHtml: string;
  linkTargets: LinkTarget[];
  invalid?: boolean;
}

type Edit = (selected: string) => { insert: string; select?: [number, number] };

const TOOLS = [
  { id: "h2", label: "Heading 2", Icon: Heading2 },
  { id: "h3", label: "Heading 3", Icon: Heading3 },
  { id: "bold", label: "Bold (⌘B)", Icon: Bold },
  { id: "italic", label: "Italic (⌘I)", Icon: Italic },
  { id: "ul", label: "Bulleted list", Icon: List },
  { id: "ol", label: "Numbered list", Icon: ListOrdered },
  { id: "quote", label: "Quote", Icon: Quote },
  { id: "code", label: "Code", Icon: Code },
  { id: "table", label: "Table", Icon: Table },
  { id: "link", label: "Link (⌘K)", Icon: Link2 },
  { id: "image", label: "Upload image", Icon: ImageIcon },
] as const;

const SHORTCUTS: Record<string, (typeof TOOLS)[number]["id"]> = { b: "bold", i: "italic", k: "link" };

/** Markdown editor with a formatting toolbar, link/image tools and a live preview. */
export function MarkdownEditor({ value, onChange, previewHtml, linkTargets, invalid }: Props) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"write" | "preview" | "split">("write");
  const [link, setLink] = useState<{ open: boolean; text: string; key: number }>({ open: false, text: "", key: 0 });
  const [uploading, setUploading] = useState(false);
  const selection = useRef<[number, number]>([0, 0]);

  const apply = (edit: Edit, range?: [number, number]) => {
    const el = ta.current;
    const [s, e] = range ?? (el ? [el.selectionStart, el.selectionEnd] : [value.length, value.length]);
    const { insert, select } = edit(value.slice(s, e));
    onChange(value.slice(0, s) + insert + value.slice(e));
    requestAnimationFrame(() => {
      el?.focus();
      const [a, b] = select ?? [insert.length, insert.length];
      el?.setSelectionRange(s + a, s + b);
    });
  };

  const wrap = (before: string, after: string, placeholder: string) =>
    apply((sel) => {
      const text = sel || placeholder;
      return { insert: `${before}${text}${after}`, select: [before.length, before.length + text.length] };
    });

  /** Prefix each selected line (headings, lists, quotes). */
  const prefixLines = (prefix: string | ((i: number) => string)) => {
    const el = ta.current;
    if (!el) return;
    const start = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    const endIdx = value.indexOf("\n", el.selectionEnd);
    const end = endIdx === -1 ? value.length : endIdx;
    apply(
      (sel) => {
        const lines = sel.split("\n").map((line, i) => {
          const clean = line.replace(/^(#{1,6}\s|[-*]\s|\d+\.\s|>\s)/, "");
          return (typeof prefix === "function" ? prefix(i) : prefix) + clean;
        });
        const insert = lines.join("\n");
        return { insert, select: [insert.length, insert.length] };
      },
      [start, end],
    );
  };

  const openLink = () => {
    const el = ta.current;
    const range: [number, number] = el ? [el.selectionStart, el.selectionEnd] : [value.length, value.length];
    selection.current = range;
    setLink((l) => ({ open: true, text: value.slice(...range), key: l.key + 1 }));
  };

  const insertImage = async (f: File) => {
    const alt = prompt(
      "Describe the image (alt text, used by Google and screen readers):",
      f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
    );
    if (alt === null) return;
    setUploading(true);
    try {
      const url = await uploadImage(f);
      apply(() => ({ insert: `\n\n![${alt.replace(/[[\]]/g, "")}](${url})\n\n` }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  type ToolId = (typeof TOOLS)[number]["id"];
  const runTool = (id: ToolId) => {
    switch (id) {
      case "h2":
        return prefixLines("## ");
      case "h3":
        return prefixLines("### ");
      case "bold":
        return wrap("**", "**", "bold text");
      case "italic":
        return wrap("*", "*", "italic text");
      case "ul":
        return prefixLines("- ");
      case "ol":
        return prefixLines((i) => `${i + 1}. `);
      case "quote":
        return prefixLines("> ");
      case "code":
        return apply((sel) =>
          sel.includes("\n")
            ? { insert: `\n\`\`\`\n${sel}\n\`\`\`\n` }
            : { insert: `\`${sel || "code"}\``, select: [1, 1 + (sel || "code").length] },
        );
      case "table":
        return apply(() => ({ insert: "\n\n| Column | Column |\n| --- | --- |\n| Cell | Cell |\n\n" }));
      case "link":
        return openLink();
      case "image":
        return file.current?.click();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const id = SHORTCUTS[e.key.toLowerCase()];
    if (id) {
      e.preventDefault();
      runTool(id);
    }
  };

  const editor = (
    <textarea
      ref={ta}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      aria-label="Article body (Markdown)"
      spellCheck
      className={`min-h-[32rem] w-full resize-y rounded-b-sm border bg-inset p-4 font-mono text-[0.875rem] leading-relaxed text-text focus:border-accent focus:outline-none ${
        invalid ? "border-[#c45b5b]" : "border-line-strong"
      }`}
    />
  );
  const preview = (
    <div className="min-h-[32rem] overflow-y-auto rounded-b-sm border border-line-strong bg-bg p-6">
      <div className="prose-article" dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-sm border border-b-0 border-line-strong bg-elevated px-1.5 py-1">
        {TOOLS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => runTool(id)}
            disabled={mode === "preview" || (id === "image" && uploading)}
            className="grid size-8 place-items-center rounded-sm text-text-muted hover:bg-surface hover:text-text disabled:opacity-30"
          >
            <Icon className="size-4" />
          </button>
        ))}
        {uploading ? <span className="ml-1 text-[0.75rem] text-text-subtle">Uploading…</span> : null}
        <div className="ml-auto flex rounded-sm border border-line p-0.5" role="group" aria-label="Editor view">
          {(
            [
              ["write", PenLine, "Write"],
              ["split", Columns2, "Split"],
              ["preview", Eye, "Preview"],
            ] as const
          ).map(([m, Icon, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 rounded-xs px-2 py-1 text-[0.75rem] ${mode === m ? "bg-surface text-text" : "text-text-subtle hover:text-text"} ${m === "split" ? "max-xl:hidden" : ""}`}
            >
              <Icon className="size-3.5" aria-hidden /> {label}
            </button>
          ))}
        </div>
      </div>

      {mode === "write" ? (
        editor
      ) : mode === "preview" ? (
        preview
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {editor}
          {preview}
        </div>
      )}

      <p className="mt-2 text-[0.75rem] text-text-subtle">
        Markdown: <code className="font-mono">## Heading</code>, <code className="font-mono">**bold**</code>,{" "}
        <code className="font-mono">[text](url)</code>. Add <code className="font-mono">{"{nofollow}"}</code>,{" "}
        <code className="font-mono">{"{sponsored}"}</code> or <code className="font-mono">{"{newtab}"}</code> right
        after a link to set its options.
      </p>

      <input
        ref={file}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void insertImage(f);
        }}
      />

      <LinkDialog
        key={link.key}
        open={link.open}
        initialText={link.text}
        targets={linkTargets}
        onClose={() => setLink((l) => ({ ...l, open: false }))}
        onInsert={(md) => apply(() => ({ insert: md }), selection.current)}
      />
    </div>
  );
}
