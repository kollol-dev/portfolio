import type { Bone, Object3D } from "three";

/**
 * Logical → GLB bone mapping.
 *
 * Primary names were read from public/models/avatar.glb (Avaturn export,
 * Mixamo-style names without the "mixamorig:" prefix). If a different model
 * is dropped in, `fallbacks` are tried as case-insensitive patterns, so
 * common Mixamo / Ready Player Me / VRM-ish rigs still resolve.
 */

export type RigBoneKey =
  | "hips"
  | "spine"
  | "chest"
  | "neck"
  | "head"
  | "leftShoulder"
  | "leftUpperArm"
  | "leftForearm"
  | "leftHand"
  | "rightShoulder"
  | "rightUpperArm"
  | "rightForearm"
  | "rightWrist"
  | "rightHand";

interface BoneSpec {
  primary: string;
  fallbacks: RegExp[];
  /** Required bones must resolve or the arm animation is disabled. */
  required: boolean;
}

const side = (s: "Left" | "Right", part: string) =>
  new RegExp(`(^|[:_.])(${s}|${s[0]}[_.]?)${part}$`, "i");

export const RIG_CONFIG: Record<RigBoneKey, BoneSpec> = {
  hips: { primary: "Hips", fallbacks: [/hips$/i, /pelvis$/i], required: false },
  spine: { primary: "Spine", fallbacks: [/spine$/i], required: false },
  chest: { primary: "Spine2", fallbacks: [/spine2$/i, /chest$/i, /upperchest$/i], required: false },
  neck: { primary: "Neck", fallbacks: [/neck$/i], required: false },
  head: { primary: "Head", fallbacks: [/head$/i], required: false },

  leftShoulder: { primary: "LeftShoulder", fallbacks: [side("Left", "Shoulder"), side("Left", "Clavicle")], required: false },
  leftUpperArm: { primary: "LeftArm", fallbacks: [side("Left", "Arm"), side("Left", "UpperArm")], required: false },
  leftForearm: { primary: "LeftForeArm", fallbacks: [side("Left", "ForeArm"), side("Left", "LowerArm")], required: false },
  leftHand: { primary: "LeftHand", fallbacks: [side("Left", "Hand")], required: false },

  rightShoulder: { primary: "RightShoulder", fallbacks: [side("Right", "Shoulder"), side("Right", "Clavicle")], required: true },
  rightUpperArm: { primary: "RightArm", fallbacks: [side("Right", "Arm"), side("Right", "UpperArm")], required: true },
  rightForearm: { primary: "RightForeArm", fallbacks: [side("Right", "ForeArm"), side("Right", "LowerArm")], required: true },
  // This rig has no separate wrist bone; the hand bone doubles as the wrist.
  rightWrist: { primary: "RightHand", fallbacks: [side("Right", "Wrist"), side("Right", "Hand")], required: false },
  rightHand: { primary: "RightHand", fallbacks: [side("Right", "Hand")], required: true },
};

export type ResolvedRig = Partial<Record<RigBoneKey, Bone>>;

export interface RigResolution {
  bones: ResolvedRig;
  /** How each key was found, for the diagnostic report. */
  matches: Record<RigBoneKey, { name: string | null; via: "primary" | "fallback" | "missing" }>;
  missingRequired: RigBoneKey[];
  /** True when every required bone resolved — arm animation can run. */
  armReady: boolean;
}

/** Find mapped bones in a loaded model without modifying it. */
export function resolveRig(root: Object3D): RigResolution {
  const all: Bone[] = [];
  root.traverse((o) => {
    if ((o as Bone).isBone) all.push(o as Bone);
  });
  const byName = new Map(all.map((b) => [b.name, b]));

  const bones: ResolvedRig = {};
  const matches = {} as RigResolution["matches"];
  const missingRequired: RigBoneKey[] = [];

  for (const key of Object.keys(RIG_CONFIG) as RigBoneKey[]) {
    const spec = RIG_CONFIG[key];
    let bone = byName.get(spec.primary);
    let via: "primary" | "fallback" | "missing" = bone ? "primary" : "missing";
    if (!bone) {
      bone = all.find((b) => spec.fallbacks.some((re) => re.test(b.name)));
      if (bone) via = "fallback";
    }
    if (bone) bones[key] = bone;
    else if (spec.required) missingRequired.push(key);
    matches[key] = { name: bone?.name ?? null, via };
  }

  return { bones, matches, missingRequired, armReady: missingRequired.length === 0 };
}
