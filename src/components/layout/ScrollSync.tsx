"use client";

import { useEffect } from "react";
import { SECTION_IDS, type SectionId } from "@/config/sections";
import { scrollProgress, useScrollStore } from "@/lib/scrollStore";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Watches the editorial sections and publishes the active one.
 *
 * The active section is the last one whose top has passed the middle of the
 * viewport (the reading line), or the final section at the very bottom of the
 * page. An IntersectionObserver catches layout changes and the scroll listener
 * keeps progress current. Both are coalesced into one read per animation frame.
 * Works with or without the 3D scene.
 */
export function ScrollSync() {
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;
    const { setActive } = useScrollStore.getState();
    let raf = 0;

    const compute = () => {
      raf = 0;
      const vh = window.innerHeight;
      const mid = vh * 0.5;
      let active = els[0];
      for (const el of els) {
        if (el.getBoundingClientRect().top <= mid) active = el;
      }
      const max = document.documentElement.scrollHeight - vh;
      if (max > 0 && window.scrollY >= max - 2) active = els[els.length - 1];

      const r = active.getBoundingClientRect();
      scrollProgress.overall = max > 0 ? clamp01(window.scrollY / max) : 0;
      scrollProgress.section = r.height > 0 ? clamp01((mid - r.top) / r.height) : 0;
      setActive(active.id as SectionId);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    const io = new IntersectionObserver(schedule, {
      rootMargin: "-50% 0px -50% 0px", // a zero-height line across the middle
      threshold: 0,
    });
    els.forEach((el) => io.observe(el));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    compute();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
