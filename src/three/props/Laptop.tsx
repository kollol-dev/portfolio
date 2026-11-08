"use client";

import { portfolio } from "@/data/portfolio";
import { palette3d } from "@/styles/tokens3d";
import { Dot, Label, Mat, Panel, Plate, Rule, ScreenSurface } from "./kit";

const W = 0.3;
const DEPTH = 0.2;
const BASE_T = 0.011;
const LID_H = 0.2;
const LID_T = 0.007;
const OPEN_ANGLE = -0.27; // lid tilted back ~15° past vertical

const SCREEN_W = 0.27;
const SCREEN_H = 0.168;
const SCREEN_Y = LID_H / 2 + 0.004;
const UI = LID_T / 2 + 0.0009;

const BOXES = ["Upload API", "Queue", "ETL · GDAL", "Graph · SPARQL"];

/** 04 Projects — open laptop showing the featured project's architecture. */
export function Laptop() {
  const project = portfolio.projects[0];
  const top = SCREEN_Y + SCREEN_H / 2;
  const left = -SCREEN_W / 2;
  const boxW = 0.054;
  const gap = (SCREEN_W - 0.03 - boxW * BOXES.length) / (BOXES.length - 1);
  const rowY = SCREEN_Y - 0.022;

  return (
    <group>
      {/* Base, lying flat */}
      <Plate size={[W, DEPTH, BASE_T]} radius={0.012} bevel={0.3} position={[0, BASE_T / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Mat kind="aluminium" />
      </Plate>
      <group position={[0, BASE_T + 0.0002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Panel w={W - 0.04} h={0.096} r={0.004} position={[0, 0.03, 0]}>
          <Mat kind="bezel" />
        </Panel>
        <Panel w={0.095} h={0.056} r={0.004} position={[0, -0.058, 0]}>
          <meshPhysicalMaterial color="#232328" metalness={0.6} roughness={0.25} />
        </Panel>
      </group>

      {/* Lid, hinged at the back edge */}
      <group position={[0, BASE_T, -DEPTH / 2 + 0.004]} rotation={[OPEN_ANGLE, 0, 0]}>
        <Plate size={[W, LID_H, LID_T]} radius={0.012} bevel={0.3} position={[0, LID_H / 2, 0]}>
          <Mat kind="aluminium" />
        </Plate>
        <Panel w={W - 0.008} h={LID_H - 0.008} r={0.009} position={[0, LID_H / 2, LID_T / 2 + 0.0002]}>
          <Mat kind="bezel" />
        </Panel>
        <ScreenSurface w={SCREEN_W} h={SCREEN_H} r={0.003} z={LID_T / 2 + 0.0005} />
        <group position={[0, 0, 0]}>
          {/* Browser chrome */}
          <Panel w={SCREEN_W} h={0.014} position={[0, top - 0.007, UI - 0.0002]}>
            <meshBasicMaterial color="#18181d" toneMapped={false} />
          </Panel>
          {["#55555e", "#44444c", "#3a3a42"].map((c, i) => (
            <Dot key={c} position={[left + 0.009 + i * 0.006, top - 0.007, UI]} r={0.0017} color={c} />
          ))}
          <Label position={[0, top - 0.007, UI]} size={0.0042} font="mono" color={palette3d.textMuted} anchorX="center">
            architecture / overview
          </Label>

          <Label position={[left + 0.015, top - 0.033, UI]} size={0.0155} font="serif">
            {project.name}
          </Label>
          <Label position={[left + 0.015, top - 0.05, UI]} size={0.0046} font="monoMedium" color={palette3d.accent} letterSpacing={0.1}>
            EVENT-DRIVEN · GIS ETL · KNOWLEDGE GRAPH
          </Label>

          {/* Pipeline diagram */}
          {BOXES.map((label, i) => {
            const x = left + 0.015 + boxW / 2 + i * (boxW + gap);
            return (
              <group key={label}>
                <Panel w={boxW} h={0.03} r={0.003} position={[x, rowY, UI - 0.0001]}>
                  <meshBasicMaterial color={i === 2 ? "#2a241b" : "#1c1c22"} toneMapped={false} />
                </Panel>
                <Label position={[x, rowY, UI + 0.0001]} size={0.0052} anchorX="center" color={i === 2 ? palette3d.accent : palette3d.text}>
                  {label}
                </Label>
                {i < BOXES.length - 1 ? (
                  <Rule from={[x + boxW / 2 + 0.003, rowY]} to={[x + boxW / 2 + gap - 0.003, rowY]} z={UI} color={palette3d.accent} width={0.0007} />
                ) : null}
              </group>
            );
          })}

          <Rule from={[left + 0.015, SCREEN_Y - 0.055]} to={[-left - 0.015, SCREEN_Y - 0.055]} z={UI} color="#2a2a31" />
          <Label position={[left + 0.015, SCREEN_Y - 0.067, UI]} size={0.0042} font="mono" color={palette3d.textMuted} letterSpacing={0.08}>
            {project.stack.join("   ").toUpperCase()}
          </Label>
        </group>
      </group>
    </group>
  );
}
