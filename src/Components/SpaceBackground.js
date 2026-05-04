import { useEffect, useRef } from 'react';
import './SpaceBackground.css';

// Three depth layers: [count, minSize, maxSize, minOpacity, maxOpacity, parallaxStrength, scrollRate, twinkleFraction]
const LAYERS = [
  { count: 130, size: [0.35, 0.85], opacity: [0.07, 0.20], parallax: 0.007, scroll: 0.018, twinkle: 0.28 },
  { count:  65, size: [0.80, 1.50], opacity: [0.20, 0.40], parallax: 0.020, scroll: 0.048, twinkle: 0.18 },
  { count:  30, size: [1.40, 2.20], opacity: [0.35, 0.60], parallax: 0.044, scroll: 0.095, twinkle: 0.10 },
];

const rand   = (a, b) => a + Math.random() * (b - a);
const lerp   = (a, b, t) => a + (b - a) * t;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const buildStars = () => {
  const stars = [];
  LAYERS.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      const twinkles = Math.random() < layer.twinkle;
      stars.push({
        nx: Math.random(),
        ny: Math.random(),
        size:        rand(...layer.size),
        baseOpacity: rand(...layer.opacity),
        parallax:    layer.parallax,
        scrollRate:  layer.scroll,
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
      canvas.width  = Math.round(W * dpr);
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

        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starRgb},${opacity.toFixed(3)})`;
        ctx.fill();
      }

      // Spawn / draw shooting stars
      if (Date.now() >= nextShootAt) spawnShooter();

      shooters = shooters.filter(s => s.life < s.duration);
      for (const s of shooters) {
        s.life += dt;
        const prog  = s.life / s.duration;
        const alpha = s.maxOpacity * Math.sin(prog * Math.PI);

        const headX = s.startX + s.vx * s.life;
        const headY = s.startY + s.vy * s.life;
        const dist  = Math.hypot(s.vx, s.vy);
        const nx    = s.vx / dist;
        const ny    = s.vy / dist;
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

      rafId = requestAnimationFrame(draw);
    };

    // ── Event listeners ──────────────────────────────────────────────
    const onMouseMove  = (e) => {
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

    window.addEventListener('mousemove',      onMouseMove,  { passive: true });
    window.addEventListener('scroll',         onScroll,     { passive: true });
    window.addEventListener('resize',         onResize,     { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode'],
    });

    return () => {
      isRunning = false;
      if (rafId)      cancelAnimationFrame(rafId);
      if (themeRafId) cancelAnimationFrame(themeRafId);
      window.removeEventListener('mousemove',      onMouseMove);
      window.removeEventListener('scroll',         onScroll);
      window.removeEventListener('resize',         onResize);
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
