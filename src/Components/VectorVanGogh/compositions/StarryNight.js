import {
  generateSpiralPath,
  generateWavePath,
  generateCypressStrokes,
  generateStarRays,
  generateSkyFlowStrokes,
  generateConcentricArcs,
  generateCircleApprox,
} from '../pathGenerators';

// Approximate star positions from the actual painting (normalised to 1000×700 viewBox).
const STAR_POSITIONS = [
  { x: 145, y: 88 },
  { x: 242, y: 60 },
  { x: 382, y: 50 },
  { x: 470, y: 74 },
  { x: 582, y: 57 },
  { x: 670, y: 84 },
  { x: 215, y: 198 },
  { x: 442, y: 178 },
  { x: 600, y: 158 },
  { x: 708, y: 110 },
  { x: 872, y: 178 },
];

// Village silhouette — hand-placed horizontal strokes evoking rooflines, walls, windows.
// x: 250–780, y: 490–660 (lower-centre of the 1000×700 viewBox).
const VILLAGE_PATHS = [
  // Church / steeple
  { d: 'M 492,510 L 512,492 L 532,510', sw: 2 },
  { d: 'M 507,492 L 512,466 L 517,492', sw: 1.5 },
  // Rooflines
  { d: 'M 308,558 L 372,552 L 432,556', sw: 2.5 },
  { d: 'M 372,552 L 402,538 L 432,552', sw: 2 },
  { d: 'M 452,550 L 524,545 L 582,548', sw: 2.5 },
  { d: 'M 542,545 L 562,532 L 582,545', sw: 2 },
  { d: 'M 602,556 L 664,550 L 724,553', sw: 2.5 },
  { d: 'M 652,550 L 672,538 L 692,550', sw: 2 },
  // Walls
  { d: 'M 302,578 L 438,572', sw: 3 },
  { d: 'M 448,572 L 578,568', sw: 3 },
  { d: 'M 592,574 L 728,570', sw: 3 },
  { d: 'M 308,602 L 432,598', sw: 4 },
  { d: 'M 448,598 L 572,595', sw: 4 },
  { d: 'M 590,596 L 718,593', sw: 4 },
  // Ground / base
  { d: 'M 285,628 L 745,625', sw: 5 },
  { d: 'M 285,646 L 745,643', sw: 5 },
];

