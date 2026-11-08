# Kollol Chakraborty — 3D Portfolio

A scroll-driven editorial portfolio. The left column tells the story in plain, accessible HTML.
On the right, a 3D avatar hands the visitor a different object for each section: an ID card,
a tablet, a framed certificate, a laptop, a book and a phone.

**Stack:** Next.js 16 (App Router, every route pre-rendered as static), React 19, TypeScript (strict),
Tailwind CSS v4, three.js + React Three Fiber 9 + drei 10, motion (DOM only), zustand.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm run start   # production build
npm run lint
npx tsc --noEmit
```

## Dashboard & blog (`/admin`)

A password-protected dashboard for editing the home page, writing blog articles and managing SEO.
Changes go live immediately, with no rebuild.

**Set up login** (once):

```bash
npm run admin:setup            # prints ADMIN_USERNAME, ADMIN_PASSWORD_HASH, SESSION_SECRET
npm run admin:setup -- --write # also saves them to .env.local for local use
```

On Hostinger, add those three values plus `CONTENT_DATA_DIR` (a folder **outside** the app, e.g.
`/home/USER/portfolio-data`) under your Node.js app → Environment variables. Variables set there apply to
both the build and the running site, so dashboard edits survive redeploys.

**Home page:** Dashboard → Home page → Profile, Experience, Projects… Every field is editable, with
version history and one-click restore. *Home page SEO* gives a Rank Math-style score for the home page.

**Blog:** Dashboard → Blog → *New post*.

- Write in Markdown with the toolbar (headings, lists, quotes, code, tables, images) and a live preview.
- **Internal links (inbound):** select text → *Link* (⌘K) → *Internal* → pick a post or home page section.
  The *Links* panel also suggests internal links based on other posts' keywords.
- **External links (outbound):** *Link* → *External* → URL, with optional `nofollow` or `sponsored`.
  They open in a new tab with `rel="noopener noreferrer"`. You can also type `[text](url){nofollow}` by hand.
- **Per-article SEO:** focus and secondary keywords, SEO title (pixel meter), meta description, slug,
  canonical and noindex. A live score out of 100 comes from 24 checks, alongside a Google preview.
- **Published pages include:** breadcrumbs, a single H1, Published/Updated dates, reading time, a table of
  contents, FAQ, an author box, "Continue reading", and structured data (BlogPosting, BreadcrumbList,
  FAQPage). Articles also get a share image, an RSS feed (`/blog/rss.xml`), sitemap entries and `/llms.txt`.
- **Scheduling:** set a future publish date and click *Schedule*. Drafts and scheduled posts return a real 404.
- **Images:** uploads up to 5 MB (JPG/PNG/WebP/AVIF/GIF) are stored in the data folder and served from `/media/…`.

**Data:** home page content, posts (`blog.json`), images (`media/`) and backups (`revisions/`) all live in
the data folder. Use *Settings → Download backup* before risky changes.

## Editing content

**All content lives in [`content/portfolio.json`](content/portfolio.json):** profile, ID card photo,
section headings, skills, experience, certifications, projects, education, activities and the
closing line. The page, the ID card, the 3D props, the share image and the search data all read
from it.

- Open it in VS Code. The `"$schema"` line gives autocomplete, field descriptions and red underlines
  for mistakes (from `content/portfolio.schema.json`).
- In section titles, wrap a word in `*asterisks*` for the brass italic accent: `"Selected *work*."`
- Text starting with `[PLACEHOLDER]` shows as a dashed **TBD** box. Replace it with real text.
- Optional links (`github`, `live`, `verifyUrl`) can be `""` until you have them.
- `"featured": true` chooses which project appears on the 3D laptop and which certificate is framed.
- If something is wrong (a missing field, a number where text is expected), `npm run build` stops
  with a message naming the exact field, for example
  `content/portfolio.json → experience[2].start must be non-empty text`.
- The site is built ahead of time, so **content changes need a rebuild** (`npm run build`, or redeploy).

| You want to change… | Edit |
|---|---|
| Any text, role, project, link, heading | Dashboard → Home page (or `content/portfolio.json` before first save) |
| ID card photo | Put the image in `public/images/` and set `profile.photo` |
| Section order, which prop each section shows | `src/config/sections.ts` |
| Colours, type scale, spacing | `src/app/globals.css` (Tailwind v4 `@theme`) |
| 3D lighting, materials, camera, timing | `src/styles/tokens3d.ts` |
| Where a prop sits in the hand | `src/three/props/registry.ts` (`offset`, `tilt`, `scale`) |

## Environment variables

| File | Committed? | Used for |
|---|---|---|
| `.env.example` | Yes | Template listing every variable. Copy it when starting fresh. |
| `.env.production` | Yes | Values for production builds (`npm run build`), including on Hostinger. Public values only. |
| `.env.local` | **No** (git-ignored) | Your machine only; overrides the others. Put secrets here if you ever add any. |

There is one variable today:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com   # no trailing slash
```

It's used for canonical links, social preview images and the sitemap. Variables starting with
`NEXT_PUBLIC_` are baked into the site **when it is built** and are visible to anyone, so never put
secrets in them, and rebuild after changing them.

