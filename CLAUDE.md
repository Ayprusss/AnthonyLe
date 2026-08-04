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

### Design System — "SEVASTOLINK"
The site is a **Seegson personal terminal from Alien: Isolation** — a single-gun phosphor CRT running a station workstation. The boot scene is not an intro to a different-looking site; it is the same machine powering on. Terminal conventions carry the information architecture: the hero is the **index screen** with a **FOLDERS** column of outlined boxes; every section is a folder opening on an **inverse-video** header strip; a fixed **status bar** rides the top edge and a fixed **key legend** the bottom; deployed projects are flagged **ONLINE**; Experience is the **service record**; the footer signs off with `EOF · SESSION TERMINATED`.

**Three faces, three jobs, no overlap.** All self-hosted from `src/fonts/`, all declared `font-weight: 100 900` in `@font-face` so the browser never synthesises a bold — faux-bold smears a pixel face and thickens the others unevenly.

| Token | Face | Job |
|---|---|---|
| `--font-term` | `Jixellation` | What the **terminal draws**: bars, labels, nav, tables, section titles, buttons, the boot log. The only monospaced face, so column alignment lives here and nowhere else. |
| `--font-hv` / `--font-prose` | `Isolation` | What a **person wrote**: running prose only. |
| `--font-mark` | `Isolation` | The **boot plate** wordmark, set huge. |
| `--font-ident` | `Nostromo Cond` | What is **stamped on the hardware**: the `SEEGSON` ident in the status bar, nothing else. |

- **Jixellation never sets running prose** — it is crisp in a status bar and mush in a paragraph. This split inverts the game, whose chrome is Helvetica-ish and whose terminals are Jixellation.
- Isolation carries two roles because it has two weights of presence: set small it is a text face, set huge it is the heaviest display face available, which the plate needs. Nostromo is condensed and lightly stemmed — wrong for a plate (stretching it only widens the thin horizontals), right for a 34px bar. Nostromo is also effectively **caps-only**: its lowercase glyphs are capitals, so never set mixed case in it.
- **Isolation's `·` (U+00B7) is mapped to a wrong outline and renders as `û`.** Keep separator dots in `--font-term` text; never put one in a paragraph.
- **Type scale**: fixed px steps `--t1`…`--t7` (11/13/16/22/32/48/72), never `clamp()` — a pixel font off the whole-pixel grid is a smear.
- **Palette**: monochrome phosphor. Contrast is **inverse video** (solid `--phos` block, `--scr` text), never hue. SEEGSON STANDARD / Professional: screen `#030c06`, phosphor `#35ff5b`, hot `#c8ffd4`. SEVASTOLINK / Personal: screen `#100a02`, phosphor `#ffb32e`, hot `#ffe9b8`. `--alert` (`#ff6a2a` / `#ff4d3d`) is the one non-phosphor hue and has exactly two uses sitewide — the hero `ONLINE` session marker and the Projects `ONLINE` badge. A third use means it stopped being structural.
- **No border-radius anywhere; 1px solid borders only; no gradients on UI surfaces.**
- **Folder refs**: a CSS counter on `main > div` feeds `.page-bar-no` (`0{n}`) and the hero's folder list, so the bar and the reading order can never disagree.

### Rendering & Animation Stack

- **Canvas** (`Schematic.js`) — **one wireframe per profile**, because each profile is a different job:
  - `buildStation()` (SEEGSON STANDARD) — SEVASTOPOL STATION: a 24-gon ring truss, eight spoke trusses, an octagonal core spindle, three asymmetric docking arms, a comms mast.
  - `buildSpecimen()` (SEVASTOLINK) — the organism: swept cross-sections along a spine (elongated cranium, hunched torso, dorsal tubes, spindly limbs, a segmented tail longer than the body).

  Both are a vertex list + edge index list, no curves and no fills, projected by hand. `tube(pts, radii, sides, squash)` is the only primitive the specimen needs — head, neck, torso, tail and limbs are the same sweep with different spines, using a per-point orthonormal frame. `normalize()` centres each model on its bounding box and fits it to a common span, so the hidden-line test can assume a centroid at the origin.

  Per-model framing lives on the model itself: `yaw0` (the specimen is only recognisable in three-quarter, where cranium and tail are both off-axis), `fit` (normalize equalises *bounding* span, which oversells a figure that is mostly thin tail), and `ox`/`oy`. **Scroll drives rotation**: `yaw = yaw0 + scrollProgress * 2.6 + clock * 0.05`, `pitch = -0.28 + sin(scrollProgress·π) * 0.18`. A **hidden-line pass** dashes any edge whose midpoint z sits behind the centroid. Bloom is a second wide low-alpha stroke, not a shadow blur. Behind it: a 40px graticule with plotter margin ticks. Alpha drops past the hero (`0.26 + 0.74 * near`) and again below 700px wide, where callouts are cut entirely. A profile switch **crossfades one figure into the other** (`fade` lerps per model) behind a 0.35 s static burst plus 0.3 s of per-edge vector jitter, driven by a `MutationObserver` on `data-theme` that also re-reads `--phos-rgb`. **Reduced motion**: no rAF loop — draws once and on scroll/resize, and the model cuts over instead of crossfading.
