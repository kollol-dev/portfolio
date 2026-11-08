# Architecture — Interactive 3D Portfolio

## 1. Creative direction

**Concept: "The Studio Presentation."** A quiet, product-launch-style page. On the left
is an editorial column you read. On the right, Kollol's avatar stands in a dim studio
and hands each chapter to the viewer as a physical object.

- **Tone:** calm, exact, confident. Like an Apple keynote slide or an industrial design
  monograph, not a game HUD.
- **Palette:** near-black surfaces (`#0A0A0C`, `#111114`, `#17171B`), 1px white hairlines
  at 8–14% opacity, warm brass accent (`#C8A97E`) used sparingly for links, active
  markers and focus, cool steel (`#8FA3B8`) for meta and data.
- **Type:** *Instrument Serif* for display headlines (with italic emphasis), *Geist* for
  body, *Geist Mono* for small uppercase eyebrow labels, dates and tech tags.
- **Layout:** numbered chapters (`01`–`07`), lots of negative space, one idea per
  screen. A 38rem text measure on the left; the canvas fills the right 50–55% from
  `lg` (1024px) up.
- **Lighting:** a three-point studio rig (warm key, cool fill, neutral rim), soft
  contact shadow, low-intensity studio environment for reflections only.
- **Avoid:** neon, glow, heavy blur or glass, floating decorative shapes, dashboard cards.

## 2. Dependency check (verified 2026-11-08)

| Package | Version | Note |
|---|---|---|
| next | 16.4.5 | App Router, Turbopack, `cacheComponents` on |
| react / react-dom | 19.3.0 | R3F 9.8 peer range is `>=19 <19.4`, so this works |
| three | 0.187.0 | |
| @react-three/fiber | 9.8.2 | React 19 line (v8 is React 18 only) |
| @react-three/drei | 10.7.9 | needs R3F `^9`, React `^19` |
| motion | 14.x | DOM only |
| zustand | 5.x | shared active-section and scroll-progress state only |
| lucide-react | 1.x | icons |
| tailwindcss | 4.x | CSS-first config (see below) |

**Tailwind v4 note:** v4 has no `tailwind.config.ts` by default. All theme tokens are
declared once in `@theme` inside `src/app/globals.css`, which generates the utilities
(`bg-surface`, `text-display`, `border-line`, …). A separate JS config would be a second
source of truth, so there isn't one. 3D tokens live in `src/styles/tokens3d.ts`.

**Upgrade guard:** React 19.4+ is outside R3F 9.8's peer range. Check R3F's peer deps
before bumping React.

## 3. Avatar rig — inspected from `public/models/avatar.glb`

These come from parsing the GLB's JSON chunk directly, not from assumptions.
Phase 3 adds a runtime diagnostic that re-checks them in the browser.

- Generator: `Avaturn.me | Blender`, glTF 2.0, about 4.2 MB, extension `KHR_materials_ior`.
- One skin, `Armature`, with **52 joints**. **No animations** are baked into this file.
- Meshes (all skinned to the same skeleton): `avaturn_body`, `avaturn_glasses_0`,
  `avaturn_glasses_1`, `avaturn_hair_0`, `avaturn_shoes_0`, `avaturn_look_0`.
- Hierarchy (Mixamo-style names, no `mixamorig:` prefix):

```
Armature
└─ Hips
   ├─ Spine → Spine1 → Spine2
   │   ├─ Neck → Head
   │   ├─ LeftShoulder → LeftArm → LeftForeArm → LeftHand → (fingers)
   │   └─ RightShoulder → RightArm → RightForeArm → RightHand → (fingers)
   ├─ LeftUpLeg → LeftLeg → LeftFoot → LeftToeBase
   └─ RightUpLeg → RightLeg → RightFoot → RightToeBase
```

