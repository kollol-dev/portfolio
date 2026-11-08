"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { SkeletonHelper, type Mesh, type Object3D } from "three";
import { resolveRig, type RigResolution } from "./rigConfig";
import { inspectSkeleton, isRigDebug, logSkeletonReport, type SkeletonReport } from "./skeletonDiagnostics";

export const AVATAR_URL = "/models/avatar.glb";

declare global {
  interface Window {
    /** Set when rig debugging is on, for inspection from devtools. */
    __avatarReport?: SkeletonReport;
  }
}

interface AvatarProps {
  /** Called once the model is loaded and bones are resolved. */
  onRig?: (rig: RigResolution, root: Object3D) => void;
}

/**
 * Loads the GLB and hands resolved bones to the caller.
 * Holds no animation logic — that lives in the AvatarController (Phase 4).
 */
export function Avatar({ onRig }: AvatarProps) {
  const { scene, animations } = useGLTF(AVATAR_URL);
  // This component only renders in the browser (Scene is loaded with ssr: false).
  const [debug] = useState(isRigDebug);
  const [showSkeleton] = useState(
    () => new URLSearchParams(window.location.search).get("debug") === "rig",
  );

  useLayoutEffect(() => {
    scene.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        // Skinned bounds don't follow bone motion; avoid popping when the arm reaches.
        mesh.frustumCulled = false;
      }
    });

    const rig = resolveRig(scene);
    if (debug) {
      const report = inspectSkeleton(scene, rig, animations);
      logSkeletonReport(report);
      window.__avatarReport = report;
    }
    onRig?.(rig, scene);
  }, [scene, animations, debug, onRig]);

  const helper = useMemo(() => (showSkeleton ? new SkeletonHelper(scene) : null), [showSkeleton, scene]);
  useLayoutEffect(() => () => helper?.dispose(), [helper]);

  return (
    <>
      <primitive object={scene} />
      {helper ? <primitive object={helper} /> : null}
    </>
  );
}

useGLTF.preload(AVATAR_URL);
