"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { SceneErrorBoundary } from "./SceneErrorBoundary";
import { WebGLFallback } from "./WebGLFallback";

// three / R3F / drei only load in the browser, in their own chunk.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

const DESKTOP_QUERY = "(min-width: 64rem)";

let webglSupport: boolean | undefined;
function hasWebGL(): boolean {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const c = document.createElement("canvas");
    webglSupport = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

type Mode = "pending" | "off" | "webgl" | "unsupported";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMode(): Mode {
  // Mobile layout gets the 3D treatment in Phase 7; until then, skip the 4 MB model.
  if (!window.matchMedia(DESKTOP_QUERY).matches) return "off";
  return hasWebGL() ? "webgl" : "unsupported";
}

/** Decides whether to render the 3D stage, a fallback, or nothing. */
export function SceneMount() {
  const mode = useSyncExternalStore<Mode>(subscribe, getMode, () => "pending");
  const [contextLost, setContextLost] = useState(false);

  if (mode === "pending" || mode === "off") return null;
  if (mode === "unsupported") return <WebGLFallback reason="unsupported" />;
  if (contextLost) return <WebGLFallback reason="error" />;

  return (
    <SceneErrorBoundary fallback={<WebGLFallback reason="error" />}>
      <Scene onContextLost={() => setContextLost(true)} />
    </SceneErrorBoundary>
  );
}
