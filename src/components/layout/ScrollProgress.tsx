"use client";

import { useEffect, useRef } from "react";
import { scrollProgress } from "@/lib/scrollStore";

/**
 * 1px reading-progress line along the bottom of the nav. Updated on
 * animation frames straight on the element's transform — no re-renders.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (bar.current) bar.current.style.transform = `scaleX(${scrollProgress.overall})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="absolute inset-x-0 -bottom-px h-px">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-accent/70" />
    </div>
  );
}
