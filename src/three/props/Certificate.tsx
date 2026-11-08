"use client";

import { portfolio } from "@/data/portfolio";
import { materials } from "@/styles/tokens3d";
import { Label, Mat, Panel, Plate, Rule } from "./kit";

const W = 0.21;
const H = 0.16;
const D = 0.014;
const OPEN = { w: 0.172, h: 0.122, r: 0.002 };
const PAPER_Z = -D / 2 + 0.0035;
const T = PAPER_Z + 0.0003;
const INK = "#1f1d1a";
const INK_SOFT = "#5a554c";

/** 03 Certifications — framed certificate. */
export function Certificate() {
  const cert = portfolio.certifications[1] ?? portfolio.certifications[0];
  return (
    <group position={[0, H / 2, 0]}>
      {/* Black frame with a thin brass inner lip */}
      <Plate size={[W, H, D]} radius={0.004} bevel={0.2} hole={OPEN}>
        <Mat kind="bezel" />
      </Plate>
      <Plate size={[OPEN.w + 0.006, OPEN.h + 0.006, 0.004]} radius={0.002} bevel={0.2} hole={OPEN} position={[0, 0, -D / 2 + 0.0055]}>
        <Mat kind="brass" />
      </Plate>
      {/* Backing board and paper */}
      <Plate size={[W - 0.004, H - 0.004, 0.002]} radius={0.003} position={[0, 0, -D / 2 + 0.001]}>
        <Mat kind="bezel" />
      </Plate>
      <Panel w={OPEN.w + 0.004} h={OPEN.h + 0.004} position={[0, 0, PAPER_Z]}>
        <meshStandardMaterial color={materials.paper.color} roughness={materials.paper.roughness} />
      </Panel>

      <Label position={[0, 0.042, T]} size={0.0052} font="monoMedium" color={INK_SOFT} anchorX="center" letterSpacing={0.24} uppercase>
        Certificate
      </Label>
      <Rule from={[-0.018, 0.034]} to={[0.018, 0.034]} z={T} color="#b39467" width={0.0005} />
      <Label position={[0, 0.016, T]} size={0.0112} font="serif" color={INK} anchorX="center" maxWidth={0.15} lineHeight={1.1}>
        {cert.name}
      </Label>
      <Label position={[0, -0.009, T]} size={0.0062} font="sansMedium" color={INK} anchorX="center">
        {cert.issuer}
      </Label>
      <Label position={[0, -0.0195, T]} size={0.0043} font="mono" color={INK_SOFT} anchorX="center" letterSpacing={0.06}>
        {cert.period.toUpperCase()}
      </Label>

      <Rule from={[-0.07, -0.042]} to={[-0.03, -0.042]} z={T} color={INK_SOFT} width={0.0004} />
      <Label position={[-0.07, -0.0475, T]} size={0.0032} font="mono" color={INK_SOFT} letterSpacing={0.1}>
        AWARDED TO K. CHAKRABORTY
      </Label>

      {/* Foil seal */}
      <mesh position={[0.06, -0.038, T + 0.0009]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.0016, 40]} />
        {/* Less metallic than the frame lip so it reads as foil, not a dark mirror */}
        <meshStandardMaterial color="#c8a97e" metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0.06, -0.038, T + 0.0018]}>
        <ringGeometry args={[0.0085, 0.0092, 40]} />
        <meshStandardMaterial color="#8c7350" metalness={1} roughness={0.4} />
      </mesh>
    </group>
  );
}
