import React, { useEffect, useRef } from 'react';
import './SpaceBackground.css';

// The ether behind the page: a mosaic-block starfield (the sky as a
// teletext graphic), occasional interference bands rolling down the
// picture, and a burst of full-screen static whenever the receiver
// retunes to the other channel.

const CELL = 4;                       // mosaic block size, px
const STAR_DENSITY = 1 / 16000;       // stars per px²

const rand = (a, b) => a + Math.random() * (b - a);

const readColors = () => {
    const css = getComputedStyle(document.documentElement);
    const rgb = (name, fallback) => (css.getPropertyValue(name).trim() || fallback);
    return {
        ink: rgb('--ink-rgb', '236, 238, 248'),
        lab: rgb('--lab-rgb', '56, 225, 230'),
        hl:  rgb('--hl-rgb',  '255, 210, 31'),
        bar: rgb('--bar-rgb', '26, 26, 208'),
    };
};

const SpaceBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let reduce = reduceQuery.matches;

        let W = 0, H = 0, dpr = 1;
        let stars = [];
        let colors = readColors();

        let staticT = 0;              // 1 → 0 while retuning
        let bandY = -1;               // interference band position, -1 = idle
        let nextBandAt = rand(5, 11); // seconds until next band
        let clock = 0;
        let scrollY = window.scrollY;
        let rafId = null;
        let last = performance.now();

        const seedStars = () => {
            const count = Math.round(W * H * STAR_DENSITY);
            stars = Array.from({ length: count }, () => {
                const roll = Math.random();
                return {
                    x: Math.floor(rand(0, W / CELL)),
                    y: Math.floor(rand(0, H / CELL)),
                    // most stars are ink; a few carry service colour
                    tone: roll < 0.78 ? 'ink' : roll < 0.92 ? 'lab' : 'hl',
                    base: rand(0.05, 0.3),
                    depth: rand(0.02, 0.12),      // scroll parallax rate
                    phase: Math.floor(rand(0, 4)),
                    period: rand(0.7, 2.4),        // seconds per twinkle step
                    tall: Math.random() < 0.3,     // some stars are 1×2 blocks
                };
            });
        };

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seedStars();
            if (reduce) draw(0);
        };

        const drawStars = () => {
            const rows = Math.ceil(H / CELL);
            for (const s of stars) {
                // quantized twinkle: alpha steps, never fades
                const step = (Math.floor(clock / s.period) + s.phase) % 4;
                const a = s.base * (step === 0 ? 0.4 : step === 2 ? 1.6 : 1);
                const yy = (((s.y - scrollY * s.depth / CELL) % rows) + rows) % rows;
                ctx.fillStyle = `rgba(${colors[s.tone]}, ${Math.min(a, 0.55)})`;
                ctx.fillRect(s.x * CELL, Math.floor(yy) * CELL, CELL - 1, (s.tall ? 2 : 1) * CELL - 1);
            }
        };

        const drawBand = () => {
            if (bandY < 0) return;
            const bandH = 26;
            const top = bandY * (H + bandH * 2) - bandH;
            for (let i = 0; i < 90; i++) {
                const w = rand(6, 60);
                const x = rand(-10, W);
                const y = top + rand(0, bandH);
                ctx.fillStyle = `rgba(${colors.ink}, ${rand(0.03, 0.14)})`;
                ctx.fillRect(x, y, w, 2);
            }
        };

        const drawStatic = () => {
            if (staticT <= 0) return;
            const cols = Math.ceil(W / (CELL * 2));
            const rows = Math.ceil(H / (CELL * 2));
            const coverage = staticT * 0.5;
            const palette = [colors.ink, colors.ink, colors.lab, colors.hl, colors.bar];
            for (let i = 0, n = cols * rows * coverage; i < n; i++) {
                const c = palette[(Math.random() * palette.length) | 0];
                ctx.fillStyle = `rgba(${c}, ${rand(0.1, 0.7) * staticT})`;
                ctx.fillRect(
                    ((Math.random() * cols) | 0) * CELL * 2,
                    ((Math.random() * rows) | 0) * CELL * 2,
                    CELL * 2 - 1, CELL * 2 - 1
                );
            }
        };

        const draw = (dt) => {
            ctx.clearRect(0, 0, W, H);
            drawStars();

            if (!reduce) {
                if (bandY >= 0) {
                    bandY += dt / 1.3;
                    if (bandY > 1) { bandY = -1; nextBandAt = clock + rand(6, 14); }
                } else if (clock > nextBandAt) {
                    bandY = 0;
                }
                drawBand();

                if (staticT > 0) staticT = Math.max(0, staticT - dt / 0.7);
                drawStatic();
            }
        };

        const tick = (now) => {
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;
            clock += dt;
            scrollY = window.scrollY;
            draw(dt);
            rafId = requestAnimationFrame(tick);
        };

        // Retune: re-read service colours and blast static.
        const mo = new MutationObserver(() => {
            colors = readColors();
            if (!reduce) staticT = 1;
            if (reduce) draw(0);
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const onMotionChange = (e) => {
            reduce = e.matches;
            if (reduce) {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
                staticT = 0;
                bandY = -1;
                draw(0);
            } else if (!rafId) {
                last = performance.now();
                rafId = requestAnimationFrame(tick);
            }
        };
        if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onMotionChange);

        const onScroll = () => { if (reduce) { scrollY = window.scrollY; draw(0); } };

        window.addEventListener('resize', resize, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        resize();
        if (!reduce) rafId = requestAnimationFrame(tick);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            mo.disconnect();
            if (reduceQuery.removeEventListener) reduceQuery.removeEventListener('change', onMotionChange);
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return <canvas ref={canvasRef} className="space-bg-canvas" aria-hidden="true" />;
};

export default SpaceBackground;
