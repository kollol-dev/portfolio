/**
 * 3D design tokens — lighting rig, material palette, camera and motion
 * timing for the R3F scene. Hex values mirror the CSS tokens in
 * src/app/globals.css so the canvas and the page read as one system.
 */

export const palette3d = {
  background: "#0a0a0c",
  floor: "#0d0d10",
  accent: "#c8a97e",
  steel: "#8fa3b8",
  text: "#ededef",
  textMuted: "#9a9aa3",
} as const;

/** Three-point studio rig: warm key, cool fill, neutral rim. */
export const lighting = {
  ambient: { intensity: 0.15, color: "#ffffff" },
  key: {
    color: "#fff1e0",
    intensity: 2.2,
    position: [2.5, 3.5, 3] as const,
  },
  fill: {
    color: "#cfdcff",
    intensity: 0.6,
    position: [-3, 2, 2] as const,
  },
  rim: {
    color: "#ffffff",
    intensity: 1.4,
    position: [-1.5, 3, -3] as const,
  },
  /** Procedural <Environment> built from Lightformers (no HDR download);
   *  low intensity, used for reflections only. */
  environment: { intensity: 0.35, resolution: 256 },
  /** Soft contact shadow under the feet (no shadow maps — cheaper). */
  contactShadow: { opacity: 0.55, blur: 2.4, far: 1.6, scale: 3, resolution: 512 },
} as const;

/**
 * Physical material presets for presentation props.
 * Values are MeshPhysicalMaterial-compatible.
 */
export const materials = {
  /** Space-grey anodized aluminium — laptop, tablet, phone bodies. */
  aluminium: { color: "#2a2a2f", metalness: 0.85, roughness: 0.32 },
  /** Darker bezel / frame trims. */
  bezel: { color: "#0e0e11", metalness: 0.4, roughness: 0.5 },
  /** Device glass over screens. */
  glass: {
    color: "#0b0b0d",
    metalness: 0,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  },
  /** Emissive screen surface (UI is drawn on top). */
  screen: { color: "#101014", emissive: "#14141a", emissiveIntensity: 0.6 },
  /** Matte cotton paper — certificate, diploma. */
  paper: { color: "#ece7dc", metalness: 0, roughness: 0.9 },
  /** Brushed brass — frame, badge, foil seal. */
  brass: { color: "#c8a97e", metalness: 1, roughness: 0.35 },
  /** Hardcover cloth / leather — book, ID card holder. */
  cloth: { color: "#26262e", metalness: 0, roughness: 0.72, sheen: 0.4, sheenColor: "#3a3a44" },
  /** Matte card stock — identity card. */
  card: { color: "#16161a", metalness: 0.1, roughness: 0.55 },
} as const;

/** Full-body framing with ~11% head/foot room for a 1.88 m avatar. */
export const camera = {
  fov: 30,
  position: [0, 1.0, 4.6] as const,
  target: [0, 0.93, 0] as const,
  near: 0.05,
  far: 50,
  /** Medium shot used while a prop is presented: chest-up, leaning toward the hand. */
  present: {
    position: [-0.34, 1.46, 2.45] as const,
    target: [-0.2, 1.36, 0.1] as const,
  },
  /** Push-in speed (exponential, per second). */
  damping: 2.2,
  /** Camera travel (m) across one section's scroll, centred on mid-section. */
  drift: { x: 0.08, y: 0.03 },
} as const;

/** Rendering budgets. */
export const renderBudget = {
  dpr: [1, 2] as [number, number],
  /** Lightweight mode (mobile / low-power) caps DPR and drops shadows. */
  lightDpr: [1, 1.5] as [number, number],
} as const;

/** Arm + prop motion timing (seconds), consumed by AvatarController. */
export const motion3d = {
  reachDuration: 0.7,
  retractDuration: 0.5,
  propScaleIn: 0.45,
  propScaleOut: 0.3,
  /** Exponential damping factor for slerp toward targets (higher = snappier). */
  damping: 6,
  breathing: { amplitude: 0.012, periodSeconds: 4.2 },
} as const;