- **Profile switch glitch** (`Home.js` + `Home.css`) — toggling sets `is-tuning` on `.home-container` for 650 ms, driving a stepped vertical-hold roll (`channel-roll`) on `main`. Skipped on first render.
- **Boot scene** (`BootScene.js`) — always green whichever profile is loading; its `--fg` / `--fg-hot` are the SEEGSON STANDARD values verbatim, so a cold boot hands off to an identical screen. A cold boot runs the full `LINES` log then the **operator plate**: `AYPRUSSS` typed one character at a time at 90 ms, **no trailing cursor**, in `--font-mark`, with horizontal slices carved by a `repeating-linear-gradient` mask. A ghost span reserves the finished width so characters land left-to-right. A restart runs the shorter `RESTART_LINES` and **skips the plate** — a title card on every profile switch would grate.
- **Framer Motion** — hero entrance, section scroll reveals, Hobbies flip. `Home.js` wraps everything in `MotionConfig reducedMotion="user"`.
- **React Scroll** — smooth anchor navigation (folder column, navbar, mobile list, `KeyLegend`)
- `GrainOverlay.css` (`.grain-overlay`) — CRT glass: 3px scanlines + vignette, fixed at z-index 10. **No aperture-grille RGB stripes**: a single-gun tube has no shadow mask.
- **CRT bezel** (`Home.css` `.crt-bezel`) — inset tube shadow, fixed above content (z 40, pointer-events none)
- Blink animations use `steps()` (`dot-pulse`) — a terminal blinks, it never eases.

### Layout Flow
`App.js` → `Home.js` (global `theme` state, boot overlay, IntersectionObserver section tracking) → renders `Navbar`, `Hero` (receives `sections` for the folder column), a theme-dependent section set, `Contact`, and `KeyLegend`.

The section set is the `SECTIONS` config in `Home.js`. `Hero` and `Contact` bookend both profiles:

| Slot | Professional | Personal       |
|------|--------------|----------------|
| 1    | `Skills`     | `About`        |
| 2    | `Projects`   | `Volunteering` |
| 3    | `Experience` | `Experience` (shared) |
| 4    | `Resume`     | `Hobbies`      |

`Home.js` renders `SECTIONS[theme]` into `<div id={s.id}>` wrappers and passes the same list to `Navbar` as `links` and to `KeyLegend` as `sections` (both append a static `contact` link). The IntersectionObserver effect depends on `theme` so it re-observes after a swap. Section outer width/padding lives in `Home.css` (`main > div[id]`, max-width 1180px), not in the section CSS files; the hero opts out (`main > div#hero`).

Z-index stack: `base-bg` (−3) → `StationSchematic` canvas (−2) → content → `grain-overlay` (10) → `crt-bezel` (40) → `KeyLegend` (950) → `Navbar` (1000) → `BootScene` (60, only while booting).

### Key legend — the keys are real
`KeyLegend.js` binds `↑ ↓` (move the folder cursor, painted onto `.hero-folder.is-cursor` by toggling the class directly rather than lifting cursor state into `Hero`), `Enter` (jump to the highlighted folder), `PgUp` / `PgDn` (page between folders, relative to `data-section` so it works before the cursor is touched), and `Q` (switch profile). A legend that lies is decoration; one that works is the interface. Guarded by `isTyping()` so the contact form is never intercepted, and `Enter` defers to any focused `a` / `button`. Below 620px only the profile hint shows — the legend describes a keyboard.

