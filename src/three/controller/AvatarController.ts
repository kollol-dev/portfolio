import { Quaternion, Vector3, type Bone } from "three";
import type { Object3D } from "three";
import type { PropId } from "@/config/sections";
import { dampFactor, ease, motion3d } from "@/styles/tokens3d";
import type { ResolvedRig } from "../avatar/rigConfig";
import { createPoseContext, POSES, solvePose, tipChild, type PoseContext, type PoseSnapshot } from "./poses";

export type AvatarState = "IDLE" | "REACHING" | "PRESENTING" | "RETRACTING" | "TRANSITIONING";

/** Arm height (reach progress) the arm drops to while swapping props. */
const LOWERED = 0.4;
/** Reach progress after which the prop starts scaling in. */
const PROP_IN_AT = 0.55;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/*
 * Motion mapping (see tokens3d D):
 * - Arm reach: symmetric in-out cubic — a limb accelerates and decelerates;
 *   the same curve serves both reach and retract.
 * - Prop scale-in: the page's editorial curve (cubic-bezier(0.16, 1, 0.3, 1),
 *   evaluated exactly), so a prop arrives the way text reveals do.
 * - Bone follow: exponential damping (continuous, retargetable).
 */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

interface Additive {
  bone: Bone;
  rest: Quaternion;
  /** Avatar-space axes converted into the bone's local frame. */
  x: Vector3;
  y: Vector3;
}

/**
 * Drives the avatar's arm. Pure TypeScript: no React, no allocation per
 * frame. Call `setTarget` whenever the active section changes (any number
 * of times, at any moment) and `update` once per frame.
 *
 * The arm's position is one continuous value (`reach`, 0 = idle,
 * 1 = presenting), so a new target can interrupt any state without a jump:
 * the machine only changes which direction `reach` and `prop` move in.
 * Whatever target is set last is the one that ends up presented.
 */
export class AvatarController {
  state: AvatarState = "IDLE";
  /** Prop currently in (or entering / leaving) the hand. */
  current: PropId | null = null;
  /** Eased outputs for the prop layer (Phase 5). */
  reachWeight = 0;
  propScale = 0;

  private target: PropId | null = null;
  private reach = 0;
  private prop = 0;
  private reducedMotion = false;

  private readonly ctx: PoseContext;
  private readonly idle: PoseSnapshot;
  private readonly present: PoseSnapshot;
  private readonly armBones: Bone[];
  private readonly breathers: { add: Additive; amount: number }[] = [];
  private readonly lookers: { add: Additive; yaw: number; pitch: number }[] = [];
  private readonly listeners = new Set<(s: AvatarState) => void>();
  private readonly afterUpdate = new Set<(dt: number) => void>();

  private readonly _q = new Quaternion();
  private readonly _d = new Quaternion();

  constructor(rig: ResolvedRig, root: Object3D) {
    this.ctx = createPoseContext(rig, root);
    this.idle = solvePose(this.ctx, POSES.idle);
    this.present = solvePose(this.ctx, POSES.present);
    this.armBones = [...this.idle.keys()].filter(
      (b) => !this.idle.get(b)!.equals(this.ctx.rest.get(b)!) || !this.present.get(b)!.equals(this.ctx.rest.get(b)!),
    );

    const additive = (bone: Bone | undefined): Additive | null => {
      if (!bone) return null;
      root.updateWorldMatrix(true, true);
      const inv = bone.getWorldQuaternion(new Quaternion()).invert();
      const rootQ = root.getWorldQuaternion(new Quaternion());
      return {
        bone,
        rest: this.ctx.rest.get(bone)?.clone() ?? bone.quaternion.clone(),
        x: new Vector3(1, 0, 0).applyQuaternion(rootQ).applyQuaternion(inv),
        y: new Vector3(0, 1, 0).applyQuaternion(rootQ).applyQuaternion(inv),
      };
    };
    // Breathing: chest leads, spine follows.
    for (const [bone, amount] of [
      [rig.chest, 1],
      [rig.spine, 0.5],
    ] as const) {
      const add = additive(bone);
      if (add) this.breathers.push({ add, amount });
    }
    // Glance toward the presented object (avatar's right = -X, so negative yaw).
    for (const [bone, yaw, pitch] of [
      [rig.neck, -0.08, 0.03],
      [rig.head, -0.1, 0.06],
    ] as const) {
      const add = additive(bone);
      if (add) this.lookers.push({ add, yaw, pitch });
    }

    this.applyArm(1); // start in the idle pose immediately
  }

  /* --------------------------------------------------------------- input */

  setTarget(id: PropId | null) {
    this.target = id;
  }

