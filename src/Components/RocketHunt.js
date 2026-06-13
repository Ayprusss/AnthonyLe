import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RocketHunt.css';
import { rand, clamp, buildStars, CRAFT } from './spacecraft';

// ── Game constants ──────────────────────────────────────────────────
export const MAX_AMMO = 6;
export const ROUND_TIME = 30;       // seconds per round
export const TOTAL_ROUNDS = 2;
const COUNTDOWN_TIME = 3.2;         // "ROUND N" 3-2-1 lead-in
const INTERMISSION_TIME = 3.8;      // between-round card
const RELOAD_TIME = 1.1;            // auto-reload cooldown

const STANDARD_POINTS = 100;
const GOLD_POINTS = 300;
const ASTEROID_PENALTY = 150;

const STAR_RGB = '226, 230, 240';
const GOLD_RGB = '255, 205, 70';
const HISCORE_KEY = 'rockethunt-hiscore';

// Points awarded for hitting a target. Exported for tests.
export const scoreValue = (target) => {
  if (!target) return 0;
  if (target.kind === 'asteroid') return -ASTEROID_PENALTY;
  return target.gold ? GOLD_POINTS : STANDARD_POINTS;
};

const readHiScore = () => {
  try {
    const v = parseInt(localStorage.getItem(HISCORE_KEY), 10);
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
};
const writeHiScore = (v) => {
  try { localStorage.setItem(HISCORE_KEY, String(v)); } catch (_) {}
};

const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(pointer: coarse)').matches;

const RocketHunt = () => {
  const [expanded, setExpanded] = useState(false);
  const [hiScore, setHiScore] = useState(readHiScore);
  const [hud, setHud] = useState({
    phase: 'ready',
    round: 1,
    score: 0,
    ammo: MAX_AMMO,
    reloading: false,
    timeLeft: ROUND_TIME,
    roundOneScore: 0,
    finalScore: 0,
    isNewHigh: false,
  });

  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const hiScoreRef = useRef(hiScore);
  hiScoreRef.current = hiScore;

  // ── Engine factory ────────────────────────────────────────────────
  const createEngine = useCallback((W, H) => ({
    phase: 'ready',
    round: 1,
    score: 0,
    ammo: MAX_AMMO,
    reloading: false,
    reloadT: 0,
    phaseT: 0,
    roundTimeLeft: ROUND_TIME,
    roundOneScore: 0,
    finalScore: 0,
    isNewHigh: false,
    spawnTimer: 0,
    targets: [],
    particles: [],
    popups: [],
    taps: [],
    bgRocks: [],
    stars: buildStars(),
    shake: 0,
    flashRed: 0,
    shotFlash: 0,
    mouseX: W / 2,
    mouseY: H / 2,
    isTouch: isCoarsePointer(),
    W, H,
    lastTime: 0,
  }), []);

  // Reset engine into an active game starting at Round 1 countdown.
  const startGame = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    e.phase = 'countdown';
    e.round = 1;
    e.score = 0;
    e.ammo = MAX_AMMO;
    e.reloading = false;
    e.reloadT = 0;
    e.phaseT = COUNTDOWN_TIME;
    e.roundTimeLeft = ROUND_TIME;
    e.roundOneScore = 0;
    e.finalScore = 0;
    e.isNewHigh = false;
    e.spawnTimer = 0.6;
    e.targets = [];
    e.particles = [];
    e.popups = [];
    e.shake = 0;
    e.flashRed = 0;
    setHud((h) => ({ ...h, phase: 'countdown', round: 1, score: 0, ammo: MAX_AMMO, reloading: false, timeLeft: ROUND_TIME, isNewHigh: false }));
  }, []);

  const collapse = useCallback(() => setExpanded(false), []);

  // ── Main effect: canvas + loop, alive only while expanded ──────────
  useEffect(() => {
    if (!expanded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = 1;
    let rafId = null;
    let running = true;

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const W = Math.max(1, Math.round(rect.width));
      const H = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!engineRef.current) engineRef.current = createEngine(W, H);
      engineRef.current.W = W;
      engineRef.current.H = H;
    };

    measure();
    const e = engineRef.current;
    e.lastTime = performance.now();

    // ── Spawning ────────────────────────────────────────────────────
    const goldChance = () => (e.round >= 2 ? 0.24 : 0.16);
    const spawnInterval = () =>
      e.round >= 2 ? rand(0.42, 0.85) : rand(0.55, 1.05);

    const edgeStart = (W, H, margin) => {
      const side = Math.floor(Math.random() * 4);
      switch (side) {
        case 0: return { x: rand(W * 0.05, W * 0.95), y: -margin };
        case 1: return { x: W + margin, y: rand(H * 0.05, H * 0.7) };
        case 2: return { x: rand(W * 0.05, W * 0.95), y: H + margin };
        default: return { x: -margin, y: rand(H * 0.05, H * 0.7) };
      }
    };

    const spawnRocket = (gold) => {
      const { W, H } = e;
      const start = edgeStart(W, H, 80);
      const targetX = W * (0.25 + Math.random() * 0.5);
      const targetY = H * (0.2 + Math.random() * 0.45);
      const angle = Math.atan2(targetY - start.y, targetX - start.x);
      const speed = gold ? rand(280, 360) : rand(150, 260);
      const modelIdx = Math.floor(Math.random() * CRAFT.length);
      e.targets.push({
        kind: 'rocket',
        gold,
        modelIdx,
        x: start.x, y: start.y,
        angle,
        speed,
        curve: rand(-0.12, 0.12),
        tailD: CRAFT[modelIdx].tailD,
        radius: gold ? 30 : 34,
        smokeTimer: 0,
      });
    };

    const spawnAsteroid = () => {
      const { W, H } = e;
      const fromLeft = Math.random() < 0.5;
      const r = rand(16, 28);
      e.targets.push({
        kind: 'asteroid',
        x: fromLeft ? -40 : W + 40,
        y: rand(H * 0.1, H * 0.6),
        angle: fromLeft ? rand(-0.25, 0.25) : Math.PI + rand(-0.25, 0.25),
        speed: rand(90, 150),
        curve: 0,
        radius: r + 6,
        size: r,
        rot: Math.random() * Math.PI,
        rotSpeed: rand(-1.2, 1.2),
        verts: Array.from({ length: 9 }, () => rand(0.72, 1.12)),
      });
    };

    const spawnTarget = () => {
      if (Math.random() < 0.28) spawnAsteroid();
      else spawnRocket(Math.random() < goldChance());
    };

    // Slow non-interactive background rocks for atmosphere
    const seedBgRocks = () => {
      if (e.bgRocks.length) return;
      const { W, H } = e;
      for (let i = 0; i < 5; i++) {
        e.bgRocks.push({
          x: Math.random() * W,
          y: rand(H * 0.05, H * 0.55),
          r: rand(6, 16),
          vx: rand(-12, 12),
          rot: Math.random() * Math.PI,
          rotSpeed: rand(-0.4, 0.4),
          verts: Array.from({ length: 8 }, () => rand(0.7, 1.1)),
        });
      }
    };
    seedBgRocks();

    // ── Explosions / feedback ───────────────────────────────────────
    const explode = (x, y, gold, asteroid) => {
      const n = asteroid ? 14 : 18;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = rand(40, asteroid ? 130 : 175);
        e.particles.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0,
          maxLife: rand(0.4, 0.95),
          size: rand(1.5, 3.5),
          maxSize: rand(8, 18),
          rgb: asteroid ? '150, 150, 158' : gold ? GOLD_RGB : '255, 160, 70',
        });
      }
    };

    const popup = (x, y, text, rgb) => {
      e.popups.push({ x, y, text, rgb, life: 0, maxLife: 0.9 });
    };

    // ── Shooting ────────────────────────────────────────────────────
    const shoot = (px, py, touch) => {
      if (e.phase !== 'playing') return;
      if (e.reloading || e.ammo <= 0) {
        e.shotFlash = 0.12; // dry-fire blip
        return;
      }
      e.ammo -= 1;
      e.shotFlash = 0.18;
      if (touch) e.taps.push({ x: px, y: py, life: 0, maxLife: 0.45 });
      if (e.ammo <= 0) { e.reloading = true; e.reloadT = RELOAD_TIME; }

      // nearest target within hit radius
      const pad = touch ? 14 : 0;
      let best = null, bestD = Infinity;
      for (const t of e.targets) {
        const d = Math.hypot(t.x - px, t.y - py);
        if (d <= t.radius + pad && d < bestD) { bestD = d; best = t; }
      }
      if (!best) return;

      e.targets = e.targets.filter((t) => t !== best);
      if (best.kind === 'asteroid') {
        e.score = Math.max(0, e.score - ASTEROID_PENALTY);
        explode(best.x, best.y, false, true);
        popup(best.x, best.y, `-${ASTEROID_PENALTY}`, '255, 80, 80');
        e.shake = 11;
        e.flashRed = 0.55;
      } else {
        const v = best.gold ? GOLD_POINTS : STANDARD_POINTS;
        e.score += v;
        explode(best.x, best.y, best.gold, false);
        popup(best.x, best.y, `+${v}`, best.gold ? GOLD_RGB : '255, 235, 200');
      }
    };

    // ── Per-frame update ────────────────────────────────────────────
    const updateTargets = (dt) => {
      const { W, H } = e;
      for (const t of e.targets) {
        if (t.kind === 'rocket') {
          t.angle += t.curve * dt;
          t.x += Math.cos(t.angle) * t.speed * dt;
          t.y += Math.sin(t.angle) * t.speed * dt;
        } else {
          t.x += Math.cos(t.angle) * t.speed * dt;
          t.y += Math.sin(t.angle) * t.speed * dt;
          t.rot += t.rotSpeed * dt;
        }
      }
      e.targets = e.targets.filter((t) =>
        t.x > -120 && t.x < W + 120 && t.y > -120 && t.y < H + 160
      );
    };

    const updateParticles = (dt) => {
      for (const p of e.particles) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94; p.vy *= 0.94;
      }
      e.particles = e.particles.filter((p) => p.life < p.maxLife);
      for (const u of e.popups) { u.life += dt; u.y -= 26 * dt; }
      e.popups = e.popups.filter((u) => u.life < u.maxLife);
      for (const tp of e.taps) tp.life += dt;
      e.taps = e.taps.filter((tp) => tp.life < tp.maxLife);
      for (const b of e.bgRocks) {
        b.x += b.vx * dt; b.rot += b.rotSpeed * dt;
        if (b.x < -30) b.x = e.W + 30; else if (b.x > e.W + 30) b.x = -30;
      }
      e.shake = Math.max(0, e.shake - dt * 28);
      e.flashRed = Math.max(0, e.flashRed - dt * 1.4);
      e.shotFlash = Math.max(0, e.shotFlash - dt * 1.2);
    };

    const finalize = () => {
      e.finalScore = e.score;
      if (e.score > hiScoreRef.current) {
        e.isNewHigh = true;
        setHiScore(e.score);
        writeHiScore(e.score);
      } else {
        e.isNewHigh = false;
      }
    };

    const advance = (dt) => {
      if (e.phase === 'countdown') {
        e.phaseT -= dt;
        if (e.phaseT <= 0) { e.phase = 'playing'; e.roundTimeLeft = ROUND_TIME; e.spawnTimer = 0.4; }
      } else if (e.phase === 'playing') {
        e.roundTimeLeft -= dt;
        e.spawnTimer -= dt;
        if (e.spawnTimer <= 0) { spawnTarget(); e.spawnTimer = spawnInterval(); }
        if (e.reloading) { e.reloadT -= dt; if (e.reloadT <= 0) { e.ammo = MAX_AMMO; e.reloading = false; } }
        updateTargets(dt);
        if (e.roundTimeLeft <= 0) {
          if (e.round < TOTAL_ROUNDS) {
            e.roundOneScore = e.score;
            e.round += 1;
            e.phase = 'intermission';
            e.phaseT = INTERMISSION_TIME;
            e.targets = [];
          } else {
            e.phase = 'results';
            finalize();
          }
        }
      } else if (e.phase === 'intermission') {
        e.phaseT -= dt;
        updateTargets(dt);
        if (e.phaseT <= 0) {
          e.phase = 'countdown';
          e.phaseT = COUNTDOWN_TIME;
          e.ammo = MAX_AMMO;
          e.reloading = false;
        }
      }
      updateParticles(dt);
    };

    // ── Drawing ─────────────────────────────────────────────────────
    const drawStars = (now) => {
      const { W, H } = e;
      ctx.fillStyle = `rgb(${STAR_RGB})`;
      for (const s of e.stars) {
        const drift = (now * 0.004 * s.scrollRate * 60) % H;
        const x = s.nx * W;
        const y = ((s.ny * H + drift) % H + H) % H;
        let op = s.baseOpacity;
        if (s.twinkles) op *= 0.55 + 0.45 * Math.sin(now * 0.001 * s.twinkleSpeed + s.twinklePhase);
        ctx.globalAlpha = op;
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawRock = (x, y, size, rot, verts, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < verts.length; i++) {
        const a = (i / verts.length) * Math.PI * 2;
        const rr = size * verts[i];
        const vx = Math.cos(a) * rr, vy = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(58, 58, 66, ${alpha})`;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = `rgba(150, 150, 160, ${alpha})`;
      ctx.stroke();
      ctx.restore();
    };

    const drawMoonStation = (now) => {
      const { W, H } = e;
      const moonR = W * 0.95;
      const cx = W * 0.5;
      const cy = H + moonR * 0.66;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
      ctx.clip();
      const g = ctx.createLinearGradient(0, cy - moonR, 0, H);
      g.addColorStop(0, 'rgba(150, 152, 162, 0.95)');
      g.addColorStop(1, 'rgba(70, 72, 82, 0.95)');
      ctx.fillStyle = g;
      ctx.fillRect(0, cy - moonR, W, moonR * 2);
      // a few surface craters along the lit limb
      const craters = [[0.2, 26], [0.62, 34], [0.82, 20], [0.4, 30]];
      for (const [fx, cr] of craters) {
        const ccx = fx * W;
        const surfY = cy - Math.sqrt(Math.max(0, moonR * moonR - (ccx - cx) * (ccx - cx)));
        const cgr = ctx.createRadialGradient(ccx, surfY + cr * 0.5, 0, ccx, surfY + cr * 0.5, cr);
        cgr.addColorStop(0, 'rgba(50, 52, 60, 0.5)');
        cgr.addColorStop(1, 'rgba(50, 52, 60, 0)');
        ctx.fillStyle = cgr;
        ctx.beginPath();
        ctx.ellipse(ccx, surfY + cr * 0.4, cr, cr * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Space station silhouette on the horizon
      const stationX = W * 0.72;
      const surfY = cy - Math.sqrt(Math.max(0, moonR * moonR - (stationX - cx) * (stationX - cx)));
      ctx.save();
      ctx.translate(stationX, surfY);
      ctx.strokeStyle = `rgba(${STAR_RGB}, 0.6)`;
      ctx.fillStyle = 'rgba(20, 22, 30, 0.85)';
      ctx.lineWidth = 1.3;
      ctx.lineJoin = 'round';
      // habitat dome
      ctx.beginPath();
      ctx.ellipse(0, -2, 26, 18, 0, Math.PI, 0);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-26, -2); ctx.lineTo(26, -2);
      ctx.stroke();
      // support legs
      ctx.beginPath();
      ctx.moveTo(-14, -2); ctx.lineTo(-18, 8);
      ctx.moveTo(14, -2); ctx.lineTo(18, 8);
      ctx.stroke();
      // antenna mast + dish
      ctx.beginPath();
      ctx.moveTo(8, -18); ctx.lineTo(8, -40);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(8, -42, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GOLD_RGB}, 0.7)`;
      ctx.fill();
      // solar panels
      ctx.strokeStyle = `rgba(${STAR_RGB}, 0.5)`;
      ctx.fillStyle = 'rgba(40, 70, 120, 0.55)';
      ctx.beginPath();
      ctx.rect(-58, -20, 24, 12); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.rect(34, -20, 24, 12); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-34, -14); ctx.lineTo(-20, -10);
      ctx.moveTo(34, -14); ctx.lineTo(20, -10);
      ctx.stroke();
      ctx.restore();
    };

    const drawRocketTarget = (t, now) => {
      const model = CRAFT[t.modelIdx];
      const tint = t.gold ? GOLD_RGB : STAR_RGB;
      const tailDir = t.angle + Math.PI;
      const tailX = t.x + Math.cos(tailDir) * t.tailD;
      const tailY = t.y + Math.sin(tailDir) * t.tailD;

      // gold glow ring
      if (t.gold) {
        const gg = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.radius * 1.6);
        gg.addColorStop(0, `rgba(${GOLD_RGB}, 0.28)`);
        gg.addColorStop(1, `rgba(${GOLD_RGB}, 0)`);
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // engine flame
      const perpX = -Math.sin(tailDir), perpY = Math.cos(tailDir);
      const flicker = Math.sin(now * 0.011) * 0.5 + Math.sin(now * 0.023) * 0.35 + Math.sin(now * 0.037) * 0.15;
      const flameLen = 18 + flicker * 8;
      const flameW = 5 + flicker * 2;
      const tipX = tailX + Math.cos(tailDir) * flameLen;
      const tipY = tailY + Math.sin(tailDir) * flameLen;
      const grad = ctx.createLinearGradient(tailX, tailY, tipX, tipY);
      grad.addColorStop(0, 'rgba(255, 235, 140, 1)');
      grad.addColorStop(0.3, 'rgba(255, 107, 43, 0.92)');
      grad.addColorStop(0.7, 'rgba(255, 40, 10, 0.55)');
      grad.addColorStop(1, 'rgba(200, 20, 0, 0)');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tailX + perpX * flameW, tailY + perpY * flameW);
      ctx.quadraticCurveTo(tipX, tipY, tailX - perpX * flameW, tailY - perpY * flameW);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.shadowBlur = 16;
      ctx.shadowColor = 'rgba(255, 100, 20, 0.6)';
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.angle + model.noseOffset);
      ctx.scale(model.scale, model.scale);
      ctx.translate(-model.cx, -model.cy);
      model.draw(ctx, now, tint);
      ctx.restore();
    };

    const drawParticles = () => {
      for (const p of e.particles) {
        const tt = clamp(p.life / p.maxLife, 0, 1);
        const size = p.size + (p.maxSize - p.size) * Math.sqrt(tt);
        const alpha = Math.pow(1 - tt, 1.6) * 0.7;
        if (alpha < 0.01) continue;
        const sg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        sg.addColorStop(0, `rgba(${p.rgb}, ${alpha.toFixed(3)})`);
        sg.addColorStop(1, `rgba(${p.rgb}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
      }
    };

    const drawPopups = () => {
      ctx.textAlign = 'center';
      ctx.font = '700 18px "IBM Plex Mono", monospace';
      for (const u of e.popups) {
        const a = 1 - u.life / u.maxLife;
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgba(${u.rgb}, 1)`;
        ctx.fillText(u.text, u.x, u.y);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'start';
    };

    const drawTaps = () => {
      for (const tp of e.taps) {
        const a = 1 - tp.life / tp.maxLife;
        const r = 6 + (1 - a) * 26;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 107, 43, ${(a * 0.8).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    const drawCrosshair = () => {
      if (e.isTouch) return;
      const x = e.mouseX, y = e.mouseY;
      const kick = e.shotFlash > 0 ? 3 : 0;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 107, 43, 0.95)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(x, y, 16 - kick, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 107, 43, 1)';
      ctx.fill();
      const g = 7, len = 9;
      ctx.beginPath();
      ctx.moveTo(x - g - len, y); ctx.lineTo(x - g, y);
      ctx.moveTo(x + g, y); ctx.lineTo(x + g + len, y);
      ctx.moveTo(x, y - g - len); ctx.lineTo(x, y - g);
      ctx.moveTo(x, y + g); ctx.lineTo(x, y + g + len);
      ctx.stroke();
      ctx.restore();
    };

    const render = (now) => {
      const { W, H } = e;
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      if (e.shake > 0) ctx.translate(rand(-e.shake, e.shake) * 0.4, rand(-e.shake, e.shake) * 0.4);

      // backdrop
      const vg = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(16, 17, 24, 0)');
      vg.addColorStop(1, 'rgba(2, 2, 6, 0.7)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      drawStars(now);
      for (const b of e.bgRocks) drawRock(b.x, b.y, b.r, b.rot, b.verts, 0.4);
      drawMoonStation(now);

      // targets
      for (const t of e.targets) {
        if (t.kind === 'rocket') drawRocketTarget(t, now);
        else drawRock(t.x, t.y, t.size, t.rot, t.verts, 0.95);
      }

      drawParticles();
      drawPopups();
      drawTaps();
      drawCrosshair();
      ctx.restore();

      // red damage flash
      if (e.flashRed > 0) {
        ctx.fillStyle = `rgba(255, 30, 30, ${(e.flashRed * 0.3).toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
    };

    // ── Loop ────────────────────────────────────────────────────────
    let hudCache = '';
    const syncHud = () => {
      const next = {
        phase: e.phase,
        round: e.round,
        score: e.score,
        ammo: e.ammo,
        reloading: e.reloading,
        timeLeft: Math.max(0, Math.ceil(e.roundTimeLeft)),
        roundOneScore: e.roundOneScore,
        finalScore: e.finalScore,
        isNewHigh: e.isNewHigh,
      };
      const key = JSON.stringify(next);
      if (key !== hudCache) { hudCache = key; setHud(next); }
    };

    const loop = (now) => {
      if (!running) return;
      const dt = clamp((now - e.lastTime) / 1000, 0, 0.05);
      e.lastTime = now;
      advance(dt);
      render(now);
      syncHud();
      rafId = requestAnimationFrame(loop);
    };

    // ── Input ───────────────────────────────────────────────────────
    const localPoint = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };
    const onPointerMove = (ev) => {
      const p = localPoint(ev.clientX, ev.clientY);
      e.mouseX = p.x; e.mouseY = p.y;
    };
    const onPointerDown = (ev) => {
      const p = localPoint(ev.clientX, ev.clientY);
      e.mouseX = p.x; e.mouseY = p.y;
      shoot(p.x, p.y, ev.pointerType === 'touch' || e.isTouch);
    };
    const onResize = () => measure();

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onResize);
    document.body.classList.add('rockethunt-active');

    rafId = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      document.body.classList.remove('rockethunt-active');
    };
  }, [expanded, createEngine]);

  // Hide entirely on collapse so a fresh game starts each open
  useEffect(() => {
    if (!expanded) {
      engineRef.current = null;
      setHud((h) => ({ ...h, phase: 'ready' }));
    }
  }, [expanded]);

  const onExpand = useCallback(() => setExpanded(true), []);

  // ── Render ──────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <motion.div
        className="rockethunt-pip"
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        drag
        dragMomentum={false}
        dragElastic={0.12}
      >
        <span className="rockethunt-corner rockethunt-corner-tl" />
        <span className="rockethunt-corner rockethunt-corner-br" />
        <div className="rockethunt-pip-top">
          <span className="rockethunt-pip-tag">✦ ARCADE</span>
          <span className="rockethunt-pip-hi">HI {hiScore}</span>
        </div>
        <h3 className="rockethunt-pip-title">ROCKET<br />HUNT</h3>
        <p className="rockethunt-pip-sub">Shoot the rockets. Mind the asteroids.</p>
        <button className="btn-primary rockethunt-expand" onClick={onExpand}>
          EXPAND ▶
        </button>
      </motion.div>
    );
  }

  const showHud = hud.phase === 'playing' || hud.phase === 'countdown' || hud.phase === 'intermission';

  return (
    <div className="rockethunt-overlay">
      <canvas ref={canvasRef} className="rockethunt-canvas" />

      <button className="rockethunt-close" onClick={collapse} aria-label="Close game">✕</button>

      {showHud && (
        <div className="rockethunt-hud">
          <div className="rockethunt-hud-block">
            <span className="rockethunt-hud-label">Round</span>
            <span className="rockethunt-hud-value">{hud.round} / {TOTAL_ROUNDS}</span>
          </div>
          <div className="rockethunt-hud-block rockethunt-hud-score">
            <span className="rockethunt-hud-label">Score</span>
            <span className="rockethunt-hud-value">{hud.score}</span>
          </div>
          <div className="rockethunt-hud-block">
            <span className="rockethunt-hud-label">Time</span>
            <span className="rockethunt-hud-value">{hud.phase === 'playing' ? hud.timeLeft : ROUND_TIME}</span>
          </div>
          <div className="rockethunt-hud-block rockethunt-hud-ammo">
            <span className="rockethunt-hud-label">{hud.reloading ? 'Reloading' : 'Ammo'}</span>
            <span className="rockethunt-shells">
              {Array.from({ length: MAX_AMMO }, (_, i) => (
                <span key={i} className={`rockethunt-shell${i < hud.ammo ? ' is-loaded' : ''}`} />
              ))}
            </span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {hud.phase === 'ready' && (
          <motion.div
            key="ready"
            className="rockethunt-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <span className="rockethunt-card-tag">✦ DEEP SIGNAL ARCADE</span>
            <h2 className="rockethunt-card-title">ROCKET HUNT</h2>
            <p className="rockethunt-card-text">
              Two 30-second rounds. Down the rockets — <b>gold ones</b> are worth triple.
              Do <b>not</b> shoot the asteroids. Reload happens automatically when your
              magazine runs dry.
            </p>
            <p className="rockethunt-card-hi">HIGH SCORE — {hiScore}</p>
            <button className="btn-primary" onClick={startGame}>INSERT COIN ▶</button>
          </motion.div>
        )}

        {hud.phase === 'countdown' && (
          <motion.div
            key="countdown"
            className="rockethunt-card rockethunt-card-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="rockethunt-card-tag">GET READY</span>
            <h2 className="rockethunt-card-title">ROUND {hud.round}</h2>
          </motion.div>
        )}

        {hud.phase === 'intermission' && (
          <motion.div
            key="intermission"
            className="rockethunt-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="rockethunt-card-tag">ROUND {hud.round - 1} COMPLETE</span>
            <h2 className="rockethunt-card-title">SCORE {hud.roundOneScore}</h2>
            <p className="rockethunt-card-text">Round {hud.round} incoming…</p>
          </motion.div>
        )}

        {hud.phase === 'results' && (
          <motion.div
            key="results"
            className="rockethunt-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <span className="rockethunt-card-tag">GAME OVER</span>
            <h2 className="rockethunt-card-title">FINAL SCORE</h2>
            <p className="rockethunt-card-final">{hud.finalScore}</p>
            <p className="rockethunt-card-hi">
              {hud.isNewHigh ? '★ NEW HIGH SCORE ★' : `HIGH SCORE — ${hiScore}`}
            </p>
            <div className="rockethunt-card-actions">
              <button className="btn-primary" onClick={startGame}>REPLAY ▶</button>
              <button className="btn-secondary" onClick={collapse}>CLOSE</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RocketHunt;
