import { Box3, Vector3, type Bone, type Object3D, type SkinnedMesh } from "three";
import type { RigResolution } from "./rigConfig";

/**
 * Skeleton diagnostic. Reads the loaded GLB and reports what is actually
 * there: bones, hierarchy, skeleton bindings, rest rotations and bounds.
 * Runs in development, or in production with ?debug=rig.
 */

export interface BoneInfo {
  name: string;
  parent: string | null;
  depth: number;
  restQuaternion: [number, number, number, number];
  worldPosition: [number, number, number];
}

export interface SkeletonReport {
  boneCount: number;
  bones: BoneInfo[];
  skinnedMeshes: { name: string; boneCount: number; rootBone: string | null }[];
  sharedSkeleton: boolean;
  animations: string[];
  bounds: { min: [number, number, number]; max: [number, number, number]; height: number };
  rig: RigResolution["matches"];
  missingRequired: string[];
  armReady: boolean;
  /** Angle between the right upper arm and straight down, in degrees.
   *  ~90° means T-pose, ~45° A-pose, ~0–15° arms at the sides. */
  rightArmDropDeg: number | null;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const v3 = (v: Vector3): [number, number, number] => [r3(v.x), r3(v.y), r3(v.z)];

export function inspectSkeleton(
  root: Object3D,
  rig: RigResolution,
  animations: { name: string }[] = [],
): SkeletonReport {
  root.updateMatrixWorld(true);

  const bones: BoneInfo[] = [];
  const skinned: SkinnedMesh[] = [];
  const tmp = new Vector3();

  const walk = (o: Object3D, depth: number) => {
    if ((o as Bone).isBone) {
      const q = (o as Bone).quaternion;
      bones.push({
        name: o.name,
        parent: o.parent && (o.parent as Bone).isBone ? o.parent.name : null,
        depth,
        restQuaternion: [r3(q.x), r3(q.y), r3(q.z), r3(q.w)],
        worldPosition: v3(o.getWorldPosition(tmp)),
      });
    }
    if ((o as SkinnedMesh).isSkinnedMesh) skinned.push(o as SkinnedMesh);
    o.children.forEach((c) => walk(c, (o as Bone).isBone ? depth + 1 : depth));
  };
  walk(root, 0);

  const skeletons = new Set(skinned.map((m) => m.skeleton));
  const box = new Box3().setFromObject(root);

  let rightArmDropDeg: number | null = null;
  const upper = rig.bones.rightUpperArm;
  const fore = rig.bones.rightForearm;
  if (upper && fore) {
    const a = upper.getWorldPosition(new Vector3());
    const b = fore.getWorldPosition(new Vector3());
    const dir = b.sub(a).normalize();
    rightArmDropDeg = Math.round((dir.angleTo(new Vector3(0, -1, 0)) * 180) / Math.PI);
  }

  return {
    boneCount: bones.length,
    bones,
    skinnedMeshes: skinned.map((m) => ({
      name: m.name,
      boneCount: m.skeleton.bones.length,
      rootBone: m.skeleton.bones[0]?.name ?? null,
    })),
    sharedSkeleton: skeletons.size <= 1,
    animations: animations.map((a) => a.name),
    bounds: { min: v3(box.min), max: v3(box.max), height: r3(box.max.y - box.min.y) },
    rig: rig.matches,
    missingRequired: rig.missingRequired,
    armReady: rig.armReady,
    rightArmDropDeg,
  };
}

/** Pretty console output. Collapsed groups keep the console tidy. */
export function logSkeletonReport(report: SkeletonReport) {
  const status = report.armReady ? "✓ arm rig ready" : `✗ missing: ${report.missingRequired.join(", ")}`;
  console.groupCollapsed(
    `%c[avatar] ${report.boneCount} bones · ${report.skinnedMeshes.length} skinned meshes · ${status}`,
    "color:#c8a97e",
  );
  console.log("Bounds (m):", report.bounds);
  console.log("Animations:", report.animations.length ? report.animations : "none");
  console.log(
    "Right arm drop from vertical:",
    report.rightArmDropDeg === null ? "n/a" : `${report.rightArmDropDeg}°`,
  );
  console.table(
    Object.entries(report.rig).map(([key, m]) => ({ key, bone: m.name ?? "—", via: m.via })),
  );
  console.table(report.skinnedMeshes);
  console.groupCollapsed("Bone hierarchy");
  for (const b of report.bones) {
    console.log(`${"  ".repeat(b.depth)}${b.name}`, b.restQuaternion);
  }
  console.groupEnd();
  console.groupEnd();
}

export const isRigDebug = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    process.env.NODE_ENV === "development" ||
    new URLSearchParams(window.location.search).get("debug") === "rig"
  );
};
