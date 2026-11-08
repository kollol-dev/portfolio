import { portfolio } from "@/data/portfolio";

/**
 * Section registry — the one ordered list both the DOM and the 3D scene use.
 * Structure (order, numbering, which prop) lives here; the words (nav label,
 * heading, stage caption) come from content/portfolio.json → "sections".
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
export type PropId = "idCard" | "tablet" | "certificate" | "laptop" | "diploma" | "phone";

const PROPS: Record<SectionId, PropId | null> = {
  intro: "idCard",
  experience: "tablet",
  certifications: "certificate",
  projects: "laptop",
  education: "diploma",
  activities: "phone",
  contact: null,
};

export interface SectionMeta {
  id: SectionId;
  index: string; // editorial numbering, e.g. "01"
  navLabel: string;
  eyebrow: string;
  title: string;
  prop: PropId | null;
  /** Caption on the 3D stage while this section's prop is shown. */
  propLabel: string | null;
}

export const SECTIONS: readonly SectionMeta[] = SECTION_IDS.map((id, i) => {
  const copy = portfolio.sections[id];
  return {
    id,
    index: String(i + 1).padStart(2, "0"),
    navLabel: copy.navLabel,
    eyebrow: copy.eyebrow,
    title: copy.title,
    prop: PROPS[id],
    propLabel: PROPS[id] ? copy.stageCaption : null,
  };
});
