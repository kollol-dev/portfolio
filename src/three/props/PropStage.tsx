"use client";

import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Euler, Quaternion, Vector3, type Group } from "three";
import type { PropId } from "@/config/sections";
import type { AvatarController } from "../controller/AvatarController";
import { PROPS } from "./registry";

const IDS = Object.keys(PROPS) as PropId[];

/**
 * Places the active prop in the avatar's right hand.
 *
 * All six props stay mounted (hidden) so text and geometry are built once,
 * and swapping never stalls a frame. Each frame, after the controller has
 * posed the bones, we read the hand's world transform, build a palm frame
 * and position the prop on it. The prop then turns to face the camera.
 * The GLB's bone hierarchy is never modified.
 */
export function PropStage({ controller }: { controller: AvatarController }) {
  const camera = useThree((s) => s.camera);
  const anchor = useRef<Group>(null);
  const groups = useRef<Partial<Record<PropId, Group | null>>>({});

  const tmp = useMemo(
    () => ({
      hand: new Vector3(),
      tip: new Vector3(),
      normal: new Vector3(),
      fwd: new Vector3(),
      side: new Vector3(),
      q: new Quaternion(),
      target: new Quaternion(),
      euler: new Euler(0, 0, 0, "YXZ"),
      shown: null as PropId | null,
    }),
    [],
  );

  useEffect(() => {
    const { bone, palmLocal, tip } = controller.hand;
    if (!bone || !palmLocal || !tip) return;

    return controller.onAfterUpdate((dt) => {
      const a = anchor.current;
      if (!a) return;
      const id = controller.current;
      const s = controller.propScale;

      for (const pid of IDS) {
        const g = groups.current[pid];
        if (g) g.visible = pid === id && s > 0.001;
      }
      if (!id || s <= 0.001) {
        tmp.shown = null;
        return;
      }
      const cfg = PROPS[id];

      // Palm frame from this frame's bone pose.
      bone.updateWorldMatrix(true, false);
      tip.updateWorldMatrix(false, false);
      bone.getWorldPosition(tmp.hand);
      bone.getWorldQuaternion(tmp.q);
      tmp.normal.copy(palmLocal).applyQuaternion(tmp.q).normalize();
      tmp.fwd.copy(tip.getWorldPosition(tmp.tip)).sub(tmp.hand).normalize();
      tmp.side.crossVectors(tmp.fwd, tmp.normal).normalize();

      a.position
        .copy(tmp.hand)
        .addScaledVector(tmp.normal, cfg.offset.up + (1 - s) * -0.015)
        .addScaledVector(tmp.fwd, cfg.offset.fwd)
        .addScaledVector(tmp.side, cfg.offset.side);

      // Face the camera (yaw), then tilt; a small spin settles out as it scales in.
      const yaw = Math.atan2(camera.position.x - a.position.x, camera.position.z - a.position.z);
      tmp.euler.set(cfg.tilt, yaw + (1 - s) * 0.6, 0);
      tmp.target.setFromEuler(tmp.euler);
      if (tmp.shown !== id || controller.isReducedMotion) a.quaternion.copy(tmp.target);
      else a.quaternion.slerp(tmp.target, 1 - Math.exp(-10 * dt));
      tmp.shown = id;

      groups.current[id]?.scale.setScalar(cfg.scale * s);
    });
  }, [controller, camera, tmp]);

  return (
    <group ref={anchor}>
      {IDS.map((id) => {
        const { Component } = PROPS[id];
        return (
          <group
            key={id}
            visible={false}
            ref={(g) => {
              groups.current[id] = g;
            }}
          >
            <Component />
          </group>
        );
      })}
    </group>
  );
}
