"use client";

import { useCallback, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, RotateCcw, Save } from "lucide-react";
import { saveContent, type SaveResult } from "@/app/admin/actions";
import { Button } from "./ui";
import { Field, type Schema } from "./SchemaForm";

type Values = Record<string, unknown>;

/** Unsaved-changes state, Cmd/Ctrl+S, leave warning and save status. */
export function useContentDraft(initial: Values) {
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(saved), [values, saved]);

  const save = useCallback(() => {
    if (pending) return;
    startTransition(async () => {
      const res = await saveContent(values);
      setResult(res);
      if (res.ok) setSaved(values);
      else if (res.path)
        document
          .querySelector(`[data-path="${CSS.escape(res.path)}"]`)
          ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }, [pending, values]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [save, dirty]);

  const update = (key: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setResult(null);
  };
  const discard = () => {
    setValues(saved);
    setResult(null);
  };

  return { values, update, dirty, pending, result, save, discard };
}

export function EditorHeader({
  title,
  description,
  dirty,
  pending,
  result,
  onSave,
  onDiscard,
  extra,
}: {
  title: string;
  description?: string;
  dirty: boolean;
  pending: boolean;
  result: SaveResult | null;
  onSave: () => void;
  onDiscard: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-line bg-bg/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-h3 text-text">{title}</h1>
          {description ? <p className="mt-0.5 max-w-2xl text-caption text-text-subtle">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {extra}
          <span
            className="hidden font-mono text-micro tracking-wider text-text-subtle uppercase sm:inline"
            aria-live="polite"
          >
            {pending ? "Saving…" : dirty ? "Unsaved changes" : result?.ok ? "Saved" : ""}
          </span>
          <Button variant="ghost" onClick={onDiscard} disabled={!dirty || pending}>
            <RotateCcw className="size-4" aria-hidden /> Discard
          </Button>
          <Button variant="primary" onClick={onSave} disabled={!dirty || pending}>
            <Save className="size-4" aria-hidden /> {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      {result ? (
        <div
          role={result.ok ? "status" : "alert"}
          className={`mt-3 flex items-start gap-2 rounded-sm border px-3 py-2 text-caption ${
            result.ok
              ? "border-[#7fb59a]/40 bg-[#7fb59a]/10 text-[#b8dcc7]"
              : "border-[#c45b5b]/50 bg-[#c45b5b]/10 text-[#f0a3a3]"
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          ) : (
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          )}
          <span className="flex-1">
            {result.ok ? (
              "Saved. The live site is updated."
            ) : (
              <>
                Not saved: <code className="font-mono text-[0.75rem]">{result.error}</code>
              </>
            )}
          </span>
          {result.ok ? (
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 underline underline-offset-2"
            >
              View site <ExternalLink className="size-3" aria-hidden />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Generic editor for one or more top-level content keys. */
export function ContentEditor({
  title,
  description,
  initial,
  schema,
}: {
  title: string;
  description: string;
  initial: Values;
  schema: Schema;
}) {
  const { values, update, dirty, pending, result, save, discard } = useContentDraft(initial);
  const errorPath = result && !result.ok ? result.path : undefined;

  return (
    <div>
      <EditorHeader
        title={title}
        description={description}
        dirty={dirty}
        pending={pending}
        result={result}
        onSave={save}
        onDiscard={discard}
      />
      <div className="grid max-w-3xl gap-6">
        {Object.keys(initial).map((key) => (
          <div key={key} className="rounded-md border border-line bg-surface p-5">
            <Field
              name={key}
              schema={schema.properties?.[key] ?? {}}
              root={schema}
              value={values[key]}
              path={key}
              errorPath={errorPath}
              required={schema.required?.includes(key)}
              bare={typeof initial[key] === "object"}
              onChange={(v) => update(key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
