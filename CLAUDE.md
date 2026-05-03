# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server at http://localhost:3000
npm run build    # Production build
npm test         # Run Jest tests (CRA)
```

## Architecture

**Single-page React 18 portfolio app** (Create React App, no Next.js). React Router v6 defines one route (`/`) that renders `Home.js`.

### Design System — "DEEP SIGNAL"
Cinematic dark-first editorial aesthetic.

- **Display font**: `Bebas Neue` (condensed, used for section titles, hero name, project/role headings)
- **Body font**: `IBM Plex Mono` (all body text, labels, nav links, form inputs)
- **Accent color**: `#ff6b2b` (electric amber-orange), used sparingly for labels, active states, hover accents
- **Base**: near-black `#09090b` dark / warm cream `#f5f4ef` light — binary toggle, no section-by-section transitions
- **Ghost section numbers**: CSS counters on `main > div` render auto-numbered `::before` on `.section-container` at low opacity

### Rendering & Animation Stack
- **Canvas starfield** (`SpaceBackground.js`) — 225 procedural stars across 3 depth layers with mouse parallax, scroll drift, twinkling, and shooting stars. Reads `--text-rgb` to auto-invert in light mode. Replaces the previous SVG/paint-stroke approach.
- **Custom cursor** (`Home.js`) — a lagged ring (lerp `t=0.13`) + instant dot, both driven by `requestAnimationFrame`. Ring expands on hover over links/buttons. Hidden on touch devices.
- **Framer Motion** — hero entrance animations (staggered slide-in) and section scroll reveals
- **React Scroll** — smooth anchor navigation between sections
- `GrainOverlay.css` — film grain texture via SVG `feTurbulence` filter, rendered fixed on top of everything at z-index 10

### Layout Flow
`App.js` → `Home.js` (global `mode` state, IntersectionObserver section tracking, cursor rAF loop) → renders: `Navbar`, `Hero`, `Skills`, `Projects`, `Experience`, `Resume`, `Contact`

The background stack (bottom to top): `base-bg` (z-index -3, solid bg color) → `SpaceBackground` canvas (z-index -2) → content → `grain-overlay` (z-index 10).

### Theming
`src/theme.css` defines two states: default (dark) and `[data-mode="light"]`. Key variables:
- `--bg`, `--text`, `--text-dim`, `--border`, `--accent` — primary design tokens
- `--bg-rgb`, `--text-rgb`, `--accent-rgb` — RGB triplets for `rgba()` usage
- `--font-display`, `--font-body` — font stack references
- Legacy aliases (`--bg-color`, `--text-main`, etc.) kept for backward compat

`data-mode` attribute is set on `document.documentElement` by `Home.js`. Preference persisted to `localStorage`.

### Navbar
Simplified — no pill toggle. `AL.` logo (Bebas Neue) + monospace nav links + plain text `LIGHT`/`DARK` button. Gains backdrop blur on scroll.

### Contact Form
`Contact.js` uses EmailJS directly (hardcoded service/template IDs). No backend.

### Key Files
- `src/Pages/Home/Home.js` — global state, section observer, custom cursor rAF loop
- `src/Components/SpaceBackground.js` — canvas starfield (3-layer parallax, shooting stars)
- `src/Components/Hero.js` — dramatic split-name hero (`ANTHONY` solid / `LE` outline stroke)
- `src/theme.css` — all design tokens
- `src/index.css` — font import, reset, shared `.section-container` / `.btn-*` / ghost number styles

### Current Branch: `space-redesign`
Full visual redesign underway. `PaintStrokeBackground.js` is unused (kept but not imported). SVG assets in `public/` are staged but not currently rendered — the starfield canvas replaced them. The `VANGOGH.md` / `VECTORVANGOGH.md` files document earlier design explorations.