## Deploying to Hostinger (Node.js app)

1. Set your real domain in `.env.production`.
2. Create the upload zip:
   ```bash
   npm run package
   ```
   This writes `release/portfolio-upload.zip` (about 2–3 MB). It leaves out `node_modules`, `.next`
   and `.git`, which Hostinger regenerates or doesn't need. That's what made the folder about 1 GB.
3. In hPanel: **Websites → Add website → Node.js Apps → Upload your website files** and upload the zip.
4. Build settings (Hostinger usually detects them for Next.js):
   - **Node version:** **22** (required; set it in the Node.js app settings)
   - **Install:** `npm install`  ·  **Build:** `npm run build`  ·  **Start:** `npm start`
   - **Environment variables:** optional. You can set `NEXT_PUBLIC_SITE_URL` here instead of in
     `.env.production`; a value set here wins.
5. Deploy, then open the site and check that the 3D stage loads and the resume downloads.

**Why the build uses webpack and a WASM compiler:** Hostinger's servers run an older Linux
(glibc < 2.29). Next.js 16's native compiler (SWC) needs glibc 2.30, so it can't load there.
The project therefore:
- ships `@next/swc-wasm-nodejs` (pinned to the exact `next` version), which Next uses automatically
  when the native compiler can't load;
- builds with webpack (`next build --webpack` in `npm run build`), because Turbopack can't run on WASM;
- uses `next.config.mjs` and `postcss.config.mjs` (plain JS, no compile step).

Local `npm run dev` still uses Turbopack. To reproduce Hostinger's compiler locally, run
`NEXT_TEST_WASM=1 npm run build`. **If you upgrade `next`, upgrade `@next/swc-wasm-nodejs` to the
exact same version.**

To update the site later, edit the content, run `npm run package` again and re-upload, or connect a
Git repository in hPanel.

## Assets

| File | Notes |
|---|---|
| `public/resume.pdf` | Linked from the nav, hero and contact section. Replace it to update. |
| `public/images/portrait.webp` | ID card photo (480×600 WebP, cropped from the Avaturn render). |
| `public/models/avatar.glb` | Avaturn export, **compressed** (4.2 MB → 1.1 MB, meshopt + WebP). |
| `public/fonts/*.woff` | Subset Geist, Geist Mono and Instrument Serif for 3D text (OFL licences included). |

### Replacing the avatar

Compress the new export the same way, so the bone names and skin are kept and the file
shrinks by about 70%:

```bash
npx @gltf-transform/cli@4 optimize input.glb public/models/avatar.glb \
  --compress meshopt --texture-compress webp --texture-size 1024 \
  --simplify false --join false --instance false --flatten false
```

Then open `/?debug=rig` and check the console report. A Mixamo-style rig (`RightArm`,
`RightForeArm`, `RightHand`, …) works as is. Other naming schemes are matched by the
fallback patterns in `src/three/avatar/rigConfig.ts`. The poses assume a T-pose at rest.

## How it works (short version)

- **Page:** Server Components render all content. The site works fully without JavaScript or WebGL.
- **Scroll:** `ScrollSync` finds the section crossing the reading line and stores it in zustand.
  `ScrollBridge` passes it to the avatar after it has held for 160 ms, so sections you scroll past
  quickly never trigger a reach.
- **Avatar:** `AvatarController` is a plain-TypeScript state machine
  (`IDLE → REACHING → PRESENTING → RETRACTING / TRANSITIONING`). It blends poses solved once from
  the GLB's rest pose. Any new section can interrupt it, and the latest always wins.
- **Props:** each frame they follow the hand bone's world transform (a palm frame plus an offset)
  and turn to face the camera. The GLB's bones are never re-parented.
- **Loading:** the 3D bundle and model load only on the client, after the page is idle.
  Phones and tablets get a 3D band under the nav, and the **3D** button turns it off completely.
- **Fallbacks:** no WebGL, a failed model load or a lost GPU context each show a quiet panel instead.
  `prefers-reduced-motion` snaps the arm between poses and turns off breathing, drift and reveals.

Full details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Debug tools

| URL | What it does |
|---|---|
| `/?debug=rig` | Skeleton overlay, console rig report (`window.__avatarReport`), palm-direction arrow. Keys **1–6** present each prop, **0** lowers the arm. `window.__avatar` is the controller. `window.__camOverride = { pos, target }` pins the camera. |
| `/?quality=low` / `/?quality=high` | Force the lightweight or full 3D mode (render scale 1.5× vs 2×, geometry detail). |

## Validation (Phase 8)

Production build, `tsc --noEmit` and `eslint` pass with no errors.

Lighthouse on the production build:

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop | ~70 | 100 | 100 | 100 |
| Mobile | ~87–94 | 100 | 100 | 100 |

Paint metrics are strong: LCP 0.3 s on desktop and 0.9 s on mobile, with no layout shift.
The performance score is pulled down by blocking time from the 3D scene. Lighthouse renders
WebGL in software, which exaggerates this; real GPUs are much faster.
