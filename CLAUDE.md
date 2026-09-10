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

### Design system

The site is **one page in two sessions**, and the sessions are literal inversions of each other: professional is black type on white, personal is white type on black. Same layout, same type, same rhythm — only the six colour tokens swap. The toggle reads as the light going off rather than as a different website.

**Everything is flush left, ragged right.** One strong left margin is the spine of the page; the boot console is the only centred thing on the site.

#### Colour — there is no hue

True `#000` and `#fff`, not a softened charcoal. Six neutral roles per session, defined once in `src/theme.css` and swapped under `[data-theme="personal"]`:

| Token | Professional | Personal |
|---|---|---|
| `--ground` | `#ffffff` | `#000000` |
| `--ink` (body) | `#000000` | `#ededed` |
| `--ink-max` (headings) | `#000000` | `#ffffff` |
| `--mute` (secondary) | `#6e6e6e` | `#9b9b9b` |
| `--rule` (hairlines) | `#d6d6d6` | `#2e2e2e` |
| `--fill` (quiet bands) | `#f1f1f1` | `#141414` |

Body copy on the dark side is `#ededed`, **not** `#fff` — pure white body text on true black halates, and holding `#fff` back keeps the brightest step for headings. There is no accent colour: a "live" project is a link that says `Live site`, and form success/failure are told apart by their words plus a margin marker, never by hue.

#### Type — one family, one width axis

- **Archivo** (`@fontsource-variable/archivo/wdth.css`, family name `Archivo Variable`) carries display, UI and body. The `wdth` axis is the personality: `--wide` (112%) for the name, `--normal` elsewhere. Deliberately not Inter or Geist.
- **IBM Plex Mono** 400 appears in **the boot log and the shortcut panel's key column, nothing else**. A boot log is genuinely monospaced content; mono as a decorative label face is not.

Scale is a 1.25 modular off a 17px body (`--fs-micro` … `--fs-h1`); only `--fs-h1` uses `clamp()`. Measure is capped at **66ch** (`--measure`).

**Sentence case throughout.** The only capitals on the site are the name in `Overview`, and they live in CSS (`text-transform`) so a screen reader still receives an ordinary name. Section titles keep their trailing period (`Skills.`) — it closes the word, which is the quietest way to finish a heading when there is no colour or eyebrow label doing that job. Tests depend on it.

#### Structure encodes information, or it goes

- **Rules** separate discrete records. That is their only job — no rule appears where records do not.
- **No numbering unless the content is a sequence.** Experience and Volunteering are chronological, so dates order them. Projects and Skills are not sequences and carry no counters.
- **No cards, no border-radius, no shadows, no gradients.** Hierarchy is weight, size and space.
- **No `·`-joined meta strings, no all-caps eyebrows, no `→` on buttons.**

#### Motion budget — three moments, total

1. **Boot** (~2.2s, once per browser session, any key or click skips).
2. **Session switch** (300ms) — the same inversion wipe as the boot hand-off.
3. **State feedback** — rail cursor, skills disclosure, copy confirmation, focus rings.

Nothing animates on scroll. There are no `whileInView` reveals; `framer-motion` is not a dependency any more.

### The boot console

`BootScene.js` is a plain Linux boot: service lines stream, a getty prompt appears, `anthony` types itself in, the session opens. It is always black whichever session is loading — a machine does not know which account it is about to open — and it is the one place that sets its own colours rather than reading the session tokens.

**The hand-off is the point.** On the professional session, white sweeps across the console (`.boot-invert`, the `wipe-across` keyframe shared with `.swap-wipe` in `Home.css`) and the daylight page is underneath it. On the personal session the console is already the colour of the page it is opening, so the text simply fades. That asymmetry is not a flourish — it is what "the two sessions are inversions of each other" actually looks like, and seeing it at boot is what teaches the toggle.

Skipped entirely for reduced-motion viewers and in jsdom (`canAnimate()` in `Home.js` requires `matchMedia`), so tests render the page directly.

### Layout flow

`App.js` → `Home.js` (session state, boot overlay, scroll-position tracking) → renders `Rail`, then `Overview`, a session-dependent section set, and `Contact`.

`Home.js` holds `theme` (`'professional'` | `'personal'`, default professional), sets `data-theme` on `document.documentElement`, and persists to `localStorage('site-theme')`. The boot runs once per `sessionStorage('booted')`.

The section set is the `SECTIONS` config in `Home.js`. Overview and Contact bookend both sessions:

| Slot | Professional | Personal |
|------|--------------|----------|
| 1 | `Experience` | `About` |
| 2 | `Projects` | `Hobbies` |
| 3 | `Skills` | `Volunteering` |
| 4 | `Resume` | `Experience` (shared) |

Professional leads with Experience on purpose: it is the first thing anyone scanning a portfolio looks for.