- Resting local rotations (quaternion x, y, z, w):
  - `RightShoulder` `[0.518, -0.513, 0.483, 0.484]`
  - `RightArm` `[-0.003, -0.08, 0.025, 0.996]`
  - `RightForeArm` `[0, 0, -0.012, 1]`
  - `RightHand` `[-0.001, -0.003, -0.01, 1]`

  **Confirmed in the browser (Phase 3):** the rest pose is a full T-pose. The right
  upper arm points 90° from vertical, along -X. Phase 4 must add a relaxed "arms down"
  idle pose before any reaching.

- Runtime facts (from the Phase 3 diagnostic):
  - Height 1.877 m, feet at y≈0, facing +Z (toward the camera).
  - The avatar's right hand is on screen-left, on the editorial column side.
  - Right arm world positions: shoulder joint (-0.204, 1.508), elbow (-0.458, 1.508),
    wrist (-0.726, 1.508).
- **Debug:** add `?debug=rig` to any URL to see the bone overlay and a console
  report, saved on `window.__avatarReport`. The console report also prints on every
  load in development.

**Planned rig mapping** (configurable in Phase 4, with a fallback lookup by name
pattern if a different GLB is used):

| Logical | GLB bone |
|---|---|
| `rightShoulder` | `RightShoulder` |
| `rightUpperArm` | `RightArm` |
| `rightForearm` | `RightForeArm` |
| `rightWrist` | `RightHand` (no separate wrist bone in this rig) |
| `rightHand` | `RightHand` |

Other files in `../Cartoon Avatar/`: `model_avatar_with_animation.glb` (may hold an
idle clip we could use later) and `model_body_only.glb` (about 1 MB, a possible
lightweight mode).

## 4. Rendering and state architecture

```
app/page.tsx (Server Component)
├─ <SiteNav/>                      client: active-section highlight
├─ <main> editorial column         Server Components, works fully without JS or WebGL
│   └─ <Section id=…/> × 7         each registers with the IntersectionObserver
└─ <SceneMount/>                   client: dynamic(() => import("Scene"), { ssr: false })
    └─ <Canvas> (position: fixed)  <Suspense> + WebGL-detect fallback
        ├─ <StudioLights/> <ContactShadows/>
        ├─ <Avatar/>               loads GLB, exposes bone refs (no animation logic)
        ├─ <AvatarController/>     state machine, runs only in useFrame
        └─ <PropAnchor/>           follows the RightHand world transform each frame
            └─ <IdCard/> | <Tablet/> | <Certificate/> | <Laptop/> | <Diploma/> | <Phone/>
```

**Data flow:** `IntersectionObserver` → zustand `activeSection` (changes only on
section change) plus a `progressRef` (written every scroll, never stored in React
state) → `AvatarController` reads both inside `useFrame`.

**Animation state machine:** `IDLE → REACHING → PRESENTING → RETRACTING → TRANSITIONING → REACHING …`.
A new `activeSection` during any state sets the *target* prop. The controller always
retracts the current prop before reaching with the latest target, so stale
transitions are dropped and the latest section wins.

**Rules:**
- Motion animates the DOM; `useFrame` plus quaternion slerp animates 3D. They never
  touch the same property.
- No React re-renders per frame. Everything per-frame goes through refs.
- Never re-parent GLB bones. Props copy the hand's `getWorldPosition` and
  `getWorldQuaternion`, plus a per-prop local offset.
- Dispose geometries and materials on unmount. `dpr={[1, 2]}` (lightweight mode
  uses `[1, 1.5]` and no shadows).
- `prefers-reduced-motion`: props swap without the arm reach, and idle breathing is
  turned off.

## 5. Folder layout

```
src/
  app/            layout.tsx, page.tsx, globals.css (tokens), opengraph-image (P7)
  config/         sections.ts — ordered section registry shared by DOM and 3D
  data/           portfolio.ts — typed content (P2)
  components/
    layout/       SiteNav, Footer (P2)
    sections/     Intro, Experience, Certifications, Projects, Education, Activities, Contact (P2)
    ui/           Button, Tag, Eyebrow, etc. (P2)
  three/
    Scene.tsx, SceneMount.tsx, WebGLFallback.tsx   (P3)
    avatar/       Avatar.tsx, rigConfig.ts, skeletonDiagnostics.ts (P3–P4)
    controller/   AvatarController.ts, states (P4)
    props/        IdCard, Tablet, Certificate, Laptop, Diploma, Phone (P5)
  lib/            store.ts (zustand), useSectionObserver.ts (P6)
  styles/         tokens3d.ts
public/
  models/avatar.glb
  resume.pdf
```

