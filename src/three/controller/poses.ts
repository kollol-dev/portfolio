import { Quaternion, Vector3, type Bone, type Object3D } from "three";
import type { ResolvedRig, RigBoneKey } from "../avatar/rigConfig";

/**
 * Poses are written as *directions* in avatar space (avatar faces +Z, its
 * right side is -X, up is +Y), not as raw bone quaternions. The solver turns
 * them into local bone rotations once, at load time, starting from the GLB's
 * rest pose. This keeps poses readable and independent of bone axis
 * conventions, so they survive a different rig as long as bones resolve.
 */

type V3 = readonly [number, number, number];

type Step =
  /** Point `bone` so the vector to its child bone follows `dir`. */
  | { aim: RigBoneKey; dir: V3 }
  /** Twist `twist` about its own axis until `hand`'s palm faces `facing`. */
  | { twist: RigBoneKey; hand: RigBoneKey; facing: V3 };

export interface PoseSpec {
  steps: Step[];
  /** Per-joint finger curl in radians (0 = flat T-pose hand). */
  curl: { right: number; left: number };
}

export type PoseId = "idle" | "present";

export const POSES: Record<PoseId, PoseSpec> = {
  /** Relaxed standing: arms down, slight elbow bend, palms toward the thighs. */
  idle: {
    steps: [
      { aim: "rightUpperArm", dir: [-0.2, -1, -0.02] },
      { aim: "rightForearm", dir: [-0.1, -1, 0.16] },
      { twist: "rightForearm", hand: "rightHand", facing: [1, 0, 0.15] },
      { aim: "rightHand", dir: [-0.06, -1, 0.12] },
      { aim: "leftUpperArm", dir: [0.2, -1, -0.02] },
      { aim: "leftForearm", dir: [0.1, -1, 0.16] },
      { twist: "leftForearm", hand: "leftHand", facing: [-1, 0, 0.15] },
      { aim: "leftHand", dir: [0.06, -1, 0.12] },
    ],
    curl: { right: 0.22, left: 0.22 },
  },
  /** Right forearm extended toward the viewer, palm up, as if offering an object. */
  present: {
    steps: [
      { aim: "rightUpperArm", dir: [-0.3, -0.78, 0.56] },
      { aim: "rightForearm", dir: [-0.26, 0.06, 1] },
      { twist: "rightForearm", hand: "rightHand", facing: [0.1, 1, 0.1] },
      { aim: "rightHand", dir: [-0.22, 0.05, 1] },
      { aim: "leftUpperArm", dir: [0.2, -1, -0.02] },
      { aim: "leftForearm", dir: [0.1, -1, 0.16] },
      { twist: "leftForearm", hand: "leftHand", facing: [-1, 0, 0.15] },
      { aim: "leftHand", dir: [0.06, -1, 0.12] },
    ],
    curl: { right: 0.12, left: 0.22 },
  },
};

/** Local rotations for every animated bone in a given pose. */
export type PoseSnapshot = Map<Bone, Quaternion>;

/* ------------------------------------------------------------- helpers */

const _a = new Vector3();
const _b = new Vector3();
const _c = new Vector3();
const _q = new Quaternion();
const _q2 = new Quaternion();

/** The child bone that defines a bone's pointing direction. */
export function tipChild(bone: Bone): Bone | undefined {
  const bones = bone.children.filter((c): c is Bone => (c as Bone).isBone);
  return bones.find((b) => /middle1?$/i.test(b.name)) ?? bones[0];
}

/** Apply a world-space rotation `delta` to a bone by rewriting its local quaternion. */
function rotateWorld(bone: Bone, delta: Quaternion) {
  const world = bone.getWorldQuaternion(_q2);
  const next = delta.clone().multiply(world);
  const parentWorld = bone.parent ? bone.parent.getWorldQuaternion(new Quaternion()) : new Quaternion();
  bone.quaternion.copy(parentWorld.invert().multiply(next));
  bone.updateWorldMatrix(false, true);
}

function aimBone(bone: Bone, dirWorld: Vector3) {
  const child = tipChild(bone);
  if (!child) return;
  bone.updateWorldMatrix(true, true);
  const from = child.getWorldPosition(_a).sub(bone.getWorldPosition(_b)).normalize();
  rotateWorld(bone, _q.setFromUnitVectors(from, dirWorld));
}

/** Palm normal of a hand in its own local frame, measured at rest. */
export function restPalmNormal(hand: Bone): Vector3 {
  // In this rig's T-pose the palms face the floor.
  hand.updateWorldMatrix(true, false);
  return new Vector3(0, -1, 0).applyQuaternion(hand.getWorldQuaternion(new Quaternion()).invert());
}

