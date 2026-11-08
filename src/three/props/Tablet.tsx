"use client";

import { careerStartYear, portfolio } from "@/data/portfolio";
import { materials, palette3d } from "@/styles/tokens3d";
import { Dot, Label, Mat, Panel, Plate, Rule, ScreenSurface } from "./kit";

const W = 0.26;
const H = 0.18;
const D = 0.009;
const UI = D / 2 + 0.0008;

const years = (start: string, end: string) => `${start.slice(-4)}–${end === "Present" ? "Now" : end.slice(-4)}`;

/** 02 Experience — tablet showing the role timeline. */
export function Tablet() {
  const roles = portfolio.experience.slice(0, 4);
  const top = 0.03;
  const step = 0.03;
  return (
    <group position={[0, H / 2, 0]}>
      <Plate size={[W, H, D]} radius={0.016} bevel={0.3}>
        <Mat kind="aluminium" />
      </Plate>
      <Panel w={W - 0.008} h={H - 0.008} r={0.012} position={[0, 0, D / 2 + 0.0002]}>
        <meshPhysicalMaterial {...materials.glass} />
      </Panel>
      <ScreenSurface w={W - 0.026} h={H - 0.026} r={0.004} z={D / 2 + 0.0004} />
      <Dot position={[0, H / 2 - 0.0075, D / 2 + 0.0005]} r={0.0013} color="#26262c" />

      <Label
        position={[-0.105, 0.062, UI]}
        size={0.0052}
        font="monoMedium"
        color={palette3d.accent}
        letterSpacing={0.14}
        uppercase
      >
        Experience
      </Label>
      <Label
        position={[0.105, 0.062, UI]}
        size={0.0046}
        font="mono"
        color={palette3d.textMuted}
        anchorX="right"
        letterSpacing={0.06}
      >
        {`${careerStartYear() ?? ""} — PRESENT`}
      </Label>
      <Rule from={[-0.105, 0.051]} to={[0.105, 0.051]} z={UI} color="#2a2a31" />

      <Rule
        from={[-0.098, top + 0.004]}
        to={[-0.098, top - step * (roles.length - 1) - 0.004]}
        z={UI}
        color="#33333b"
      />
      {roles.map((r, i) => {
        const y = top - i * step;
        return (
          <group key={r.company}>
            <Dot position={[-0.098, y, UI + 0.0001]} r={0.0018} color={i === 0 ? palette3d.accent : "#55555e"} />
            <Label position={[-0.09, y, UI]} size={0.0048} font="mono" color={palette3d.textMuted}>
              {years(r.start, r.end)}
            </Label>
            <Label position={[-0.045, y + 0.0035, UI]} size={0.0072} font="sansMedium">
              {r.role}
            </Label>
            <Label position={[-0.045, y - 0.0065, UI]} size={0.0054} color={palette3d.textMuted}>
              {r.company}
            </Label>
          </group>
        );
      })}
    </group>
  );
}
