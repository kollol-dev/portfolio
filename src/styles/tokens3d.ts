/**
 * MIDNIGHT BLUE design tokens — the single source of truth for the DOM and
 * the WebGL scene.
 *
 *   A. Colour     B. Spacing     C. Typography
 *   D. Motion     E. Spatial     F. Materials (+ lighting)
 *
 * The CSS side is generated from this file: `npm run tokens` writes
 * src/styles/tokens.css (custom properties + Tailwind v4 `@theme`), and
 * `npm run lint` fails if that file is stale. Never hand-edit tokens.css.
 *
 * This module has no imports on purpose: the generator runs it directly with
 * Node's type stripping.
 */

/* ======================================================================
   A. COLOUR
   ====================================================================== */

/** The eight brand colours. Nothing else should introduce a new hue. */
export const palette = {
  midnightNavy: "#10151e",
  slateBlue: "#222c3b",
  deepSlate: "#303a49",
  silverMist: "#dce3ed",
  coolGrey: "#929ba8",
  steelBlue: "#8fa9c9",
  pureWhite: "#ffffff",
  mutedShadow: "#080b11",
} as const;

/** "#rrggbb" → 0xrrggbb, the number three.js `Color` / `ArrowHelper` accept. */
export const hexToNumber = (hex: string): number => Number.parseInt(hex.slice(1), 16);

