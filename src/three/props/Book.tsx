"use client";

import { useContent } from "@/content/ContentProvider";
import { materials, palette3d } from "@/styles/tokens3d";
import { Label, Mat, Plate, Rule } from "./kit";

const W = 0.15;
const H = 0.21;
const D = 0.032;
const BOARD = 0.004;
const FRONT = D / 2 + 0.0004;
const FOIL = palette3d.accent;

/** 05 Education — clothbound hardcover with foil lettering. */
export function Book() {
  const portfolio = useContent();
  const edu = portfolio.education[0];
  const [startYear, endYear] = edu.period.match(/\d{4}/g) ?? ["", ""];
  return (
    <group position={[0, H / 2, 0]}>
      <Plate size={[W, H, BOARD]} radius={0.003} bevel={0.3} position={[0, 0, D / 2 - BOARD / 2]}>
        <Mat kind="cloth" />
      </Plate>
      <Plate size={[W, H, BOARD]} radius={0.003} bevel={0.3} position={[0, 0, -D / 2 + BOARD / 2]}>
        <Mat kind="cloth" />
      </Plate>
      <Plate size={[0.009, H, D]} radius={0.003} bevel={0.3} position={[-W / 2 + 0.0045, 0, 0]}>
        <Mat kind="cloth" color="#121821" />
      </Plate>
      {/* Page block */}
      <mesh position={[0.002, 0, 0]}>
        <boxGeometry args={[W - 0.012, H - 0.008, D - BOARD * 2]} />
        <meshStandardMaterial color={materials.paper.color} roughness={0.95} />
      </mesh>

      <Label
        position={[0.004, 0.072, FRONT]}
        size={0.0046}
        font="monoMedium"
        color={FOIL}
        anchorX="center"
        letterSpacing={0.22}
        uppercase
      >
        {edu.institution}
      </Label>
      <Rule from={[-0.012, 0.061]} to={[0.02, 0.061]} z={FRONT} color={FOIL} width={0.0005} />
      <Label position={[0.004, 0.022, FRONT]} size={0.0175} font="serif" color={FOIL} anchorX="center">
        {edu.cover.title}
      </Label>
      <Label
        position={[0.004, -0.004, FRONT]}
        size={0.0092}
        font="serifItalic"
        color={FOIL}
        anchorX="center"
        maxWidth={0.11}
        lineHeight={1.15}
      >
        {edu.cover.subtitle}
      </Label>
      <Rule from={[-0.012, -0.03]} to={[0.02, -0.03]} z={FRONT} color={FOIL} width={0.0005} />
      <Label
        position={[0.004, -0.042, FRONT]}
        size={0.0046}
        font="mono"
        color={FOIL}
        anchorX="center"
        letterSpacing={0.12}
      >
        {`${startYear} — ${endYear}`}
      </Label>
      <Label
        position={[0.004, -0.088, FRONT]}
        size={0.0036}
        font="mono"
        color={FOIL}
        anchorX="center"
        letterSpacing={0.16}
        uppercase
      >
        {edu.location}
      </Label>
    </group>
  );
}
