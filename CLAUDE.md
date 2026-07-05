# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                                    # Dev server at http://localhost:3000
npm run build                                # Production build
npm test                                     # Run all Jest tests (CRA / jsdom)
npm test -- --testPathPattern=Contact        # Run a single test file by name
npm test -- --watch                          # Interactive watch mode
```

## Architecture

**Single-page React 18 portfolio app** (Create React App, no Next.js). React Router v6 defines one route (`/`) that renders `Home.js`.

### Design System — "WORKING PRINT"
The site is presented as an **engineer's drawing set drafted on the void of space**: white-ink drafting linework, ruled tables, and title blocks printed directly over a black starfield. Drafting conventions carry the information architecture — the hero is the **cover sheet** with a drawing index, Skills is a **bill of materials**, Experience is the **revision table**, deployed projects carry an **AS BUILT** stamp, Contact is a **transmittal form**, and the footer is the closing **title block**. Every section is a numbered sheet (`SHT 02/06`).

- **Display font**: `Anton` (single weight 400 — strong, minimal; sheet titles, hero name, role/project headings; always uppercase with slight positive tracking)
- **Annotation font**: `Sometype Mono` (labels, bands, tables, nav, form inputs — `--font-mono`)
- **Prose font**: `Archivo` (reading paragraphs — `--font-prose`)
- **Palette**: black paper + pale ink + one accent, the **checker's red pencil** (`--red`). Both themes are black ("we are in space"); the toggle shifts ink temperature, not the sky: Professional = blue-black paper `#05070d` with cool ink `#dde8f4`, Personal = warm black `#080706` with ivory ink `#f0e8d8`.
- **SHT tags**: CSS counters on `main > div` render a bordered `SHT NN` box via `.section-container::before`; the same counter fills `.sheet-band-sht` in each section's header band, so the two can never disagree.

### Rendering & Animation Stack

- **Canvas** (`SpaceBackground.js`) — 225 procedural stars across 3 depth layers with mouse parallax, scroll drift, twinkling, and shooting stars, in the ink color (`--ink-rgb`). In **Professional** theme it animates 3D-wireframe spacecraft (Saturn V, Falcon 9 — bodies of revolution, depth-shaded edges) on curved arcs with flame + smoke, plus a hero-centered **3D supernova** (`drawSupernova`) at `W*0.5, H*0.72`: ejecta shell, SN 1987A **triple-ring** (equatorial bead-ring + two polar rings), nebular **filaments**, corona rays, and periodic **light echoes**, all projected with a shared spin+tilt frame (`rot3`) so near-side features draw in front of the core. It **detonates on load** (and on each return to Professional) via the `burstT` 0→1 clock. In **Personal** theme it crossfades (`personalT`) to a procedural Earth scene (`drawEarthScene`): day/night globe with vector-silhouette continents (`LAND_SHAPES`), drifting **cloud decks**, city lights, orbiting Moon, low-orbit **satellite**, and a geocentric planet ring driven by scroll. A **drafting overlay** inks in over both scenes once settled: dashed construction circles and `drawCallout` leader-line labels (`EJECTA FIELD`, `SHOCK FRONT` in red, `TERRA — HOME`, `LUNA`, `SOL`) whose targets ride the scene rotation. Canvas ink colors come from `--ink-rgb` / `--red-rgb` (re-read on `data-theme` mutation). **Reduced motion**: a `matchMedia('(prefers-reduced-motion: reduce)')` flag freezes the animation clock (`anim`), skips rocket/shooter spawns, and snaps `burstT`/`personalT` — scroll- and pointer-driven movement stays.
- **Drafting crosshair cursor** (`Home.js`) — two full-viewport hairlines track the pointer instantly; a lagged **detail bubble** (lerp `t=0.2`) with a red center prick follows, expanding on link/button hover. Hidden on touch devices.
- **Framer Motion** — hero entrance, section scroll reveals, Hobbies sheet-flip. `Home.js` wraps everything in `MotionConfig reducedMotion="user"`.
- **React Scroll** — smooth anchor navigation (drawing index, navbar, mobile index)
- `GrainOverlay.css` — paper tooth via SVG `feTurbulence` + faint uneven-exposure blotches, fixed at z-index 10
- **Fixed sheet frame** (`Home.css` `.sheet-frame`) — a 10px-inset drawing border with fold ticks, fixed above content (z 40, pointer-events none)

### Layout Flow
`App.js` → `Home.js` (global `theme` state, IntersectionObserver section tracking, crosshair rAF loop) → renders `Navbar`, then `Hero` (receives `sections` for the cover-sheet drawing index) + a theme-dependent section set + `Contact`.

The section set is the `SECTIONS` config in `Home.js`. `Hero` and `Contact` bookend both themes; the middle slots swap by theme (slots stay position-aligned so sheet numbers 01–06 never shift):

| Slot | Professional | Personal       |
|------|--------------|----------------|
| 1    | `Skills`     | `About`        |
| 2    | `Projects`   | `Volunteering` |
| 3    | `Experience` | `Experience` (shared) |
| 4    | `Resume`     | `Hobbies`      |

