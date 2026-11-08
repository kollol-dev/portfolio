/**
 * Section registry — the one ordered list both the DOM and the 3D scene use.
 * The DOM renders sections in this order; the scroll observer reports the
 * active `id`; the avatar controller maps that `id` to a prop.
 */

export const SECTION_IDS = [
  "intro",
  "experience",
  "certifications",
  "projects",
  "education",
  "activities",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Props the avatar can present. `contact` presents nothing (arm at rest). */
export type PropId =
  | "idCard"
  | "tablet"
  | "certificate"
  | "laptop"
  | "diploma"
  | "phone";

export interface SectionMeta {
  id: SectionId;
  index: string; // editorial numbering, e.g. "01"
  navLabel: string;
  prop: PropId | null;
}

export const SECTIONS: readonly SectionMeta[] = [
  { id: "intro", index: "01", navLabel: "Intro", prop: "idCard" },
  { id: "experience", index: "02", navLabel: "Experience", prop: "tablet" },
  { id: "certifications", index: "03", navLabel: "Certifications", prop: "certificate" },
  { id: "projects", index: "04", navLabel: "Projects", prop: "laptop" },
  { id: "education", index: "05", navLabel: "Education", prop: "diploma" },
  { id: "activities", index: "06", navLabel: "Activities", prop: "phone" },
  { id: "contact", index: "07", navLabel: "Contact", prop: null },
] as const;
