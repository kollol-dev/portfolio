"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { camera as cam } from "@/styles/tokens3d";
import { scrollProgress } from "@/lib/scrollStore";
import type { AvatarController } from "./controller/AvatarController";

const WIDE_POS = new Vector3(...cam.position);
const WIDE_TGT = new Vector3(...cam.target);
const NEAR_POS = new Vector3(...cam.present.position);
const NEAR_TGT = new Vector3(...cam.present.target);

declare global {
  interface Window {
    /** Rig-debug only: pin the camera, e.g. to inspect a prop up close. */
    __camOverride?: { pos: [number, number, number]; target: [number, number, number] } | null;
  }
}

/**
 * Wide full-body shot when the hand is empty; medium shot while any prop is
 * presented. It follows "is a prop in hand" rather than the arm itself, so
 * swapping between props doesn't make the camera pump in and out.
 */
export function CameraRig({ controller }: { controller: AvatarController | null }) {
  const camera = useThree((s) => s.camera);
  const v = useMemo(() => ({ w: 0, drift: 0, pos: new Vector3(), tgt: new Vector3() }), []);

  useLayoutEffect(() => {
    camera.position.copy(WIDE_POS);
    camera.lookAt(WIDE_TGT);
  }, [camera]);

  useEffect(() => {
    if (!controller) return;
    const debug = new URLSearchParams(window.location.search).get("debug") === "rig";
    return controller.onAfterUpdate((dt) => {
      const o = debug ? window.__camOverride : null;
      if (o) {
        camera.position.set(...o.pos);
        camera.lookAt(...o.target);
        return;
      }
      const goal = controller.current ? 1 : 0;
      v.w = controller.isReducedMotion ? goal : v.w + (goal - v.w) * (1 - Math.exp(-cam.damping * dt));
      // Smootherstep keeps the start and end of the move gentle.
      const t = v.w * v.w * v.w * (v.w * (v.w * 6 - 15) + 10);
      v.pos.lerpVectors(WIDE_POS, NEAR_POS, t);
      v.tgt.lerpVectors(WIDE_TGT, NEAR_TGT, t);

      // Slow drift tied to reading progress within the section: the shot
      // eases a few centimetres sideways as you scroll, so the stage
      // feels connected to the page. Off with reduced motion.
      const goalDrift = controller.isReducedMotion ? 0 : scrollProgress.section - 0.5;
      v.drift += (goalDrift - v.drift) * (1 - Math.exp(-4 * dt));
      v.pos.x += v.drift * cam.drift.x;
      v.pos.y -= v.drift * cam.drift.y;
      camera.position.copy(v.pos);
      camera.lookAt(v.tgt);
    });
  }, [controller, camera, v]);

  return null;
}
