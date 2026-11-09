# Midnight Blue — audit and roadmap

Baseline: `origin/master` at `c0d23bc` (same as the local checkout), plus the
uncommitted Midnight Blue palette and type swap (Phase 02/04 groundwork).

## 1. Architecture overview

| Layer | Files | How it works |
| --- | --- | --- |
| Content | `content/portfolio.json`, `content/blog.json` → `src/content/store.ts` | Runtime JSON store (`CONTENT_DATA_DIR`), cached with `"use cache"` + tags, edited in `/admin`. |
| Page | `src/app/page.tsx` | Server component. Left column (`lg:w-1/2`) holds 7 `<Section>`s + Latest posts; right half is the fixed `StageFrame`. All text is server-rendered — works with no JS / no WebGL. |
| Sections | `src/components/sections/*`, `ui/Section.tsx` | Eyebrow (`01 — LABEL`), H2 with `*emphasis*`, body. Every section is `min-h-dvh` and vertically centred. |
| Scroll | `components/layout/ScrollSync.tsx` → `lib/scrollStore.ts` | Zustand `active` section (changes ~7×/page) + a mutable `scrollProgress` object read by the frame loop (no re-renders). |
| Bridge | `three/ScrollBridge.tsx` | Debounces (160 ms) the active section into `controller.setTarget(propId)`. |
| 3D mount | `three/SceneMount.tsx` | Client-only, idle-loaded, WebGL detection, context-loss + error-boundary fallback, mobile band can be hidden (unmounts canvas). |
| Scene | `three/Scene.tsx`, `CameraRig.tsx`, `StudioLights.tsx` | Fixed camera targets (wide / present / band) blended by damping + smootherstep; 3 directional lights + Lightformer env + ContactShadows. |
| Avatar | `three/avatar/*`, `controller/AvatarController.ts`, `poses.ts` | GLB (meshopt/WebP) → resolved bones → pose state machine (reach / present / retract), exponential damping. |
| Props | `three/props/registry.ts`, `PropStage.tsx`, `kit.tsx` | Six props, all mounted once, attached to a palm frame computed per frame; troika SDF text with local fonts. |
| Tokens | `app/globals.css` (`:root` + `@theme inline`), `styles/tokens3d.ts` | **Two independent sources.** Hex values are copied by hand between them. |

Strengths worth keeping: server-rendered content with a real no-WebGL path;
no per-frame React work; idle-loaded 3D chunk; a single prop registry with
named calibration; restrained component set (no card library, no icon soup).

## 2. Visual design audit

**Works**
- Numbered chapters, mono eyebrows, hairline rules — already Swiss in spirit.
- One accent colour, used sparingly. Accessible contrast (verified, see §3 of the brief).
- 3D stage is decorative (`aria-hidden`) and never carries information.

**Doesn't yet**
1. **Symmetric, not asymmetric.** A hard 50/50 split; every section is the same
   `min-h-dvh`, centred, 38rem column. The rhythm is uniform, so nothing leads.
2. **Projects are identical cards** (`rounded-md border bg-surface p-8`), the
   one place the page falls back to template UI. The `featured` flag exists in
   the data but the layout ignores it.
3. **Tag chips everywhere** — experience, toolkit and projects all use bordered
   mono pills. The toolkit reads as a badge wall rather than structured information.
4. **Avatar placement is a constant, not a composition.** The camera targets are
   hand-tuned numbers; the avatar is centred in the right half regardless of
   viewport aspect, so on ultra-wide or short screens it floats away from the
   column edge, and on the mobile band props can crop.
5. **Motion constants are duplicated** (CSS `--ease-out-expo`, Reveal and
   StageCaption literals, controller `easeInOutCubic`, camera smootherstep) and
   do not share one curve.
6. **Lighting reads "studio demo"**: an unshadowed rig (ContactShadows only,
   meshes flagged `castShadow` but no light casts), a hard-coded Lightformer
   colour, pure-black contact shadow instead of Muted Shadow.
7. **Hero carries too much**: eyebrow, H1, headline, summary, ID card, two
   buttons, socials, scroll cue — the expressive headline has to compete.

Note on the brief: `cubic-bezier(0.16, 1, 0.3, 1)` is an expo-out curve
(≈ `1 − 2^(−10t)`), not `1 − (1 − t)³` — at t = 0.25 it is 0.83 vs 0.58. The
token system evaluates the exact Bézier in JS so DOM and WebGL match.

## 3. The five most important improvements

1. **One token source.** `tokens3d.ts` defines every primitive; the CSS
   `@theme` is generated from it and a check fails the lint run on drift.
2. **DOM-anchored avatar.** Compute the visible frustum from FOV/aspect and
   place the avatar against the column edge in world units, so it never
   overlaps text and holds its composition on every aspect ratio.
3. **Projects as case studies.** One featured project set large (Bodoni
   intro line, wide measure, architecture as a numbered list), supporting
   projects as a quiet indexed list — no cards.
4. **Asymmetric rhythm.** A 12-column grid with variable measures per section,
   sections sized by content rather than all `min-h-dvh`, a calmer hero.
5. **One motion language.** A shared editorial curve and durations used by
   CSS, motion/react and the frame loop, plus a lit, shadowed 3D scene with
   physically based material profiles.

## 4. Roadmap — status (all phases complete, 2026-11-09)

| Phase | Outcome |
| --- | --- |
| 03 Tokens | `tokens3d.ts` (A–F) is the single source; `npm run tokens` generates `tokens.css`; `npm run lint` fails on drift. |
| 04 Type | Space Grotesk / Bodoni Moda (italic only, via `.editorial`) / Geist Mono through next/font; fluid scale from `typeScale`. |
| 05 Editorial UI | Two-line grid (column edge + `--hang`), column 50% → 56% at xl, hero reduced to one headline + metadata, projects as lead case study + index, no cards or chips, solid nav. |
| 06 3D art direction | Physically based profiles (metals fully metallic), one shadow-casting key on a shadow-catcher floor (high tier only), tokenised Lightformer environment, Muted Shadow contact shadow. |
| 07 DOM/WebGL | `src/three/framing.ts` solves each shot from FOV, canvas aspect and DOM pixel insets (nav, caption, gutter); regions measured from the posed GLB; recomputed on resize only. Fixes the presenting-shot shoulder crop at every width. |
| 08 Motion | Prop scale-in on the exact editorial Bézier; damping via `dampFactor`; badge sway loop → single settle; scroll cue 3 pulses; named calibration in PropStage. |
| 09 Responsive + a11y | 320–1920: no horizontal overflow, text always clear of the stage (41–77 px gap); 24 px targets; skip link + visible focus; reduced motion stops all CSS animation. |
| 10 Validation | tsc, lint, production build pass. Lighthouse (prod, headless): desktop 100/100/100/100, mobile 93–94 perf, 100 a11y/BP/SEO, CLS 0. No-WebGL fallback and no-JS rendering verified. |

Performance note: removing anisotropy (brushed steel) and clearcoat (bezels) cut
first-render shader compilation from an 811 ms task to ~200 ms (mobile TBT
1,080 → ~300 ms). Keep new material features off unless they are visible.
