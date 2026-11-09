import { PLACEHOLDER_PREFIX } from "@/data/portfolio";

/** Dashboard content editors: one page per group of top-level content keys. */
export interface EditorDef {
  slug: string;
  label: string;
  /** Top-level keys of the content JSON this editor owns. */
  keys: string[];
  description: string;
}

export const EDITORS: EditorDef[] = [
  {
    slug: "profile",
    label: "Profile",
    keys: ["profile"],
    description: "Name, headline, summary, contact details, photo and social links.",
  },
  {
    slug: "headings",
    label: "Section headings",
    keys: ["sections"],
    description:
      "Navigation labels, section titles and 3D stage captions. Wrap a word in *asterisks* for the Steel Blue serif accent.",
  },
  {
    slug: "experience",
    label: "Experience",
    keys: ["experience"],
    description: "Roles, newest first. The oldest start year becomes “Since …” on your ID card.",
  },
  { slug: "skills", label: "Skills", keys: ["skills"], description: "Shown as the Toolkit list under Experience." },
  {
    slug: "projects",
    label: "Projects",
    keys: ["projects"],
    description: "Featured work. Mark one “featured” to show it on the 3D laptop.",
  },
  {
    slug: "certifications",
    label: "Certifications",
    keys: ["certifications"],
    description: "Mark one “featured” to show it in the 3D frame.",
  },
  {
    slug: "education",
    label: "Education",
    keys: ["education"],
    description: "Degrees. The first entry appears on the 3D book.",
  },
  {
    slug: "activities",
    label: "Activities",
    keys: ["activities", "closingStatement"],
    description: "Leadership, volunteering, awards, and the closing quote.",
  },
];

export const editorForKey = (key: string) => EDITORS.find((e) => e.keys.includes(key));

export interface PlaceholderItem {
  path: string;
  hint: string;
  editor?: EditorDef;
}

/** Every "[PLACEHOLDER] …" string in the raw content, with where to fix it. */
export function findPlaceholders(raw: unknown, path = ""): PlaceholderItem[] {
  if (typeof raw === "string") {
    if (!raw.startsWith(PLACEHOLDER_PREFIX)) return [];
    const top = path.split(/[.[]/)[0];
    return [{ path, hint: raw.slice(PLACEHOLDER_PREFIX.length).trim(), editor: editorForKey(top) }];
  }
  if (Array.isArray(raw)) return raw.flatMap((v, i) => findPlaceholders(v, `${path}[${i}]`));
  if (raw && typeof raw === "object")
    return Object.entries(raw).flatMap(([k, v]) =>
      k === "$schema" ? [] : findPlaceholders(v, path ? `${path}.${k}` : k),
    );
  return [];
}
