// Deterministic PRNG — same seed always produces the same sequence.
function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Smooth a point array into a quadratic Bézier chain by threading through midpoints.
function smoothPoints(pts) {
  let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i].x + pts[i + 1].x) / 2).toFixed(2);
    const my = ((pts[i].y + pts[i + 1].y) / 2).toFixed(2);
    d += ` Q ${pts[i].x.toFixed(2)},${pts[i].y.toFixed(2)} ${mx},${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(2)},${last.y.toFixed(2)}`;
  return d;
}

// Archimedean spiral. Starts at startR from center, expands to endR over `turns` rotations.
export function generateSpiralPath(cx, cy, startR, endR, turns, segments = 220) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = turns * 2 * Math.PI * t - Math.PI / 2;
    const r = startR + (endR - startR) * t;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return smoothPoints(pts);
}

// Sinusoidal wave path spanning a given width, starting at (x0, y0).
export function generateWavePath(x0, y0, width, amplitude, frequency, segments = 70) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pts.push({
      x: x0 + width * t,
      y: y0 + amplitude * Math.sin(frequency * 2 * Math.PI * t),
    });
  }
  return smoothPoints(pts);
}

// Individual upward-flame brushstroke paths for a cypress tree.
// Returns an array of `count` path strings. All coordinates are absolute.
export function generateCypressStrokes(baseX, topY, treeWidth, treeHeight, count, seed) {
  const rng = seededRng(seed);
  return Array.from({ length: count }, () => {
    const x     = baseX + rng() * treeWidth;
    const startY = topY + treeHeight;
    const endY   = topY + rng() * treeHeight * 0.45;
    const cpx    = x + (rng() - 0.5) * treeWidth * 0.9;
    const cpy    = startY - (startY - endY) * (0.35 + rng() * 0.3);
    const endX   = x + (rng() - 0.5) * treeWidth * 0.5;
    return `M ${x.toFixed(1)},${startY.toFixed(1)} Q ${cpx.toFixed(1)},${cpy.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`;
  });
}

// Radiating line segments from a centre point — used for Van Gogh star bursts.
export function generateStarRays(cx, cy, numRays, minLen, maxLen, seed) {
  const rng = seededRng(seed);
  return Array.from({ length: numRays }, (_, i) => {
    const angle = (i / numRays) * 2 * Math.PI + rng() * 0.25;
    const len   = minLen + rng() * (maxLen - minLen);
    return `M ${cx.toFixed(1)},${cy.toFixed(1)} L ${(cx + len * Math.cos(angle)).toFixed(1)},${(cy + len * Math.sin(angle)).toFixed(1)}`;
  });
}

// Series of arcs at increasing radii around a centre point, evoking Van Gogh's swirl clusters.
// a0 = start angle (radians), sweep = arc extent (positive = CCW, negative = CW).
export function generateConcentricArcs(cx, cy, minR, maxR, count, a0, sweep, seed) {
  const rng = seededRng(seed);
  return Array.from({ length: count }, (_, i) => {
    const t           = i / count;
    const r           = minR + t * (maxR - minR) + (rng() - 0.5) * (maxR - minR) * 0.12;
    const actualA0    = a0 + (rng() - 0.5) * 0.3;
    const actualSweep = sweep * (0.85 + rng() * 0.3);
    const segments    = Math.max(10, Math.round(Math.abs(actualSweep) * r / 12));
    const pts = Array.from({ length: segments + 1 }, (_, j) => {
      const angle = actualA0 + actualSweep * (j / segments);
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    return smoothPoints(pts);
  });
}

// Full-circle approximation — used for moon and star halo rings.
// Segment count scales with circumference so all circles look equally smooth.
export function generateCircleApprox(cx, cy, r) {
  const segments = Math.max(24, Math.round(2 * Math.PI * r / 8));
  const pts = Array.from({ length: segments + 1 }, (_, i) => {
    const angle = (i / segments) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  return smoothPoints(pts);
}

// Dense, turbulent sky-flow strokes that fill the sky region.
// Each stroke is a horizontal sinusoid with randomised phase, amplitude and y position.
export function generateSkyFlowStrokes(count, seed) {
  const rng = seededRng(seed);
  return Array.from({ length: count }, () => {
    const y         = 25 + rng() * 390;        // sky band: 0–415
    const amplitude = 14 + rng() * 32;
    const frequency = 1.4 + rng() * 2.2;
    const phase     = rng() * Math.PI * 2;
    const width     = 520 + rng() * 580;
    const startX    = rng() * 150 - 75;
    const segments  = 55;
    const pts = Array.from({ length: segments + 1 }, (_, i) => {
      const t = i / segments;
      return {
        x: startX + width * t,
        y: y + amplitude * Math.sin(frequency * 2 * Math.PI * t + phase),
      };
    });
    return smoothPoints(pts);
  });
}
