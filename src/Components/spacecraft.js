// Shared spacecraft art + starfield helpers.
//
// Lifted out of SpaceBackground.js so the RocketHunt mini-game can reuse the
// exact same rocket models, particle math, and starfield without duplicating
// the Path2D data. The Path2D objects are built lazily on first draw so that
// importing this module in a jsdom test environment (no Path2D) never throws —
// the draw functions only run inside a real canvas rAF loop.

// ── Math helpers ────────────────────────────────────────────────────
export const rand = (a, b) => a + Math.random() * (b - a);
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ── Starfield ───────────────────────────────────────────────────────
// Three depth layers: count, size range, opacity range, parallax, scroll, twinkle fraction.
export const LAYERS = [
  { count: 130, size: [0.35, 0.85], opacity: [0.07, 0.20], parallax: 0.007, scroll: 0.018, twinkle: 0.28 },
  { count: 65, size: [0.80, 1.50], opacity: [0.20, 0.40], parallax: 0.020, scroll: 0.048, twinkle: 0.18 },
  { count: 30, size: [1.40, 2.20], opacity: [0.35, 0.60], parallax: 0.044, scroll: 0.095, twinkle: 0.10 },
];

export const buildStars = () => {
  const stars = [];
  LAYERS.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      const twinkles = Math.random() < layer.twinkle;
      stars.push({
        nx: Math.random(),
        ny: Math.random(),
        size: rand(...layer.size),
        baseOpacity: rand(...layer.opacity),
        parallax: layer.parallax,
        scrollRate: layer.scroll,
        twinkles,
        twinkleSpeed: twinkles ? rand(0.35, 1.1) : 0,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: li,
      });
    }
  });
  return stars;
};

// ── Spacecraft Path2D art (lazily constructed) ──────────────────────
let PATHS = null;

const buildPaths = () => ({
  // Saturn V (Apollo-era)
  saturnVBody: new Path2D(
    'M12 0.5 Q13.4 2.8 14 5.5 L14 8 L14.6 8.6 L14.6 11.2 L14 11.8 L14 16.8' +
    ' L15.2 17.8 L15.2 21 L13.4 22 L13.4 23.5 L10.6 23.5 L10.6 22 L8.8 21' +
    ' L8.8 17.8 L10 16.8 L10 11.8 L9.4 11.2 L9.4 8.6 L10 8 L10 5.5' +
    ' Q10.6 2.8 12 0.5 Z'
  ),
  saturnVFinL: new Path2D('M8.8 20.5 L6 23.5 L8.5 23.2 L10.6 22'),
  saturnVFinR: new Path2D('M15.2 20.5 L18 23.5 L15.5 23.2 L13.4 22'),
  saturnVEngines: new Path2D(
    'M11 23.5 L10.8 24.5 M11.7 23.5 L11.7 24.5 M12 23.5 L12 24.8' +
    ' M12.3 23.5 L12.3 24.5 M13 23.5 L13.2 24.5'
  ),
  saturnVTower: new Path2D('M12 0.5 L12 -1.8 M11.4 -1 L12 -2.2 L12.6 -1'),

  // Space Shuttle
  shuttleBody: new Path2D(
    'M23 11.5 Q23 10.8 22 10.5 L6 9.5 L3.5 10 L2 11 L2 13.5 L3.5 14.5 L6 14.5 L22 13.5 Q23 13.2 23 11.5 Z'
  ),
  shuttleWing: new Path2D('M14 14 L8 20 L5 20 L4 19 L7 14.5'),
  shuttleWingTop: new Path2D('M14 10 L8 4 L5 4 L4 5 L7 9.5'),
  shuttleTail: new Path2D('M3 10 L1 5 L2.5 5 L4 9.5'),
  shuttleEngines: new Path2D('M2 11 L0.5 10.5 M2 12 L0 12 M2 13 L0.5 13.5'),

  // Falcon 9 (SpaceX-style)
  falcon9Body: new Path2D(
    'M12 0 Q13.6 2 14 4.5 L14 5 Q14 5.6 13.6 5.8 L13.6 9 L14 9.5 L14 10.2' +
    ' L13.6 10.8 L13.6 20.5 L14.2 21 L14.2 23.5 L9.8 23.5 L9.8 21' +
    ' L10.4 20.5 L10.4 10.8 L10 10.2 L10 9.5 L10.4 9 L10.4 5.8' +
    ' Q10 5.6 10 5 L10 4.5 Q10.4 2 12 0 Z'
  ),
  falcon9GridFinL: new Path2D('M10 9.5 L7.5 9 L7.5 10.2 L10 10.2'),
  falcon9GridFinR: new Path2D('M14 9.5 L16.5 9 L16.5 10.2 L14 10.2'),
  falcon9LegL: new Path2D('M9.8 22.5 L7 24.5 L8 24.5 L9.8 23.5'),
  falcon9LegR: new Path2D('M14.2 22.5 L17 24.5 L16 24.5 L14.2 23.5'),
  falcon9Engine: new Path2D('M11 23.5 L10.5 24.8 Q12 25.5 13.5 24.8 L13 23.5'),
});

