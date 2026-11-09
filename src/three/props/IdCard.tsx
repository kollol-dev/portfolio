"use client";

import { displayUrl } from "@/data/portfolio";
import { useContent } from "@/content/ContentProvider";
import { palette3d } from "@/styles/tokens3d";
import { Label, Mat, Panel, Plate, Rule } from "./kit";

const W = 0.15;
const H = 0.095;
const D = 0.0035;
const Z = D / 2 + 0.0004;
const L = -W / 2 + 0.018; // left text column

/** 01 Intro — professional identity card. */
export function IdCard() {
  const portfolio = useContent();
  const { profile } = portfolio;
  const github = profile.socials.find((s) => s.kind === "github");
  return (
    <group position={[0, H / 2, 0]}>
      <Plate size={[W, H, D]} radius={0.007} bevel={0.3}>
        <Mat kind="card" />
      </Plate>
      <Panel w={0.0035} h={H - 0.026} position={[-W / 2 + 0.009, 0, Z]}>
        <meshBasicMaterial color={palette3d.accent} toneMapped={false} />
      </Panel>

      <Label
        position={[L, H / 2 - 0.015, Z]}
        size={0.0042}
        font="monoMedium"
        color={palette3d.accent}
        letterSpacing={0.14}
        uppercase
      >
        Identity
      </Label>
      <Label position={[L, 0.009, Z]} size={0.0128} font="display" letterSpacing={-0.02}>
        {profile.name}
      </Label>
      <Label position={[L, -0.0075, Z]} size={0.0062} color={palette3d.textMuted}>
        {profile.title}
      </Label>
      <Rule from={[L, -0.0205]} to={[W / 2 - 0.012, -0.0205]} z={Z} color="#2a3444" />
      <Label
        position={[L, -0.0305, Z]}
        size={0.0041}
        font="mono"
        color={palette3d.textMuted}
        letterSpacing={0.08}
        uppercase
      >
        {profile.location}
      </Label>
      <Label
        position={[W / 2 - 0.012, -0.0305, Z]}
        size={0.0041}
        font="mono"
        color={palette3d.textMuted}
        anchorX="right"
      >
        {github ? displayUrl(github.href) : profile.email}
      </Label>

      {/* Steel monogram chip */}
      <Plate size={[0.022, 0.022, 0.0014]} radius={0.003} position={[W / 2 - 0.021, H / 2 - 0.021, D / 2 + 0.0007]}>
        <Mat kind="steel" />
      </Plate>
      <Label
        position={[W / 2 - 0.021, H / 2 - 0.021, D / 2 + 0.0016]}
        size={0.0074}
        font="monoMedium"
        color="#10151e"
        anchorX="center"
      >
        KC
      </Label>
    </group>
  );
}
