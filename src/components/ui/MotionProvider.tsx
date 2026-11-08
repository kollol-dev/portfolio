"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Loads only motion's DOM-animation features (no layout/drag), and
 * honours prefers-reduced-motion for every `m.*` element on the page.
 * `strict` fails loudly if a full `motion.*` component sneaks back in.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