function twistToFace(twistBone: Bone, hand: Bone, palmLocal: Vector3, facingWorld: Vector3) {
  twistBone.updateWorldMatrix(true, true);
  const axis = hand.getWorldPosition(_a).sub(twistBone.getWorldPosition(_b)).normalize();
  const n = palmLocal.clone().applyQuaternion(hand.getWorldQuaternion(_q2));
  // Project both onto the plane perpendicular to the twist axis.
  n.addScaledVector(axis, -n.dot(axis)).normalize();
  const f = _c.copy(facingWorld).addScaledVector(axis, -facingWorld.dot(axis)).normalize();
  const angle = Math.atan2(axis.dot(new Vector3().crossVectors(n, f)), n.dot(f));
  rotateWorld(twistBone, _q.setFromAxisAngle(axis, angle));
}

/* --------------------------------------------------------------- solver */

export interface PoseContext {
  rig: ResolvedRig;
  root: Object3D;
  /** Rest-pose local rotations of every bone this module may touch. */
  rest: PoseSnapshot;
  palms: Partial<Record<"rightHand" | "leftHand", Vector3>>;
  fingers: { right: Bone[][]; left: Bone[][] };
  /** Per-finger-bone curl axis in the bone's local rest frame. */
  curlAxes: Map<Bone, Vector3>;
}

const FINGER_RE = /(Index|Middle|Ring|Pinky)\d$/i;

function collectFingers(hand: Bone | undefined): Bone[][] {
  if (!hand) return [];
  return hand.children
    .filter((c): c is Bone => (c as Bone).isBone && FINGER_RE.test(c.name))
    .map((first) => {
      const chain: Bone[] = [];
      let b: Bone | undefined = first;
      while (b) {
        chain.push(b);
        b = b.children.find((c): c is Bone => (c as Bone).isBone);
      }
      return chain;
    });
}

/**
 * Snapshot the rest pose. Stored on the model's userData so a remount
 * (e.g. hot reload) never mistakes an already-animated pose for rest.
 */
export function createPoseContext(rig: ResolvedRig, root: Object3D): PoseContext {
  const cached = root.userData.__restPose as Map<string, Quaternion> | undefined;
  const animated = new Set<Bone>();
  (Object.values(rig) as Bone[]).forEach((b) => animated.add(b));
  const fingers = { right: collectFingers(rig.rightHand), left: collectFingers(rig.leftHand) };
  [...fingers.right, ...fingers.left].flat().forEach((b) => animated.add(b));

  if (cached) {
    animated.forEach((b) => {
      const q = cached.get(b.uuid);
      if (q) b.quaternion.copy(q);
    });
  } else {
    root.userData.__restPose = new Map([...animated].map((b) => [b.uuid, b.quaternion.clone()]));
  }
  root.updateWorldMatrix(true, true);

  const rest: PoseSnapshot = new Map([...animated].map((b) => [b, b.quaternion.clone()]));
  const palms: PoseContext["palms"] = {};
  if (rig.rightHand) palms.rightHand = restPalmNormal(rig.rightHand);
  if (rig.leftHand) palms.leftHand = restPalmNormal(rig.leftHand);

  // Curl rotates fingers toward the palm: about +Z for the right hand
  // (fingers point -X), -Z for the left, expressed in each bone's local frame.
  const rootQ = root.getWorldQuaternion(new Quaternion());
  const curlAxes = new Map<Bone, Vector3>();
  const addAxes = (chains: Bone[][], z: number) =>
    chains.flat().forEach((b) => {
      const w = b.getWorldQuaternion(new Quaternion());
      curlAxes.set(b, new Vector3(0, 0, z).applyQuaternion(rootQ).applyQuaternion(w.invert()));
    });
  addAxes(fingers.right, 1);
  addAxes(fingers.left, -1);

  return { rig, root, rest, palms, fingers, curlAxes };
}

export function applySnapshot(snap: PoseSnapshot) {
  snap.forEach((q, b) => b.quaternion.copy(q));
}

/** Solve a pose into local rotations, then restore the rest pose. */
export function solvePose(ctx: PoseContext, spec: PoseSpec): PoseSnapshot {
  const { rig, root, rest, palms } = ctx;
  applySnapshot(rest);
  root.updateWorldMatrix(true, true);
  const rootQ = root.getWorldQuaternion(new Quaternion());
  const toWorld = (v: V3) => new Vector3(...v).normalize().applyQuaternion(rootQ);

  for (const step of spec.steps) {
    if ("aim" in step) {
      const bone = rig[step.aim];
      if (bone) aimBone(bone, toWorld(step.dir));
    } else {
      const bone = rig[step.twist];
      const hand = rig[step.hand];
      const palm = palms[step.hand as "rightHand" | "leftHand"];
      if (bone && hand && palm) twistToFace(bone, hand, palm, toWorld(step.facing));
    }
  }

  const curl = (chains: Bone[][], angle: number) =>
    chains.flat().forEach((b) => {
      const axis = ctx.curlAxes.get(b);
      if (axis) b.quaternion.multiply(_q.setFromAxisAngle(axis, angle));
    });
  curl(ctx.fingers.right, spec.curl.right);
  curl(ctx.fingers.left, spec.curl.left);

  const snap: PoseSnapshot = new Map([...rest.keys()].map((b) => [b, b.quaternion.clone()]));
  applySnapshot(rest);
  root.updateWorldMatrix(true, true);
  return snap;
}
