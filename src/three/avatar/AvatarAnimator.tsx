"use client";

import { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { ArrowHelper, Quaternion, Vector3, type Object3D } from "three";
import { SECTIONS, type PropId } from "@/config/sections";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useScrollStore } from "@/lib/scrollStore";
import { AvatarController } from "../controller/AvatarController";
import type { RigResolution } from "./rigConfig";

declare global {
  interface Window {
    /** Rig-debug handle: `__avatar.setTarget("laptop")`. */
    __avatar?: AvatarController;
    /** Rig-debug handle to the scroll store, for timing tests. */
    __scrollStore?: typeof useScrollStore;
  }
}

const isDebug = () => new URLSearchParams(window.location.search).get("debug") === "rig";

interface Props {
  rig: RigResolution;
  root: Object3D;
  /** Receives the controller so other layers (scroll sync, props) can drive or read it. */
  onController?: (c: AvatarController | null) => void;
}

/**
 * Bridges the plain-TS AvatarController into R3F's frame loop.
 * Renders nothing in normal mode; in ?debug=rig mode it adds a palm arrow
 * and number-key shortcuts (1–6 = props, 0 = none).
 */
export function AvatarAnimator({ rig, root, onController }: Props) {
  const reduced = usePrefersReducedMotion();
  const controller = useMemo(() => (rig.armReady ? new AvatarController(rig.bones, root) : null), [rig, root]);
  const [debug] = useState(isDebug);

  useEffect(() => {
    controller?.setReducedMotion(reduced);
  }, [controller, reduced]);

  useEffect(() => {
    onController?.(controller);
    return () => onController?.(null);
  }, [controller, onController]);

  // Debug: expose the controller and map number keys to section props.
  useEffect(() => {
    if (!debug || !controller) return;
    window.__avatar = controller;
    window.__scrollStore = useScrollStore;
    const props = SECTIONS.map((s) => s.prop).filter((p): p is PropId => p !== null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "0") controller.setTarget(null);
      const n = Number(e.key);
      if (n >= 1 && n <= props.length) controller.setTarget(props[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      delete window.__avatar;
      delete window.__scrollStore;
    };
  }, [debug, controller]);

  const arrow = useMemo(
    () => (debug ? new ArrowHelper(new Vector3(0, 1, 0), new Vector3(), 0.15, 0xc8a97e, 0.04, 0.025) : null),
    [debug],
  );
  useEffect(() => () => arrow?.dispose(), [arrow]);

  const tmp = useMemo(() => ({ p: new Vector3(), q: new Quaternion(), n: new Vector3() }), []);

  useFrame((state, dt) => {
    if (!controller) return;
    // Clamp dt so a backgrounded tab doesn't snap the arm on return.
    controller.update(Math.min(dt, 1 / 20), state.clock.elapsedTime);

    if (arrow) {
      const { bone, palmLocal } = controller.hand;
      if (bone && palmLocal) {
        bone.updateWorldMatrix(true, false);
        arrow.position.copy(bone.getWorldPosition(tmp.p));
        arrow.setDirection(tmp.n.copy(palmLocal).applyQuaternion(bone.getWorldQuaternion(tmp.q)));
      }
    }
  });

  return arrow ? <primitive object={arrow} /> : null;
}
