import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

/* ───────────────── colour palettes ───────────────── */

const LIGHT_COLORS = [
  '#C4593A', '#8B6F47', '#4A8C6F', '#C49A3C',
  '#1B3A5C', '#D47A3A', '#8C2F3A', '#2C4A7C'
];

const DARK_COLORS = [
  '#D4694A', '#A0845C', '#5AA07F', '#D4AA4C',
  '#3B5A7C', '#E48A4A', '#AC4F5A', '#4C6A9C'
];

/* ─────────── helper functions & PRNG ─────────── */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;

/** Evaluate cubic Bézier at t ∈ [0,1] */
const cubicBezier = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

/** Pre-compute a tiny noise texture image for bristle effect */
const createNoiseImage = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const imageData = ctx.createImageData(w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = Math.random() * 55 + 15; // sparse, subtle bristle marks
  }
  ctx.putImageData(imageData, 0, 0);
  return c;
};

// We want deterministic jitter so strokes don't wobble on re-render
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/* ─────── procedural geometry generator ─────── */

const generateStrokes = (seed, count) => {
  const rng = seededRandom(seed);
  const strokes = [];

  for (let i = 0; i < count; i++) {
    // stagger start/end across the page
    const startProgress = (i / count) * 0.75;
    const endProgress = Math.min(startProgress + 0.22 + rng() * 0.18, 1.0);

    const direction = Math.floor(rng() * 4); // 0: L->R, 1: R->L, 2: T->B, 3: B->T
    let path = [];

    const off = 0.15; // amount offscreen
    const variance = 0.45; // curvature variance

    if (direction === 0) { // Left to Right
      const y = 0.1 + rng() * 0.8;
      path = [
        { x: -off, y },
        { x: 0.3,  y: y + (rng() - 0.5) * variance },
        { x: 0.7,  y: y + (rng() - 0.5) * variance },
        { x: 1 + off, y: y + (rng() - 0.5) * 0.1 },
      ];
    } else if (direction === 1) { // Right to Left
      const y = 0.1 + rng() * 0.8;
      path = [
        { x: 1 + off, y },
        { x: 0.7,  y: y + (rng() - 0.5) * variance },
        { x: 0.3,  y: y + (rng() - 0.5) * variance },
        { x: -off, y: y + (rng() - 0.5) * 0.1 },
      ];
    } else if (direction === 2) { // Top to Bottom
      const x = 0.1 + rng() * 0.8;
      path = [
        { x, y: -off },
        { x: x + (rng() - 0.5) * variance, y: 0.3 },
        { x: x + (rng() - 0.5) * variance, y: 0.7 },
        { x: x + (rng() - 0.5) * 0.1, y: 1 + off },
      ];
    } else { // Bottom to Top
      const x = 0.1 + rng() * 0.8;
      path = [
        { x, y: 1 + off },
        { x: x + (rng() - 0.5) * variance, y: 0.7 },
        { x: x + (rng() - 0.5) * variance, y: 0.3 },
        { x: x + (rng() - 0.5) * 0.1, y: -off },
      ];
    }

    strokes.push({
      path,
      widthRange: [35 + rng() * 25, 65 + rng() * 35],
      startProgress,
      endProgress,
      colorIndex: i % 8, // Cycle through existing palette
      opacity: 0.35 + rng() * 0.2
    });
  }
  return strokes;
};

const STROKE_COUNT = 14;
const GENERATED_STROKES = generateStrokes(42, STROKE_COUNT);

const TOTAL_SEGMENTS = 120; // subdivisions per Bézier

/* ═══════════════ Component ═══════════════ */

const PaintStrokeBackground = () => {
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const noiseRef = useRef(null);
  const rafRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  /* Detect dark mode from the root element */
  const getIsDark = () =>
    document.documentElement.getAttribute('data-mode') === 'dark';

  /* ───── draw one stroke at the given fraction ───── */
  const drawStroke = useCallback((ctx, def, color, fraction, w, h) => {
    if (fraction <= 0) return;

    const segments = Math.ceil(TOTAL_SEGMENTS * fraction);
    const [p0, p1, p2, p3] = def.path.map((p) => ({
      x: p.x * w,
      y: p.y * h,
    }));
    const opacity = def.opacity;
    const rng = seededRandom(
      Math.round(def.path[0].x * 1000 + def.path[0].y * 7777)
    );

    ctx.save();
    ctx.globalAlpha = opacity;

    // Build two edge arrays to form a filled ribbon polygon
    // This eliminates the visible circles from individual stroked segments
    const topEdge = [];
    const bottomEdge = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / TOTAL_SEGMENTS;
      const pt = cubicBezier(p0, p1, p2, p3, t);

      // Tangent direction for perpendicular calculation
      const tNext = Math.min(t + 0.005, 1);
      const ptNext = cubicBezier(p0, p1, p2, p3, tNext);
      const dx = ptNext.x - pt.x;
      const dy = ptNext.y - pt.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      const halfWidth = lerp(def.widthRange[0], def.widthRange[1], t) / 2;
      const jitter = (rng() - 0.5) * 4.5;

      topEdge.push({
        x: pt.x + nx * (halfWidth + jitter),
        y: pt.y + ny * (halfWidth + jitter),
      });
      bottomEdge.push({
        x: pt.x - nx * (halfWidth - jitter),
        y: pt.y - ny * (halfWidth - jitter),
      });
    }

    // Draw as a single filled polygon — no segment seams
    ctx.beginPath();
    ctx.moveTo(topEdge[0].x, topEdge[0].y);
    for (let i = 1; i < topEdge.length; i++) {
      ctx.lineTo(topEdge[i].x, topEdge[i].y);
    }
    for (let i = bottomEdge.length - 1; i >= 0; i--) {
      ctx.lineTo(bottomEdge[i].x, bottomEdge[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Bristle texture overlay
    if (noiseRef.current) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = 0.15;
      const nw = noiseRef.current.width;
      const nh = noiseRef.current.height;
      for (let tx = 0; tx < w; tx += nw) {
        for (let ty = 0; ty < h; ty += nh) {
          ctx.drawImage(noiseRef.current, tx, ty);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
  }, []);

  /* ───── full repaint ───── */
  const paintAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);
    const progress = progressRef.current;
    const isDark = getIsDark();
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

    GENERATED_STROKES.forEach((def) => {
      const frac = clamp(
        (progress - def.startProgress) / (def.endProgress - def.startProgress),
        0,
        1
      );
      drawStroke(ctx, def, colors[def.colorIndex], frac, w, h);
    });
  }, [drawStroke]);

  /* ───── resize handling ───── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create noise tile once
    noiseRef.current = createNoiseImage(128, 128);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeRef.current = { w, h };
      paintAll();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [paintAll]);

  /* ───── GSAP scroll-trigger ───── */
  useGSAP(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      scrub: 0.3,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(paintAll);
      },
    });

    return () => trigger.kill();
  }, { dependencies: [paintAll] });

  /* ───── repaint when dark/light mode changes ───── */
  useEffect(() => {
    const observer = new MutationObserver(() => {
      paintAll();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode'],
    });
    return () => observer.disconnect();
  }, [paintAll]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        pointerEvents: 'none',
      }}
    />
  );
};

export default PaintStrokeBackground;
