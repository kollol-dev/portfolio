"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useStageStore } from "@/lib/stageStore";
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

type Mode = "pending" | "desktop" | "mobile" | "unsupported";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMode(): Mode {
  if (!hasWebGL()) return "unsupported";
  return window.matchMedia(DESKTOP_QUERY).matches ? "desktop" : "mobile";
}

/** Decides whether to render the 3D stage, a fallback, or nothing. */
export function SceneMount() {
  const mode = useSyncExternalStore<Mode>(subscribe, getMode, () => "pending");
  const [contextLost, setContextLost] = useState(false);
  const mobileHidden = useStageStore((s) => s.mobileHidden);

  // Start the 3D work only once the page is loaded and the browser is idle,
  // so parsing three.js and the model never competes with the text becoming
  // interactive. The timeout caps the wait on busy pages.
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(() => setIdle(true), { timeout: 2000 });
      } else {
        timerId = setTimeout(() => setIdle(true), 300);
      }
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) clearTimeout(timerId);
    };
  }, []);

  // A hidden mobile band unmounts the canvas entirely: no GPU work, no download.
  if (mode === "pending" || !idle || (mode === "mobile" && mobileHidden)) return null;
  if (mode === "unsupported") return <WebGLFallback reason="unsupported" />;
  if (contextLost) return <WebGLFallback reason="error" />;

  return (
    <SceneErrorBoundary fallback={<WebGLFallback reason="error" />}>
      <Scene onContextLost={() => setContextLost(true)} />
    </SceneErrorBoundary>
  );
}
