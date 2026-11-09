"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3, type PerspectiveCamera, type Scene } from "three";
import {
  camera as cam,
  dampFactor,
  DESKTOP_QUERY,
  framing,
  framingAnchor,
  stageInsets,
} from "@/styles/tokens3d";
import { scrollProgress } from "@/lib/scrollStore";
import { fitRegion, type Insets, type Viewport } from "./framing";
import type { AvatarController } from "./controller/AvatarController";

declare global {
  interface Window {
    /** Rig-debug only: pin the camera, e.g. to inspect a prop up close. */
    __camOverride?: { pos: [number, number, number]; target: [number, number, number] } | null;
    /** Rig-debug only: the scene and camera, for measuring bounds from devtools. */
    __three?: { scene: Scene; camera: PerspectiveCamera };
  }
}

const insets = (top: number, bottom: number, side: number): Insets => ({ top, bottom, left: side, right: side });

/** Solves the wide and presenting shots for the current canvas size. */
function solveShots(width: number, height: number) {
  const view: Viewport = { width, height, fov: cam.fov };
  const desktop = window.matchMedia(DESKTOP_QUERY).matches;
  const d = stageInsets.desktop;
  const b = stageInsets.band;
  const wide = desktop
    ? fitRegion(framing.wide, view, insets(d.top, d.bottomWide, d.side), framingAnchor.wide)
    : fitRegion(framing.wide, view, insets(b.top, b.bottom, b.side), framingAnchor.wide);
  const near = desktop
    ? fitRegion(framing.present, view, insets(d.top, d.bottomPresent, d.side), framingAnchor.presentDesktop)
    : fitRegion(framing.presentBand, view, insets(b.top, b.bottom, b.side), framingAnchor.presentBand);
  return {
    widePos: new Vector3(...wide.position),
    wideTgt: new Vector3(...wide.target),
    nearPos: new Vector3(...near.position),
    nearTgt: new Vector3(...near.target),
  };
}

/**
 * Wide full-body shot when the hand is empty; medium shot while any prop is
 * presented. It follows "is a prop in hand" rather than the arm itself, so
 * swapping between props doesn't make the camera pump in and out.
 *
 * Both shots are solved from the real projection (see framing.ts) whenever the
 * canvas resizes — never per frame — so the figure and the prop stay inside
 * the visible stage on every aspect ratio, clear of the nav and the caption.
 */
export function CameraRig({ controller }: { controller: AvatarController | null }) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const shots = useMemo(() => solveShots(width, height), [width, height]);
  const v = useMemo(() => ({ w: 0, drift: 0, pos: new Vector3(), tgt: new Vector3() }), []);

  // Before the avatar is ready (and on resize), hold the wide shot.
  useLayoutEffect(() => {
    if (controller) return;
    camera.position.copy(shots.widePos);
    camera.lookAt(shots.wideTgt);
  }, [camera, shots, controller]);

  useEffect(() => {
    if (!controller) return;
    const debug = new URLSearchParams(window.location.search).get("debug") === "rig";
    if (debug) window.__three = { scene, camera: camera as PerspectiveCamera };
    return controller.onAfterUpdate((dt) => {
      const o = debug ? window.__camOverride : null;
      if (o) {
        camera.position.set(...o.pos);
        camera.lookAt(...o.target);
        return;
      }
      // Exponential approach (continuous target), then smootherstep so the
      // move starts and lands softly. CSS-style fixed-duration easing does not
      // apply here: the goal can flip at any moment mid-move.
      const goal = controller.current ? 1 : 0;
      v.w = controller.isReducedMotion ? goal : v.w + (goal - v.w) * dampFactor(cam.damping, dt);
      const t = v.w * v.w * v.w * (v.w * (v.w * 6 - 15) + 10);
      v.pos.lerpVectors(shots.widePos, shots.nearPos, t);
      v.tgt.lerpVectors(shots.wideTgt, shots.nearTgt, t);

      // Slow drift tied to reading progress within the section: the shot
      // eases a few centimetres sideways as you scroll, so the stage feels
      // connected to the page. Off with reduced motion.
      const goalDrift = controller.isReducedMotion ? 0 : scrollProgress.section - 0.5;
      v.drift += (goalDrift - v.drift) * dampFactor(4, dt);
      v.pos.x += v.drift * cam.drift.x;
      v.pos.y -= v.drift * cam.drift.y;
      camera.position.copy(v.pos);
      camera.lookAt(v.tgt);
    });
  }, [controller, camera, scene, shots, v]);

  return null;
}
