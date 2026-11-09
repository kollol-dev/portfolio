"use client";

import { AnimatePresence, m } from "motion/react";
import { useSections } from "@/content/ContentProvider";
import { useScrollStore } from "@/lib/scrollStore";
import { transition } from "@/styles/tokens3d";

const { duration, ease, distance } = transition.caption;

/** Editorial caption on the desktop stage naming what the avatar is holding. */
export function StageCaption() {
  const active = useScrollStore((s) => s.active);
  const meta = useSections().find((s) => s.id === active);

  return (
    // Hidden when the stage shows its no-WebGL fallback (nothing is being presented).
    <div className="absolute bottom-8 left-8 hidden lg:block [#stage:has([data-stage-fallback])_&]:hidden">
      <AnimatePresence mode="wait" initial={false}>
        {meta?.propLabel ? (
          <m.div
            key={meta.id}
            initial={{ opacity: 0, y: distance }}
            animate={{ opacity: 1, y: 0, transition: { duration, ease, delay: 0.25 } }}
            exit={{ opacity: 0, y: -distance / 2, transition: { duration: 0.2 } }}
          >
            <p className="eyebrow flex items-center gap-3">
              <span className="text-accent">{meta.index}</span>
              <span className="h-px w-6 bg-line-strong" />
              Presenting
            </p>
            <p className="editorial mt-1.5 text-h3 text-text-muted">{meta.propLabel}</p>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
