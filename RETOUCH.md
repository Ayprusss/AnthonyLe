# Paint-Stroke Canvas Background Overhaul

Replace the current `HeroRippleBackground` ripple-dot animation with a **canvas-white grain-textured background** and **scroll-triggered paint strokes** that progressively sweep across the page as the user scrolls.

> **Decisions confirmed by user:**
> - ✅ Keep dark/light toggle with adapted palettes per mode
> - ✅ Simplify theme.css to 2 states (no per-section background ramps)
> - ✅ Bold, opaque strokes — **oil paint** aesthetic, not watercolor
> - ✅ 8 strokes to start, tunable later

## Previous Architecture (What Changed)

The website previously used:
- **`HeroRippleBackground.js`** — A full-viewport `<canvas>` rendering animated dot particles that ripple outward. Only applied to the hero section. **Deleted.**
- **`theme.css`** — Per-section `data-section` / `data-mode` CSS vars that smoothly transition `--bg-color` as the user scrolls (12 state combos). **Simplified to 2 states.**
- **`Home.js`** — IntersectionObserver sets `data-section` on `<html>` as each section scrolls into view. **Still active for Navbar states.**
- **Framer Motion** — Used for component entry animations throughout. **Unchanged.**

---

## Tech Stack

### Library Choice: **GSAP + ScrollTrigger + HTML5 Canvas**

| Consideration | Details |
|---|---|
| **Why GSAP?** | Industry-standard animation engine. `ScrollTrigger` provides pixel-perfect scroll-scrubbed animations with `scrub: true`. Free for personal/commercial use (Webflow acquisition made all plugins free). |
| **Why Canvas over SVG?** | We want an organic, painterly, textured brush stroke — not a clean vector line. Canvas gives us per-pixel control for bristle textures, opacity variances, and splatter. SVG `stroke-dashoffset` draw-on is too clean/geometric for this effect. |
| **React integration** | `@gsap/react` provides the `useGSAP` hook — a drop-in `useEffect` replacement that handles animation cleanup automatically. |
| **Compatibility** | Framer Motion coexists fine with GSAP (Framer handles component enter/exit, GSAP handles the background canvas). |

**Installed via:**
```bash
npm install gsap @gsap/react
```

---

## Architecture

### Layer Stack

```
┌─────────────────────────────────────────────┐
│  PaintStrokeBackground (fixed, z-index: -2) │
│  Full-viewport <canvas> element             │
│  Draws oil-paint strokes on scroll          │
├─────────────────────────────────────────────┤
│  GrainOverlay (fixed, z-index: -1)          │
│  SVG feTurbulence filter for canvas texture  │
├─────────────────────────────────────────────┤
│  Page Content (z-index: 0+)                 │
│  Hero → Skills → Projects → Experience →    │
│  Resume → Contact                           │
│  (frosted-glass backdrop on cards/pills)    │
└─────────────────────────────────────────────┘
```

### Paint Stroke Rendering — Detailed Geometry

Each stroke is a **statically defined configuration object** in an array. Nothing is randomly generated at runtime — this gives full artistic control and deterministic results across reloads.

```js
const STROKES = [
  {
    // Bézier control points as % of viewport (0–1)
    path: [
      { x: -0.05, y: 0.3 },   // start (slightly off-screen left)
      { x: 0.25,  y: 0.15 },  // control point 1
      { x: 0.65,  y: 0.55 },  // control point 2
      { x: 1.05,  y: 0.4 },   // end (slightly off-screen right)
    ],
    color: '#C4593A',         // burnt sienna
    widthRange: [40, 70],     // brush tapers: px at start → px at end
    opacity: 0.55,
    startProgress: 0.05,      // begins drawing at 5% page scroll
    endProgress: 0.25,        // fully drawn by 25% page scroll
  },
  // ... 7 more stroke definitions
];
```

**How positions & paths are determined:**

1. **Viewport-relative coordinates** — All path points are defined as fractions of `(viewportWidth, viewportHeight)`. A point `{ x: 0.5, y: 0.3 }` means center-x, 30% down. On resize, these scale proportionally so strokes look correct on any screen.

2. **Cubic Bézier curves** — Each stroke has 4 control points forming a cubic Bézier. The two inner control points create the curve/arc:
   - Strokes 1, 3, 5, 7 → sweep roughly **left-to-right** at varying angles
   - Strokes 2, 4, 6, 8 → sweep roughly **right-to-left** for visual counterbalance
   - The control points are staggered vertically so strokes occupy different bands of the page

3. **Width tapering** — Each stroke has a `widthRange: [startPx, endPx]`. As we draw along the Bézier, `lineWidth` is linearly interpolated between these values, creating a natural brush taper (thick at the press point, thin at the lift). We subdivide the curve into ~120 tiny segments and draw each with its interpolated width.

