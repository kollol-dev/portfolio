"use client";

import { Suspense, useCallback, useState } from "react";
import type { Object3D } from "three";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { camera as cam, renderBudget } from "@/styles/tokens3d";
import { Avatar } from "./avatar/Avatar";
import { AvatarAnimator } from "./avatar/AvatarAnimator";
import type { RigResolution } from "./avatar/rigConfig";
import { StudioLights } from "./StudioLights";
import { CameraRig } from "./CameraRig";
import { ScrollBridge } from "./ScrollBridge";
import { PropStage } from "./props/PropStage";
import type { AvatarController } from "./controller/AvatarController";
import { QualityContext, detectQuality } from "./quality";

/** DOM loading indicator over the canvas, driven by the three.js loading manager. */
function LoadingOverlay() {
  const { active, progress } = useProgress();
  if (!active && progress === 100) return null;
  return (
    <div className="absolute inset-x-0 bottom-[10%] flex flex-col items-center gap-3">
      <div className="h-px w-40 overflow-hidden bg-line">
        <div
          className="h-full bg-accent transition-[width] duration-(--dur-base)"
          style={{ width: `${Math.round(progress)}%` }}
        />
      </div>
      <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">
        Loading studio · {Math.round(progress)}%
      </p>
    </div>
  );
}

export interface SceneProps {
  onContextLost?: () => void;
}

/** The fixed 3D stage. Loaded client-side only via SceneMount. */
export default function Scene({ onContextLost }: SceneProps) {
  // Set once when the model finishes loading — not a per-frame update.
  const [loaded, setLoaded] = useState<{ rig: RigResolution; root: Object3D } | null>(null);
  const handleRig = useCallback((rig: RigResolution, root: Object3D) => setLoaded({ rig, root }), []);
  const [controller, setController] = useState<AvatarController | null>(null);
  const [quality] = useState(detectQuality);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={quality === "low" ? renderBudget.lightDpr : renderBudget.dpr}
        camera={{ fov: cam.fov, position: [...cam.position], near: cam.near, far: cam.far }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              onContextLost?.();
            },
            { once: true },
          );
        }}
      >
        <QualityContext value={quality}>
          <CameraRig controller={controller} />
          <StudioLights />
          <Suspense fallback={null}>
            <Avatar onRig={handleRig} />
          </Suspense>
          {loaded ? <AvatarAnimator rig={loaded.rig} root={loaded.root} onController={setController} /> : null}
          {controller ? (
            <>
              <ScrollBridge controller={controller} />
              <Suspense fallback={null}>
                <PropStage controller={controller} />
              </Suspense>
            </>
          ) : null}
        </QualityContext>
      </Canvas>
      <LoadingOverlay />
    </div>
  );
}
