import React, { useEffect, useRef } from 'react';
import { clamp, fitCanvas, reducedMotion, smoothstep, token } from './ui/canvas';

// The professional side's panel: a sheet of points rolling in slow
// swells, seen from above and in front.
//
// It is a grid on a plane under a hand-rolled perspective camera rather
// than a 3D library. The camera never moves and the grid only ever moves
// vertically, so every dot's screen x and depth scale are fixed when the
// panel is sized; a frame is one height sum and one multiply per dot.
//
// The pointer is the only thing it answers to. A dot the pointer touches
// is pressed into a damped wave equation running over the same grid, so
// moving across the sheet drags a wake that spreads outward and settles,
// and a resting pointer raises a soft swell under itself.

// Camera, in world units. The eye sits CAM_H above the plane; rows run
// from Z_NEAR to Z_FAR in front of it. The horizon is set well above the
// top of the panel — the eye looks down onto the sheet rather than across
// it — which both fills the frame and keeps the far rows far enough apart
// that the swells never fold over themselves.
const CAM_H = 1;
const Z_NEAR = 1;
const Z_FAR = 2;
const HORIZON = -1;     // × panel height
// Turned so the rows run diagonally and the near corner — the biggest,
// darkest dots — sits against the window edge, away from the text.
const YAW = -0.32;

const SPACING = 11;     // px between dots along the near row
const MAX_COLS = 170;
const MAX_ROWS = 88;
const LEVELS = 8;       // alpha steps; dots are filled one step at a time

// Pointer response.
const STEP = 1 / 60;    // the ripple tank's fixed step, in seconds
const DAMPING = 0.975;  // per step; a ripple is gone in ~2s
const RIPPLE = 0.025;   // world height per unit of ripple — a brisk pass
                        // peaks near the swell's own height
const LIFT = 0.04;      // world height of the swell under a resting pointer

const TAU = Math.PI * 2;

