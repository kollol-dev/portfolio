"use client";

import { useMemo, type ReactNode } from "react";
import { Text } from "@react-three/drei";
import { configureTextBuilder } from "troika-three-text";
import { Path, Shape } from "three";
import { materials, palette3d } from "@/styles/tokens3d";
import { detail, useQuality } from "../quality";

/* ------------------------------------------------------------- fonts */

// Local WOFF files (troika can't read WOFF2); no CDN request at runtime.
export const FONTS = {
  sans: "/fonts/geist-sans-latin-400-normal.woff",
  sansMedium: "/fonts/geist-sans-latin-500-normal.woff",
  sansSemi: "/fonts/geist-sans-latin-600-normal.woff",
  mono: "/fonts/geist-mono-latin-400-normal.woff",
  monoMedium: "/fonts/geist-mono-latin-500-normal.woff",
  serif: "/fonts/instrument-serif-latin-400-normal.woff",
  serifItalic: "/fonts/instrument-serif-latin-400-italic.woff",
} as const;

type FontKey = keyof typeof FONTS;

// troika's defaults pull a fallback font from Google Fonts and missing-glyph
// fonts from jsDelivr. Keep everything same-origin: our fonts cover every
// character the props render, and any fallback lookup hits a local path.
// This module only runs in the browser (Scene loads with ssr: false).
configureTextBuilder({
  defaultFontURL: new URL(FONTS.sans, window.location.origin).href,
  unicodeFontsURL: new URL("/fonts/unicode-fallback", window.location.origin).href,
});

interface LabelProps {
  children: string;
  position?: [number, number, number];
  size: number;
  font?: FontKey;
  color?: string;
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "middle" | "bottom";
  maxWidth?: number;
  letterSpacing?: number;
  lineHeight?: number;
  uppercase?: boolean;
}

/** SDF text on a prop surface. Sizes are in metres. */
export function Label({
  children,
  position = [0, 0, 0],
  size,
  font = "sans",
  color = palette3d.text,
  anchorX = "left",
  anchorY = "middle",
  maxWidth,
  letterSpacing = 0,
  lineHeight = 1.2,
  uppercase = false,
}: LabelProps) {
  // Wrapped lines follow the anchor so centred blocks stay centred.
  const textAlign = anchorX === "center" ? "center" : anchorX === "right" ? "right" : "left";
  return (
    <Text
      position={position}
      fontSize={size}
      font={FONTS[font]}
      color={color}
      anchorX={anchorX}
      anchorY={anchorY}
      maxWidth={maxWidth}
      letterSpacing={letterSpacing}
      lineHeight={lineHeight}
      textAlign={textAlign}
      // Text is a flat layer resting 0.3 mm above the surface it labels.
      renderOrder={2}
    >
      {uppercase ? children.toUpperCase() : children}
    </Text>
  );
}

/* --------------------------------------------------------- materials */

type MatKind = keyof typeof materials;

/** Physical material from the 3D token palette. */
export function Mat({ kind, color }: { kind: MatKind; color?: string }) {
  const m = materials[kind];
  return <meshPhysicalMaterial {...m} {...(color ? { color } : {})} />;
}

/* ---------------------------------------------------------- geometry */

export function roundedRect<T extends Shape | Path = Shape>(w: number, h: number, r: number, target?: T): T {
  const path = (target ?? new Shape()) as T;
  const x = -w / 2;
  const y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r);
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
  return path;
}

interface PlateProps {
  /** Width, height, total thickness (m). */
  size: [number, number, number];
  radius: number;
  /** Bevel as a fraction of thickness (0–0.45). */
  bevel?: number;
  /** Optional rectangular hole (frames). */
  hole?: { w: number; h: number; r: number };
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: ReactNode; // material
}

/**
 * Rounded, bevelled slab centred on the origin, front face toward +Z.
 * Real extruded geometry, so edges catch the studio light.
 */
export function Plate({ size: [w, h, d], radius, bevel = 0.25, hole, position, rotation, children }: PlateProps) {
  const q = detail[useQuality()];
  const bevelT = d * bevel;
  const shape = useMemo(() => {
    const s = roundedRect(w - bevelT * 2, h - bevelT * 2, Math.max(radius - bevelT, 0.0005));
    if (hole) s.holes.push(roundedRect(hole.w + bevelT * 2, hole.h + bevelT * 2, hole.r, new Path()));
    return s;
  }, [w, h, radius, bevelT, hole]);

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -(d - bevelT * 2) / 2]} castShadow>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: d - bevelT * 2,
              bevelEnabled: true,
              bevelThickness: bevelT,
              bevelSize: bevelT,
              bevelSegments: q.bevel,
              curveSegments: q.curve,
            },
          ]}
        />
        {children}
      </mesh>
    </group>
  );
}

/** Flat rounded panel (screens, glass, inlays), facing +Z. */
export function Panel({
  w,
  h,
  r = 0,
  position,
  children,
}: {
  w: number;
  h: number;
  r?: number;
  position?: [number, number, number];
  children: ReactNode;
}) {
  const q = detail[useQuality()];
  const shape = useMemo(() => roundedRect(w, h, r), [w, h, r]);
  return (
    <mesh position={position}>
      <shapeGeometry args={[shape, q.curve]} />
      {children}
    </mesh>
  );
}

/** Emissive screen surface; UI labels go on top at z + 0.0003. */
export function ScreenSurface({ w, h, r = 0, z = 0 }: { w: number; h: number; r?: number; z?: number }) {
  return (
    <Panel w={w} h={h} r={r} position={[0, 0, z]}>
      <meshStandardMaterial {...materials.screen} roughness={0.4} />
    </Panel>
  );
}

/** Thin flat line (dividers, timeline rails), in the XY plane. */
export function Rule({
  from,
  to,
  width = 0.0006,
  color = palette3d.textMuted,
  z = 0,
}: {
  from: [number, number];
  to: [number, number];
  width?: number;
  color?: string;
  z?: number;
}) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  return (
    <mesh position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, z]} rotation={[0, 0, Math.atan2(dy, dx)]}>
      <planeGeometry args={[len, width]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

/** Small filled disc (timeline dots, status lights). */
export function Dot({ position, r, color }: { position: [number, number, number]; r: number; color: string }) {
  return (
    <mesh position={position}>
      <circleGeometry args={[r, 20]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
