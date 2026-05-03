# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at localhost:3000 (hot reload)
npm run build      # Production build to /build
npm test           # Jest test runner (watch mode)
```

To run a single test file:
```bash
npm test -- --testPathPattern="Contact.test.js" --watchAll=false
```

## Tech Stack

- **React 18** via Create React App (react-scripts) — no Next.js, no Vite
- **Framer Motion** — entrance animations using `whileInView` on most components
- **GSAP + ScrollTrigger** — scroll-based paint stroke animations in `PaintStrokeBackground.js`
- **react-scroll** — smooth in-page scroll linking between sections
- **react-pdf / pdfjs-dist** — resume PDF viewer
- **EmailJS (`@emailjs/browser`)** — contact form submission (credentials hardcoded in `Contact.js`)
- **CSS custom properties** for light/dark theming (no CSS-in-JS, no Tailwind)

## Architecture

`src/Pages/Home/Home.js` is the central orchestrator — it manages theme state, section tracking, and renders all components. There is only one page.

**Theme system:** `data-mode="light"|"dark"` is set on `document.documentElement` and persisted to `localStorage`. All color values are CSS variables defined in `src/theme.css`; switching themes is instant via attribute change.

**Scroll spy:** `Home.js` uses `IntersectionObserver` to track which section is in view and passes `activeSection` down to `Navbar` for highlighting.

**Section IDs** (used by both react-scroll and IntersectionObserver): `hero`, `skills`, `projects`, `experience`, `resume`, `contact`.

**PaintStrokeBackground:** GSAP/ScrollTrigger draws animated Bézier brush strokes on a `<canvas>` as the user scrolls. This is a complex component; scroll position maps to paint stroke reveal progress.

**Styling convention:** Each component has a co-located `.css` file. No shared component library. Responsive breakpoints and grain overlay (`GrainOverlay.css`) are global.

## Key Files

| File | Purpose |
|---|---|
| `src/Pages/Home/Home.js` | Layout, theme state, IntersectionObserver |
| `src/theme.css` | All CSS custom property definitions for both modes |
| `src/Components/PaintStrokeBackground.js` | GSAP canvas animation |
| `src/Components/Contact.js` | EmailJS credentials + form logic |
| `public/Resume_Anthony_Le.pdf` | Static resume asset served directly |
