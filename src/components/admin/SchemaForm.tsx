"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { PLACEHOLDER_PREFIX } from "@/data/portfolio";
import { Button, IconButton, TagInput, TextArea, TextInput, Toggle } from "./ui";

/*
 * Renders an editable form from content/portfolio.schema.json, so every
 * field the site supports can be edited without a hand-built form.
 */

export interface Schema {
  type?: string | string[];
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  enum?: string[];
  description?: string;
  title?: string;
  format?: string;
  $ref?: string;
  allOf?: Schema[];
  definitions?: Record<string, Schema>;
  [key: string]: unknown;
}

type Json = unknown;

/** Resolve $ref and allOf against the root schema. */
export function resolve(schema: Schema | undefined, root: Schema): Schema {
  if (!schema) return {};
  let s = schema;
  if (s.$ref) {
    const name = s.$ref.replace("#/definitions/", "");
    const { $ref: _ref, ...rest } = s;
    void _ref;
    s = { ...resolve(root.definitions?.[name], root), ...rest };
  }
  if (s.allOf) {
    const parts = s.allOf.map((p) => resolve(p, root));
    const { allOf: _all, ...rest } = s;
    void _all;
    s = parts.reduce<Schema>(
      (acc, p) => ({
        ...acc,
        ...p,
        properties: { ...acc.properties, ...p.properties },
        required: [...(acc.required ?? []), ...(p.required ?? [])],
      }),
      rest,
    );
    s = { ...s, properties: { ...s.properties, ...rest.properties } };
  }
  return s;
}

const kindOf = (s: Schema): string => {
  if (s.enum) return "enum";
  const t = Array.isArray(s.type) ? s.type[0] : s.type;
  if (t) return t;
  if (s.properties) return "object";
  if (s.items) return "array";
  return "string";
};

const LONG_TEXT = new Set(["summary", "description", "headline", "closingStatement", "intro", "availability"]);
const LONG_ITEMS = new Set(["highlights", "architecture", "challenges", "achievements"]);
const CHIP_LISTS = new Set(["items", "stack", "keywords", "secondaryKeywords", "tags", "pipeline"]);
const CARD_TITLE_KEYS = ["name", "company", "title", "label", "institution", "kind"];

export const humanize = (key: string) =>
  key
    .replace(/\[\d+\]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\bUrl\b/, "URL")
    .replace(/\bId\b/, "ID");

/** Empty value for a schema, used when adding list items. */
function emptyFor(schema: Schema, root: Schema): Json {
  const s = resolve(schema, root);
  switch (kindOf(s)) {
    case "object":
      return Object.fromEntries(
        (s.required ?? Object.keys(s.properties ?? {})).map((k) => [k, emptyFor(s.properties?.[k] ?? {}, root)]),
      );
    case "array":
      return [];
    case "boolean":
      return false;
    case "enum":
      return s.enum?.[0] ?? "";
    default:
      return "";
  }
}

interface FieldProps {
  name: string;
  schema: Schema;
  root: Schema;
  value: Json;
  onChange: (v: Json) => void;
  path: string;
  errorPath?: string;
  required?: boolean;
  /** Hide the label (used for list rows). */
  bare?: boolean;
}

function Label({
  name,
  required,
  description,
  placeholder,
  children,
}: {
  name: string;
  required?: boolean;
  description?: string;
  placeholder?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
      <span className="text-caption font-medium text-text">
        {humanize(name)}
        {required ? (
          <span className="ml-1 text-accent" aria-hidden>
            *
          </span>
        ) : null}
        {placeholder ? (
          <span className="ml-2 rounded-xs border border-dashed border-[#e0b45c]/60 px-1.5 py-px font-mono text-[0.625rem] text-[#e0b45c] uppercase">
            TBD
          </span>
        ) : null}
      </span>
      {children}
      {description ? <span className="w-full text-[0.75rem] leading-snug text-text-subtle">{description}</span> : null}
    </div>
  );
}

