import { create } from "zustand";
import type { SectionId } from "@/config/sections";

interface ScrollState {
  /** Section whose top has crossed the middle of the viewport. */
  active: SectionId;
  setActive: (id: SectionId) => void;
}

/**
 * Shared active-section state. Changes only when the section changes,
 * so subscribers re-render a handful of times per page, never per frame.
 */
export const useScrollStore = create<ScrollState>((set) => ({
  active: "intro",
  setActive: (id) => set((s) => (s.active === id ? s : { active: id })),
}));

/**
 * Normalised scroll progress, written on every scroll frame. A plain mutable
 * object on purpose: the 3D frame loop reads it directly, and React never
 * re-renders because of it.
 */
export const scrollProgress = {
  /** 0 at the top of the page, 1 at the bottom. */
  overall: 0,
  /** 0 when the active section's top reaches mid-viewport, 1 when its bottom does. */
  section: 0,
};
