import React, { useEffect, useRef } from 'react';
import './SpaceBackground.css';

// Three depth layers: [count, minSize, maxSize, minOpacity, maxOpacity, parallaxStrength, scrollRate, twinkleFraction]
const LAYERS = [
  { count: 130, size: [0.35, 0.85], opacity: [0.07, 0.20], parallax: 0.007, scroll: 0.018, twinkle: 0.28 },
  { count: 65, size: [0.80, 1.50], opacity: [0.20, 0.40], parallax: 0.020, scroll: 0.048, twinkle: 0.18 },
  { count: 30, size: [1.40, 2.20], opacity: [0.35, 0.60], parallax: 0.044, scroll: 0.095, twinkle: 0.10 },
];

// Supernova sprite color palette — RGB triplets
const SUPERNOVA_COLORS = [
  [255, 247, 135], // hot yellow-white
  [255, 183, 77],  // amber
  [255, 107, 43],  // orange accent
  [255, 56, 145],  // electric pink
  [176, 68, 255],  // violet
  [59, 158, 255],  // electric blue
  [0, 255, 225],   // cyan
];

// Leans the ejecta sphere + shockwave ring for a 3D read (matches Earth's tilt).
const SUPERNOVA_TILT = -0.34;

// Uniform random direction on the unit sphere — seeds the 3D ejecta shell.
const randUnit = () => {
  const z = rand(-1, 1);
  const th = rand(0, Math.PI * 2);
  const rr = Math.sqrt(1 - z * z);
  return [rr * Math.cos(th), z, rr * Math.sin(th)];
};

