import React, { useEffect, useRef } from 'react';
import './SpaceBackground.css';

// Three depth layers: [count, minSize, maxSize, minOpacity, maxOpacity, parallaxStrength, scrollRate, twinkleFraction]
const LAYERS = [
  { count: 130, size: [0.35, 0.85], opacity: [0.07, 0.20], parallax: 0.007, scroll: 0.018, twinkle: 0.28 },
  { count: 65, size: [0.80, 1.50], opacity: [0.20, 0.40], parallax: 0.020, scroll: 0.048, twinkle: 0.18 },
  { count: 30, size: [1.40, 2.20], opacity: [0.35, 0.60], parallax: 0.044, scroll: 0.095, twinkle: 0.10 },
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

    // ── Rocket ships ─────────────────────────────────────────────────
    // Lucide "Rocket" icon (24×24). Nose points upper-right ≈ −45° in screen coords,
    // so we rotate by (r.angle + π/4) to align the nose with the direction of travel.
    // Path2D objects — created once, never inside the draw loop
    const rocketBodyPath = new Path2D(
      'M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z'
    );
    const rocketFinR = new Path2D('M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5');
    const rocketFinL = new Path2D('M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05');
    const rocketThruster = new Path2D(
      'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09'
    );

    // ── Additional spacecraft models ─────────────────────────────────
    // Registered in CRAFT[] below — spawnRocket() picks one at random each pass.

    // --- Model: Saturn V (Apollo-era) ---------------------------------
    // Nose points UP (−Y direction). Add −π/2 to r.angle when drawing.
    const SATURN_V_SCALE = 1.5;
    const SATURN_V_CX = 12;
    const SATURN_V_CY = 12;
    const SATURN_V_TAIL_D = 20;
    const SATURN_V_NOSE_OFFSET = -Math.PI / 2;
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
    // Nose points RIGHT (+X direction). Add 0 to r.angle when drawing.
    const SHUTTLE_SCALE = 1.7;
    const SHUTTLE_CX = 12;
    const SHUTTLE_CY = 12;
    const SHUTTLE_TAIL_D = 16;
    const SHUTTLE_NOSE_OFFSET = 0;
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
    // Nose points UP (−Y direction). Add −π/2 to r.angle when drawing.
    const FALCON9_SCALE = 1.4;
    const FALCON9_CX = 12;
    const FALCON9_CY = 12;
    const FALCON9_TAIL_D = 18;
    const FALCON9_NOSE_OFFSET = -Math.PI / 2;
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

    // --- Model: Flying Saucer / UFO ----------------------------------
    // Horizontal disc — "nose" points RIGHT (+X). Add 0 to r.angle when drawing.
    const UFO_SCALE = 2.0;
    const UFO_CX = 12;
    const UFO_CY = 12;
    const UFO_TAIL_D = 14;
    const UFO_NOSE_OFFSET = 0;
    // Glass dome on top
    const ufoDome = new Path2D(
      'M9 10 Q9 6 12 5 Q15 6 15 10 Z'
    );
    // Main saucer disc (wide ellipse)
    const ufoDisc = new Path2D(
      'M2 12 Q2 9.5 12 9 Q22 9.5 22 12 Q22 14.5 12 15 Q2 14.5 2 12 Z'
    );
    // Underside landing lights (small circles via arcs)
    const ufoLightL = new Path2D();
    ufoLightL.arc(8, 14, 0.7, 0, Math.PI * 2);
    const ufoLightC = new Path2D();
    ufoLightC.arc(12, 14.8, 0.7, 0, Math.PI * 2);
    const ufoLightR = new Path2D();
    ufoLightR.arc(16, 14, 0.7, 0, Math.PI * 2);
    // Beam of light underneath (triangle)
    const ufoBeam = new Path2D('M10 15 L12 22 L14 15');

    // --- Model: Astronaut (EVA) ---------------------------------------
    // Floating figure — "nose" points UP (−Y). Add −π/2 to r.angle when drawing.
    const ASTRO_SCALE = 1.8;
    const ASTRO_CX = 12;
    const ASTRO_CY = 12;
    const ASTRO_TAIL_D = 14;
    const ASTRO_NOSE_OFFSET = -Math.PI / 2;
    // Helmet (rounded rectangle / circle)
    const astroHelmet = new Path2D(
      'M10 2 Q10 0.5 12 0.5 Q14 0.5 14 2 L14 5 Q14 6.5 12 6.5 Q10 6.5 10 5 Z'
    );
    // Visor (reflective strip across helmet)
    const astroVisor = new Path2D(
      'M10.5 2.8 L13.5 2.8 L13.5 4.2 L10.5 4.2 Z'
    );
    // Suit torso (boxy)
    const astroTorso = new Path2D(
      'M9 6.5 L15 6.5 L15.5 7.5 L15.5 14 L14 15 L10 15 L8.5 14 L8.5 7.5 Z'
    );
    // PLSS backpack
    const astroBackpack = new Path2D(
      'M15 7.5 L17 7.5 L17 13 L15 13.5'
    );
    // Left arm (reaching out, slight bend)
    const astroArmL = new Path2D(
      'M9 7.5 L6.5 9 L5 12 L5.5 12.5 L7 10 L9 9'
    );
    // Right arm (relaxed, drifting)
    const astroArmR = new Path2D(
      'M15 8.5 L17.5 10 L19 9 L19.5 9.5 L18 11 L15.5 10'
    );
    // Left leg (slightly bent, floating)
    const astroLegL = new Path2D(
      'M10 15 L9.5 18 L9 21 L8 22 L9 22.5 L10 21 L10.5 18'
    );
    // Right leg (extended, drifting)
    const astroLegR = new Path2D(
      'M14 15 L14.5 18.5 L15.5 21.5 L16.5 22 L16 23 L14.5 21 L13.5 18'
    );
    // Tether line (curving away from suit)
    const astroTether = new Path2D(
      'M8.5 8 Q4 6 2 8 Q0 10 1 14'
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

    // ── Helpers ──────────────────────────────────────────────────────
    const updateStarColor = () => {
      const v = window.getComputedStyle(document.documentElement)
        .getPropertyValue('--text-rgb').trim();
      if (v) starRgb = v;
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

    // ── Main render loop ─────────────────────────────────────────────
    const draw = (now) => {
      if (!isRunning) return;
      const dt = clamp((now - lastTime) / 1000, 0, 0.05);
      lastTime = now;

      smoothNX = lerp(smoothNX, mouseNX, 0.05);
      smoothNY = lerp(smoothNY, mouseNY, 0.05);

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

      // Spawn new rocket when timer fires
      if (Date.now() >= nextRocketAt) spawnRocket();

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
      themeRafId = requestAnimationFrame(updateStarColor);
    });

    resize();
    updateStarColor();
    rafId = requestAnimationFrame(draw);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode'],
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