**Section width and spacing live in `Home.css`** (`.content`, `.section`), not in the section stylesheets.

### Navigation — the rail

`Rail.js` renders the fixed top bar and the fixed index rail. It replaced a fixed status bar *plus* a fixed bottom key-legend strip.

- **Session control** is a two-cell segmented button. Both options stay visible and the current one is filled with ink — the control is a small preview of the inversion it performs. A single toggle would show the state or the affordance, never both.
- **Position** is marked with a 2px flush-left bar plus a weight change. The marker is always on the link and merely transparent when inactive, so nothing shifts sideways while scrolling.
- **Below 1040px** the rail lies down as a horizontal scrollspy strip under the bar. There is no hamburger — six short words fit on a line, and a menu that has to be opened is a menu that gets ignored.
- **Keyboard**: `↑`/`↓` move between sections, `P` switches session, `?` opens the shortcut panel, `Escape` closes it. Guarded by `isTyping()` so the contact form is never intercepted. The shortcuts are documented in the `?` panel rather than in permanent chrome.

Navigation uses **native `#hash` anchors** with `scroll-behavior: smooth` and `scroll-margin-top` — no `react-scroll`. Real links mean deep-linking, middle-click and keyboard all work for free.

Scroll position is measured in a rAF-throttled scroll handler in `Home.js`, **not** an IntersectionObserver: a section shorter than the observer band never reports, and Contact is exactly that short. Bottom-of-page always resolves to the last entry.

Z-index stack: content → `.rail` (90) → `.bar` (100) → `.swap-wipe` (900) → `.help-scrim` (1000) → `.boot` (1000) → `.skip-link` (1200).

### Shared chrome (`src/index.css`)

Anything used by more than one section lives here; anything used by exactly one lives in that section's stylesheet.

- `Section` (`ui/Section.js`) — `h2` plus an optional one-sentence lead. No bar, no meta cell.
- `.record` / `.rec-period` / `.rec-title` / `.rec-sub` / `.rec-body` — Experience, Volunteering, Projects and Hobbies are all lists of the same shape, so they are set from one place and read the same way. **Volunteering has no stylesheet of its own**; it uses this chrome directly.
- `.lead-record` / `.lead-title` / `.lead-body` — one entry given room instead of a rule. This is how Projects and Hobbies say which entry matters most; size is the whole ranking mechanism.
- `.btn` + `.btn-primary` / `.btn-secondary` — a solid block of ink and its outline. Hover swaps one into the other: the same inversion at button scale.
- `.measure`, `.lead`, `.meta`, `.micro`, `.pairs`, `.inline-list`, `.link-row`, `.sr-only`, `.skip-link`.

Links are **underlined by default** — an underline is what marks a link, and colour is not available to do that job here.

### Contact form

`Contact.js` uses EmailJS via environment variables (`REACT_APP_EMAILJS_SERVICE_ID`, `REACT_APP_EMAILJS_TEMPLATE_ID`, `REACT_APP_EMAILJS_PUBLIC_KEY`). No backend. Keep the input placeholders (`Your Email` / `Subject` / `Your Message`) and the `Send Message` button text — tests match them. Inputs are a baseline with a label above, not a box.

### Résumé

There is no embedded PDF viewer. A picture of a document is not a document: it could not be searched, did not reflow on a phone, and cost ~500KB of JavaScript plus a worker fetched from a third-party CDN. The section says what is in the file and then hands over the file (`Open in tab` / `Download PDF`, exactly two links — tests count them).

### Testing notes

Tests use `@testing-library/react` with jsdom. No mocks are needed for animation or fonts; the components have no animation library and the boot is skipped without `matchMedia`.

Contracts the tests rely on:
- Section titles are `h2` ending in a period (`Skills.`).
- `Experience` renders company as `h3`; `Volunteering` matches it (`h3`, not `h4`).
- `Resume` renders exactly 2 links, both `rel="noopener noreferrer"`.
- `Projects` renders 6 external links (5 source + 1 live).
- `Hobbies` renders all six as `h3`, Rock Climbing first, with exactly 2 outbound links. **There is no carousel** — it hid five of six entries behind an arrow.
- `Home.test.js` mocks `Rail` as two buttons exposing `onSwitch`.

### Key files

- `src/theme.css` — the six-token ramp × two sessions, type tokens, scale, spacing, frame and motion constants
- `src/index.css` — reset and every shared primitive
- `src/Pages/Home/Home.js` — session state, `SECTIONS`, boot overlay, scroll tracking, the session wipe
- `src/Pages/Home/Home.css` — the frame: content column, section spacing, `wipe-across`
- `src/Components/Rail.js` — top bar, index rail, keyboard bindings, shortcut panel
- `src/Components/BootScene.js` — the Linux console and the inversion hand-off
- `src/Components/Overview.js` — the nameplate and the per-session introduction
- `src/Components/ui/Section.js` — the shared section header