export function buildStarryNight(isMobile = false) {
  const density    = isMobile ? 0.5 : 1;
  const raysPerStar = isMobile ? 6 : 9;

  // ─── Hills (wave paths stacked across the lower landscape band) ──────────
  const hillCount = Math.round(12 * density);
  const hillPaths = Array.from({ length: hillCount }, (_, i) => {
    const t         = i / hillCount;
    const y         = 455 + t * 165;          // y: 455 → 620
    const amplitude = 22 - t * 10;            // taller ripples at the top of the hills
    const frequency = 2.0 + t * 1.5;
    const ss        = (i / hillCount) * 0.04; // gentle stagger within the group
    return {
      d:           generateWavePath(-10, y, 1020, amplitude, frequency, 70),
      paletteKey:  'hills',
      paletteIndex: i % 6,
      strokeWidth: 2.5 + t * 2,
      opacity:     0.80 + t * 0.15,
      scrollStart: ss,
      scrollEnd:   ss + 0.27,
      filter:      'paintTexture',
    };
  });

  // ─── Village (hand-authored silhouette strokes) ───────────────────────────
  const villageCount = Math.round(VILLAGE_PATHS.length * density);
  const villagePaths = VILLAGE_PATHS.slice(0, villageCount).map((v, i) => ({
    d:           v.d,
    paletteKey:  'village',
    paletteIndex: i % 5,
    strokeWidth: v.sw,
    opacity:     0.82,
    scrollStart: 0.05 + (i / villageCount) * 0.06,
    scrollEnd:   0.34 + (i / villageCount) * 0.06,
    filter:      null,
  }));

  // ─── Cypress tree (left edge, x 25–155, full height) ─────────────────────
  const cypressCount = Math.round(28 * density);
  const cypressPaths = generateCypressStrokes(25, 90, 130, 610, cypressCount, 42)
    .map((d, i) => ({
      d,
      paletteKey:  'cypress',
      paletteIndex: i % 5,
      strokeWidth: 1.5 + (i % 3) * 0.6,
      opacity:     0.88,
      scrollStart: 0.15 + (i / cypressCount) * 0.07,
      scrollEnd:   0.47 + (i / cypressCount) * 0.07,
      filter:      null,
    }));

  // ─── Sky flow (turbulent horizontal currents across the whole sky) ────────
  const skyFlowCount = Math.round(34 * density);
  const skyFlowPaths = generateSkyFlowStrokes(skyFlowCount, 99)
    .map((d, i) => ({
      d,
      paletteKey:  'skyFlow',
      paletteIndex: i % 6,
      strokeWidth: 2.0 + (i % 4) * 0.7,
      opacity:     0.70 + (i % 3) * 0.08,
      scrollStart: 0.30 + (i / skyFlowCount) * 0.10,
      scrollEnd:   0.72 + (i / skyFlowCount) * 0.10,
      filter:      null,
    }));

  // ─── Sky arcs (concentric swirl clusters + large sweeping background arcs) ─
  // Four clusters match the dominant turbulence centres in the painting.
  const arcClusterDefs = [
    // Main large swirl — left-centre of sky
    { cx: 370, cy: 185, minR: 68, maxR: 238, count: Math.round(8 * density),  a0: -Math.PI * 0.18, sweep:  Math.PI * 1.28, seed: 201 },
    // Secondary swirl — right of centre
    { cx: 578, cy: 152, minR: 42, maxR: 132, count: Math.round(5 * density),  a0: -Math.PI * 0.5,  sweep: -Math.PI * 0.88, seed: 202 },
    // Upper-left small swirl — near cypress top
    { cx: 212, cy: 138, minR: 28, maxR: 82,  count: Math.round(4 * density),  a0: -Math.PI * 0.28, sweep:  Math.PI * 0.72, seed: 203 },
    // Lower-right accent — echoes the hill ridge
    { cx: 798, cy: 322, minR: 35, maxR: 95,  count: Math.round(4 * density),  a0: -Math.PI * 0.65, sweep: -Math.PI * 0.70, seed: 204 },
  ];
  const skyArcPaths = arcClusterDefs.flatMap(({ cx, cy, minR, maxR, count: c, a0, sweep, seed }) =>
    generateConcentricArcs(cx, cy, minR, maxR, c, a0, sweep, seed).map((d, i) => ({
      d,
      paletteKey:   'skyFlow',
      paletteIndex: (seed + i) % 6,
      strokeWidth:  2.2 + (i % 3) * 0.6,
      opacity:      0.72 + (i % 4) * 0.06,
      scrollStart:  0.36 + (i / c) * 0.08,
      scrollEnd:    0.74 + (i / c) * 0.08,
      filter:       null,
    }))
  );

  // ─── Moon halo (concentric rings that glow behind the spiral) ─────────────
  const moonHaloRadii = [20, 38, 60, 86, 116, 150, 188];
  const visibleHalos  = isMobile ? moonHaloRadii.slice(0, 5) : moonHaloRadii;
  const moonHaloPaths = visibleHalos.map((r, i) => ({
    d:            generateCircleApprox(760, 200, r),
    paletteKey:   i < 3 ? 'moon' : 'sky',
    paletteIndex: i % 5,
    strokeWidth:  Math.max(1.2, 4.5 - i * 0.55),
    opacity:      Math.max(0.18, 0.92 - i * 0.11),
    scrollStart:  0.46 + i * 0.012,
    scrollEnd:    0.76 + i * 0.012,
    filter:       'moonGlow',
  }));

  // ─── Star halos (concentric rings around each star position) ─────────────
  const haloRadii    = isMobile ? [10, 20] : [9, 17, 27];
  const starHaloPaths = STAR_POSITIONS.flatMap((pos, si) =>
    haloRadii.map((r, ri) => ({
      d:            generateCircleApprox(pos.x, pos.y, r),
      paletteKey:   'stars',
      paletteIndex: (si * 2 + ri) % 6,
      strokeWidth:  isMobile ? 1.5 : 1.8 - ri * 0.25,
      opacity:      0.82 - ri * 0.14,
      scrollStart:  0.63 + (si / STAR_POSITIONS.length) * 0.13,
      scrollEnd:    0.88 + (si / STAR_POSITIONS.length) * 0.09,
      filter:       'starGlow',
    }))
  );

  // ─── Moon swirl (isolated so it can carry its own glow filter) ───────────
  const moonPath = {
    d:           generateSpiralPath(760, 200, 8, 165, 3.5, 280),
    paletteKey:  'moon',
    paletteIndex: 0,
    strokeWidth: 5,
    opacity:     1,
    scrollStart: 0.50,
    scrollEnd:   0.80,
    filter:      'moonGlow',
  };

  // ─── Sky swirls (smaller, satellite spirals throughout the sky) ───────────
  const swirlDefs = [
    { cx: 530, cy: 172, startR: 5, endR: 98,  turns: 3.0, segs: 220, pk: 'sky',     pi: 2, sw: 3.5, ss: 0.55, se: 0.83 },
    { cx: 352, cy: 238, startR: 4, endR: 68,  turns: 2.5, segs: 180, pk: 'sky',     pi: 4, sw: 3.0, ss: 0.60, se: 0.86 },
    { cx: 630, cy: 118, startR: 3, endR: 50,  turns: 2.5, segs: 150, pk: 'skyFlow', pi: 1, sw: 2.5, ss: 0.58, se: 0.83 },
    { cx: 232, cy: 152, startR: 3, endR: 44,  turns: 2.0, segs: 130, pk: 'skyFlow', pi: 3, sw: 2.5, ss: 0.63, se: 0.87 },
    { cx: 810, cy: 320, startR: 3, endR: 38,  turns: 2.0, segs: 120, pk: 'sky',     pi: 1, sw: 2.0, ss: 0.65, se: 0.88 },
  ];
  const swirlPaths = swirlDefs.map(s => ({
    d:           generateSpiralPath(s.cx, s.cy, s.startR, s.endR, s.turns, s.segs),
    paletteKey:  s.pk,
    paletteIndex: s.pi,
    strokeWidth: s.sw,
    opacity:     0.88,
    scrollStart: s.ss,
    scrollEnd:   s.se,
    filter:      null,
  }));

  // ─── Stars (radiating ray bursts at fixed sky positions) ─────────────────
  const starPaths = STAR_POSITIONS.flatMap((pos, si) =>
    generateStarRays(pos.x, pos.y, raysPerStar, 8, 22, si * 17 + 5).map((d, ri) => ({
      d,
      paletteKey:  'stars',
      paletteIndex: (si + ri) % 6,
      strokeWidth: 2.5,
      opacity:     0.95,
      scrollStart: 0.65 + (si / STAR_POSITIONS.length) * 0.13,
      scrollEnd:   0.90 + (si / STAR_POSITIONS.length) * 0.09,
      filter:      'starGlow',
    }))
  );

  return {
    viewBox: '0 0 1000 700',
    pathGroups: [
      { id: 'hills',      paths: hillPaths },
      { id: 'village',    paths: villagePaths },
      { id: 'cypress',    paths: cypressPaths },
      { id: 'skyFlow',    paths: skyFlowPaths },
      { id: 'skyArcs',    paths: skyArcPaths },
      { id: 'moonHalo',   paths: moonHaloPaths },
      { id: 'moonSwirl',  paths: [moonPath] },
      { id: 'skySwirls',  paths: swirlPaths },
      { id: 'starHalos',  paths: starHaloPaths },
      { id: 'stars',      paths: starPaths },
    ],
  };
}
