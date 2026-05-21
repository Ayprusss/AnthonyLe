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

### Design System — "DEEP SIGNAL"
Cinematic dark-first editorial aesthetic.

- **Display font**: `Bebas Neue` (condensed — section titles, hero name, project/role headings)
- **Body font**: `IBM Plex Mono` (all body text, labels, nav links, form inputs)
- **Accent color**: `#ff6b2b` (electric amber-orange) — used sparingly for labels, active states, hover accents
- **Base**: near-black `#09090b` — single dark palette. The Navbar toggle switches **Professional ↔ Personal** (content + background), NOT colors. (A cream light mode was removed; both themes share the dark palette.)
- **Ghost section numbers**: CSS counters on `main > div` render auto-numbered `::before` on `.section-container` at low opacity

### Rendering & Animation Stack

- **Canvas starfield** (`SpaceBackground.js`) — 225 procedural stars across 3 depth layers with mouse parallax, scroll drift, twinkling, and shooting stars. In **Professional** theme it animates spacecraft (Saturn V, Space Shuttle, Falcon 9) flying across the screen on curved arcs with engine flame and smoke particle trails. It watches `data-theme`: in **Personal** theme it suppresses rockets, fades out the supernova bloom, and crossfades (`personalT`) to a procedural Earth scene. `drawEarthScene` renders a day/night globe whose continents are **vector silhouettes** (`LAND_SHAPES` lon/lat polygons, densified + orthographically projected onto the rotating sphere, far-side vertices clamped to the limb), shaded by a single sub-solar terminator overlay, with amber night-side city lights (`CITIES`), an orbiting Moon (near-edge-on orbit, passes in front of/behind Earth), and a corner Sun. Earth spin + Moon orbit are driven by both `now` and `pageScrollY`.
- **Custom cursor** (`Home.js`) — lagged ring (lerp `t=0.13`) + instant dot, both `requestAnimationFrame`-driven. Ring expands on hover over links/buttons. Hidden on touch devices.
- **Framer Motion** — hero entrance animations (staggered slide-in) and section scroll reveals
- **React Scroll** — smooth anchor navigation between sections
- `GrainOverlay.css` — film grain texture via SVG `feTurbulence`, fixed at z-index 10

### Layout Flow
`App.js` → `Home.js` (global `theme` state, IntersectionObserver section tracking, cursor rAF loop) → renders `Navbar`, then `Hero` + a theme-dependent section set + `Contact`.

The section set is the `SECTIONS` config in `Home.js`. `Hero` and `Contact` bookend both themes; the middle slots swap by theme (slots stay position-aligned so ghost numbers 01–06 never shift):

| Slot | Professional | Personal       |
|------|--------------|----------------|
| 1    | `Skills`     | `About`        |
| 2    | `Projects`   | `Volunteering` |
| 3    | `Experience` | `Experience` (shared) |
| 4    | `Resume`     | `Hobbies`      |

`Home.js` renders `SECTIONS[theme]` into `<div id={s.id}>` wrappers and passes the same list to `Navbar` as `links` (which appends a static `contact` link). The IntersectionObserver effect depends on `theme` so it re-observes after a swap.

Background z-index stack: `base-bg` (−3, solid color) → `SpaceBackground` canvas (−2) → content → `grain-overlay` (10).

### Theming (Professional / Personal)
Both themes share **one dark palette** — the toggle swaps content + background, not colors. `src/theme.css` defines the dark `:root` tokens only (the old `[data-mode="light"]` block was removed; an empty `[data-theme="personal"]` block is reserved for any future accent tweaks). Key variables:
- `--bg`, `--text`, `--text-dim`, `--border`, `--accent` — primary tokens
- `--bg-rgb`, `--text-rgb`, `--accent-rgb` — RGB triplets for `rgba()` usage
- `--font-display`, `--font-body` — font stack references
- Legacy aliases (`--bg-color`, `--text-main`, etc.) kept for backward compat

`Home.js` holds the `theme` state (`'professional'` | `'personal'`, default professional), sets `data-theme` on `document.documentElement`, and persists it to `localStorage('site-theme')`. `SpaceBackground.js` reads `data-theme` via a `MutationObserver` to drive the rocket/Earth swap.

### SpaceBackground — Spacecraft System

All spacecraft are defined in the `CRAFT` array inside `useEffect`. Each entry has:
- `scale`, `cx`/`cy` — SVG scale and rotation pivot (visual center of mass in SVG space)
- `tailD` — world-space px offset from pivot to flame/smoke origin
- `noseOffset` — radians **added to `r.angle`** so the SVG nose faces the travel direction. Formula: `noseOffset = -(SVG nose angle in screen coords)`. Nose-UP SVGs (−π/2) need `+π/2`; nose-RIGHT SVGs (0) need `0`.
- `hasFlame` — whether to draw the engine flame cone and emit smoke particles
- `draw(now)` — Path2D paint function; `ctx` and `starRgb` are captured from closure

Each spawned rocket gets `speed` and `curve` (rad/s angular velocity, `rand(-0.18, 0.18)`). The update loop applies `r.angle += r.curve * dt` then recomputes `vx`/`vy`, producing smooth arcing paths. Path2D objects are created once at `useEffect` init — never inside the draw loop.

### Contact Form
`Contact.js` uses EmailJS via environment variables (`REACT_APP_EMAILJS_SERVICE_ID`, `REACT_APP_EMAILJS_TEMPLATE_ID`, `REACT_APP_EMAILJS_PUBLIC_KEY`). No backend.

### Testing Notes
Tests use `@testing-library/react` with jsdom. Two consistent mock patterns appear throughout:

```js
// Framer Motion — strip animation props to avoid React warnings
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

`SpaceBackground` uses Canvas 2D APIs unavailable in jsdom — mock it as `() => <canvas />` in any test that renders `Home`.

### Key Files
- `src/Pages/Home/Home.js` — global `theme` state, `SECTIONS` config (Professional/Personal swap), IntersectionObserver section tracking, custom cursor rAF loop
- `src/Components/About.js` / `Volunteering.js` / `Hobbies.js` — Personal-theme sections (swap in for Skills / Projects / Resume). Volunteering models the `Experience.js` timeline.
- `src/Components/SpaceBackground.js` — canvas starfield + spacecraft animation system (CRAFT registry, curved paths, smoke particles)
- `src/Components/Hero.js` — split-name hero (`ANTHONY` solid / `LE` outline stroke)
- `src/theme.css` — all design tokens
- `src/index.css` — font import, reset, shared `.section-container` / `.btn-*` / ghost number styles