## 6. Content inventory (from `Kollol-Backend-Developer-Resume.pdf`)

**Available:** name, contact details, LinkedIn and GitHub, skills, four roles with
bullet points (Technovative, Dorik, Syntaxive, Appifylab), education (Leading
University, B.Sc CSE, CGPA 3.35, bus-tracking project), two certifications/programs,
one leadership role (Leading University Computer Club VP).

**Missing, so these will be `[PLACEHOLDER]` in Phase 2 until provided:**
- Featured projects: names, descriptions, architecture notes, GitHub and live URLs.
  The resume has no project section.
- Certification credential IDs and verification links.
- Awards, hackathon results, volunteering beyond the computer club.
- Availability status and a one-line tagline or summary in Kollol's own words.
- Whether to show the phone number and street address publicly. Default: no, only
  city and country plus email.

## 7. Arm animation (Phase 4)

- **Poses** (`src/three/controller/poses.ts`) are written as avatar-space directions
  for each arm segment, plus a palm-facing direction and a finger curl. They are
  solved into bone rotations once at load, starting from the GLB rest pose. That
  rest pose is cached on `scene.userData`, so hot reloads never compound.
- **Controller** (`src/three/controller/AvatarController.ts`) is plain TypeScript with
  no per-frame allocation. The arm position is one continuous value `reach` (0 = idle,
  1 = presenting), and the prop has its own `prop` value. States only change which way
  those values move, so any new target can interrupt at any time, and the last one set
  wins. When swapping, the arm lowers to 40% while the old prop shrinks to 0, then the
  new prop is swapped in.
- **Timing:** reach 0.7 s, retract 0.5 s, prop in 0.45 s, prop out 0.3 s
  (`motion3d` in tokens3d).
- **Additive layers:** chest and spine breathing, a slow head sway, and a
  glance toward the hand that scales with `reach`.
- **Reduced motion:** the arm snaps between poses, the prop still scales in,
  and there is no breathing or sway.
- **Debug (`?debug=rig`):** keys `1`–`6` select section props and `0` clears.
  `window.__avatar` is the controller, and a brass arrow shows the palm normal.

## 8. Presentation props (Phase 5)

| Section | Prop | File | Content source |
|---|---|---|---|
| 01 Intro | Identity card | `props/IdCard.tsx` | `profile` name, title, location, GitHub |
| 02 Experience | Tablet | `props/Tablet.tsx` | first 4 `experience` roles |
| 03 Certifications | Framed certificate | `props/Certificate.tsx` | `certifications[1]` (Microsoft) |
| 04 Projects | Laptop | `props/Laptop.tsx` | `projects[0]` name and stack |
| 05 Education | Hardcover book | `props/Book.tsx` | `education[0]` |
| 06 Activities | Phone | `props/Phone.tsx` | first `leadership` activity |

- Geometry is extruded and bevelled (`Plate`), with inset glass and screens (`Panel`),
  a hollow frame, and a page block. Text is drei `<Text>` with local WOFF fonts in
  `public/fonts` (OFL licences included), so there are no CDN requests.
- **Attachment** (`props/PropStage.tsx`): after the controller poses the bones each
  frame (`controller.onAfterUpdate`), we read the hand's world transform, build a palm
  frame (palm normal, finger direction, thumb side) and place the prop on it at the
  per-prop offset in `props/registry.ts`. The prop turns to face the camera, then
  applies its tilt. The GLB hierarchy is never touched.
- All six props stay mounted and hidden, so text and geometry are built once and a swap
  never stalls. R3F disposes their JSX geometries and materials when the canvas unmounts.
