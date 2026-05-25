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

    // ── Additional spacecraft models ─────────────────────────────────
    // Registered in CRAFT[] below — spawnRocket() picks one at random each pass.

    // --- Model: Saturn V (Apollo-era) ---------------------------------
    // Main fuselage — pointed nose cone → cylindrical body → tapered engine skirt
    const saturnVBody = new Path2D(
      'M12 0.5 Q13.4 2.8 14 5.5 L14 8 L14.6 8.6 L14.6 11.2 L14 11.8 L14 16.8' +
      ' L15.2 17.8 L15.2 21 L13.4 22 L13.4 23.5 L10.6 23.5 L10.6 22 L8.8 21' +
      ' L8.8 17.8 L10 16.8 L10 11.8 L9.4 11.2 L9.4 8.6 L10 8 L10 5.5' +
      ' Q10.6 2.8 12 0.5 Z'
    );
    // Swept fins at base
    const saturnVFinL = new Path2D('M8.8 20.5 L6 23.5 L8.5 23.2 L10.6 22');
    const saturnVFinR = new Path2D('M15.2 20.5 L18 23.5 L15.5 23.2 L13.4 22');
    // Five F-1 engine nozzles (short strokes)
    const saturnVEngines = new Path2D(
      'M11 23.5 L10.8 24.5 M11.7 23.5 L11.7 24.5 M12 23.5 L12 24.8' +
      ' M12.3 23.5 L12.3 24.5 M13 23.5 L13.2 24.5'
    );
    // Launch escape tower above nose
    const saturnVTower = new Path2D('M12 0.5 L12 -1.8 M11.4 -1 L12 -2.2 L12.6 -1');

    // --- Model: Space Shuttle -----------------------------------------
    // Fuselage — blunt nose, payload bay, tapered aft
    const shuttleBody = new Path2D(
      'M23 11.5 Q23 10.8 22 10.5 L6 9.5 L3.5 10 L2 11 L2 13.5 L3.5 14.5 L6 14.5 L22 13.5 Q23 13.2 23 11.5 Z'
    );
    // Delta wing (swept underneath body)
    const shuttleWing = new Path2D(
      'M14 14 L8 20 L5 20 L4 19 L7 14.5'
    );
    // Upper delta wing / dorsal OMS pods
    const shuttleWingTop = new Path2D(
      'M14 10 L8 4 L5 4 L4 5 L7 9.5'
    );
    // Vertical stabiliser (tail fin)
    const shuttleTail = new Path2D('M3 10 L1 5 L2.5 5 L4 9.5');
    // Engine cluster (3 SSMEs)
    const shuttleEngines = new Path2D('M2 11 L0.5 10.5 M2 12 L0 12 M2 13 L0.5 13.5');

    // --- Model: Falcon 9 (SpaceX-style) ------------------------------
    // Sleek cylindrical body — smooth nose fairing → interstage → first stage
    const falcon9Body = new Path2D(
      'M12 0 Q13.6 2 14 4.5 L14 5 Q14 5.6 13.6 5.8 L13.6 9 L14 9.5 L14 10.2' +
      ' L13.6 10.8 L13.6 20.5 L14.2 21 L14.2 23.5 L9.8 23.5 L9.8 21' +
      ' L10.4 20.5 L10.4 10.8 L10 10.2 L10 9.5 L10.4 9 L10.4 5.8' +
      ' Q10 5.6 10 5 L10 4.5 Q10.4 2 12 0 Z'
    );
    // Grid fins (near interstage, deployed outward)
    const falcon9GridFinL = new Path2D(
      'M10 9.5 L7.5 9 L7.5 10.2 L10 10.2'
    );
    const falcon9GridFinR = new Path2D(
      'M14 9.5 L16.5 9 L16.5 10.2 L14 10.2'
    );
    // Deployable landing legs at base
    const falcon9LegL = new Path2D('M9.8 22.5 L7 24.5 L8 24.5 L9.8 23.5');
    const falcon9LegR = new Path2D('M14.2 22.5 L17 24.5 L16 24.5 L14.2 23.5');
    // Single Merlin engine bell
    const falcon9Engine = new Path2D(
      'M11 23.5 L10.5 24.8 Q12 25.5 13.5 24.8 L13 23.5'
    );

    // ── Spacecraft model registry ─────────────────────────────────────
    // scale      — SVG scale multiplier
    // cx/cy      — rotation pivot in SVG space (visual center of mass)
    // tailD      — world-space px from pivot to flame/smoke origin
    // noseOffset — radians added to r.angle so SVG nose faces travel direction
    // draw(now)  — paints all Path2D strokes/fills; ctx captured from closure
    const CRAFT = [
      {
        // 0 — Saturn V
        scale: 1.5, cx: 12, cy: 12, tailD: 20,
        noseOffset: Math.PI / 2, hasFlame: true,
        draw(now) {
          ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.fillStyle = `rgba(${starRgb}, 0.06)`; ctx.fill(saturnVBody);
          ctx.strokeStyle = `rgba(${starRgb}, 0.9)`; ctx.stroke(saturnVBody);
          ctx.strokeStyle = 'rgba(255, 107, 43, 0.85)';
          ctx.stroke(saturnVFinL); ctx.stroke(saturnVFinR);
          ctx.strokeStyle = `rgba(${starRgb}, 0.65)`;
          ctx.stroke(saturnVEngines); ctx.stroke(saturnVTower);
        },
      },
      {
        // 1 — Space Shuttle
        scale: 1.7, cx: 12, cy: 12, tailD: 16,
        noseOffset: 0, hasFlame: true,
        draw(now) {
          ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.fillStyle = `rgba(${starRgb}, 0.08)`; ctx.fill(shuttleBody);
          ctx.strokeStyle = `rgba(${starRgb}, 0.92)`; ctx.stroke(shuttleBody);
          ctx.strokeStyle = 'rgba(255, 107, 43, 0.82)';
          ctx.stroke(shuttleWing); ctx.stroke(shuttleWingTop);
          ctx.strokeStyle = `rgba(${starRgb}, 0.72)`;
          ctx.stroke(shuttleTail); ctx.stroke(shuttleEngines);
        },
      },
      {
        // 2 — Falcon 9
        scale: 1.4, cx: 12, cy: 12, tailD: 18,
        noseOffset: Math.PI / 2, hasFlame: true,
        draw(now) {
          ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.fillStyle = `rgba(${starRgb}, 0.06)`; ctx.fill(falcon9Body);
          ctx.strokeStyle = `rgba(${starRgb}, 0.9)`; ctx.stroke(falcon9Body);
          ctx.strokeStyle = 'rgba(255, 107, 43, 0.82)';
          ctx.stroke(falcon9GridFinL); ctx.stroke(falcon9GridFinR);
          ctx.strokeStyle = `rgba(${starRgb}, 0.68)`;
          ctx.stroke(falcon9LegL); ctx.stroke(falcon9LegR); ctx.stroke(falcon9Engine);
        },
      },
    ];

    let rockets = [];
    let smokeParticles = [];
    let nextRocketAt = Date.now() + rand(6000, 14000);

    // ── Supernova (footer ambient bloom) ─────────────────────────────
    let supernovaSprites = [];
    let smoothSupernovaAlpha = 0;

    const spawnRocket = () => {
      const modelIdx = Math.floor(Math.random() * CRAFT.length);
      const model = CRAFT[modelIdx];
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
        tailD: model.tailD,
        smokeTimer: 0,
      });

      nextRocketAt = Date.now() + rand(22000, 50000);
    };

    const drawRocket = (r, now) => {
      const model = CRAFT[r.modelIdx];
      const tailDir = r.angle + Math.PI;
      const tailX = r.x + Math.cos(tailDir) * r.tailD;
      const tailY = r.y + Math.sin(tailDir) * r.tailD;

      if (model.hasFlame) {
        const perpX = -Math.sin(tailDir);
        const perpY = Math.cos(tailDir);
        const flicker = Math.sin(now * 0.011) * 0.5 + Math.sin(now * 0.023) * 0.35 + Math.sin(now * 0.037) * 0.15;
        const flameLen = 18 + flicker * 8;
        const flameW = 5 + flicker * 2;
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

      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.angle + model.noseOffset);
      ctx.scale(model.scale, model.scale);
      ctx.translate(-model.cx, -model.cy);
      model.draw(now);
      ctx.restore();
    };

    const buildSupernovaSprites = () => {
      supernovaSprites = [];
      // Dense inner ring — vibrant cluster near core
      for (let i = 0; i < 38; i++) {
        const [r, g, b] = SUPERNOVA_COLORS[Math.floor(Math.random() * SUPERNOVA_COLORS.length)];
        const minD = rand(27, 83);
        const maxD = rand(132, 240);
        supernovaSprites.push({
          angle: Math.random() * Math.PI * 2,
          dist: rand(minD, maxD),
          minDist: minD,
          maxDist: maxD,
          vAngle: rand(0.06, 0.24) * (Math.random() < 0.5 ? 1 : -1),
          vDist: rand(4, 18) * (Math.random() < 0.5 ? 1 : -1),
          size: rand(1.4, 4.1),
          baseOpacity: rand(0.55, 0.95),
          twinkleSpeed: rand(1.2, 3.5),
          twinklePhase: Math.random() * Math.PI * 2,
          r, g, b,
        });
      }
      // Sparse outer spray — wider, dimmer
      for (let i = 0; i < 22; i++) {
        const [r, g, b] = SUPERNOVA_COLORS[Math.floor(Math.random() * SUPERNOVA_COLORS.length)];
        const minD = rand(195, 278);
        const maxD = rand(338, 473);
        supernovaSprites.push({
          angle: Math.random() * Math.PI * 2,
          dist: rand(minD, maxD),
          minDist: minD,
          maxDist: maxD,
          vAngle: rand(0.02, 0.09) * (Math.random() < 0.5 ? 1 : -1),
          vDist: rand(2, 10) * (Math.random() < 0.5 ? 1 : -1),
          size: rand(0.75, 2.6),
          baseOpacity: rand(0.28, 0.65),
          twinkleSpeed: rand(0.7, 2.1),
          twinklePhase: Math.random() * Math.PI * 2,
          r, g, b,
        });
      }
    };

    const drawSupernova = (now, dt, alpha) => {
      const cx = W / 2;
      const cy = H * 0.9;

      // Always advance sprite positions so they're animated when revealed
      for (const sp of supernovaSprites) {
        sp.angle += sp.vAngle * dt;
        sp.dist += sp.vDist * dt;
        if (sp.dist <= sp.minDist || sp.dist >= sp.maxDist) {
          sp.vDist *= -1;
          sp.dist = clamp(sp.dist, sp.minDist, sp.maxDist);
        }
      }

      if (alpha < 0.005) return;

      // Outer diffuse nebula — wide cool halo
      const outerR = Math.min(W * 1.02, H * 1.17);
      const g0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      g0.addColorStop(0.00, `rgba(176,68,255,${(0.13 * alpha).toFixed(3)})`);
      g0.addColorStop(0.28, `rgba(59,158,255,${(0.11 * alpha).toFixed(3)})`);
      g0.addColorStop(0.58, `rgba(0,220,255,${(0.06 * alpha).toFixed(3)})`);
      g0.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = g0;
      ctx.fill();

      // Mid warm corona
      const midR = Math.min(W * 0.60, H * 0.75);
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, midR);
      g1.addColorStop(0.00, `rgba(255,220,80,${(0.28 * alpha).toFixed(3)})`);
      g1.addColorStop(0.22, `rgba(255,107,43,${(0.22 * alpha).toFixed(3)})`);
      g1.addColorStop(0.48, `rgba(255,56,145,${(0.13 * alpha).toFixed(3)})`);
      g1.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, midR, 0, Math.PI * 2);
      ctx.fillStyle = g1;
      ctx.fill();

      // Hot pulsing core
      const pulse = 1 + 0.13 * Math.sin(now * 0.00092);
      const coreR = 120 * pulse;
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      g2.addColorStop(0.00, `rgba(255,255,235,${(0.96 * alpha).toFixed(3)})`);
      g2.addColorStop(0.13, `rgba(255,245,160,${(0.86 * alpha).toFixed(3)})`);
      g2.addColorStop(0.34, `rgba(255,200,80,${(0.60 * alpha).toFixed(3)})`);
      g2.addColorStop(0.65, `rgba(255,100,40,${(0.26 * alpha).toFixed(3)})`);
      g2.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.shadowBlur = 112;
      ctx.shadowColor = `rgba(255,200,60,${(0.52 * alpha).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();
      ctx.restore();

      // Corona rays — 12 slow-rotating radial streaks
      ctx.save();
      ctx.lineCap = 'round';
      const rotPhase = now * 0.00022;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + rotPhase;
        const len = 202 + 158 * Math.abs(Math.sin(now * 0.00068 + i * 0.79));
        const rA = (0.22 + 0.11 * Math.sin(now * 0.00098 + i * 1.37)) * alpha;
        const rx2 = cx + Math.cos(a) * len;
        const ry2 = cy + Math.sin(a) * len;
        if (ry2 > H + 20) continue; // skip rays purely below viewport
        const rGrad = ctx.createLinearGradient(cx, cy, rx2, ry2);
        rGrad.addColorStop(0.0, `rgba(255,230,120,${rA.toFixed(3)})`);
        rGrad.addColorStop(0.5, `rgba(255,150,60,${(rA * 0.44).toFixed(3)})`);
        rGrad.addColorStop(1.0, 'rgba(200,80,30,0)');
        ctx.lineWidth = 0.8 + 0.8 * Math.abs(Math.sin(i * 2.1 + now * 0.00072));
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(rx2, ry2);
        ctx.strokeStyle = rGrad;
        ctx.stroke();
      }
      ctx.restore();

      // Light sprites — orbiting colored particles with glow
      ctx.save();
      ctx.shadowBlur = 0; // set per-particle below
      for (const sp of supernovaSprites) {
        const sx = cx + Math.cos(sp.angle) * sp.dist;
        const sy = cy + Math.sin(sp.angle) * sp.dist;
        if (sy > H + 5) continue; // clip below viewport
        const tPhase = now * 0.001 * sp.twinkleSpeed + sp.twinklePhase;
        const flicker = 0.42 + 0.58 * Math.abs(Math.sin(tPhase));
        const opacity = sp.baseOpacity * flicker * alpha;
        if (opacity < 0.025) continue;
        ctx.globalAlpha = opacity;
        ctx.shadowBlur = sp.size * 5.5;
        ctx.shadowColor = `rgb(${sp.r},${sp.g},${sp.b})`;
        ctx.fillStyle = `rgb(${sp.r},${sp.g},${sp.b})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sp.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.restore();

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

    const drawSun = (now, sx, sy, ease) => {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.0006);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const corona = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(W, H) * 0.6);
      corona.addColorStop(0,    `rgba(255,224,160,${(0.30 * ease).toFixed(3)})`);
      corona.addColorStop(0.16, `rgba(255,150,60,${(0.15 * ease).toFixed(3)})`);
      corona.addColorStop(0.45, `rgba(255,107,43,${(0.05 * ease).toFixed(3)})`);
      corona.addColorStop(1,    'rgba(255,107,43,0)');
      ctx.fillStyle = corona;
      ctx.fillRect(0, 0, W, H);

      const coreR = Math.min(W, H) * 0.052 * (1 + 0.05 * pulse);
      const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, coreR * 1.7);
      core.addColorStop(0,    `rgba(255,250,236,${(0.96 * ease).toFixed(3)})`);
      core.addColorStop(0.5,  `rgba(255,214,150,${(0.82 * ease).toFixed(3)})`);
      core.addColorStop(0.85, `rgba(255,150,60,${(0.18 * ease).toFixed(3)})`);
      core.addColorStop(1,    'rgba(255,150,60,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(sx, sy, coreR * 1.7, 0, TAU); ctx.fill();
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

      // Earthrise composition: large + low, so the dark night side sits under the
      // body copy and the lit limb crests into mid-screen. Subtle mouse parallax.
      const R = Math.min(W, H) * 0.30 * lerp(0.9, 1, ease);
      const cx = W * 0.5 + (smoothNX - 0.5) * -34;
      const cy = H * 0.72 + (smoothNY - 0.5) * -22;
      const sunX = W * 0.85, sunY = H * 0.17;

      // 3D sun-light direction = on-screen direction to the sun + a forward bias
      let ldx = sunX - cx, ldy = sunY - cy;
      const ll = Math.hypot(ldx, ldy) || 1;
      ldx /= ll; ldy /= ll;
      const Ln = Math.hypot(ldx, ldy, 0.55);
      const Lx = ldx / Ln, Ly = ldy / Ln, Lz = 0.55 / Ln;

      drawSun(now, sunX, sunY, ease);

      // time + scroll drive the spin (Earth) and the orbit (Moon)
      const rot = now * 0.00002 + pageScrollY * 0.0016;
      const moonA = now * 0.00009 + pageScrollY * 0.0024;

      // Near-edge-on orbit so the Moon sweeps in front of and behind the planet
      const orbitR = R * 1.9;
      const ORBIT_TILT = 1.3;
      const oc = Math.cos(ORBIT_TILT), os = Math.sin(ORBIT_TILT);
      const planeY = Math.sin(moonA) * orbitR;
      const moonX = cx + Math.cos(moonA) * orbitR;
      const moonY = cy + planeY * oc;
      const moonDepth = planeY * os;          // > 0 → toward viewer (in front)
      const moonFront = moonDepth > 0;
      const moonR = R * 0.24 * (1 + 0.14 * (moonDepth / orbitR));

      drawOrbitRing(cx, cy, orbitR, orbitR * oc, ease);
      if (!moonFront) drawMoon(moonX, moonY, moonR, Lx, Ly, Lz, ease, 0.72);
      drawEarth(now, cx, cy, R, rot, Lx, Ly, Lz, ease);
      if (moonFront) drawMoon(moonX, moonY, moonR, Lx, Ly, Lz, ease, 1);
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

      // Supernova — scroll-aware bloom that rises behind the footer
      const scrollMax = document.documentElement.scrollHeight - H;
      const rawScrollRatio = scrollMax > 10 ? clamp(pageScrollY / scrollMax, 0, 1) : 1;
      const targetSupernovaAlpha = isPersonal ? 0 : clamp((rawScrollRatio - 0.62) / 0.38, 0, 1);
      smoothSupernovaAlpha = lerp(smoothSupernovaAlpha, targetSupernovaAlpha, 0.04);
      drawSupernova(now, dt, smoothSupernovaAlpha);

      // Spawn / draw shooting stars
      if (Date.now() >= nextShootAt) spawnShooter();

      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        if (s.life >= s.duration) {
          shooters.splice(i, 1);
          continue;
        }

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
          const tailDir = r.angle + Math.PI;
          const tailX = r.x + Math.cos(tailDir) * r.tailD;
          const tailY = r.y + Math.sin(tailDir) * r.tailD;
          const perpAngle = r.angle + Math.PI / 2;

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
