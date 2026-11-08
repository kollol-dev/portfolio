"use client";

import { portfolio } from "@/data/portfolio";
import { materials, palette3d } from "@/styles/tokens3d";
import { Dot, Label, Mat, Panel, Plate, ScreenSurface } from "./kit";

const W = 0.078;
const H = 0.158;
const D = 0.0085;
const UI = D / 2 + 0.0008;

/** 06 Activities — phone showing a leadership badge. */
export function Phone() {
  const act = portfolio.activities.find((a) => a.kind === "leadership") ?? portfolio.activities[0];
  const [title, subtitle] = act.title.split(" & ");
  const years = act.period.replace(/[A-Za-z]+ /g, "").replace("–", "—");

  return (
    <group position={[0, H / 2, 0]}>
      <Plate size={[W, H, D]} radius={0.012} bevel={0.3}>
        <Mat kind="aluminium" />
      </Plate>
      <Panel w={W - 0.004} h={H - 0.004} r={0.0105} position={[0, 0, D / 2 + 0.0002]}>
        <meshPhysicalMaterial {...materials.glass} />
      </Panel>
      <ScreenSurface w={W - 0.008} h={H - 0.01} r={0.009} z={D / 2 + 0.0004} />
      <Panel w={0.018} h={0.005} r={0.0025} position={[0, H / 2 - 0.009, D / 2 + 0.0006]}>
        <meshBasicMaterial color="#050506" toneMapped={false} />
      </Panel>

      <Label
        position={[-0.029, 0.058, UI]}
        size={0.0032}
        font="monoMedium"
        color={palette3d.accent}
        letterSpacing={0.14}
      >
        ACTIVITIES
      </Label>

      {/* Badge */}
      <mesh position={[0, 0.026, UI]}>
        <ringGeometry args={[0.0165, 0.018, 64]} />
        <meshBasicMaterial color={palette3d.accent} toneMapped={false} />
      </mesh>
      <Dot position={[0, 0.026, UI - 0.0001]} r={0.0165} color="#16161b" />
      <Label position={[0, 0.0265, UI + 0.0001]} size={0.0145} font="serif" color={palette3d.accent} anchorX="center">
        {act.badge}
      </Label>
      <Label
        position={[0, 0.0015, UI]}
        size={0.003}
        font="mono"
        color={palette3d.textMuted}
        anchorX="center"
        letterSpacing={0.16}
      >
        LEADERSHIP
      </Label>

      <Label position={[0, -0.011, UI]} size={0.0058} font="sansSemi" anchorX="center">
        {title}
      </Label>
      {subtitle ? (
        <Label position={[0, -0.0195, UI]} size={0.0042} color={palette3d.textMuted} anchorX="center">
          {subtitle}
        </Label>
      ) : null}
      <Label
        position={[0, -0.033, UI]}
        size={0.0038}
        color={palette3d.textMuted}
        anchorX="center"
        maxWidth={0.058}
        lineHeight={1.25}
      >
        {act.organisation}
      </Label>
      <Label
        position={[0, -0.048, UI]}
        size={0.0034}
        font="mono"
        color={palette3d.textMuted}
        anchorX="center"
        letterSpacing={0.08}
      >
        {years}
      </Label>

      {act.tags.length ? (
        <>
          <Panel w={0.058} h={0.011} r={0.0055} position={[0, -0.062, UI - 0.0001]}>
            <meshBasicMaterial color="#1d1d23" toneMapped={false} />
          </Panel>
          <Label
            position={[0, -0.062, UI]}
            size={0.0029}
            font="mono"
            color={palette3d.text}
            anchorX="center"
            letterSpacing={0.1}
          >
            {act.tags.slice(0, 2).join(" · ").toUpperCase()}
          </Label>
        </>
      ) : null}
    </group>
  );
}
