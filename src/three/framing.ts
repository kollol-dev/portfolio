/**
 * DOM → WebGL framing.
 *
 * Instead of hand-placed camera positions, each shot names a world-space
 * region that must be visible (e.g. "head to chest, prop to far shoulder")
 * and the camera is solved from the real projection: vertical FOV, the
 * canvas aspect ratio, and pixel insets taken from the DOM layout (the nav
 * bar covering the top of the desktop stage, the caption in its corner, the
 * gutter to the text column). Pure maths, no three.js objects, no allocation
 * beyond the result.
 *
 * The camera always looks straight down −Z (no roll, no pitch), which keeps
 * verticals vertical — an architectural, lens-shift style of framing.
 */

export interface Region {
  /** World-space horizontal extent [min, max] in metres. */
  x: readonly [number, number];
  /** World-space vertical extent [min, max] in metres. */
  y: readonly [number, number];
  /** Depth of the plane the region is measured on. */
  z: number;
}

/** Pixel insets: parts of the canvas covered or reserved by the DOM. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Where the region sits when the frame has room to spare, 0–1 on each axis:
 * x 0 = hug the left inset, 1 = hug the right; y 0 = hug the bottom, 1 = the top.
 */
export interface Anchor {
  x: number;
  y: number;
}

export interface Viewport {
  /** Canvas size in CSS pixels. */
  width: number;
  height: number;
  /** Vertical field of view in degrees. */
  fov: number;
}

export interface Shot {
  position: [number, number, number];
  target: [number, number, number];
  /** Camera-to-region distance (m). */
  distance: number;
}

/** Visible width and height (m) of a plane `distance` metres in front of the camera. */
export function frustumSize(distance: number, fov: number, aspect: number) {
  const height = 2 * distance * Math.tan((fov * Math.PI) / 360);
  return { width: height * aspect, height };
}

/** Converts a CSS-pixel inset into normalised device coordinates (−1…1). */
const ndc = (px: number, size: number) => (2 * px) / size;

/**
 * Solves the camera that shows `region` inside the canvas minus `insets`,
 * as large as possible, positioned by `anchor` when one axis has slack.
 */
export function fitRegion(region: Region, view: Viewport, insets: Insets, anchor: Anchor): Shot {
  const aspect = view.width / Math.max(1, view.height);
  const t = Math.tan((view.fov * Math.PI) / 360);

  // Safe area in NDC. Clamp so an inset can never invert the frame.
  const top = 1 - Math.min(ndc(insets.top, view.height), 0.9);
  const bottom = -1 + Math.min(ndc(insets.bottom, view.height), 0.9);
  const left = -1 + Math.min(ndc(insets.left, view.width), 0.9);
  const right = 1 - Math.min(ndc(insets.right, view.width), 0.9);
  const safeH = Math.max(0.1, top - bottom);
  const safeW = Math.max(0.1, right - left);

  const w = region.x[1] - region.x[0];
  const h = region.y[1] - region.y[0];

  // Distance needed for each axis to fit; the larger one wins.
  const distance = Math.max(h / (t * safeH), w / (t * aspect * safeW));

  // Half extents of the whole frame at that distance, and the leftover room.
  const hy = distance * t;
  const hx = hy * aspect;
  const slackY = hy * safeH - h;
  const slackX = hx * safeW - w;

  // Place the region's edges against the safe area according to the anchor.
  const cy = region.y[1] + slackY * (1 - anchor.y) - hy * top;
  const cx = region.x[0] - slackX * anchor.x - hx * left;

  return {
    position: [cx, cy, region.z + distance],
    target: [cx, cy, region.z],
    distance,
  };
}

/** Projects a world point onto the canvas (CSS px), for checks and tests. */
export function projectToCanvas(
  point: readonly [number, number, number],
  shot: Shot,
  view: Viewport,
): { x: number; y: number } {
  const aspect = view.width / view.height;
  const t = Math.tan((view.fov * Math.PI) / 360);
  const depth = shot.position[2] - point[2];
  const nx = (point[0] - shot.position[0]) / (depth * t * aspect);
  const ny = (point[1] - shot.position[1]) / (depth * t);
  return { x: ((nx + 1) / 2) * view.width, y: ((1 - ny) / 2) * view.height };
}