  getTarget() {
    return this.target;
  }

  setReducedMotion(on: boolean) {
    this.reducedMotion = on;
  }

  onStateChange(fn: (s: AvatarState) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /**
   * Runs right after the bones are posed each frame. Props and the camera
   * hook in here so they always read this frame's hand transform.
   */
  onAfterUpdate(fn: (dt: number) => void) {
    this.afterUpdate.add(fn);
    return () => {
      this.afterUpdate.delete(fn);
    };
  }

  get isReducedMotion() {
    return this.reducedMotion;
  }

  /* -------------------------------------------------------------- update */

  update(dt: number, elapsed: number) {
    this.step(dt);
    this.reachWeight = easeInOutCubic(this.reach);
    this.propScale = ease.editorial(this.prop);
    const smoothing = this.reducedMotion ? 1 : dampFactor(motion3d.damping * 2.5, dt);
    this.applyArm(smoothing);
    this.applyAdditive(elapsed);
    this.afterUpdate.forEach((fn) => fn(dt));
  }

  private setState(s: AvatarState) {
    if (s === this.state) return;
    this.state = s;
    this.listeners.forEach((fn) => fn(s));
  }

  /** Advance the state machine. Every state re-checks the latest target first. */
  private step(dt: number) {
    const fast = this.reducedMotion ? 1000 : 1;
    const reachRate = (fast * dt) / motion3d.reachDuration;
    const retractRate = (fast * dt) / motion3d.retractDuration;
    const propIn = dt / motion3d.propScaleIn;
    const propOut = dt / motion3d.propScaleOut;
    const { target, current } = this;

    switch (this.state) {
      case "IDLE":
        if (target) {
          this.current = target;
          this.setState("REACHING");
        }
        break;

      case "REACHING":
      case "PRESENTING":
        if (target !== current) {
          this.setState(target ? "TRANSITIONING" : "RETRACTING");
          break;
        }
        this.reach = clamp01(this.reach + reachRate);
        if (this.reach >= PROP_IN_AT) this.prop = clamp01(this.prop + propIn);
        this.setState(this.reach >= 1 && this.prop >= 1 ? "PRESENTING" : "REACHING");
        break;

      case "RETRACTING":
        if (target) {
          this.setState(target === current ? "REACHING" : "TRANSITIONING");
          break;
        }
        this.prop = clamp01(this.prop - propOut);
        if (this.prop < 0.5) this.reach = clamp01(this.reach - retractRate);
        if (this.reach <= 0 && this.prop <= 0) {
          this.current = null;
          this.setState("IDLE");
        }
        break;

      case "TRANSITIONING":
        if (target === current) {
          this.setState("REACHING");
          break;
        }
        if (!target) {
          this.setState("RETRACTING");
          break;
        }
        this.prop = clamp01(this.prop - propOut);
        if (this.reach > LOWERED) this.reach = Math.max(LOWERED, this.reach - retractRate);
        if (this.prop <= 0 && this.reach <= LOWERED) {
          this.current = target; // swap happens out of sight: prop is at scale 0
          this.setState("REACHING");
        }
        break;
    }
  }

  private applyArm(smoothing: number) {
    const w = this.reachWeight;
    for (const bone of this.armBones) {
      this._q.copy(this.idle.get(bone)!).slerp(this.present.get(bone)!, w);
      if (smoothing >= 1) bone.quaternion.copy(this._q);
      else bone.quaternion.slerp(this._q, smoothing);
    }
  }

  private applyAdditive(t: number) {
    const breathe = this.reducedMotion
      ? 0
      : Math.sin((t * 2 * Math.PI) / motion3d.breathing.periodSeconds) * motion3d.breathing.amplitude;
    for (const { add, amount } of this.breathers) {
      add.bone.quaternion.copy(add.rest).multiply(this._d.setFromAxisAngle(add.x, -breathe * amount));
    }
    const sway = this.reducedMotion ? 0 : Math.sin(t * 0.37) * 0.015;
    const w = this.reachWeight;
    for (const { add, yaw, pitch } of this.lookers) {
      add.bone.quaternion
        .copy(add.rest)
        .multiply(this._d.setFromAxisAngle(add.y, yaw * w + sway))
        .multiply(this._d.setFromAxisAngle(add.x, pitch * w));
    }
  }

  /* --------------------------------------------------------------- hand */

  /** Hand bone, its rest palm normal (local) and finger bone, for prop attachment. */
  get hand() {
    const bone = this.ctx.rig.rightHand;
    return { bone, palmLocal: this.ctx.palms.rightHand, tip: bone ? tipChild(bone) : undefined };
  }
}
