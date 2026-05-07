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
- **Base**: near-black `#09090b` dark / warm cream `#f5f4ef` light — binary toggle, no section-by-section transitions
- **Ghost section numbers**: CSS counters on `main > div` render auto-numbered `::before` on `.section-container` at low opacity

### Rendering & Animation Stack

- **Canvas starfield** (`SpaceBackground.js`) — 225 procedural stars across 3 depth layers with mouse parallax, scroll drift, twinkling, and shooting stars. Also animates spacecraft (Saturn V, Space Shuttle, Falcon 9) flying across the screen on curved arcs with engine flame and smoke particle trails. Reads `--text-rgb` to auto-invert in light mode.
- **Custom cursor** (`Home.js`) — lagged ring (lerp `t=0.13`) + instant dot, both `requestAnimationFrame`-driven. Ring expands on hover over links/buttons. Hidden on touch devices.
- **Framer Motion** — hero entrance animations (staggered slide-in) and section scroll reveals
- **React Scroll** — smooth anchor navigation between sections
- `GrainOverlay.css` — film grain texture via SVG `feTurbulence`, fixed at z-index 10

### Layout Flow
`App.js` → `Home.js` (global `mode` state, IntersectionObserver section tracking, cursor rAF loop) → renders: `Navbar`, `Hero`, `Skills`, `Projects`, `Experience`, `Resume`, `Contact`

Background z-index stack: `base-bg` (−3, solid color) → `SpaceBackground` canvas (−2) → content → `grain-overlay` (10).

### Theming
`src/theme.css` defines two states: default (dark) and `[data-mode="light"]`. Key variables:
- `--bg`, `--text`, `--text-dim`, `--border`, `--accent` — primary tokens
- `--bg-rgb`, `--text-rgb`, `--accent-rgb` — RGB triplets for `rgba()` usage
- `--font-display`, `--font-body` — font stack references
- Legacy aliases (`--bg-color`, `--text-main`, etc.) kept for backward compat

`data-mode` is set on `document.documentElement` by `Home.js`; persisted to `localStorage`.

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
- `src/Pages/Home/Home.js` — global `mode` state, IntersectionObserver section tracking, custom cursor rAF loop
- `src/Components/SpaceBackground.js` — canvas starfield + spacecraft animation system (CRAFT registry, curved paths, smoke particles)
- `src/Components/Hero.js` — split-name hero (`ANTHONY` solid / `LE` outline stroke)
- `src/theme.css` — all design tokens
- `src/index.css` — font import, reset, shared `.section-container` / `.btn-*` / ghost number styles