const paths = () => (PATHS || (PATHS = buildPaths()));

// ── Spacecraft model registry ───────────────────────────────────────
// scale      — SVG scale multiplier
// cx/cy      — rotation pivot in SVG space (visual center of mass)
// tailD      — world-space px from pivot to flame/smoke origin
// noseOffset — radians added to travel angle so the SVG nose faces forward
// hasFlame   — whether the engine flame / smoke trail renders
// draw(ctx, now, starRgb) — paints the craft; `starRgb` tints the body so the
//              game can pass a gold triplet for high-value targets.
export const CRAFT = [
  {
    // 0 — Saturn V
    scale: 1.5, cx: 12, cy: 12, tailD: 20,
    noseOffset: Math.PI / 2, hasFlame: true,
    draw(ctx, now, starRgb) {
      const P = paths();
      ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.fillStyle = `rgba(${starRgb}, 0.06)`; ctx.fill(P.saturnVBody);
      ctx.strokeStyle = `rgba(${starRgb}, 0.9)`; ctx.stroke(P.saturnVBody);
      ctx.strokeStyle = 'rgba(255, 107, 43, 0.85)';
      ctx.stroke(P.saturnVFinL); ctx.stroke(P.saturnVFinR);
      ctx.strokeStyle = `rgba(${starRgb}, 0.65)`;
      ctx.stroke(P.saturnVEngines); ctx.stroke(P.saturnVTower);
    },
  },
  {
    // 1 — Space Shuttle
    scale: 1.7, cx: 12, cy: 12, tailD: 16,
    noseOffset: 0, hasFlame: true,
    draw(ctx, now, starRgb) {
      const P = paths();
      ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.fillStyle = `rgba(${starRgb}, 0.08)`; ctx.fill(P.shuttleBody);
      ctx.strokeStyle = `rgba(${starRgb}, 0.92)`; ctx.stroke(P.shuttleBody);
      ctx.strokeStyle = 'rgba(255, 107, 43, 0.82)';
      ctx.stroke(P.shuttleWing); ctx.stroke(P.shuttleWingTop);
      ctx.strokeStyle = `rgba(${starRgb}, 0.72)`;
      ctx.stroke(P.shuttleTail); ctx.stroke(P.shuttleEngines);
    },
  },
  {
    // 2 — Falcon 9
    scale: 1.4, cx: 12, cy: 12, tailD: 18,
    noseOffset: Math.PI / 2, hasFlame: true,
    draw(ctx, now, starRgb) {
      const P = paths();
      ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.fillStyle = `rgba(${starRgb}, 0.06)`; ctx.fill(P.falcon9Body);
      ctx.strokeStyle = `rgba(${starRgb}, 0.9)`; ctx.stroke(P.falcon9Body);
      ctx.strokeStyle = 'rgba(255, 107, 43, 0.82)';
      ctx.stroke(P.falcon9GridFinL); ctx.stroke(P.falcon9GridFinR);
      ctx.strokeStyle = `rgba(${starRgb}, 0.68)`;
      ctx.stroke(P.falcon9LegL); ctx.stroke(P.falcon9LegR); ctx.stroke(P.falcon9Engine);
    },
  },
];

// Convenience: paint craft `idx` at the current transform with `starRgb` tint.
export const drawCraft = (ctx, idx, now, starRgb) => {
  CRAFT[idx].draw(ctx, now, starRgb);
};