### Theming (Professional / Personal)
One tube, two phosphors. `src/theme.css` defines SEEGSON STANDARD `:root` tokens and a SEVASTOLINK `[data-theme="personal"]` override:
- `--scr`, `--scr-high`, `--phos`, `--phos-hot`, `--phos-dim`, `--phos-faint`, `--phos-hair`, `--glow`, `--alert` — primary tokens
- `--scr-rgb`, `--phos-rgb`, `--phos-hot-rgb`, `--alert-rgb` — RGB triplets for `rgba()` usage
- `--font-term`, `--font-hv`, `--font-mark`; `--t1`…`--t7`
- **The teletext token names survive as aliases** (`--bar`, `--hl`, `--lab`, `--ink*`, `--red`, `--grn`, `--mag`, `--screen`, `--font-display`, `--font-mono`, `--font-prose`, `--accent`, `--border`, …), all re-pointed onto the phosphor ramp. This is what turns every section stylesheet monochrome from one file — prefer the `--phos*` names in new code, but do not delete the aliases.

`Home.js` holds the `theme` state (`'professional'` | `'personal'`, default professional), sets `data-theme` on `document.documentElement`, and persists it to `localStorage('site-theme')`. The Navbar toggle is the `[Q] PROFILE:` key; `KeyLegend` binds the same action to the `Q` key.

### Section Presentation (shared terminal chrome in `index.css`)
- `SectionHeader` (`ui/SectionHeader.js`) — every section opens with a `.page-bar` (folder ref cell · `SEEGSON // PERSONAL TERMINAL // {title}` path · content-derived readout · terminating block), all inverse video, then the `.section-title` in `--phos-hot` with a phosphor bloom. Sections pass `title` / `meta` / `subtitle`. The path cell hides below 700px.
- `.rule-table` + `.rule-table-head` — shared listings chrome (1px `--phos-hair` top rule, `--phos-dim` column heads, `--phos-faint` row separators) used by Skills (`.bom-*`), Experience (`.rev-*`), Volunteering (`.vol-*`). Inline items separate with a `·` via `::after`, not chips.
- `.btn-primary` — a lit key (solid `--phos`, `--scr` text); `.btn-secondary` — an unlit 1px outline. Hover flips the state rather than shifting hue. Active nav links are punched back out of the status bar (`--scr` block, `--phos` text).
- Experience entries count **down** from latest (`experiences.length - idx`); Projects panels carry an inverse-video title strip, `REF. A–E` captions and a `MATL` credits strip; the fifth (odd) panel spans the full grid row.

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

Component tests also mock `./ui/TextScramble` (legacy; only matters if a component imports it). `Schematic` uses Canvas 2D APIs unavailable in jsdom — mock it as `() => <canvas />` in any test that renders `Home`. Other contracts tests rely on: section titles are `h2` with a trailing period (`Skills.`), Volunteering orgs are `h4`, Resume renders exactly 2 links, Hobbies has `Previous hobby` / `Next hobby` buttons that cycle `h3` names.

**Known failing test**: `Projects.test.js` expects 7 external links (5 GitHub + 2 live) but the data now has 6 (5 GitHub + 1 live) — a live project was removed in `3fd5c3a`. This predates the SEVASTOLINK work; fix by updating the expectation or restoring the project.

### Key Files
- `src/Pages/Home/Home.js` — global `theme` state, `SECTIONS` config, boot overlay + profile-switch restart, IntersectionObserver tracking, `MotionConfig`, bezel/overlay markup
- `src/Components/ui/SectionHeader.js` — shared inverse-video folder header used by all sections
- `src/Components/Schematic.js` — both wireframes: the `tube()` sweep primitive, `buildStation()` / `buildSpecimen()`, `normalize()`, hand-rolled projection, hidden-line pass, graticule, callouts, crossfade, reduced-motion handling
- `src/Components/KeyLegend.js` — fixed input legend and the keyboard bindings behind it
- `src/Components/BootScene.js` — cold boot / restart, the APOLLO core log, the typed operator plate
- `src/Components/Hero.js` — index screen: path line, FOLDERS column, `ANTHONY` (inverse) / `LE` (lit), operator record
- `src/Components/Navbar.js` — fixed inverse-video status bar: Nostromo ident, folder links, `[Q] PROFILE:`, station clock, read-position gauge
- `src/theme.css` — all design tokens (SEEGSON STANDARD green / SEVASTOLINK amber) plus the legacy aliases
- `src/index.css` — `@font-face`, reset, `.page-bar`, `.rule-table`, keys, folder counter, focus + reduced-motion rules
- `src/fonts/` — `jixellation.ttf`, `isolation.ttf`, `nostromo.ttf`, bundled by webpack. They must live under `src/`, not `public/` — CRA's css-loader cannot resolve a root-absolute `url()` in CSS.