// clearX / clearY: the corner of the panel the name overhangs into, which
// the sheet thins out of so it never sits behind the lettering.
const PointWave = ({ clearX = 0, clearY = 0 }) => {
    const ref = useRef(null);
    const clearRef = useRef({ x: clearX, y: clearY });
    clearRef.current = { x: clearX, y: clearY };
    const rebuildRef = useRef(() => {});

    useEffect(() => { rebuildRef.current(); }, [clearX, clearY]);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas && typeof canvas.getContext === 'function' && canvas.getContext('2d');
        if (!ctx) return undefined;

        const still = reducedMotion();

        let w = 0;
        let h = 0;
        let cols = 0;
        let rows = 0;
        let n = 0;
        let horizon = 0;
        let reach = 0;
        let colour = '#000';

        // Per dot: phase inputs for the swell, screen x, depth scale,
        // size, and last frame's screen y (which the pointer tests
        // against). Ripple height lives in cur/prev, the swell in lift.
        let ga, gb, sx, sc, size, sy, cur, prev, lift;
        // Dots grouped by alpha step, so a frame is LEVELS fills.
        let order, offsets;

        const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, inside: false, fresh: true };
        let t = 0;
        let acc = 0;
        let last = 0;
        let raf = 0;
        let built = false;

        const build = () => {
            ({ w, h } = fitCanvas(canvas, ctx));
            colour = token('--ink-max', '#000');

            horizon = HORIZON * h;
            const f = ((1.06 * h - horizon) * Z_NEAR) / CAM_H;
            const cx = w * 0.56;
            const zc = (Z_NEAR + Z_FAR) / 2;
            // Wide enough that the far row still spans the panel.
            const halfX = (0.62 * w * Z_FAR) / f;
            // The swell's wavelength is tied to how much of the sheet is
            // on screen, so it reads the same at any panel size.
            const span = (w * zc) / f;

            cols = clamp(Math.round((2 * halfX * f) / Z_NEAR / SPACING), 40, MAX_COLS);
            rows = clamp(Math.round(h / 11), 30, MAX_ROWS);
            n = cols * rows;
            reach = clamp(Math.min(w, h) * 0.14, 70, 130);

            ga = new Float32Array(n);
            gb = new Float32Array(n);
            sx = new Float32Array(n);
            sc = new Float32Array(n);
            size = new Float32Array(n);
            sy = new Float32Array(n).fill(-1e4);
            cur = new Float32Array(n);
            prev = new Float32Array(n);
            lift = new Float32Array(n);

            const level = new Int8Array(n).fill(-1);
            const counts = new Int32Array(LEVELS);
            const cos = Math.cos(YAW);
            const sin = Math.sin(YAW);
            const dotScale = clamp(h / 900, 0.85, 1.15);
            const clear = clearRef.current;

            for (let j = 0; j < rows; j++) {
                const v = j / (rows - 1);                // 0 near, 1 far
                const z = Z_NEAR + (Z_FAR - Z_NEAR) * v;
                for (let i = 0; i < cols; i++) {
                    const k = j * cols + i;
                    const u = (i / (cols - 1)) * 2 - 1;  // -1 left, 1 right
                    const x = u * halfX;

                    const dz = z - zc;
                    const xr = x * cos - dz * sin;
                    const zr = Math.max(zc + x * sin + dz * cos, 0.35);
                    const s = f / zr;

                    sx[k] = cx + xr * s;
                    sc[k] = s;
                    ga[k] = (x / span) * TAU;
                    gb[k] = v * TAU;

                    const depth = clamp((zr - Z_NEAR) / (Z_FAR - Z_NEAR), 0, 1);
                    size[k] = (2.3 - 1.4 * depth) * dotScale;

                    // Far dots fade with distance; the sheet's own edges
                    // dissolve rather than ending on a hard row; it thins
                    // out toward the text so it never crowds it; and it
                    // stays out from behind the name.
                    const restY = horizon + CAM_H * s;
                    const underName = clear.x
                        ? (1 - smoothstep(clear.x * 0.5, clear.x + 60, sx[k])) *
                          (1 - smoothstep(clear.y, clear.y + 80, restY))
                        : 0;
                    const alpha =
                        (1 - 0.72 * depth) *
                        smoothstep(0, 0.16, 1 - Math.abs(u)) *
                        smoothstep(0, 0.22, 1 - v) *
                        smoothstep(0, w * 0.3, sx[k]) *
                        smoothstep(0, h * 0.14, restY) *
                        (1 - underName);

                    if (alpha < 0.04 || sx[k] < -4 || sx[k] > w + 4) continue;
                    const l = Math.min(LEVELS - 1, Math.floor(alpha * LEVELS));
                    level[k] = l;
                    counts[l] += 1;
                }
            }

            offsets = new Int32Array(LEVELS + 1);
            for (let l = 0; l < LEVELS; l++) offsets[l + 1] = offsets[l] + counts[l];
            order = new Int32Array(offsets[LEVELS]);
            const fill = offsets.slice(0, LEVELS);
            for (let k = 0; k < n; k++) {
                if (level[k] >= 0) order[fill[level[k]]++] = k;
            }

            built = true;
        };

        const touch = () => {
            if (!pointer.inside) return;
            const speed = pointer.fresh
                ? 0
                : Math.hypot(pointer.x - pointer.lastX, pointer.y - pointer.lastY);
            pointer.fresh = false;
            pointer.lastX = pointer.x;
            pointer.lastY = pointer.y;

            const push = Math.min(speed, 40) * 0.035;
            const r2 = reach * reach;
            for (let k = 0; k < n; k++) {
                const dx = sx[k] - pointer.x;
                if (dx > reach || dx < -reach) continue;
                const dy = sy[k] - pointer.y;
                if (dy > reach || dy < -reach) continue;
                const d2 = dx * dx + dy * dy;
                if (d2 >= r2) continue;
                const q = 1 - Math.sqrt(d2) / reach;
                const q2 = q * q;
                cur[k] -= push * q2;
                lift[k] += (q2 - lift[k]) * 0.2;
            }
        };

        // One step of the ripple tank: each cell moves toward the mean of
        // its neighbours, overshoots, and loses a little every step.
        const ripple = () => {
            for (let k = 0; k < n; k++) lift[k] *= 0.93;
            for (let j = 1; j < rows - 1; j++) {
                let k = j * cols + 1;
                for (let i = 1; i < cols - 1; i++, k++) {
                    prev[k] =
                        ((cur[k - 1] + cur[k + 1] + cur[k - cols] + cur[k + cols]) * 0.5 - prev[k]) *
                        DAMPING;
                }
            }
            const swap = cur;
            cur = prev;
            prev = swap;
        };

        const heights = () => {
            for (let k = 0; k < n; k++) {
                const a = ga[k];
                const b = gb[k];
                const swell =
                    0.06 * Math.sin(0.9 * a + 0.5 * b + 0.5 * t) +
                    0.04 * Math.sin(0.55 * a - 0.9 * b - 0.6 * t + 1.3) +
                    0.018 * Math.sin(1.9 * a + 1.4 * b + 0.9 * t + 0.4) * Math.cos(0.7 * b - 0.3 * t);
                const y = swell + cur[k] * RIPPLE + lift[k] * LIFT;
                sy[k] = horizon + (CAM_H - y) * sc[k];
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = colour;
            for (let l = 0; l < LEVELS; l++) {
                const start = offsets[l];
                const end = offsets[l + 1];
                if (start === end) continue;
                ctx.globalAlpha = (l + 1) / LEVELS;
                ctx.beginPath();
                for (let m = start; m < end; m++) {
                    const k = order[m];
                    const y = sy[k];
                    if (y < -4 || y > h + 4) continue;
                    const x = sx[k];
                    const s = size[k];
                    if (s < 1.7) {
                        ctx.rect(x - s / 2, y - s / 2, s, s);
                    } else {
                        const r = s / 2;
                        ctx.moveTo(x + r, y);
                        ctx.arc(x, y, r, 0, TAU);
                    }
                }
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        };

        const frame = (now) => {
            if (!built) build();
            const dt = last ? Math.min(now - last, 50) / 1000 : 0;
            last = now;
            t += dt;

            // The tank runs at a fixed rate, so a ripple travels and fades
            // at the same speed on a 60Hz panel and a 144Hz one.
            acc += dt;
            while (acc >= STEP) {
                touch();
                ripple();
                acc -= STEP;
            }
            heights();
            draw();
            raf = requestAnimationFrame(frame);
        };

        const drawStill = () => {
            build();
            heights();
            draw();
        };

        const onMove = (e) => {
            const r = canvas.getBoundingClientRect();
            pointer.x = e.clientX - r.left;
            pointer.y = e.clientY - r.top;
            const inside = pointer.x >= 0 && pointer.x <= w && pointer.y >= 0 && pointer.y <= h;
            if (inside && !pointer.inside) pointer.fresh = true;
            pointer.inside = inside;
        };
        const onOut = (e) => { if (!e.relatedTarget) pointer.inside = false; };
        const onBlur = () => { pointer.inside = false; };

        // Sizing waits a frame: the session attribute on <html> is set by
        // Home after this effect runs, and the colour has to be read after.
        rebuildRef.current = () => {
            if (still) drawStill();
            else if (built) build();
        };
        const ro = typeof ResizeObserver === 'function'
            ? new ResizeObserver(() => rebuildRef.current())
            : null;

        if (still) {
            raf = requestAnimationFrame(drawStill);
        } else {
            raf = requestAnimationFrame(frame);
            window.addEventListener('pointermove', onMove, { passive: true });
            window.addEventListener('pointerout', onOut);
            window.addEventListener('blur', onBlur);
        }
        ro?.observe(canvas);

        return () => {
            cancelAnimationFrame(raf);
            ro?.disconnect();
            rebuildRef.current = () => {};
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerout', onOut);
            window.removeEventListener('blur', onBlur);
        };
    }, []);

    return <canvas ref={ref} className="point-wave" aria-hidden="true" />;
};

export default PointWave;
