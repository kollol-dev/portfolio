"use client";

import { useEffect } from "react";
import { SECTION_PROPS, type SectionId } from "@/config/sections";
import { useScrollStore } from "@/lib/scrollStore";
import type { AvatarController } from "./controller/AvatarController";

/**
 * How long a section must stay active before the avatar acts on it.
 * Sections flown past during a fast scroll or an anchor jump never start a
 * reach; the controller only hears about where the reader settles.
 */
export const SETTLE_MS = 160;

const propFor = (id: SectionId) => SECTION_PROPS[id] ?? null;

/** Feeds the active section from the scroll store into the avatar controller. */
export function ScrollBridge({ controller }: { controller: AvatarController }) {
  useEffect(() => {
    // Act on the section the page loaded at straight away.
    controller.setTarget(propFor(useScrollStore.getState().active));

    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useScrollStore.subscribe((state, prev) => {
      if (state.active === prev.active) return;
      clearTimeout(timer);
      timer = setTimeout(() => controller.setTarget(propFor(state.active)), SETTLE_MS);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [controller]);

  return null;
}