- **Camera** (`CameraRig.tsx`): a wide full-body shot when the hand is empty, and a
  medium chest-up shot whenever a prop is in hand. It follows "has a prop", not arm
  height, so swaps don't pump the camera.
- **Lightweight mode** (`quality.ts`): low-memory, few-core, save-data or touch devices
  get DPR ≤ 1.5 and coarser bevels and curves.
- **Debug (`?debug=rig`):** `window.__camOverride = { pos, target }` pins the camera for
  close inspection, and `null` releases it.

## 9. Scroll sync (Phase 6)

- **`ScrollSync`** (DOM, works without 3D): the active section is the last one whose
  top has crossed the middle of the viewport, or Contact at the very bottom of the page.
  An IntersectionObserver (a zero-height line across the middle) plus a passive scroll
  listener feed a single read per animation frame.
- **`useScrollStore`** (zustand) holds `active` and changes only when the section
  changes. **`scrollProgress`** is a plain mutable object, `{ overall, section }`,
  written every scroll frame and read directly by the 3D loop, so React never re-renders.
- **`ScrollBridge`** (3D): passes `active` to the controller's prop target only after it
  has held for **160 ms** (`SETTLE_MS`). Sections flown past during fast scrolls or anchor
  jumps never start a reach. The controller's own interruptibility covers everything else.
- **Nav:** the active link gets `aria-current="location"`, an accent index and a hairline
  underline.
- **Camera drift:** within each section the shot eases up to ±4 cm sideways with reading
  progress (`camera.drift`). It's off with reduced motion.
- **Debug (`?debug=rig`):** `window.__scrollStore` is exposed for timing tests.

## 10. Motion, SEO, accessibility and mobile (Phase 7)

- **Mobile and tablet 3D:** below `lg`, the stage is a fixed band under the nav
  (`--stage-h: 30svh`) with its own closer camera shot (`camera.presentBand`, chosen
  when aspect > 1.2). The **3D** button in the nav hides the band and unmounts the
  canvas, so there's no GPU work and no model download. The choice persists in
  `localStorage`, and the band defaults to hidden on data-saver connections. The
  reading line for section detection is the middle of the area below the band.
- **DOM motion** (`motion`): `Reveal` fades content up on scroll. Server HTML is fully
  visible (idle → shown), and only content below the fold is hidden, so there's no flash
  and it works without JS. The hero uses a pure-CSS staggered `rise`. There's also a
  scroll cue, a nav progress hairline (direct transform, no re-renders), and a desktop
  stage caption that crossfades the presented prop's name. All of it respects
  `prefers-reduced-motion`.
- **SEO:** full `metadata` (title template, description, canonical, Open Graph profile,
  Twitter large card, robots), `opengraph-image.tsx` (1200×630, site fonts),
  `sitemap.ts`, `robots.ts`, `icon.svg`, and schema.org `Person` JSON-LD built only from
  real data. **Set `NEXT_PUBLIC_SITE_URL` in production**; it falls back to
  `http://localhost:3000`.
- **Accessibility:** landmarks are header/nav, main, footer and aside (decorative,
  `aria-hidden`). The skip link targets a focusable `<main>`. The mobile menu moves focus
  in on open and returns it on Escape. The 3D toggle has a fixed name with `aria-pressed`.
  Active section uses `aria-current`. Small text meets AA contrast.

## 11. Production hardening (Phase 8)

- **Model:** compressed with gltf-transform (meshopt geometry, WebP textures), 4.21 MB → 1.16 MB.
  Bone names, hierarchy and meshes were verified identical. Each mesh now has its own `Skin`
  entry, but they all bind the same 52 bones. `useGLTF(url, false, true)` enables the bundled
  meshopt decoder; Draco stays off, so drei never fetches a decoder from a CDN.
- **3D fonts:** subset to Latin and kerning only (177 KB → 90 KB). `configureTextBuilder` points
  troika's default font and its missing-glyph fallback at same-origin URLs, so text rendering never
  calls Google Fonts or jsDelivr.
