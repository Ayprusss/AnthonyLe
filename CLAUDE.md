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

### Design System — "CH·741"
The site is presented as a **broadcast teletext service viewed on a CRT** (CEEFAX-style; the 741 comes from the owner's handle). Teletext conventions carry the information architecture — the hero is **PAGE 100**, the service index with dot-leader page numbers and a **fastext** row (the four coloured remote keys); every section is a numbered page (`P200`–`P600`) opening with a white-on-service-colour header bar; deployed projects carry a blinking **ON AIR** badge; Experience is the **broadcast log**; Contact is the **viewer response form**; the footer is the **closedown** (`END OF TRANSMISSION`).

- **Display font**: `VT323` (single weight 400 — headlines, page numbers, header bars, captions; large sizes only, it's thin when small)
- **Body/annotation font**: `IBM Plex Mono` 400/500/600 (`--font-mono`, also `--font-prose` — everything read is mono; the CRT fiction admits no humanist sans)
- **Palette**: saturated colour is **structural**, never decorative. CH 1 / Professional ("NEWS"): CRT blue-black `#07070e`, header-bar blue `--bar #1a1ad0`, headline yellow `--hl #ffd21f`, label cyan `--lab #38e1e6`. CH 2 / Personal ("LEISURE"): violet-black `#0c0710`, magenta bar `#b3128f`, headline green, label yellow. Universal: `--red` (fastext/alerts), `--grn`, `--mag`.
- **Page tags**: CSS counters on `main > div` render `P{n}00` — a bar-coloured corner box via `.section-container::before` and the `.page-bar-no` cell in each section's header bar — so the two can never disagree. Hero = P100, slots 1–4 = P200–P500, Contact = P600.

### Rendering & Animation Stack

- **Canvas** (`SpaceBackground.js`) — the "ether" behind the page: a mosaic-block starfield (blocky 4px cells, quantized *stepping* twinkle — nothing fades smoothly, this is teletext), per-star scroll parallax (`depth`), occasional horizontal **interference bands** rolling down (`bandY`, every ~6–14 s), and a full-screen **static burst** (`staticT` 1→0 over 0.7 s) whenever `data-theme` mutates (channel retune). Colours come from `--ink-rgb`/`--lab-rgb`/`--hl-rgb`/`--bar-rgb`, re-read on mutation. **Reduced motion**: no rAF loop at all — the field draws once (and on scroll/resize), no bands, no static.
- **Channel retune glitch** (`Home.js` + `Home.css`) — toggling theme sets `is-tuning` on `.home-container` for 650 ms, driving a stepped vertical-hold roll (`channel-roll`) on `main`. Skipped on first render.
- **Framer Motion** — hero entrance, section scroll reveals, Hobbies channel-flip. `Home.js` wraps everything in `MotionConfig reducedMotion="user"`.
- **React Scroll** — smooth anchor navigation (page index, navbar, mobile index, fastext keys)
- `GrainOverlay.css` (`.grain-overlay`) — CRT glass: 3px scanlines, faint aperture-grille RGB stripes (`::before`), vignette (`::after`), fixed at z-index 10
- **CRT bezel** (`Home.css` `.crt-bezel`) — rounded-corner inset tube shadow, fixed above content (z 40, pointer-events none)
- Blink animations use `steps()` (`dot-pulse`) — teletext blinks, it never eases.

### Layout Flow
`App.js` → `Home.js` (global `theme` state, retune flash, IntersectionObserver section tracking) → renders `Navbar`, then `Hero` (receives `sections` for the page index + fastext keys) + a theme-dependent section set + `Contact`.

The section set is the `SECTIONS` config in `Home.js`. `Hero` and `Contact` bookend both themes; the middle slots swap by theme (slots stay position-aligned so page numbers 100–600 never shift):

| Slot | Professional | Personal       |
|------|--------------|----------------|
| 1    | `Skills`     | `About`        |
| 2    | `Projects`   | `Volunteering` |
| 3    | `Experience` | `Experience` (shared) |
| 4    | `Resume`     | `Hobbies`      |

`Home.js` renders `SECTIONS[theme]` into `<div id={s.id}>` wrappers and passes the same list to `Navbar` as `links` (which appends a static `contact` link). The IntersectionObserver effect depends on `theme` so it re-observes after a swap. Section outer width/padding lives in `Home.css` (`main > div[id]`, max-width 1180px), not in the section CSS files; the hero opts out (`main > div#hero`).

Background z-index stack: `base-bg` (−3, radial phosphor lift) → `SpaceBackground` canvas (−2) → content → `crt-bezel` (40) → `grain-overlay` (10, visually above content but below bezel chrome due to stacking).

### Theming (Professional / Personal)
Both channels play on the **same black tube**; `src/theme.css` defines CH 1 `:root` tokens and a CH 2 `[data-theme="personal"]` override. Key variables:
- `--screen`, `--bar`, `--ink`, `--ink-strong`, `--ink-dim`, `--ink-faint`, `--hl`, `--lab`, `--grn`, `--red`, `--mag` — primary tokens
- `--screen-rgb`, `--bar-rgb`, `--ink-rgb`, `--hl-rgb`, `--lab-rgb`, `--grn-rgb`, `--red-rgb`, `--mag-rgb` — RGB triplets for `rgba()` usage
- `--font-display` (VT323), `--font-mono` / `--font-prose` (IBM Plex Mono)
- Legacy aliases (`--paper`, `--bg`, `--text`, `--accent`, `--border`, `--font-body`, etc.) map onto the new tokens for backward compat

`Home.js` holds the `theme` state (`'professional'` | `'personal'`, default professional), sets `data-theme` on `document.documentElement`, and persists it to `localStorage('site-theme')`. `SpaceBackground.js` reads `data-theme` via a `MutationObserver` to fire the static burst and re-read colours. The Navbar toggle is the red **TUNE** fastext key (`TUNE: CH 2 · PERSONAL`).

### Section Presentation (shared teletext chrome in `index.css`)
- `SectionHeader` (`ui/SectionHeader.js`) — every section opens with a `.page-bar` (P-number cell · `CH·741` ident · rule · content-derived readout, white on `--bar`) then the VT323 `.section-title` in `--hl` with a phosphor bloom. Sections pass `title` / `meta` / `subtitle`.
- `.rule-table` + `.rule-table-head` — shared listings chrome (2px `--bar` top rule, cyan column heads, `--ink-faint` row separators) used by Skills (`.bom-*`), Experience (`.rev-*`), Volunteering (`.vol-*`). Inline items separate with a yellow `·` via `::after`, not chips.
- `.btn-primary` — solid `--hl` fastext key (hard offset shadow, presses in on hover); `.btn-secondary` — 2px cyan outline. Nav toggle is solid `--red`.
- Experience episode numbers count **down** from latest (`experiences.length - idx`); Projects panels are programme cards with an inverse-video `--bar` title strip, `PROG. A–E` captions and a `MATL` credits strip; the fifth (odd) panel spans the full grid row. Active nav links render inverse video (cyan block, screen-coloured text).

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
- `src/Pages/Home/Home.js` — global `theme` state, `SECTIONS` config, retune (`is-tuning`) flash, IntersectionObserver tracking, `MotionConfig`, bezel/overlay markup
- `src/Components/ui/SectionHeader.js` — shared page header bar + headline used by all sections
- `src/Components/SpaceBackground.js` — mosaic starfield, interference bands, channel-change static, reduced-motion handling
- `src/Components/Hero.js` — PAGE 100: service header bar with live Ottawa clock + date, double-height name (`ANTHONY` on bar / `LE` in headline glow), page index (from `sections` prop), studio status row, fastext key row
- `src/theme.css` — all design tokens (CH 1 news / CH 2 leisure on black)
- `src/index.css` — font imports, reset, `.page-bar`, `.rule-table`, fastext buttons, P-number counter tags, focus + reduced-motion rules
