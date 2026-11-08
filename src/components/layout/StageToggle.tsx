"use client";

import { useEffect } from "react";
import { Box } from "lucide-react";
import { initialMobileHidden, useStageStore } from "@/lib/stageStore";

/**
 * Mobile/tablet button that shows or hides the 3D stage band.
 * Also mirrors the state onto <html data-stage> so CSS can resize the band
 * and the content offset together.
 */
export function StageToggle() {
  const hidden = useStageStore((s) => s.mobileHidden);
  const setHidden = useStageStore((s) => s.setMobileHidden);

  useEffect(() => {
    useStageStore.setState({ mobileHidden: initialMobileHidden() });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.stage = hidden ? "off" : "on";
  }, [hidden]);

  return (
    <button
      type="button"
      onClick={() => setHidden(!hidden)}
      aria-pressed={!hidden}
      title={hidden ? "Show the 3D stage" : "Hide the 3D stage"}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-sm border px-2.5 font-mono text-micro tracking-wider uppercase transition-colors duration-(--dur-base) lg:hidden ${
        hidden ? "border-line text-text-subtle" : "border-accent/50 text-accent"
      }`}
    >
      <Box className="size-3.5" aria-hidden strokeWidth={1.5} />
      3D
      <span className="sr-only"> stage</span>
    </button>
  );
}