/** "#rrggbb" + alpha → "rgb(r g b / a)". */
export const withAlpha = (hex: string, alpha: number): string => {
  const n = hexToNumber(hex);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${alpha})`;
};

/**
 * Semantic roles. Measured contrast (WCAG 2.x):
 * text 14.2:1, textMuted 6.5:1, accent 7.6:1 on bg; textMuted 5.0:1 on surface.
 * Deep Slate (elevated) drops Cool Grey to 4.1:1 — never put small text on it.
 */
export const color = {
  bg: palette.midnightNavy,
  surface: palette.slateBlue,
  elevated: palette.deepSlate,
  inset: palette.mutedShadow,
  line: withAlpha(palette.silverMist, 0.09),
  lineStrong: withAlpha(palette.silverMist, 0.16),
  text: palette.silverMist,
  textMuted: palette.coolGrey,
  textSubtle: palette.coolGrey,
  /** Decorative only (3.0:1) — rules, separators, never copy. */
  textFaint: "#5a6473",
  accent: palette.steelBlue,
  accentStrong: palette.pureWhite,
  accentSoft: withAlpha(palette.steelBlue, 0.14),
  /** Steel is the accent: one signature colour, no second hue. */
  steel: palette.steelBlue,
  /** Dashboard status only. */
  ok: "#7fb59a",
} as const;

/** Colours used inside the 3D scene. */
export const palette3d = {
  background: color.bg,
  floor: "#0c1018",
  accent: color.accent,
  steel: color.steel,
  text: color.text,
  textMuted: color.textMuted,
  shadow: palette.mutedShadow,
} as const;

/* ======================================================================
   B. SPACING — 4px base, 8px rhythm
   ====================================================================== */

export const BASE_UNIT = 4;

/** Named steps (px). Every value is a multiple of 4; the large ones of 8. */
export const space = {
  "3xs": 4,
  "2xs": 8,
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  "2xl": 64,
  "3xl": 96,
  "4xl": 128,
  "5xl": 160,
} as const;

/** Multipliers applied to editorial spacing as the viewport narrows. */
export const spaceScale = { mobile: 0.5, tablet: 0.75, desktop: 1 } as const;

/* ======================================================================
   C. TYPOGRAPHY
   ====================================================================== */

/** Font stacks. The `--font-*` variables are set by next/font in app/layout.tsx. */
export const fontFamily = {
  sans: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
  display: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
  editorial: 'var(--font-bodoni-moda), "Didot", ui-serif, Georgia, serif',
  mono: "var(--font-geist-mono), ui-monospace, monospace",
} as const;

export const fontWeight = { regular: 400, medium: 500, semibold: 600 } as const;

/** Viewport range (px) over which fluid sizes interpolate. */
export const FLUID_RANGE = { min: 375, max: 1600 } as const;

const round = (n: number, places = 4) => Number(n.toFixed(places));

/**
 * Linear interpolation from `minPx` at FLUID_RANGE.min to `maxPx` at
 * FLUID_RANGE.max, clamped outside it, as a CSS `clamp()` in rem + vw.
 */
export function fluid(minPx: number, maxPx: number, range = FLUID_RANGE): string {
  if (minPx === maxPx) return `${round(minPx / 16)}rem`;
  const slope = (maxPx - minPx) / (range.max - range.min);
  const intercept = minPx - slope * range.min;
  return `clamp(${round(minPx / 16)}rem, ${round(intercept / 16)}rem + ${round(slope * 100, 3)}vw, ${round(maxPx / 16)}rem)`;
}

interface TypeStep {
  /** Size at the narrow end of FLUID_RANGE (px). */
  min: number;
  /** Size at the wide end (px). */
  max: number;
  lineHeight: number | string;
  tracking?: string;
  weight?: number;
}

/** The type scale. Desktop targets from the brief: display 76–112, h2 42–64, h3 22–30, body 15–18. */
export const typeScale = {
  micro: { min: 11, max: 11, lineHeight: "1rem", tracking: "0.08em" },
  caption: { min: 13, max: 13, lineHeight: "1.25rem" },
  body: { min: 15, max: 17, lineHeight: 1.65 },
  lead: { min: 17, max: 20, lineHeight: 1.55 },
  h3: { min: 20, max: 28, lineHeight: 1.25, tracking: "-0.01em", weight: fontWeight.medium },
  h2: { min: 34, max: 64, lineHeight: 1.02, tracking: "-0.035em", weight: fontWeight.medium },
  display: { min: 46, max: 112, lineHeight: 0.92, tracking: "-0.045em", weight: fontWeight.medium },
} as const satisfies Record<string, TypeStep>;

/** Text-width constraints. */
export const measure = {
  /** Left editorial column. */
  content: "38rem",
  /** Body copy hung from the second grid line (~65 characters). */
  body: "34rem",
  /** Long-form article body. */
  article: "42rem",
} as const;

export const radius = { xs: 2, sm: 6, md: 10, lg: 16 } as const;

/* ======================================================================
   D. MOTION
   ====================================================================== */

/** Cubic-Bézier control points, shared by CSS, motion/react and WebGL. */
export const easing = {
  /** Primary editorial curve: a long, soft expo-out (≈ 1 − 2^(−10t)). */
  editorial: [0.16, 1, 0.3, 1],
  /** Symmetric in-out for looping indicators. */
  inOut: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/**
 * Evaluates a CSS `cubic-bezier()` in JS, so a frame-loop animation over a
 * fixed duration follows exactly the curve the DOM uses.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s: number) => ((ay * s + by) * s + cy) * s;
  const slopeX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    // Newton–Raphson, falling back to bisection where the slope is flat.
    let s = t;
    for (let i = 0; i < 6; i++) {
      const err = sampleX(s) - t;
      if (Math.abs(err) < 1e-6) return sampleY(s);
      const d = slopeX(s);
      if (Math.abs(d) < 1e-6) break;
      s -= err / d;
    }
    let lo = 0;
    let hi = 1;
    s = t;
    for (let i = 0; i < 30; i++) {
      const x = sampleX(s);
      if (Math.abs(x - t) < 1e-6) break;
      if (x < t) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return sampleY(s);
  };
}

/** Ready-made JS easing functions for the frame loop. */
export const ease = {
  editorial: cubicBezier(...easing.editorial),
  inOut: cubicBezier(...easing.inOut),
} as const;

/**
 * Frame-rate-independent exponential approach for continuous targets
 * (camera follow, bone slerp). Use `ease.*` for fixed-duration moves instead.
 * Returns the blend factor for this frame.
 */
export const dampFactor = (lambda: number, dt: number): number => 1 - Math.exp(-lambda * dt);

/** Durations in milliseconds. */
export const duration = {
  fast: 160,
  base: 320,
  slow: 640,
  reveal: 700,
  hero: 900,
} as const;

/** Shared transition presets (seconds, for motion/react). */
export const transition = {
  reveal: { duration: duration.reveal / 1000, ease: easing.editorial, distance: 18 },
  caption: { duration: 0.5, ease: easing.editorial, distance: 6 },
} as const;

/** With prefers-reduced-motion: no travel, effectively instant. */
export const reducedMotion = { duration: 0.01, distance: 0 } as const;

/** 3D arm and prop timing (seconds), used by AvatarController. */
export const motion3d = {
  reachDuration: 0.7,
  retractDuration: 0.5,
  propScaleIn: 0.45,
  propScaleOut: 0.3,
  /** Exponential damping factor for slerp toward targets (higher = snappier). */
  damping: 6,
  breathing: { amplitude: 0.012, periodSeconds: 4.2 },
} as const;

/* ======================================================================
   E. SPATIAL
   ====================================================================== */

/** Breakpoints (px). The split-screen stage starts at `lg`. */
export const breakpoint = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 } as const;

/** `matchMedia` query for the desktop split layout. */
export const DESKTOP_QUERY = `(min-width: ${breakpoint.lg / 16}rem)`;

export const layout = {
  navHeight: 64,
  /** Height of the 3D band on mobile/tablet. */
  stageBand: "30svh",
  /**
   * Share of the viewport width given to the editorial column. Even at `lg`
   * (the column is narrow there); from `xl` the text takes the larger share,
   * so the page reads asymmetric: text leads, the stage answers.
   */
  column: { lg: 0.5, xl: 0.56 },
  /**
   * The editorial grid's second vertical line, from `md` up. Numbers, dates
   * and metadata sit on the column edge; text starts at the hang. 88px holds a
   * stacked mono date ("FEB 2023").
   */
  hang: 88,
  /** Side gutter: 4vw, clamped between these (px). */
  gutter: { min: space.sm, vw: 4, max: space.xl },
  /** Vertical padding of a section: fluid between these, tracking viewport height. */
  sectionPadding: { min: 80, vh: 14, max: space["5xl"] },
} as const;

/**
 * Camera. Shots are not hand-placed positions: each names a world-space
 * region that must stay visible, and src/three/framing.ts solves the camera
 * from the live FOV, canvas aspect and the DOM insets below.
 */
export const camera = {
  fov: 30,
  /** Starting pose before the first fit (full body, straight on). */
  position: [0, 0.95, 4.6] as const,
  target: [0, 0.95, 0] as const,
  near: 0.05,
  far: 50,
  /** Push-in speed (exponential, per second). */
  damping: 2.2,
  /** Camera travel (m) across one section's scroll, centred on mid-section. */
  drift: { x: 0.08, y: 0.03 },
} as const;

/*
 * Framing regions (metres, avatar space: +Y up, avatar faces +Z, its right
 * hand is −X). Measured from the posed GLB with ?debug=rig:
 *   body at rest      x −0.31…0.31, y 0…1.87
 *   presenting body   x −0.43…0.31 (right hand forward), head top 1.87
 *   every held prop   x −0.49…−0.21, y 1.21…1.57, z 0.29…0.48
 */
export const framing = {
  /** Empty hand: the full figure, feet to crown, with air around it. */
  wide: { x: [-0.42, 0.42], y: [-0.06, 1.97], z: 0 },
  /** Prop in hand: crown to chest, from past the prop to the far shoulder.
   *  Measured on a plane between body and prop, so the near prop's
   *  perspective growth is covered by the extra 6 cm on the prop side. */
  present: { x: [-0.56, 0.36], y: [0.98, 1.95], z: 0.22 },
  /** Mobile band (short and wide): tighter, so the prop reads at small sizes. */
  presentBand: { x: [-0.56, 0.36], y: [1.12, 1.95], z: 0.22 },
} as const;

/** CSS-pixel areas of the stage canvas that the DOM covers or reserves. */
export const stageInsets = {
  desktop: {
    /** The fixed nav (layout.navHeight) sits over the stage's top edge; plus breathing room. */
    top: 64 + space.md,
    /** The bottom-left caption (StageCaption): 32px offset + two lines + gap. */
    bottomPresent: 104,
    bottomWide: space.md,
    /** The prop keeps one gutter from the text column when there is room. */
    side: space.xl,
  },
  band: { top: space["2xs"], bottom: space.lg, side: space.sm },
} as const;

/** How spare room is distributed (see framing.ts Anchor). */
export const framingAnchor = {
  /** Full figure: centred across, feet to crown fills the height. */
  wide: { x: 0.5, y: 0.5 },
  /** Desktop presenting: the prop hugs the text-column side, crown hugs the top. */
  presentDesktop: { x: 0, y: 1 },
  /** Band: centred. */
  presentBand: { x: 0.5, y: 1 },
} as const;

export const avatar = {
  /** Model height in metres (top of head). */
  height: 1.88,
} as const;

/** Rendering budgets. */
export const renderBudget = {
  dpr: [1, 2] as [number, number],
  /** Lightweight mode (mobile / low-power) caps DPR and drops shadows. */
  lightDpr: [1, 1.5] as [number, number],
} as const;

/* ======================================================================
   F. MATERIALS AND LIGHTING
   ====================================================================== */

/**
 * Physically based profiles (MeshPhysicalMaterial values). Metals are fully
 * metallic (their colour is their reflectance); dielectrics have metalness 0.
 * Partial metalness only for coated metal, where a clear lacquer sits on top.
 */
export const materialProfiles = {
  /** Matte graphite — unreflective dark surfaces (card stock, plastics). */
  matteGraphite: { color: "#20252d", metalness: 0, roughness: 0.82 },
  /** Satin anodised aluminium — device bodies. Dark reflectance, soft sheen. */
  satinAluminium: { color: "#59616d", metalness: 1, roughness: 0.42 },
  /** Brushed steel — trims, chips, seals. (Anisotropy would sell the grain, but at
   *  these sizes it is invisible and costs a shader variant; roughness carries it.) */
  brushedSteel: { color: "#aeb9c7", metalness: 1, roughness: 0.36 },
  /** Neutral ceramic — off-white glaze. */
  neutralCeramic: { color: "#dfe3e8", metalness: 0, roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.4 },
  /** Controlled metallic — dark coated metal with damped reflections (bezels, frames).
   *  Partial metalness stands in for a lacquer layer without a clearcoat shader pass. */
  controlledMetal: { color: "#151a21", metalness: 0.6, roughness: 0.5 },
} as const;

/** Material roles used by the props (`<Mat kind="…" />`). */
export const materials = {
  aluminium: materialProfiles.satinAluminium,
  bezel: materialProfiles.controlledMetal,
  /** Device glass over screens: dielectric, near-mirror clearcoat. */
  glass: {
    color: "#0a0d12",
    metalness: 0,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  },
  /** Emissive screen surface (UI is drawn on top). Kept dim: the screen is a surface, not a lamp. */
  screen: { color: color.bg, emissive: "#141a24", emissiveIntensity: 0.6 },
  /** Matte cotton paper — certificate, diploma. */
  paper: { color: "#ece7dc", metalness: 0, roughness: 0.9 },
  steel: materialProfiles.brushedSteel,
  /** Hardcover cloth — book, ID card holder (navy-slate). */
  cloth: { color: "#1f2735", metalness: 0, roughness: 0.72, sheen: 0.4, sheenColor: "#34404f" },
  /** Identity card stock. */
  card: { ...materialProfiles.matteGraphite, color: "#141a24", roughness: 0.6 },
} as const;

/**
 * Photographic lighting hierarchy: one dominant key (the only shadow caster),
 * a soft cool fill at a quarter of its strength, a restrained rim to separate
 * the silhouette from the navy, and a dim procedural environment for
 * reflections only.
 */
export const lighting = {
  ambient: { intensity: 0.12, color: palette.pureWhite },
  key: {
    color: "#f4f6fa",
    intensity: 2.4,
    position: [1.5, 4.4, 2.4] as const,
    /** Shadow map: tight orthographic box around the figure (m). */
    shadow: {
      mapSize: { high: 1024, low: 0 },
      bounds: { left: -1.1, right: 1.1, top: 2.3, bottom: -0.3, near: 1, far: 9 },
      bias: -0.0004,
      normalBias: 0.025,
      /** Opacity of the cast shadow on the invisible floor. */
      opacity: 0.26,
    },
  },
  fill: {
    color: "#c9d6e8",
    intensity: 0.6,
    position: [-3, 2, 2] as const,
  },
  rim: {
    color: palette.pureWhite,
    intensity: 1.1,
    position: [-1.5, 3, -3] as const,
  },
  /** Procedural <Environment> built from Lightformers (no HDR download);
   *  low intensity, used for reflections only. */
  environment: {
    intensity: 0.32,
    resolution: 256,
    formers: [
      { form: "rect", intensity: 2, position: [2, 3, 3], scale: [3, 2, 1], color: palette.pureWhite },
      { form: "rect", intensity: 0.8, position: [-3, 2, 1], scale: [2, 3, 1], color: "#c9d6e8" },
      { form: "ring", intensity: 1.0, position: [0, 4, -3], scale: [2, 2, 1], color: palette.pureWhite },
    ],
  },
  /** Soft contact shadow under the feet: grounds the figure where the cast shadow is faint. */
  contactShadow: { opacity: 0.45, blur: 2.4, far: 1.6, scale: 3, resolution: 512, color: palette.mutedShadow },
} as const;