`Home.js` renders `SECTIONS[theme]` into `<div id={s.id}>` wrappers and passes the same list to `Navbar` as `links` (which appends a static `contact` link). The IntersectionObserver effect depends on `theme` so it re-observes after a swap.

Background z-index stack: `base-bg` (−3, radial nebular lift) → `SpaceBackground` canvas (−2) → content → `sheet-frame` (40) → `grain-overlay` (10, visually above content but below frame chrome due to stacking).

### Theming (Professional / Personal)
Both prints share the **black paper**; `src/theme.css` defines cool-ink `:root` tokens and a warm-ink `[data-theme="personal"]` override. Key variables:
- `--paper`, `--ink`, `--ink-strong`, `--ink-dim`, `--ink-faint`, `--red` — primary tokens
- `--paper-rgb`, `--ink-rgb`, `--red-rgb` — RGB triplets for `rgba()` usage
- `--font-display` (Anton), `--font-mono` (Sometype Mono), `--font-prose` (Archivo)
- Legacy aliases (`--bg`, `--text`, `--accent`, `--border`, `--font-body`, etc.) map onto the ink tokens for backward compat

`Home.js` holds the `theme` state (`'professional'` | `'personal'`, default professional), sets `data-theme` on `document.documentElement`, and persists it to `localStorage('site-theme')`. `SpaceBackground.js` reads `data-theme` via a `MutationObserver` to drive the rocket/Earth swap and re-read ink colors. The Navbar toggle is styled as a red **RE-PRINT** stamp.

### Section Presentation (shared drafting chrome in `index.css`)
- `SectionHeader` (`ui/SectionHeader.js`) — every section opens with a `.sheet-band` (DWG AL-26 box · SHT counter · rule · content-derived readout) then the Anton `.section-title`. Sections pass `title` / `meta` / `subtitle`.
- `.rule-table` + `.rule-table-head` — shared ruled-table chrome used by Skills (`.bom-*`), Experience (`.rev-*`), Volunteering (`.vol-*`)
- `.btn-primary` — red stamp button (2px red border, hard offset shadow); `.btn-secondary` — quiet ink outline
- Experience REV numbers count **down** from latest (`experiences.length - idx`); Projects detail panels use callout bubbles `A–E` and a `MATL` strip; the fifth (odd) panel spans the full grid row

### SpaceBackground — Spacecraft System
Spacecraft are 3D wireframes: a nose→tail profile of `[axial, radius]` rings (`SATURN_PROFILE`, `FALCON_PROFILE`) spun into a mesh by `buildCraft`, plus flat appendages (fins/grid fins/legs). At draw time `orient()` builds a velocity-derived basis (with `pitch` out-of-plane tilt and continuous `roll`), `projVert` projects each vertex, and edges are depth-sorted and stroked — near edges bright, far edges dim; the engine-end ring and appendages stroke in red. Each spawned rocket gets `speed` and `curve` (rad/s, `rand(-0.18, 0.18)`); the update loop applies `r.angle += r.curve * dt` for smooth arcs.

### Contact Form
`Contact.js` uses EmailJS via environment variables (`REACT_APP_EMAILJS_SERVICE_ID`, `REACT_APP_EMAILJS_TEMPLATE_ID`, `REACT_APP_EMAILJS_PUBLIC_KEY`). No backend. Keep the input placeholders (`Your Email` / `Subject` / `Your Message`) and the `Send Message` button text — tests match them.

### Testing Notes
Tests use `@testing-library/react` with jsdom. Mock patterns:

```js
// Framer Motion — most tests expose ONLY motion.div (Hobbies also motion.article).
// Use motion.div in components unless you update the test's mock.
jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef(({ children, initial, whileInView, viewport, transition, ...props }, ref) =>
      <div ref={ref} {...props}>{children}</div>
    ),
  },
}));

// IntersectionObserver — required for Home.js
global.IntersectionObserver = jest.fn().mockReturnValue({
  observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
});
```

Component tests also mock `./ui/TextScramble` (legacy; only matters if a component imports it). `SpaceBackground` uses Canvas 2D APIs unavailable in jsdom — mock it as `() => <canvas />` in any test that renders `Home`. Other contracts tests rely on: section titles are `h2` with a trailing period (`Skills.`), Volunteering orgs are `h4`, Projects renders exactly 7 links, Resume exactly 2, Hobbies has `Previous hobby`/`Next hobby` buttons that cycle `h3` names.

### Key Files
- `src/Pages/Home/Home.js` — global `theme` state, `SECTIONS` config, IntersectionObserver tracking, crosshair cursor rAF loop, `MotionConfig`, sheet frame markup
- `src/Components/ui/SectionHeader.js` — shared sheet band + title header used by all sections
- `src/Components/SpaceBackground.js` — starfield, wireframe spacecraft, supernova + Earth scenes, drafting callout overlay, reduced-motion handling
- `src/Components/Hero.js` — cover sheet: split name (`ANTHONY` solid / `LE` outline stroke), drawing index (from `sections` prop), title block with live Ottawa clock
- `src/theme.css` — all design tokens (cool/warm ink prints on black)
- `src/index.css` — font imports, reset, `.sheet-band`, `.rule-table`, stamp buttons, SHT counter tags, focus + reduced-motion rules