4. **Scroll progress mapping** — Each stroke has `startProgress` and `endProgress` (0–1 of total page scroll). GSAP ScrollTrigger gives us the current scroll fraction. For a stroke, we compute:
   ```
   strokeFraction = clamp((scrollProgress - startProgress) / (endProgress - startProgress), 0, 1)
   ```
   Then we draw only the first `strokeFraction` portion of the Bézier. This creates the "painting on" effect.

5. **Overlap staggering** — Adjacent strokes have overlapping scroll ranges (e.g., stroke 1 is 5–25%, stroke 2 is 15–35%) so there's always a new stroke beginning while the previous finishes.

### Oil Paint Texture Technique

- **Higher base opacity**: 0.45–0.65 per stroke
- **Bristle texture**: After drawing each stroke, we overlay a noise pattern using `globalCompositeOperation: 'source-atop'`
- **Edge roughness**: Small seeded-random perpendicular offsets on each micro-segment for an irregular, hand-painted edge
- **Layered opacity**: Where strokes overlap, colors blend via alpha compositing, creating rich depth like layered oil glazes

### Color Palette — "Bold Oil"

| Stroke # | Color | Hex (Light Mode) | Hex (Dark Mode) | Scroll Range |
|---|---|---|---|---|
| 1 | Burnt Sienna | `#C4593A` | `#D4694A` | 5–25% |
| 2 | Raw Umber | `#8B6F47` | `#A0845C` | 15–35% |
| 3 | Viridian | `#4A8C6F` | `#5AA07F` | 25–50% |
| 4 | Yellow Ochre | `#C49A3C` | `#D4AA4C` | 35–55% |
| 5 | Prussian Blue | `#1B3A5C` | `#3B5A7C` | 45–65% |
| 6 | Cadmium Orange | `#D47A3A` | `#E48A4A` | 55–75% |
| 7 | Alizarin Crimson | `#8C2F3A` | `#AC4F5A` | 65–85% |
| 8 | Ultramarine | `#2C4A7C` | `#4C6A9C` | 75–95% |

---

## Files Changed

### New Files
- `src/Components/PaintStrokeBackground.js` — GSAP ScrollTrigger-driven canvas with oil-paint brush strokes
- `src/Components/GrainOverlay.css` — SVG feTurbulence grain texture overlay

### Modified Files
- `src/Pages/Home/Home.js` — Added PaintStrokeBackground, grain filter SVG, and grain overlay div
- `src/Components/Hero.js` — Removed HeroRippleBackground import and ripple-layer wrapper
- `src/Components/Hero.css` — Removed .hero-ripple-layer and .hero-ripple-canvas rules
- `src/theme.css` — Simplified from 12 section×mode combos to 2 states (dark/light)
- `src/index.css` — Updated root defaults to warm canvas-white palette
- `src/Components/Projects.css` — Added frosted-glass backdrop to project cards
- `src/Components/Skills.css` — Added frosted-glass backdrop to skill pills
- `src/Components/Resume.css` — Added frosted-glass backdrop to resume card
- `src/Components/Experience.css` — Updated timeline-dot border to semi-transparent

### Deleted Files
- `src/Components/HeroRippleBackground.js` — Replaced by PaintStrokeBackground

---

## Theme Tokens (After Simplification)

### Light Mode (`data-mode="light"`)
| Token | Value |
|---|---|
| `--bg-color` / `--canvas-bg` | `#FAF8F5` (warm canvas white) |
| `--text-main` | `#1a1a1a` |
| `--text-muted` | `#5c5c5c` |
| `--border-color` | `#e0ddd8` |

### Dark Mode (`data-mode="dark"`)
| Token | Value |
|---|---|
| `--bg-color` / `--canvas-bg` | `#1c1c1e` (charcoal) |
| `--text-main` | `#f0efeb` |
| `--text-muted` | `#a1a1a6` |
| `--border-color` | `#3a3a3c` |

---

## ✅ Resolved Issues

### 1. Paint strokes are visible on scroll (FIXED)
The paint strokes were previously hidden because the `body` and `#root` elements had an opaque background color. By setting their background to `transparent` in `index.css` and adding a dedicated `base-bg` layer at `z-index: -3` in `Home.js`, the canvas at `z-index: -2` is now visible.

### 2. Hero section background seam resolved (FIXED)
The visual mismatch between the Hero and subsequent sections was caused by the full-width override in `Home.css`. This has been removed, and the Hero section now shares the same `max-width: 1000px; margin: 0 auto;` structure as the rest of the site, creating a seamless background experience.