- **Loading:** `SceneMount` waits for `load` plus `requestIdleCallback` (2 s cap) before mounting
  the canvas.
- **Motion:** `LazyMotion` + `m` with `domAnimation` (strict) and `MotionConfig reducedMotion="user"`.
  Motion's core is still about 50 KB gzip.
- **Bundle (gzip):** initial JS about 226 KB (React DOM 69, Next runtime about 85, motion about 50,
  app). The lazy 3D chunk is 331 KB, plus the model at 1.1 MB and fonts at 90 KB.
- **404:** `app/not-found.tsx` follows the site design and is marked `noindex`.
- **Fallback caption:** the stage caption hides whenever the no-WebGL panel is showing.
- **Known noise:** `THREE.Clock` deprecation warning from R3F 9.8 running on three r187. It's harmless
  and will be fixed upstream.

## 12. Content as JSON, ID card, packaging

- **Content:** `content/portfolio.json` (with `portfolio.schema.json` for editor validation) is the
  single source of content. `src/data/portfolio.ts` loads it, validates every field (build fails with
  the exact field path), fills defaults (email social link, laptop screen from `stack`, book cover
  from `degree`, phone badge from initials) and exports the typed `portfolio` object plus selectors
  (`featured`, `careerStartYear`, `displayUrl`). Section headings use `*word*` for the accent
  (`Emphasis`).
- **ID card** (`components/ui/IdBadge.tsx`): portrait CSS-3D card on a lanyard in the intro. It flips
  with a motion spring (`rotateY`) on mouse hover and toggles on click/tap, with a real `aria-pressed`
  button for keyboards. Focusing a back-side link flips it to the back. It sways on its lanyard
  (CSS, off for reduced motion). It sits beside the actions via a container query.
- **Packaging:** `npm run package` → `release/portfolio-upload.zip` (source only). Build-time packages
  (Tailwind, TypeScript, types) are in `dependencies`, so installs that skip devDependencies still
  build. `engines.node >= 20.9`.

## 13. Old-glibc hosting (Hostinger)

Hostinger's build servers have glibc < 2.29. `@next/swc-linux-x64-gnu@16.4.5` needs GLIBC_2.30, so
the native compiler fails to load, and loading `next.config.ts` (which needs SWC) crashes. Tailwind's
native parts (`@tailwindcss/oxide`, `lightningcss`) need only GLIBC_2.14 and work there. Fix:
`@next/swc-wasm-nodejs` (exact version match) for the automatic WASM fallback, `next build --webpack`
(Turbopack has no WASM support), `next.config.mjs`, and Tailwind via `@tailwindcss/postcss`. Verified
with `NEXT_TEST_WASM=1 npm run build` (`loadBindings().isWasm === true`). Node 22 is required.

## 14. Dashboard, blog and SEO

- **Runtime content:** `src/content/store.ts` reads and writes JSON in `CONTENT_DATA_DIR` (default `.data/`),
  seeded from `content/*.json`. Reads are `"use cache"` with tags (`content`, `blog`), and Server Actions call
  `updateTag` after a save. Live posts use `cacheLife("hours")` so scheduled posts appear on time.
- **Auth:** scrypt password hash in an env var, an HMAC-signed httpOnly cookie on `/admin`, and a login
  throttle. `src/proxy.ts` guards `/admin`, and pages and actions re-verify the session.
- **Blog:** `src/data/blog.ts` (model and validation), `src/content/markdown.ts` (marked: escaped HTML,
  heading ids, `{nofollow newtab sponsored}` link options, link and image extraction), and
  `analyzeArticle` in `seoAnalysis.ts`.
  - Pages are `app/blog` (index, `[slug]`, OG image, RSS), plus `app/llms.txt` and `app/media/[name]`.
  - `[slug]` reads params inside `<Suspense>` (ISR with Cache Components), so posts published after the
    build render on first visit and are then cached.
  - The proxy answers unknown, draft and scheduled slugs with a real 404 before streaming starts.