export function Field({ name, schema: raw, root, value, onChange, path, errorPath, required, bare }: FieldProps) {
  const schema = resolve(raw, root);
  const kind = kindOf(schema);
  const invalid = errorPath === path;
  const error = invalid ? <p className="mt-1 text-[0.75rem] text-[#f0a3a3]">Fix this field to save.</p> : null;
  const wrap = (control: ReactNode, extra?: ReactNode, placeholder?: boolean) =>
    bare ? (
      <>
        {control}
        {error}
      </>
    ) : (
      <div data-path={path}>
        <Label name={name} required={required} description={schema.description} placeholder={placeholder}>
          {extra}
        </Label>
        {control}
        {error}
      </div>
    );

  if (kind === "boolean") {
    return (
      <div data-path={path}>
        <Toggle checked={value === true} onChange={onChange} label={humanize(name)} />
        {schema.description ? <p className="mt-1 text-[0.75rem] text-text-subtle">{schema.description}</p> : null}
      </div>
    );
  }

  if (kind === "enum") {
    return wrap(
      <select
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-9 w-full rounded-sm border border-line-strong bg-inset px-3 text-caption text-text focus:border-accent focus:outline-none"
      >
        {schema.enum?.map((opt) => (
          <option key={opt} value={opt}>
            {humanize(opt)}
          </option>
        ))}
      </select>,
    );
  }

  if (kind === "object") {
    const props = Object.entries(schema.properties ?? {}).filter(([k]) => k !== "$schema");
    const obj = (value && typeof value === "object" && !Array.isArray(value) ? value : {}) as Record<string, Json>;
    const body = (
      <div className="grid gap-5">
        {props.map(([key, sub]) => (
          <Field
            key={key}
            name={key}
            schema={sub}
            root={root}
            value={obj[key]}
            path={path ? `${path}.${key}` : key}
            errorPath={errorPath}
            required={schema.required?.includes(key)}
            onChange={(v) => onChange({ ...obj, [key]: v })}
          />
        ))}
      </div>
    );
    if (bare) return body;
    return (
      <fieldset data-path={path} className="rounded-md border border-line p-4">
        <legend className="px-1.5 text-caption font-medium text-text">{humanize(name)}</legend>
        {schema.description ? <p className="mb-4 text-[0.75rem] text-text-subtle">{schema.description}</p> : null}
        {body}
      </fieldset>
    );
  }

  if (kind === "array") {
    const list = Array.isArray(value) ? value : [];
    const item = resolve(schema.items, root);
    if (kindOf(item) === "string" && CHIP_LISTS.has(name)) {
      return wrap(<TagInput value={list as string[]} onChange={onChange} />);
    }
    if (kindOf(item) === "string") {
      return wrap(
        <StringList name={name} list={list as string[]} onChange={onChange} path={path} errorPath={errorPath} />,
      );
    }
    return wrap(
      <ObjectList
        name={name}
        list={list}
        itemSchema={item}
        root={root}
        onChange={onChange}
        path={path}
        errorPath={errorPath}
      />,
    );
  }

  // string
  const text = typeof value === "string" ? value : "";
  const isPlaceholder = text.startsWith(PLACEHOLDER_PREFIX);
  const clear = isPlaceholder ? (
    <button type="button" onClick={() => onChange("")} className="text-[0.75rem] text-accent hover:text-accent-strong">
      Clear placeholder
    </button>
  ) : null;
  const common = {
    value: text,
    invalid,
    "aria-label": humanize(name),
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  };
  const control = LONG_TEXT.has(name) ? (
    <TextArea {...common} />
  ) : (
    <TextInput
      {...common}
      type={name === "email" ? "email" : "text"}
      inputMode={/href|url|github|live/i.test(name) ? "url" : undefined}
    />
  );
  return wrap(control, clear, isPlaceholder);
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function StringList({
  name,
  list,
  onChange,
  path,
  errorPath,
}: {
  name: string;
  list: string[];
  onChange: (v: Json) => void;
  path: string;
  errorPath?: string;
}) {
  const long = LONG_ITEMS.has(name);
  return (
    <div className="grid gap-2">
      {list.map((text, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <div className="flex-1">
            {long ? (
              <TextArea
                value={text}
                rows={2}
                invalid={errorPath === `${path}[${i}]`}
                aria-label={`${humanize(name)} ${i + 1}`}
                onChange={(e) => onChange(list.map((t, j) => (j === i ? e.target.value : t)))}
              />
            ) : (
              <TextInput
                value={text}
                invalid={errorPath === `${path}[${i}]`}
                aria-label={`${humanize(name)} ${i + 1}`}
                onChange={(e) => onChange(list.map((t, j) => (j === i ? e.target.value : t)))}
              />
            )}
          </div>
          <IconButton label="Move up" disabled={i === 0} onClick={() => onChange(moveItem(list, i, i - 1))}>
            <ChevronUp className="size-4" />
          </IconButton>
          <IconButton
            label="Move down"
            disabled={i === list.length - 1}
            onClick={() => onChange(moveItem(list, i, i + 1))}
          >
            <ChevronDown className="size-4" />
          </IconButton>
          <IconButton
            label="Remove"
            onClick={() => onChange(list.filter((_, j) => j !== i))}
            className="hover:text-[#f0a3a3]"
          >
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      ))}
      <div>
        <Button variant="ghost" onClick={() => onChange([...list, ""])}>
          <Plus className="size-4" aria-hidden /> Add {humanize(name).replace(/s$/, "").toLowerCase()}
        </Button>
      </div>
    </div>
  );
}

function ObjectList({
  name,
  list,
  itemSchema,
  root,
  onChange,
  path,
  errorPath,
}: {
  name: string;
  list: Json[];
  itemSchema: Schema;
  root: Schema;
  onChange: (v: Json) => void;
  path: string;
  errorPath?: string;
}) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(list.length === 1 ? [0] : []));
  const toggle = (i: number) => setOpen((s) => new Set(s.has(i) ? [...s].filter((x) => x !== i) : [...s, i]));
  const titleOf = (v: Json, i: number) => {
    const o = (v ?? {}) as Record<string, unknown>;
    const key = CARD_TITLE_KEYS.find((k) => typeof o[k] === "string" && o[k]);
    const t = key ? String(o[key]) : "";
    return t.startsWith(PLACEHOLDER_PREFIX)
      ? `${humanize(name).replace(/s$/, "")} ${i + 1} (TBD)`
      : t || `${humanize(name).replace(/s$/, "")} ${i + 1}`;
  };
  const errorIndex = errorPath?.startsWith(`${path}[`) ? Number(errorPath.slice(path.length + 1).split("]")[0]) : -1;

  return (
    <div className="grid gap-2">
      {list.map((v, i) => {
        const isOpen = open.has(i) || errorIndex === i;
        return (
          <div key={i} className={`rounded-md border ${errorIndex === i ? "border-[#c45b5b]" : "border-line"} bg-bg`}>
            <div className="flex items-center gap-1 pr-1.5">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="flex min-h-11 flex-1 items-center gap-2 px-4 text-left text-caption text-text"
              >
                <ChevronDown
                  className={`size-4 text-text-subtle transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  aria-hidden
                />
                <span className="truncate">{titleOf(v, i)}</span>
              </button>
              <IconButton label="Move up" disabled={i === 0} onClick={() => onChange(moveItem(list, i, i - 1))}>
                <ChevronUp className="size-4" />
              </IconButton>
              <IconButton
                label="Move down"
                disabled={i === list.length - 1}
                onClick={() => onChange(moveItem(list, i, i + 1))}
              >
                <ChevronDown className="size-4" />
              </IconButton>
              <IconButton
                label="Delete"
                className="hover:text-[#f0a3a3]"
                onClick={() => {
                  if (confirm(`Delete “${titleOf(v, i)}”? You can undo by discarding changes before saving.`))
                    onChange(list.filter((_, j) => j !== i));
                }}
              >
                <Trash2 className="size-4" />
              </IconButton>
            </div>
            {isOpen ? (
              <div className="border-t border-line p-4">
                <Field
                  name={name}
                  schema={itemSchema}
                  root={root}
                  value={v}
                  path={`${path}[${i}]`}
                  errorPath={errorPath}
                  bare
                  onChange={(nv) => onChange(list.map((x, j) => (j === i ? nv : x)))}
                />
              </div>
            ) : null}
          </div>
        );
      })}
      <div>
        <Button
          variant="ghost"
          onClick={() => {
            onChange([...list, emptyFor(itemSchema, root)]);
            setOpen((s) => new Set([...s, list.length]));
          }}
        >
          <Plus className="size-4" aria-hidden /> Add{" "}
          {humanize(name).replace(/ies$/, "y").replace(/s$/, "").toLowerCase()}
        </Button>
      </div>
    </div>
  );
}