const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const buildStars = () => {
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

const SpaceBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1;
    let mouseNX = 0.5, mouseNY = 0.5;
    let smoothNX = 0.5, smoothNY = 0.5;
    let pageScrollY = 0;
    let stars = [];
    let rafId = null;
    let isRunning = true;
    let lastTime = performance.now();
    let starRgb = '255, 255, 255';

    // Personal theme: suppress rockets and (eventually) reveal the Earth scene.
    // 0 = full space/Professional, 1 = full Personal. Eased every frame for a crossfade.
    let isPersonal = false;
    let personalT = 0;

    // ── Shooting stars ──────────────────────────────────────────────
    let shooters = [];
    let nextShootAt = Date.now() + rand(3500, 8000);

    const spawnShooter = () => {
      const speed = rand(380, 680);
      const angleDeg = rand(18, 36);
      const angle = angleDeg * Math.PI / 180;
      shooters.push({
        startX: rand(W * 0.05, W * 0.65),
        startY: rand(H * 0.02, H * 0.38),
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle),
        length: rand(70, 160),
        life: 0,
        duration: rand(0.48, 0.82),
        maxOpacity: rand(0.5, 0.85),
      });
      nextShootAt = Date.now() + rand(5000, 13000);
    };

    // ── Spacecraft models (3D wireframe bodies of revolution) ─────────
    // Each craft is a nose→tail profile of [axial, radius] rings spun into a
    // 3D mesh, plus flat appendages (fins / grid fins / legs). At draw time the
    // mesh is oriented by the rocket's velocity-derived basis (see orient()) and
    // projected with the same orthographic language as the Earth + supernova, so
    // near-side edges read bright and far-side edges dim.
    // Axial coord: +1 = nose (points along travel), −1 = engine end.
    const FOUR = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    const FOUR_OFF = [Math.PI / 4, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];

    // Saturn V — broad, gently tapered stack with an engine skirt + 4 fins
    const SATURN_PROFILE = [
      [1.00, 0.00], [0.88, 0.10], [0.74, 0.17], [0.56, 0.20], [0.22, 0.215],
      [-0.20, 0.215], [-0.54, 0.205], [-0.78, 0.19], [-0.88, 0.235], [-0.97, 0.265],
    ];
    const SATURN_FIN = [[-0.60, 0.21], [-0.96, 0.21], [-0.96, 0.47], [-0.72, 0.40]];

    // Falcon 9 — slim, long first stage with a small fairing, grid fins + legs
    const FALCON_PROFILE = [
      [1.00, 0.00], [0.90, 0.085], [0.80, 0.14], [0.64, 0.155], [0.40, 0.155],
      [-0.54, 0.155], [-0.84, 0.15], [-0.92, 0.115], [-0.99, 0.175],
    ];
    const FALCON_GRIDFIN = [[0.58, 0.155], [0.68, 0.155], [0.68, 0.30], [0.58, 0.30]];
    const FALCON_LEG = [[-0.84, 0.15], [-0.99, 0.42], [-0.92, 0.18]];

    // Spin a profile into rings of N points (apex rings collapse to one point).
    const buildCraft = (profile, N, appendages) => {
      const rings = profile.map(([ax, rad]) => {
        if (rad < 1e-4) return [{ ax, c: 0, s: 0, rad: 0 }];
        const ring = [];
        for (let k = 0; k < N; k++) {
          const th = (k / N) * Math.PI * 2;
          ring.push({ ax, c: Math.cos(th), s: Math.sin(th), rad });
        }
        return ring;
      });
      return {
        rings,
        appendages: appendages || [],
        tailAx: profile[profile.length - 1][0],
      };
    };

    // scale    — model→screen px multiplier
    // hasFlame — draw engine flame + emit smoke
    // geo      — ring/appendage geometry from buildCraft()
    const CRAFT = [
      {
        scale: 17, hasFlame: true,
        geo: buildCraft(SATURN_PROFILE, 9, [{ angles: FOUR, poly: SATURN_FIN }]),
      },
      {
        scale: 16, hasFlame: true,
        geo: buildCraft(FALCON_PROFILE, 9, [
          { angles: FOUR, poly: FALCON_GRIDFIN },
          { angles: FOUR_OFF, poly: FALCON_LEG },
        ]),
      },
    ];

    let rockets = [];
    let smokeParticles = [];
    let nextRocketAt = Date.now() + rand(6000, 14000);

    // ── Supernova (footer ambient bloom) ─────────────────────────────
    // A 3D exploding star: an expanding ejecta shell + a tilted shockwave
    // ring, projected with the same rotation/tilt language as the Earth so
    // both scenes share a depth read. Driven by time + scroll.
    let supernovaSprites = [];   // ejecta particles riding unit directions
    let supernovaRing = [];      // shockwave bead-ring (SN 1987A-style)
    let supernovaRays = [];      // volumetric corona rays (3D directions)
    let smoothSupernovaAlpha = 0;
    let burstT = 0;              // detonation clock 0→1 (0 = collapsed flash)

    const spawnRocket = () => {
      const modelIdx = Math.floor(Math.random() * CRAFT.length);
      const side = Math.floor(Math.random() * 4);
      let startX, startY;
      const margin = 90;

      const targetX = W * (0.25 + Math.random() * 0.5);
      const targetY = H * (0.25 + Math.random() * 0.5);

      switch (side) {
        case 0: startX = rand(W * 0.05, W * 0.95); startY = -margin; break;
        case 1: startX = W + margin; startY = rand(H * 0.05, H * 0.95); break;
        case 2: startX = rand(W * 0.05, W * 0.95); startY = H + margin; break;
        default: startX = -margin; startY = rand(H * 0.05, H * 0.95); break;
      }

      const dx = targetX - startX;
      const dy = targetY - startY;
      const angle = Math.atan2(dy, dx);
      const speed = rand(130, 230);

      // curve: angular velocity in rad/s — negative = left arc, positive = right arc
      const curve = rand(-0.18, 0.18);

      rockets.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle,
        speed,
        curve,
        modelIdx,
        // pitch tilts the body axis out of the screen plane (so cross-section
        // rings read as ellipses); roll spins it about its long axis (so fins
        // orbit and the wireframe visibly rotates, like the Earth).
        pitch: rand(0.42, 0.8) * (Math.random() < 0.5 ? 1 : -1),
        roll: Math.random() * Math.PI * 2,
        rollSpeed: rand(0.35, 0.85) * (Math.random() < 0.5 ? 1 : -1),
        smokeTimer: 0,
      });

      nextRocketAt = Date.now() + rand(22000, 50000);
    };

    // Build the rocket's orthonormal orientation basis from its heading +
    // pitch + roll. `fwd` points along travel (with an out-of-plane tilt from
    // pitch); `right`/`up` span the body cross-section and spin with `roll`.
    const orient = (r) => {
      const cp = Math.cos(r.pitch), sp = Math.sin(r.pitch);
      const fwd = { x: Math.cos(r.angle) * cp, y: Math.sin(r.angle) * cp, z: sp };
      // right0 = fwd × worldUp(0,0,1) — stays in the screen plane
      let rx = fwd.y, ry = -fwd.x, rz = 0;
      let rl = Math.hypot(rx, ry, rz);
      if (rl < 1e-4) { rx = 1; ry = 0; rz = 0; rl = 1; }
      rx /= rl; ry /= rl; rz /= rl;
      // up0 = right0 × fwd — gains the out-of-plane (z) component
      const ux = ry * fwd.z - rz * fwd.y;
      const uy = rz * fwd.x - rx * fwd.z;
      const uz = rx * fwd.y - ry * fwd.x;
      const cr = Math.cos(r.roll), sr = Math.sin(r.roll);
      return {
        fwd,
        right: { x: cr * rx + sr * ux, y: cr * ry + sr * uy, z: cr * rz + sr * uz },
        up:    { x: -sr * rx + cr * ux, y: -sr * ry + cr * uy, z: -sr * rz + cr * uz },
      };
    };

    // Project a model vertex {ax, c, s, rad} through the basis to screen + depth.
    const projVert = (r, scale, B, v) => {
      const dx = B.fwd.x * v.ax + (B.right.x * v.c + B.up.x * v.s) * v.rad;
      const dy = B.fwd.y * v.ax + (B.right.y * v.c + B.up.y * v.s) * v.rad;
      const dz = B.fwd.z * v.ax + (B.right.z * v.c + B.up.z * v.s) * v.rad;
      return { x: r.x + scale * dx, y: r.y + scale * dy, z: dz };
    };

    const drawRocket = (r, now) => {
      const model = CRAFT[r.modelIdx];
      const scale = model.scale;
      const B = orient(r);

      // ── Engine flame — 2D billboard anchored at the projected engine plane,
      // thrusting opposite the on-screen travel direction.
      if (model.hasFlame) {
        const tailX = r.x + scale * B.fwd.x * model.geo.tailAx;
        const tailY = r.y + scale * B.fwd.y * model.geo.tailAx;
        const tailDir = Math.atan2(-B.fwd.y, -B.fwd.x);
        const perpX = -Math.sin(tailDir);
        const perpY = Math.cos(tailDir);
        const flicker = Math.sin(now * 0.011) * 0.5 + Math.sin(now * 0.023) * 0.35 + Math.sin(now * 0.037) * 0.15;
        const flameLen = 16 + flicker * 7;
        const flameW = 4.5 + flicker * 1.8;
        const wiggle = Math.sin(now * 0.019) * 2;
        const flameTipX = tailX + Math.cos(tailDir) * flameLen;
        const flameTipY = tailY + Math.sin(tailDir) * flameLen;
        const midX = tailX + Math.cos(tailDir) * flameLen * 0.45 + perpX * wiggle;
        const midY = tailY + Math.sin(tailDir) * flameLen * 0.45 + perpY * wiggle;

        const flameGrad = ctx.createLinearGradient(tailX, tailY, flameTipX, flameTipY);
        flameGrad.addColorStop(0, 'rgba(255, 235, 140, 1)');
        flameGrad.addColorStop(0.3, 'rgba(255, 107, 43, 0.92)');
        flameGrad.addColorStop(0.7, 'rgba(255, 40, 10, 0.55)');
        flameGrad.addColorStop(1, 'rgba(200, 20, 0, 0)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tailX + perpX * flameW, tailY + perpY * flameW);
        ctx.quadraticCurveTo(midX, midY, flameTipX, flameTipY);
        ctx.quadraticCurveTo(midX, midY, tailX - perpX * flameW, tailY - perpY * flameW);
        ctx.closePath();
        ctx.fillStyle = flameGrad;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(255, 100, 20, 0.65)';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // ── 3D wireframe — project rings, collect edges, depth-sort, stroke.
      const rings = model.geo.rings;
      const ringPts = [];
      let zmin = Infinity, zmax = -Infinity;
      for (const ring of rings) {
        const pts = [];
        for (const v of ring) {
          const p = projVert(r, scale, B, v);
          if (p.z < zmin) zmin = p.z;
          if (p.z > zmax) zmax = p.z;
          pts.push(p);
        }
        ringPts.push(pts);
      }

      const segs = [];
      const pushSeg = (p1, p2, amber, base) =>
        segs.push({ p1, p2, zm: (p1.z + p2.z) * 0.5, amber, base });

      // Ring hoops (the engine-end ring reads as the nozzle mouth → amber)
      for (let i = 0; i < ringPts.length; i++) {
        const pts = ringPts[i];
        if (pts.length < 3) continue;
        const amber = i === ringPts.length - 1;
        for (let k = 0; k < pts.length; k++) {
          pushSeg(pts[k], pts[(k + 1) % pts.length], amber, amber ? 0.85 : 0.7);
        }
      }
      // Longerons between adjacent rings (apex rings fan out to the next ring)
      for (let i = 0; i < ringPts.length - 1; i++) {
        const a = ringPts[i], b = ringPts[i + 1];
        if (a.length === 1) { for (const p of b) pushSeg(a[0], p, false, 0.85); }
        else if (b.length === 1) { for (const p of a) pushSeg(p, b[0], false, 0.85); }
        else { const n = Math.min(a.length, b.length); for (let k = 0; k < n; k++) pushSeg(a[k], b[k], false, 0.85); }
      }
      // Appendages (fins / grid fins / legs) — closed amber polylines
      for (const app of model.geo.appendages) {
        for (const th0 of app.angles) {
          const c0 = Math.cos(th0), s0 = Math.sin(th0);
          const poly = app.poly.map(([ax, rad]) => projVert(r, scale, B, { ax, c: c0, s: s0, rad }));
          for (let k = 0; k < poly.length; k++) {
            pushSeg(poly[k], poly[(k + 1) % poly.length], true, 0.92);
          }
        }
      }

      const zRange = (zmax - zmin) || 1;
      segs.sort((m, n) => m.zm - n.zm); // painter's order: far edges first
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const sg of segs) {
        const d = (sg.zm - zmin) / zRange;          // 0 = far, 1 = near
        ctx.globalAlpha = clamp(lerp(0.14, 1, d) * sg.base, 0, 1);
        ctx.lineWidth = sg.amber ? 1.15 : 1;
        ctx.strokeStyle = sg.amber ? 'rgb(255, 107, 43)' : `rgb(${starRgb})`;
        ctx.beginPath();
        ctx.moveTo(sg.p1.x, sg.p1.y);
        ctx.lineTo(sg.p2.x, sg.p2.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const buildSupernovaSprites = () => {
      const pickColor = () =>
        SUPERNOVA_COLORS[Math.floor(Math.random() * SUPERNOVA_COLORS.length)];

      // ── Ejecta shell ──────────────────────────────────────────────
      // Each particle rides a fixed unit direction (ux,uy,uz); `dist` is its
      // radial throw in screen px and breathes between min/max. At draw time
      // the direction is spun + tilted, so the cloud reads as a real sphere
      // — near-side (z>0) bright & large, far-side (z<0) dim & small.
      supernovaSprites = [];
      // Dense inner shell — vibrant cluster near the core
      for (let i = 0; i < 46; i++) {
        const [r, g, b] = pickColor();
        const [ux, uy, uz] = randUnit();
        const minD = rand(28, 86);
        const maxD = rand(140, 250);
        supernovaSprites.push({
          ux, uy, uz,
          dist: rand(minD, maxD), minDist: minD, maxDist: maxD,
          vDist: rand(5, 20) * (Math.random() < 0.5 ? 1 : -1),
          size: rand(1.4, 4.2),
          baseOpacity: rand(0.55, 0.95),
          twinkleSpeed: rand(1.2, 3.5),
          twinklePhase: Math.random() * Math.PI * 2,
          r, g, b,
        });
      }
      // Sparse outer spray — wider, dimmer
      for (let i = 0; i < 26; i++) {
        const [r, g, b] = pickColor();
        const [ux, uy, uz] = randUnit();
        const minD = rand(200, 290);
        const maxD = rand(350, 500);
        supernovaSprites.push({
          ux, uy, uz,
          dist: rand(minD, maxD), minDist: minD, maxDist: maxD,
          vDist: rand(3, 12) * (Math.random() < 0.5 ? 1 : -1),
          size: rand(0.8, 2.6),
          baseOpacity: rand(0.28, 0.66),
          twinkleSpeed: rand(0.7, 2.1),
          twinklePhase: Math.random() * Math.PI * 2,
          r, g, b,
        });
      }

      // ── Shockwave ring ────────────────────────────────────────────
      // Beads spaced around an equatorial circle. The same spin+tilt that
      // turns the shell leans this ring into an ellipse; its back arc draws
      // behind the core and the front arc in front — exactly like the Moon.
      supernovaRing = [];
      const beads = 56;
      for (let i = 0; i < beads; i++) {
        supernovaRing.push({
          a: (i / beads) * Math.PI * 2,
          knot: Math.random() < 0.16 ? rand(1.7, 2.7) : 1, // bright hotspots
          phase: Math.random() * Math.PI * 2,
          flick: rand(0.8, 2.2),
        });
      }

      // ── Volumetric corona rays ────────────────────────────────────
      // 3D ray directions that rotate with the shell; foreshorten + dim on
      // the far side, so the burst looks like it radiates through space.
      supernovaRays = [];
      for (let i = 0; i < 16; i++) {
        const [ux, uy, uz] = randUnit();
        supernovaRays.push({
          ux, uy, uz,
          len: rand(150, 360),
          phase: Math.random() * Math.PI * 2,
          w: rand(0.7, 1.7),
        });
      }
    };

    const drawSupernova = (now, dt, alpha, burst) => {
      // Centered hero placement — same anchor + mouse parallax as the
      // Personal Earth scene, so the two themes share a focal point.
      const cx = W * 0.5 + (smoothNX - 0.5) * -34;
      const cy = H * 0.72 + (smoothNY - 0.5) * -22;

      // Always advance the ejecta breathing so the shell is alive when revealed
      for (const sp of supernovaSprites) {
        sp.dist += sp.vDist * dt;
        if (sp.dist <= sp.minDist || sp.dist >= sp.maxDist) {
          sp.vDist *= -1;
          sp.dist = clamp(sp.dist, sp.minDist, sp.maxDist);
        }
      }

      if (alpha < 0.005) return;

      // ── 3D frame ──────────────────────────────────────────────────
      // Spin about the vertical axis (time + scroll, like the Earth) then a
      // fixed tilt, so the whole explosion turns as a single solid object.
      const spin = now * 0.00003 + pageScrollY * 0.0014;
      const cS = Math.cos(spin), sS = Math.sin(spin);
      const cT = Math.cos(SUPERNOVA_TILT), sT = Math.sin(SUPERNOVA_TILT);
      const rot3 = (ux, uy, uz) => {
        const xr = ux * cS + uz * sS;       // spin about Y
        const zr0 = -ux * sS + uz * cS;
        const yr = uy * cT - zr0 * sT;       // tilt about X
        const zr = uy * sT + zr0 * cT;       // zr > 0 → toward the viewer
        return { x: xr, y: yr, z: zr };
      };
      const breathe = 0.5 + 0.5 * Math.sin(now * 0.00046);

      // Detonation envelope. `expand` throws the ejecta / ring / rays out
      // from a collapsed point (0) to the settled remnant (1) with a small
      // overshoot; `flash` is the blinding first-light that decays as the
      // shell flies apart.
      const expand = burst >= 1
        ? 1
        : (1 - Math.pow(1 - burst, 2.6)) + Math.sin(burst * Math.PI) * 0.1;
      const flash = Math.pow(1 - burst, 2.2);

      // ── Ambient glow (cool halo → warm corona) ────────────────────
      const outerR = Math.min(W * 1.02, H * 1.17);
      const g0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      g0.addColorStop(0.00, `rgba(176,68,255,${(0.13 * alpha).toFixed(3)})`);
      g0.addColorStop(0.28, `rgba(59,158,255,${(0.11 * alpha).toFixed(3)})`);
      g0.addColorStop(0.58, `rgba(0,220,255,${(0.06 * alpha).toFixed(3)})`);
      g0.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, TAU);
      ctx.fillStyle = g0;
      ctx.fill();

      const midR = Math.min(W * 0.60, H * 0.75);
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, midR);
      g1.addColorStop(0.00, `rgba(255,220,80,${(0.28 * alpha).toFixed(3)})`);
      g1.addColorStop(0.22, `rgba(255,107,43,${(0.22 * alpha).toFixed(3)})`);
      g1.addColorStop(0.48, `rgba(255,56,145,${(0.13 * alpha).toFixed(3)})`);
      g1.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, midR, 0, TAU);
      ctx.fillStyle = g1;
      ctx.fill();

      // ── Project the shockwave ring + ejecta once, sort into depth halves
      const ringBase = Math.min(W * 0.42, H * 0.52);
      const ringR = ringBase * (0.9 + 0.13 * breathe) * expand;
      const ringPts = supernovaRing.map((bd) => {
        const p = rot3(Math.cos(bd.a), 0, Math.sin(bd.a)); // equatorial circle
        return { sx: cx + p.x * ringR, sy: cy + p.y * ringR, depth: p.z, bd };
      });
      const parts = supernovaSprites.map((sp) => {
        const p = rot3(sp.ux, sp.uy, sp.uz);
        const d = sp.dist * expand;
        return { sp, sx: cx + p.x * d, sy: cy + p.y * d, depth: p.z };
      });

      // ── Paint helpers ─────────────────────────────────────────────
      const drawBead = (rp) => {
        const d = (rp.depth + 1) / 2;                 // 0 back .. 1 front
        const flick = 0.6 + 0.4 * Math.sin(now * 0.001 * rp.bd.flick + rp.bd.phase);
        const a = clamp((0.16 + 0.5 * d) * flick * rp.bd.knot * alpha, 0, 1);
        if (a < 0.02 || rp.sy > H + 6) return;
        const size = (0.85 + 1.7 * d) * rp.bd.knot;
        ctx.globalAlpha = a;
        ctx.shadowBlur = size * 4;
        ctx.shadowColor = 'rgba(255,150,70,0.9)';
        ctx.fillStyle = 'rgba(255,214,150,1)';
        ctx.beginPath();
        ctx.arc(rp.sx, rp.sy, size, 0, TAU);
        ctx.fill();
      };
      const drawParticle = (pt) => {
        if (pt.sy > H + 6) return;
        const sp = pt.sp;
        const d = (pt.depth + 1) / 2;                 // 0 far .. 1 near
        const tPhase = now * 0.001 * sp.twinkleSpeed + sp.twinklePhase;
        const flicker = 0.42 + 0.58 * Math.abs(Math.sin(tPhase));
        const opacity = sp.baseOpacity * flicker * lerp(0.3, 1, d) * alpha;
        if (opacity < 0.025) return;
        const size = sp.size * lerp(0.65, 1.3, d);
        ctx.globalAlpha = clamp(opacity, 0, 1);
        ctx.shadowBlur = size * 5.5 * lerp(0.6, 1.15, d);
        ctx.shadowColor = `rgb(${sp.r},${sp.g},${sp.b})`;
        ctx.fillStyle = `rgb(${sp.r},${sp.g},${sp.b})`;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, size, 0, TAU);
        ctx.fill();
      };

      // ── Back hemisphere (behind the core) ─────────────────────────
      ctx.save();
      for (const pt of parts) if (pt.depth < 0) drawParticle(pt);
      for (const rp of ringPts) if (rp.depth < 0) drawBead(rp);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Volumetric corona rays (radiate from the core through the shell)
      ctx.save();
      ctx.lineCap = 'round';
      for (const ray of supernovaRays) {
        const p = rot3(ray.ux, ray.uy, ray.uz);
        const d = (p.z + 1) / 2;
        const pulse = 0.6 + 0.4 * Math.abs(Math.sin(now * 0.0007 + ray.phase));
        const len = ray.len * (0.7 + 0.5 * breathe) * pulse * expand;
        const ex = cx + p.x * len, ey = cy + p.y * len;
        if (ey > H + 20 && cy > H + 20) continue;
        const rA = (0.04 + 0.22 * d) * pulse * alpha;
        if (rA < 0.015) continue;
        const rGrad = ctx.createLinearGradient(cx, cy, ex, ey);
        rGrad.addColorStop(0.0, `rgba(255,230,120,${rA.toFixed(3)})`);
        rGrad.addColorStop(0.5, `rgba(255,150,60,${(rA * 0.44).toFixed(3)})`);
        rGrad.addColorStop(1.0, 'rgba(200,80,30,0)');
        ctx.lineWidth = ray.w * lerp(0.7, 1.5, d);
        ctx.strokeStyle = rGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      ctx.restore();

      // ── Hot core — sphere with an offset highlight for a volumetric read
      const pulse = 1 + 0.13 * Math.sin(now * 0.00092);
      const coreR = 120 * pulse;
      const hx = cx - coreR * 0.16, hy = cy - coreR * 0.2; // highlight bias
      const g2 = ctx.createRadialGradient(hx, hy, 0, cx, cy, coreR);
      g2.addColorStop(0.00, `rgba(255,255,235,${(0.96 * alpha).toFixed(3)})`);
      g2.addColorStop(0.13, `rgba(255,245,160,${(0.86 * alpha).toFixed(3)})`);
      g2.addColorStop(0.34, `rgba(255,200,80,${(0.60 * alpha).toFixed(3)})`);
      g2.addColorStop(0.65, `rgba(255,100,40,${(0.26 * alpha).toFixed(3)})`);
      g2.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.shadowBlur = 112;
      ctx.shadowColor = `rgba(255,200,60,${(0.52 * alpha).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, TAU);
      ctx.fillStyle = g2;
      ctx.fill();
      ctx.restore();

      // ── First-light flash — the blinding initial blast; grows as it dims
      if (flash > 0.01) {
        const fR = coreR + Math.min(W, H) * 0.5 * burst;
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, fR);
        fg.addColorStop(0.00, `rgba(255,255,250,${(0.85 * flash * alpha).toFixed(3)})`);
        fg.addColorStop(0.35, `rgba(255,242,205,${(0.45 * flash * alpha).toFixed(3)})`);
        fg.addColorStop(1.00, 'rgba(255,200,120,0)');
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(cx, cy, fR, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      // ── Front hemisphere (in front of the core) ───────────────────
      ctx.save();
      for (const rp of ringPts) if (rp.depth >= 0) drawBead(rp);
      for (const pt of parts) if (pt.depth >= 0) drawParticle(pt);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Expanding shockwave — a bright shell racing out on detonation
      if (burst < 0.999) {
        const shockR = burst * Math.min(W, H) * 0.72;
        const shockA = Math.pow(1 - burst, 1.6) * 0.5 * alpha;
        if (shockA > 0.012 && shockR > 4) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = `rgba(255,226,184,${shockA.toFixed(3)})`;
          ctx.lineWidth = 2 + 7 * (1 - burst);
          ctx.beginPath();
          ctx.arc(cx, cy, shockR, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Central lens flare cross
      const fA = (0.58 + 0.18 * Math.sin(now * 0.00128)) * alpha;
      const fLen = 81 + 29 * Math.sin(now * 0.00155);
      ctx.save();
      ctx.shadowBlur = 48;
      ctx.shadowColor = `rgba(255,240,160,${fA.toFixed(3)})`;
      ctx.strokeStyle = `rgba(255,255,215,${fA.toFixed(3)})`;
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - fLen, cy); ctx.lineTo(cx + fLen, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - fLen * 0.65); ctx.lineTo(cx, cy + fLen * 0.65); ctx.stroke();
      const dLen = fLen * 0.62;
      ctx.globalAlpha = fA * 0.42;
      ctx.beginPath(); ctx.moveTo(cx - dLen, cy - dLen); ctx.lineTo(cx + dLen, cy + dLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + dLen, cy - dLen); ctx.lineTo(cx - dLen, cy + dLen); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    // ── Mini solar system (Professional theme, top-right corner) ─────
    // A tiny 3D orrery pinned to the SAME screen anchor as the Personal
    // Sun (W*0.85, H*0.17). The whole disk shares the supernova's spin
    // clock under a fixed tilt, so it turns in lockstep with the burst;
    // each planet additionally revolves on its own Kepler-ish period.
    // Orbit rings are depth-shaded and planets sort in front of / behind
    // the Sun, giving the flat ecliptic a real 3D read.
    const SS_TILT = -0.52;           // leans the ecliptic toward the viewer
    const SOLAR_PLANETS = [
      { orbit: 0.16,  size: 1.3, speed: 0.330, color: [176, 170, 160] }, // Mercury
      { orbit: 0.235, size: 1.7, speed: 0.255, color: [214, 188, 140] }, // Venus
      { orbit: 0.32,  size: 1.8, speed: 0.205, color: [90, 150, 210]  }, // Earth
      { orbit: 0.41,  size: 1.5, speed: 0.168, color: [205, 110, 70]  }, // Mars
      { orbit: 0.58,  size: 3.1, speed: 0.092, color: [206, 170, 132] }, // Jupiter
      { orbit: 0.73,  size: 2.7, speed: 0.070, color: [222, 196, 140], ring: true }, // Saturn
      { orbit: 0.87,  size: 2.1, speed: 0.050, color: [150, 214, 222] }, // Uranus
      { orbit: 1.00,  size: 2.0, speed: 0.038, color: [90, 130, 224]  }, // Neptune
    ].map((p) => ({ ...p, phase: Math.random() * Math.PI * 2 }));

    // eslint-disable-next-line no-unused-vars
    const drawMiniSolarSystem = (now, alpha) => {
      if (alpha < 0.005) return;
      const cx = W * 0.85 + (smoothNX - 0.5) * -20;
      const cy = H * 0.17 + (smoothNY - 0.5) * -14;
      const maxOrbit = Math.min(W, H) * 0.12;

      // Shared 3D frame — identical spin to the supernova, fixed tilt, so
      // the orrery and the explosion turn as one rigid system.
      const spin = now * 0.00003 + pageScrollY * 0.0014;
      const cS = Math.cos(spin), sS = Math.sin(spin);
      const cT = Math.cos(SS_TILT), sT = Math.sin(SS_TILT);
      const rot3 = (ux, uy, uz) => {
        const xr = ux * cS + uz * sS;       // spin about Y
        const zr0 = -ux * sS + uz * cS;
        const yr = uy * cT - zr0 * sT;       // tilt about X
        const zr = uy * sT + zr0 * cT;       // zr > 0 → toward the viewer
        return { x: xr, y: yr, z: zr };
      };

      // ── Orbit rings — sampled + depth-shaded so the far arc dims ────
      ctx.save();
      ctx.lineCap = 'round';
      const RINGSEG = 64;
      for (const pl of SOLAR_PLANETS) {
        const R = pl.orbit * maxOrbit;
        let prev = null;
        for (let i = 0; i <= RINGSEG; i++) {
          const a = (i / RINGSEG) * TAU;
          const p = rot3(Math.cos(a) * R, 0, Math.sin(a) * R);
          const cur = { x: cx + p.x, y: cy + p.y, d: (p.z / R + 1) / 2 };
          if (prev) {
            const dd = (prev.d + cur.d) / 2;   // 0 back .. 1 front
            ctx.globalAlpha = clamp(lerp(0.04, 0.22, dd) * alpha, 0, 1);
            ctx.strokeStyle = `rgb(${starRgb})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(cur.x, cur.y);
            ctx.stroke();
          }
          prev = cur;
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ── Planets — project, then split front/back around the Sun ─────
      const placed = SOLAR_PLANETS.map((pl) => {
        const R = pl.orbit * maxOrbit;
        const a = pl.phase + now * 0.001 * pl.speed + pageScrollY * 0.0011 * pl.speed;
        const p = rot3(Math.cos(a) * R, 0, Math.sin(a) * R);
        return { pl, sx: cx + p.x, sy: cy + p.y, depth: p.z, R };
      });

      const drawPlanet = (it) => {
        const pl = it.pl;
        const d = (it.depth / it.R + 1) / 2;        // 0 back .. 1 front
        const sz = pl.size * lerp(0.78, 1.18, d);
        const [r, g, b] = pl.color;
        const a = clamp(lerp(0.4, 1, d) * alpha, 0, 1);

        // Saturn's ring — a tiny tilted ellipse in amber
        if (pl.ring) {
          ctx.save();
          ctx.globalAlpha = a * 0.85;
          ctx.strokeStyle = 'rgba(255,184,112,0.95)';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.ellipse(it.sx, it.sy, sz * 2.3, sz * 0.82, spin * 0.5 - 0.4, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = a;
        ctx.shadowBlur = sz * 3.2;
        ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
        const grad = ctx.createRadialGradient(
          it.sx - sz * 0.32, it.sy - sz * 0.32, 0, it.sx, it.sy, sz);
        grad.addColorStop(0,
          `rgb(${Math.min(255, r + 64)},${Math.min(255, g + 64)},${Math.min(255, b + 64)})`);
        grad.addColorStop(1, `rgb(${r},${g},${b})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(it.sx, it.sy, sz, 0, TAU);
        ctx.fill();
        ctx.restore();
      };

      // Back hemisphere (behind the Sun)
      for (const it of placed) if (it.depth < 0) drawPlanet(it);

      // ── Sun ─────────────────────────────────────────────────────────
      const sunPulse = 0.5 + 0.5 * Math.sin(now * 0.0012);
      const sunR = maxOrbit * 0.09 * (1 + 0.08 * sunPulse);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 6.5);
      halo.addColorStop(0,   `rgba(255,206,96,${(0.5 * alpha).toFixed(3)})`);
      halo.addColorStop(0.4, `rgba(255,140,50,${(0.12 * alpha).toFixed(3)})`);
      halo.addColorStop(1,   'rgba(255,120,40,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, sunR * 6.5, 0, TAU); ctx.fill();
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR);
      core.addColorStop(0,    `rgba(255,252,238,${alpha.toFixed(3)})`);
      core.addColorStop(0.55, `rgba(255,206,120,${alpha.toFixed(3)})`);
      core.addColorStop(1,    'rgba(255,140,50,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, TAU); ctx.fill();
      ctx.restore();

      // Front hemisphere (in front of the Sun)
      for (const it of placed) if (it.depth >= 0) drawPlanet(it);
    };

    // ── Helpers ──────────────────────────────────────────────────────
    const updateStarColor = () => {
      const v = window.getComputedStyle(document.documentElement)
        .getPropertyValue('--text-rgb').trim();
      if (v) starRgb = v;
    };

    const updateTheme = () => {
      isPersonal = document.documentElement.getAttribute('data-theme') === 'personal';
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = buildStars();
    };

    // ── Earth scene (Personal theme) ─────────────────────────────────
    // Floating Earth (focus) + orbiting Moon + corner Sun, rendered procedurally
    // to stay true to the wireframe/stippled "DEEP SIGNAL" aesthetic. The whole
    // scene fades + scales in with `t` (eased Professional->Personal progress).
    // Earth spin and Moon orbit are driven by BOTH time and scroll position, so
    // scrolling the Personal page advances the little orbital-mechanics diagram.
    const TAU = Math.PI * 2;
    const smoothstep = (a, b, x) => {
      const u = clamp((x - a) / (b - a), 0, 1);
      return u * u * (3 - 2 * u);
    };

    // Simplified continent outlines as [lon, lat] polygons (degrees). Coarse but
    // recognizable — densified + orthographically projected onto the rotating
    // sphere each frame, then filled as silhouettes.
    const LAND_SHAPES = [
      // North America (+ Central America tail)
      [[-158,71],[-128,70],[-100,69],[-84,70],[-82,73],[-74,68],[-64,60],[-56,52],
       [-66,47],[-70,43],[-74,40],[-76,35],[-81,31],[-81,25],[-90,30],[-97,26],
       [-97,20],[-92,18],[-87,16],[-83,9],[-77,8],[-83,14],[-95,16],[-105,20],
       [-112,24],[-117,32],[-123,38],[-124,46],[-130,52],[-141,60],[-152,59],[-165,60]],
      // Greenland
      [[-45,60],[-30,61],[-20,70],[-22,76],[-32,82],[-46,83],[-58,79],[-54,72],[-50,64]],
      // South America
      [[-77,8],[-70,12],[-61,10],[-50,0],[-44,-2],[-35,-6],[-39,-14],[-48,-25],
       [-56,-34],[-64,-41],[-69,-52],[-66,-55],[-74,-50],[-73,-41],[-71,-30],
       [-72,-18],[-78,-8],[-81,-4],[-80,2],[-78,6]],
      // Africa
      [[-16,15],[-12,25],[-5,32],[2,36],[10,37],[18,32],[25,32],[33,31],[35,24],
       [38,16],[43,11],[51,12],[49,4],[42,-1],[40,-11],[35,-22],[26,-34],[19,-35],
       [14,-22],[9,-1],[5,5],[-4,5],[-10,6]],
      // Madagascar
      [[44,-16],[50,-15],[50,-25],[45,-25]],
      // Europe
      [[-9,37],[-9,44],[-2,49],[2,51],[8,54],[5,58],[10,63],[18,69],[28,71],[30,66],
       [26,60],[22,56],[16,54],[14,46],[19,42],[24,41],[14,38],[3,42]],
      // United Kingdom
      [[-5,50],[-3,53],[-2,57],[-6,58],[-8,55],[-6,51]],
      // Asia (India + SE Asia mainland included in the outline)
      [[40,68],[55,71],[70,73],[95,77],[110,76],[128,73],[142,72],[160,70],[172,67],
       [178,65],[170,60],[160,61],[150,53],[142,46],[135,44],[127,40],[122,40],
       [122,30],[110,21],[106,11],[100,6],[96,16],[90,22],[88,21],[80,8],[77,9],
       [73,18],[66,25],[57,26],[50,30],[44,38],[40,44],[48,52],[55,56],[46,62]],
      // Japan
      [[131,33],[136,35],[140,38],[142,41],[139,42],[135,35],[132,32]],
      // SE Asia / Borneo
      [[109,-3],[117,-2],[119,2],[114,5],[109,2],[107,0]],
      // Australia
      [[114,-22],[122,-18],[130,-12],[137,-12],[143,-11],[146,-18],[151,-25],
       [150,-38],[143,-39],[136,-35],[129,-32],[122,-34],[115,-34]],
      // New Zealand
      [[167,-46],[171,-44],[175,-41],[178,-38],[173,-42],[168,-45]],
    ];

    const TO_RAD = Math.PI / 180;
    const densify = (poly) => {
      const out = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        const steps = Math.max(1, Math.ceil(
          Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 2.5));
        for (let s = 0; s < steps; s++) {
          const f = s / steps;
          const lat = (a[1] + (b[1] - a[1]) * f) * TO_RAD;
          out.push({
            lon: (a[0] + (b[0] - a[0]) * f) * TO_RAD,
            sinLat: Math.sin(lat),
            cosLat: Math.cos(lat),
          });
        }
      }
      return out;
    };
    const LAND = LAND_SHAPES.map(densify);

    // Major metros for the night-side "city lights" glimmer.
    const CITIES = [
      [-74,40],[-118,34],[-99,19],[-74,4],[-46,-23],[-58,-34],[0,51],[2,48],[-3,40],
      [3,6],[31,30],[28,-26],[36,-1],[37,55],[29,41],[55,25],[72,19],[77,28],[116,40],
      [121,31],[139,35],[127,37],[103,1],[106,-6],[151,-33],[100,13],
    ].map(([lo, la]) => ({
      lon: lo * TO_RAD,
      sinLat: Math.sin(la * TO_RAD),
      cosLat: Math.cos(la * TO_RAD),
      flick: rand(0.6, 1.7),
      phase: Math.random() * TAU,
    }));

    const EARTH_TILT = -0.24; // axial tilt — leans the globe for a 3D read
    const cTilt = Math.cos(EARTH_TILT), sTilt = Math.sin(EARTH_TILT);

    const MOON_CRATERS = [
      [-0.34, -0.10, 0.16], [0.10, -0.34, 0.12], [0.30, 0.20, 0.18],
      [-0.16, 0.36, 0.13], [0.42, -0.14, 0.09],
    ];

    // Geocentric ecliptic — the Sun + planets revolve around the Earth as the
    // page scrolls (a "view from Earth"). All bodies ride one tilted plane so
    // their orbits read as 3D ellipses and they pass in front of / behind the
    // globe. `orbit` = radius as a fraction of min(W,H); `speed` scales the
    // scroll+time revolution (inner bodies faster, Kepler-ish). The Sun is one
    // of the bodies, and its live position drives the Earth's day/night light.
    const SCENE_TILT = -0.42;
    const GEO_BODIES = [
      { orbit: 0.275, size: 2.0, speed: 2.05, color: [176, 170, 160] }, // Mercury
      { orbit: 0.325, size: 2.6, speed: 1.55, color: [214, 188, 140] }, // Venus
      { orbit: 0.380, size: 0,   speed: 1.15, color: [255, 210, 120], sun: true }, // Sun
      { orbit: 0.430, size: 2.2, speed: 0.92, color: [205, 110, 70]  }, // Mars
      { orbit: 0.475, size: 4.2, speed: 0.50, color: [206, 170, 132] }, // Jupiter
      { orbit: 0.520, size: 3.6, speed: 0.37, color: [222, 196, 140], ring: true }, // Saturn
      { orbit: 0.560, size: 3.0, speed: 0.27, color: [150, 214, 222] }, // Uranus
      { orbit: 0.600, size: 2.9, speed: 0.21, color: [90, 130, 224]  }, // Neptune
    ].map((b) => ({ ...b, phase: Math.random() * TAU }));

    // Sun surface features ride a spinning, tilted sphere so the Sun visibly
    // ROTATES on its axis (not just orbits): each spot/facula sweeps across the
    // face and disappears around the limb. [lon, lat] in radians; `hot` = bright
    // facula, otherwise a dark sunspot.
    const SUN_TILT = -0.30;
    const SUN_SPOTS = [
      { lon: -0.6, lat:  0.28, r: 0.20, hot: false },
      { lon:  0.25, lat: -0.36, r: 0.15, hot: false },
      { lon:  1.0,  lat:  0.06, r: 0.12, hot: false },
      { lon: -1.7, lat: -0.12, r: 0.16, hot: false },
      { lon:  2.5,  lat:  0.30, r: 0.10, hot: true  },
      { lon:  3.4,  lat: -0.22, r: 0.13, hot: true  },
      { lon:  4.6,  lat:  0.14, r: 0.11, hot: false },
    ].map((s) => ({ ...s, sinLat: Math.sin(s.lat), cosLat: Math.cos(s.lat) }));

    // A compact orbiting Sun (used in the geocentric scene). Beyond riding its
    // orbit, it SPINS on its axis: sunspots + faculae on a rotating sphere (time
    // + scroll) sweep across the disc and around the limb, and the corona rays
    // turn with it. `minWH`-scaled; depth ordering vs. the Earth handles eclipses.
    const drawGeoSun = (now, sx, sy, minWH, ease) => {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.0011);
      const coreR = minWH * 0.028 * (1 + 0.06 * pulse);
      const spin = now * 0.0006 + pageScrollY * 0.004;   // axial rotation
      const cT = Math.cos(SUN_TILT), sT = Math.sin(SUN_TILT);

      // ── Corona + rotating flare rays (additive glow) ─────────────────
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const corona = ctx.createRadialGradient(sx, sy, 0, sx, sy, coreR * 7);
      corona.addColorStop(0,    `rgba(255,228,158,${(0.55 * ease).toFixed(3)})`);
      corona.addColorStop(0.32, `rgba(255,150,60,${(0.18 * ease).toFixed(3)})`);
      corona.addColorStop(0.6,  `rgba(255,107,43,${(0.06 * ease).toFixed(3)})`);
      corona.addColorStop(1,    'rgba(255,107,43,0)');
      ctx.fillStyle = corona;
      ctx.beginPath(); ctx.arc(sx, sy, coreR * 7, 0, TAU); ctx.fill();

      ctx.lineCap = 'round';
      const RAYS = 12;
      for (let i = 0; i < RAYS; i++) {
        const a = spin * 0.7 + (i / RAYS) * TAU;
        const flick = 0.6 + 0.4 * Math.sin(now * 0.0018 + i * 1.7);
        const len = coreR * (1.5 + 1.4 * flick);
        const rg = ctx.createLinearGradient(sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
        rg.addColorStop(0, `rgba(255,200,110,${(0.16 * ease * flick).toFixed(3)})`);
        rg.addColorStop(1, 'rgba(255,140,50,0)');
        ctx.strokeStyle = rg;
        ctx.lineWidth = coreR * 0.16;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a) * coreR * 0.9, sy + Math.sin(a) * coreR * 0.9);
        ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.restore();

      // ── Body disc (soft-edged sphere) + rotating surface ─────────────
      ctx.save();
      const body = ctx.createRadialGradient(
        sx - coreR * 0.25, sy - coreR * 0.28, 0, sx, sy, coreR);
      body.addColorStop(0,    `rgba(255,250,232,${ease.toFixed(3)})`);
      body.addColorStop(0.5,  `rgba(255,208,112,${ease.toFixed(3)})`);
      body.addColorStop(0.85, `rgba(242,150,56,${ease.toFixed(3)})`);
      body.addColorStop(1,    'rgba(220,120,40,0)');
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(sx, sy, coreR, 0, TAU); ctx.fill();

      ctx.beginPath(); ctx.arc(sx, sy, coreR * 0.99, 0, TAU); ctx.clip();
      for (const sp of SUN_SPOTS) {
        const lon = sp.lon + spin;
        const x = sp.cosLat * Math.sin(lon);
        const z0 = sp.cosLat * Math.cos(lon);
        const y0 = -sp.sinLat;
        const y = y0 * cT - z0 * sT;
        const z = y0 * sT + z0 * cT;
        if (z <= 0.05) continue;                      // far side of the Sun
        const px = sx + x * coreR, py = sy + y * coreR;
        const r = sp.r * coreR * lerp(0.55, 1, z);    // foreshorten near the limb
        const edge = smoothstep(0.05, 0.4, z);        // fade onto / off the limb
        if (sp.hot) {                                 // bright facula
          const fg = ctx.createRadialGradient(px, py, 0, px, py, r * 1.4);
          fg.addColorStop(0, `rgba(255,255,236,${(0.5 * ease * edge).toFixed(3)})`);
          fg.addColorStop(1, 'rgba(255,236,170,0)');
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = fg;
          ctx.beginPath(); ctx.arc(px, py, r * 1.4, 0, TAU); ctx.fill();
        } else {                                      // dark sunspot
          const dg = ctx.createRadialGradient(px, py, 0, px, py, r);
          dg.addColorStop(0,    `rgba(120,42,8,${(0.62 * ease * edge).toFixed(3)})`);
          dg.addColorStop(0.55, `rgba(196,92,30,${(0.34 * ease * edge).toFixed(3)})`);
          dg.addColorStop(1,    'rgba(196,92,30,0)');
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = dg;
          ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
        }
      }
      // Limb darkening — sells the spherical, rotating read
      ctx.globalCompositeOperation = 'source-over';
      const limb = ctx.createRadialGradient(sx, sy, coreR * 0.55, sx, sy, coreR);
      limb.addColorStop(0,    'rgba(120,52,18,0)');
      limb.addColorStop(0.8,  'rgba(120,52,18,0)');
      limb.addColorStop(1,    `rgba(120,52,18,${(0.45 * ease).toFixed(3)})`);
      ctx.fillStyle = limb;
      ctx.beginPath(); ctx.arc(sx, sy, coreR, 0, TAU); ctx.fill();
      ctx.restore();

      // ── Hot rim highlight (additive) ─────────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const rim = ctx.createRadialGradient(sx, sy, coreR * 0.2, sx, sy, coreR * 1.05);
      rim.addColorStop(0,   'rgba(255,240,200,0)');
      rim.addColorStop(0.8, 'rgba(255,240,200,0)');
      rim.addColorStop(1,   `rgba(255,226,150,${(0.4 * ease).toFixed(3)})`);
      ctx.fillStyle = rim;
      ctx.beginPath(); ctx.arc(sx, sy, coreR * 1.05, 0, TAU); ctx.fill();
      ctx.restore();
    };

    const drawOrbitRing = (cx, cy, rx, ry, ease) => {
      ctx.save();
      ctx.strokeStyle = `rgba(${starRgb},${(0.07 * ease).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 7]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    };

    const drawMoon = (mx, my, mr, Lx, Ly, Lz, ease, dim) => {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 2);
      glow.addColorStop(0, `rgba(200,212,228,${(0.14 * ease * dim).toFixed(3)})`);
      glow.addColorStop(1, 'rgba(200,212,228,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(mx, my, mr * 2, 0, TAU); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.clip();
      const fx = mx + mr * 0.55 * Lx, fy = my + mr * 0.55 * Ly;
      const body = ctx.createRadialGradient(fx, fy, mr * 0.1, mx, my, mr * 1.3);
      body.addColorStop(0,    `rgba(200,202,210,${(ease * dim).toFixed(3)})`);
      body.addColorStop(0.5,  `rgba(116,120,131,${(ease * dim).toFixed(3)})`);
      body.addColorStop(0.82, `rgba(38,41,50,${(ease * dim).toFixed(3)})`);
      body.addColorStop(1,    `rgba(7,8,13,${(ease * dim).toFixed(3)})`);
      ctx.fillStyle = body;
      ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);

      for (const c of MOON_CRATERS) {
        const lit = clamp(c[0] * Lx + c[1] * Ly + 0.6 * Lz, 0, 1);
        if (lit < 0.12) continue; // craters only catch the lit face
        const cxp = mx + c[0] * mr, cyp = my + c[1] * mr, cr = c[2] * mr;
        const cg = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, cr);
        cg.addColorStop(0, `rgba(58,61,70,${(0.38 * lit * ease * dim).toFixed(3)})`);
        cg.addColorStop(1, 'rgba(58,61,70,0)');
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(cxp, cyp, cr, 0, TAU); ctx.fill();
      }
      ctx.restore();
    };

    const drawEarth = (now, cx, cy, R, rot, Lx, Ly, Lz, ease) => {
      // Atmospheric halo
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const halo = ctx.createRadialGradient(cx, cy, R * 0.86, cx, cy, R * 1.2);
      halo.addColorStop(0,    'rgba(96,176,224,0)');
      halo.addColorStop(0.45, `rgba(120,194,236,${(0.20 * ease).toFixed(3)})`);
      halo.addColorStop(1,    'rgba(96,176,224,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.2, 0, TAU); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();

      // Ocean — base sphere with gentle limb darkening (day/night added below)
      const ocean = ctx.createRadialGradient(cx, cy, R * 0.05, cx, cy, R * 1.12);
      ocean.addColorStop(0,    `rgba(38,104,142,${ease.toFixed(3)})`);
      ocean.addColorStop(0.72, `rgba(28,86,120,${ease.toFixed(3)})`);
      ocean.addColorStop(1,    `rgba(15,52,76,${ease.toFixed(3)})`);
      ctx.fillStyle = ocean;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // Continents — vector silhouettes projected onto the rotating sphere.
      // Each landmass is clipped to the visible hemisphere; a span that dips behind
      // the globe is closed along the limb ARC (the planet's edge), never a chord
      // across the disc — so a continent can't spuriously fill the whole face as it
      // rotates past the limb.
      ctx.fillStyle = `rgba(86,134,92,${ease.toFixed(3)})`;
      const norm = (a) => { a %= TAU; return a < 0 ? a + TAU : a; };
      // Great-circle crossing (z = 0) of an edge, snapped to the limb circle.
      const crossing = (A, B) => {
        const t = A.z / (A.z - B.z);
        const x = A.x + (B.x - A.x) * t;
        const y = A.y + (B.y - A.y) * t;
        const d = Math.hypot(x, y) || 1e-6;
        return { x: x / d, y: y / d, ang: Math.atan2(y, x) };
      };
      for (const poly of LAND) {
        const n = poly.length;
        // Rotate + tilt every vertex onto the unit sphere; note visibility.
        const P = new Array(n);
        let anyVis = false, anyHid = false;
        for (let i = 0; i < n; i++) {
          const p = poly[i];
          const lon = p.lon + rot;
          const x = p.cosLat * Math.sin(lon);
          const y0 = -p.sinLat;
          const z0 = p.cosLat * Math.cos(lon);
          const y = y0 * cTilt - z0 * sTilt;   // axial tilt about screen x-axis
          const z = y0 * sTilt + z0 * cTilt;
          P[i] = { x, y, z };
          if (z >= 0) anyVis = true; else anyHid = true;
        }
        if (!anyVis) continue;                  // entirely on the far side

        ctx.beginPath();
        if (!anyHid) {                          // entirely on the near side
          for (let i = 0; i < n; i++) {
            const q = P[i];
            if (i === 0) ctx.moveTo(cx + R * q.x, cy + R * q.y);
            else         ctx.lineTo(cx + R * q.x, cy + R * q.y);
          }
          ctx.closePath();
          ctx.fill();
          continue;
        }

        // Mixed: start the walk on a visible vertex so every exit precedes its enter.
        let s = 0;
        while (P[s].z < 0) s++;

        let started = false;
        let exitAng = 0;
        const emit = (sx, sy) => {
          if (!started) { ctx.moveTo(sx, sy); started = true; }
          else ctx.lineTo(sx, sy);
        };

        for (let k = 0; k < n; k++) {
          const A = P[(s + k) % n];
          const B = P[(s + k + 1) % n];
          const aVis = A.z >= 0, bVis = B.z >= 0;

          if (aVis) emit(cx + R * A.x, cy + R * A.y);

          if (aVis && !bVis) {                  // leaving the near side
            const c = crossing(A, B);
            emit(cx + R * c.x, cy + R * c.y);
            exitAng = c.ang;
          } else if (!aVis && bVis) {           // returning to the near side
            const c = crossing(A, B);
            // A single landmass never dips behind across more than half the limb,
            // so the hidden span is always the MINOR arc between the two crossings.
            // (The winding direction of the boundary near a crossing is unreliable —
            // the first hidden vertex can sit right on the exit angle — so picking the
            // shorter arc is what keeps a continent from ever filling the whole disc.)
            const spanCCW = norm(c.ang - exitAng);
            const total = spanCCW <= Math.PI ? spanCCW : -(TAU - spanCCW);
            const steps = Math.max(1, Math.ceil(Math.abs(total) / 0.12));
            for (let t = 1; t < steps; t++) {  // sample the limb arc as segments
              const a = exitAng + total * (t / steps);
              emit(cx + R * Math.cos(a), cy + R * Math.sin(a));
            }
            emit(cx + R * c.x, cy + R * c.y);
          }
        }
        ctx.closePath();
        ctx.fill();
      }

      // Day/night terminator — one overlay shades land + ocean together, darkening
      // the hemisphere facing away from the sun (centered on the sub-solar point).
      const sox = cx + R * Lx, soy = cy + R * Ly;
      const term = ctx.createRadialGradient(sox, soy, 0, sox, soy, R * 2.15);
      term.addColorStop(0,    'rgba(2,7,14,0)');
      term.addColorStop(0.42, 'rgba(2,7,14,0)');
      term.addColorStop(0.6,  `rgba(2,7,14,${(0.45 * ease).toFixed(3)})`);
      term.addColorStop(0.8,  `rgba(2,7,14,${(0.86 * ease).toFixed(3)})`);
      term.addColorStop(1,    `rgba(2,7,14,${(0.97 * ease).toFixed(3)})`);
      ctx.fillStyle = term;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // City lights — amber glimmer on the night side only
      ctx.globalCompositeOperation = 'lighter';
      for (const c of CITIES) {
        const lon = c.lon + rot;
        const x = c.cosLat * Math.sin(lon);
        const y0 = -c.sinLat;
        const z0 = c.cosLat * Math.cos(lon);
        const y = y0 * cTilt - z0 * sTilt;
        const z = y0 * sTilt + z0 * cTilt;
        if (z <= 0.05) continue;                 // far side
        const lit = x * Lx + y * Ly + z * Lz;
        if (lit > 0.05) continue;                // day side — skip
        const flick = 0.6 + 0.4 * Math.sin(now * 0.004 * c.flick + c.phase);
        const a = clamp(-lit * 3.5, 0.2, 1) * flick * smoothstep(0.05, 0.25, z) * ease;
        ctx.fillStyle = `rgba(255,170,88,${(0.55 * a).toFixed(3)})`;
        ctx.fillRect(cx + R * x, cy + R * y, R * 0.018, R * 0.018);
      }

      // Specular sun glint + bright atmospheric limb on the day side
      ctx.globalCompositeOperation = 'lighter';
      const gx = cx + R * 0.78 * Lx, gy = cy + R * 0.78 * Ly;
      const glint = ctx.createRadialGradient(gx, gy, 0, gx, gy, R * 0.26);
      glint.addColorStop(0, `rgba(196,230,255,${(0.18 * ease).toFixed(3)})`);
      glint.addColorStop(1, 'rgba(196,230,255,0)');
      ctx.fillStyle = glint;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      const rimx = cx + R * Lx, rimy = cy + R * Ly;
      const rim = ctx.createRadialGradient(rimx, rimy, 0, rimx, rimy, R * 0.5);
      rim.addColorStop(0,   `rgba(150,206,242,${(0.26 * ease).toFixed(3)})`);
      rim.addColorStop(0.55, 'rgba(150,206,242,0)');
      ctx.fillStyle = rim;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      ctx.restore();
    };

    const drawEarthScene = (now, t) => {
      if (t < 0.01) return;
      const ease = t * t * (3 - 2 * t);

      // Earth sits low + centered (so the dark night side tucks under the body
      // copy); it's shrunk from the old solo globe to leave room for the
      // planetary system wheeling around it. Subtle mouse parallax.
      const minWH = Math.min(W, H);
      const R = minWH * 0.13 * lerp(0.92, 1, ease);
      const cx = W * 0.5 + (smoothNX - 0.5) * -34;
      const cy = H * 0.72 + (smoothNY - 0.5) * -22;
      const ps = minWH / 900;                 // body-dot size scale

      // Shared geocentric ecliptic: a single plane tilted about screen-x, so a
      // body's flat orbit (cos a, 0, sin a) projects to a 3D ellipse and gains
      // a depth (z>0 → in front of the globe). Revolution is driven by scroll
      // (primary) + a slow time drift, so scrolling sweeps the whole system.
      const cT = Math.cos(SCENE_TILT), sT = Math.sin(SCENE_TILT);
      const place = (b) => {
        const Rb = b.orbit * minWH;
        const a = b.phase + pageScrollY * 0.0016 * b.speed + now * 0.00002 * b.speed;
        const ux = Math.cos(a) * Rb, uz = Math.sin(a) * Rb;
        return { b, sx: cx + ux, sy: cy - uz * sT, depth: uz * cT, Rb };
      };
      const placed = GEO_BODIES.map(place);

      // Sun's live 3D offset from Earth IS the day/night light direction, so the
      // lit hemisphere (and the city lights / Moon shading) tracks it as it
      // wheels around — the whole reason this reads as a "view from Earth".
      const sun = placed.find((p) => p.b.sun);
      const svx = sun.sx - cx, svy = sun.sy - cy, svz = sun.depth;
      const sl = Math.hypot(svx, svy, svz) || 1;
      const Lx = svx / sl, Ly = svy / sl, Lz = svz / sl;

      // ── Orbit rings — sampled + depth-shaded (far arc dims) ──────────
      ctx.save();
      ctx.lineCap = 'round';
      const RSEG = 72;
      for (const b of GEO_BODIES) {
        const Rb = b.orbit * minWH;
        let prev = null;
        for (let i = 0; i <= RSEG; i++) {
          const a = (i / RSEG) * TAU;
          const uz = Math.sin(a) * Rb;
          const cur = { x: cx + Math.cos(a) * Rb, y: cy - uz * sT, d: (Math.sin(a) * cT + 1) / 2 };
          if (prev) {
            const dd = (prev.d + cur.d) / 2;
            ctx.globalAlpha = clamp(lerp(0.035, 0.16, dd) * ease, 0, 1);
            ctx.strokeStyle = `rgb(${starRgb})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(cur.x, cur.y);
            ctx.stroke();
          }
          prev = cur;
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ── Body painters ────────────────────────────────────────────────
      const drawPlanetDot = (it) => {
        const b = it.b;
        const d = (it.depth / it.Rb + 1) / 2;     // 0 far .. 1 near
        const sz = b.size * ps * lerp(0.8, 1.18, d);
        const [r, g, bl] = b.color;
        const a = clamp(lerp(0.45, 1, d) * ease, 0, 1);
        // Saturn's ring — a tiny tilted ellipse in amber, leaning with the plane
        if (b.ring) {
          ctx.save();
          ctx.globalAlpha = a * 0.85;
          ctx.strokeStyle = 'rgba(255,196,128,0.95)';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.ellipse(it.sx, it.sy, sz * 2.2, sz * 0.7, -0.4, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
        ctx.save();
        ctx.globalAlpha = a;
        ctx.shadowBlur = sz * 3.2;
        ctx.shadowColor = `rgba(${r},${g},${bl},0.9)`;
        const grad = ctx.createRadialGradient(
          it.sx - sz * 0.32, it.sy - sz * 0.32, 0, it.sx, it.sy, sz);
        grad.addColorStop(0,
          `rgb(${Math.min(255, r + 64)},${Math.min(255, g + 64)},${Math.min(255, bl + 64)})`);
        grad.addColorStop(1, `rgb(${r},${g},${bl})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(it.sx, it.sy, sz, 0, TAU);
        ctx.fill();
        ctx.restore();
      };
      const drawBody = (it) =>
        it.b.sun ? drawGeoSun(now, it.sx, it.sy, minWH, ease) : drawPlanetDot(it);

      // ── Moon — its own near-edge-on orbit close to the Earth ─────────
      const moonA = now * 0.00009 + pageScrollY * 0.0024;
      const orbitR = R * 1.95;
      const ORBIT_TILT = 1.3;
      const oc = Math.cos(ORBIT_TILT), os = Math.sin(ORBIT_TILT);
      const planeY = Math.sin(moonA) * orbitR;
      const moonX = cx + Math.cos(moonA) * orbitR;
      const moonY = cy + planeY * oc;
      const moonDepth = planeY * os;          // > 0 → toward viewer (in front)
      const moonFront = moonDepth > 0;
      const moonR = R * 0.27 * (1 + 0.14 * (moonDepth / orbitR));

      // ── Composite back→front: far bodies, globe + moon, near bodies ──
      const rot = now * 0.00002 + pageScrollY * 0.0016;   // Earth's own spin

      for (const it of placed) if (it.depth < 0) drawBody(it);

      drawOrbitRing(cx, cy, orbitR, orbitR * oc, ease);
      if (!moonFront) drawMoon(moonX, moonY, moonR, Lx, Ly, Lz, ease, 0.72);
      drawEarth(now, cx, cy, R, rot, Lx, Ly, Lz, ease);
      if (moonFront) drawMoon(moonX, moonY, moonR, Lx, Ly, Lz, ease, 1);

      for (const it of placed) if (it.depth >= 0) drawBody(it);
    };

    // ── Main render loop ─────────────────────────────────────────────
    const draw = (now) => {
      if (!isRunning) return;
      const dt = clamp((now - lastTime) / 1000, 0, 0.05);
      lastTime = now;

      smoothNX = lerp(smoothNX, mouseNX, 0.05);
      smoothNY = lerp(smoothNY, mouseNY, 0.05);

      // Ease the Professional <-> Personal crossfade (0..1).
      personalT = lerp(personalT, isPersonal ? 1 : 0, 0.06);

      ctx.clearRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = `rgb(${starRgb})`;
      for (const s of stars) {
        const px = (smoothNX - 0.5) * s.parallax * W;
        const py = (smoothNY - 0.5) * s.parallax * H;
        const sy = s.scrollRate * pageScrollY;

        const x = ((s.nx * W + px) % W + W) % W;
        const y = ((s.ny * H + py - sy) % H + H) % H;

        let opacity = s.baseOpacity;
        if (s.twinkles) {
          const t = now * 0.001 * s.twinkleSpeed + s.twinklePhase;
          opacity *= 0.55 + 0.45 * Math.sin(t);
        }

        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Earth scene fades in over the starfield in Personal theme
      drawEarthScene(now, personalT);

      // Supernova — the Professional-theme hero centerpiece (mirrors the
      // Personal Earth's placement). It detonates on load and re-detonates
      // each time you return to Professional; `burstT` advances on active
      // frame-time so a backgrounded tab doesn't skip the blast.
      if (isPersonal) {
        burstT = 0;                                 // hold pre-detonation
      } else {
        burstT = Math.min(1, burstT + dt / 2.6);    // ~2.6s explosion
      }
      const targetSupernovaAlpha = isPersonal ? 0 : 1;
      const aLerp = targetSupernovaAlpha > smoothSupernovaAlpha ? 0.14 : 0.05;
      smoothSupernovaAlpha = lerp(smoothSupernovaAlpha, targetSupernovaAlpha, aLerp);
      drawSupernova(now, dt, smoothSupernovaAlpha, burstT);

      // Mini solar-system orrery in the top-right — Professional only.
      // It shares the supernova's alpha so it crossfades away in Personal
      // (where the corner is occupied by the Earth scene's Sun).
      // Disabled for now (stashed):
      // drawMiniSolarSystem(now, smoothSupernovaAlpha);

      // Spawn / draw shooting stars
      if (Date.now() >= nextShootAt) spawnShooter();

      shooters = shooters.filter(s => s.life < s.duration);
      for (const s of shooters) {
        s.life += dt;
        const prog = s.life / s.duration;
        const alpha = s.maxOpacity * Math.sin(prog * Math.PI);

        const headX = s.startX + s.vx * s.life;
        const headY = s.startY + s.vy * s.life;
        const dist = Math.hypot(s.vx, s.vy);
        const nx = s.vx / dist;
        const ny = s.vy / dist;
        const tailX = headX - nx * s.length * Math.min(prog * 3, 1);
        const tailY = headY - ny * s.length * Math.min(prog * 3, 1);

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0, `rgba(${starRgb},0)`);
        grad.addColorStop(0.6, `rgba(${starRgb},${(alpha * 0.4).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${starRgb},${alpha.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // ── Rocket + smoke ────────────────────────────────────────────

      // Spawn new rocket when timer fires — Professional theme only.
      // In Personal mode hold the timer in the future so no rockets queue up.
      if (isPersonal) {
        nextRocketAt = Date.now() + rand(22000, 50000);
      } else if (Date.now() >= nextRocketAt) {
        spawnRocket();
      }

      // Accumulate smoke — only for engine-driven craft
      for (const r of rockets) {
        if (!CRAFT[r.modelIdx].hasFlame) continue;
        r.smokeTimer += dt;
        if (r.smokeTimer >= 0.04) {
          r.smokeTimer = 0;
          const model = CRAFT[r.modelIdx];
          const B = orient(r);
          const tailX = r.x + model.scale * B.fwd.x * model.geo.tailAx;
          const tailY = r.y + model.scale * B.fwd.y * model.geo.tailAx;
          const tailDir = Math.atan2(-B.fwd.y, -B.fwd.x);
          const perpAngle = tailDir + Math.PI / 2;

          for (let i = 0; i < 3; i++) {
            const spread = rand(-7, 7);
            smokeParticles.push({
              x: tailX + Math.cos(perpAngle) * spread + rand(-2, 2),
              y: tailY + Math.sin(perpAngle) * spread + rand(-2, 2),
              vx: Math.cos(tailDir) * rand(8, 22) + rand(-10, 10),
              vy: Math.sin(tailDir) * rand(8, 22) + rand(-10, 10),
              life: 0,
              maxLife: rand(1.2, 2.8),
              size: rand(1.5, 3),
              maxSize: rand(9, 18),
            });
          }
        }
      }

      // Guard against runaway particles
      if (smokeParticles.length > 240) smokeParticles = smokeParticles.slice(-180);

      // Update + draw smoke (behind rockets)
      smokeParticles = smokeParticles.filter(p => p.life < p.maxLife);
      for (const p of smokeParticles) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.984;
        p.vy *= 0.984;

        const t = clamp(p.life / p.maxLife, 0, 1);
        const size = lerp(p.size, p.maxSize, Math.sqrt(t));
        const alpha = Math.pow(1 - t, 1.8) * 0.38;
        if (alpha < 0.003) continue;

        const sg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        sg.addColorStop(0, `rgba(${starRgb},${alpha.toFixed(3)})`);
        sg.addColorStop(1, `rgba(${starRgb},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
      }

      // Update + draw rockets (in front of smoke)
      rockets = rockets.filter(r =>
        r.x > -160 && r.x < W + 160 && r.y > -160 && r.y < H + 160
      );
      for (const r of rockets) {
        r.angle += r.curve * dt;
        r.roll += r.rollSpeed * dt;
        r.vx = r.speed * Math.cos(r.angle);
        r.vy = r.speed * Math.sin(r.angle);
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        drawRocket(r, now);
      }

      rafId = requestAnimationFrame(draw);
    };

    // ── Event listeners ──────────────────────────────────────────────
    const onMouseMove = (e) => {
      mouseNX = e.clientX / W;
      mouseNY = e.clientY / H;
    };
    const onScroll = () => { pageScrollY = window.scrollY; };
    const onResize = () => { resize(); };
    const onVisibility = () => {
      if (document.hidden) {
        isRunning = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else {
        isRunning = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(draw);
      }
    };

    let themeRafId = null;
    const themeObserver = new MutationObserver(() => {
      if (themeRafId) cancelAnimationFrame(themeRafId);
      themeRafId = requestAnimationFrame(() => {
        updateStarColor();
        updateTheme();
      });
    });

    resize();
    buildSupernovaSprites();
    updateStarColor();
    updateTheme();
    // Show the supernova immediately in Professional so the load-time blast
    // plays from its first frame rather than fading up.
    smoothSupernovaAlpha = isPersonal ? 0 : 1;
    rafId = requestAnimationFrame(draw);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (themeRafId) cancelAnimationFrame(themeRafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="space-bg-canvas"
      aria-hidden="true"
    />
  );
};

export default SpaceBackground;
