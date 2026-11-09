"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { m, useReducedMotion, type Variants } from "motion/react";
import { transition } from "@/styles/tokens3d";

/*
 * Three states instead of the usual "start hidden":
 * - idle:   server-rendered and fully visible (works without JS, no flash)
 * - hidden: set only for elements that are below the fold when first observed
 * - shown:  animates in when they scroll into view
 * Elements already on screen at load go idle → shown with no visible change.
 */
const variants: Variants = {
  idle: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: transition.reveal.distance, transition: { duration: 0 } },
  shown: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: transition.reveal.duration, ease: transition.reveal.ease, delay },
  }),
};

interface RevealProps {
  children: ReactNode;
  /** Seconds; use small steps (0.06–0.12) to stagger siblings. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
}

/** Fades content up as it enters the viewport. DOM-only (motion). */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          io.disconnect();
        } else if (entry.boundingClientRect.top > 0) {
          setState((s) => (s === "idle" ? "hidden" : s));
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const Tag = m[as];
  return (
    <Tag ref={ref as never} className={className} variants={variants} initial={false} animate={state} custom={delay}>
      {children}
    </Tag>
  );
}
