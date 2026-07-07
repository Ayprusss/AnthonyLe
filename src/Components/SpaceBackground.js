import React, { useEffect, useRef } from 'react';
import './SpaceBackground.css';

// The ether behind the page: a mosaic-block starfield (the sky as a
// teletext graphic), occasional interference bands rolling down the
// picture, and a burst of full-screen static whenever the receiver
// retunes to the other channel.
//
// Two service illustrations ride the ether, transmitted as chunky sixel
// mosaic graphics — the kind a 1980s broadcaster sent down the VBI:
//   · CH 1 / NEWS    — a SUPERNOVA starburst, detonating on tune-in
//   · CH 2 / LEISURE — the EARTH (+ Moon), the "TERRA — HOME" page
// Both are drawn on the same block grid, quantised to the teletext-7
// palette with ordered dithering. No gradients, no glow — this is a
// picture assembled from coloured squares.

const CELL = 4;                       // mosaic block size, px (starfield)
const MCELL = 6;                      // graphics block size, px (illustrations)
const STAR_DENSITY = 1 / 16000;       // stars per px²
const TAU = Math.PI * 2;

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Uniform random direction on the unit sphere — seeds the 3D ejecta shell.
const randUnit = () => {
    const z = rand(-1, 1);
    const t = rand(0, Math.PI * 2);
    const r = Math.sqrt(1 - z * z);
    return [r * Math.cos(t), z, r * Math.sin(t)];
};

// Ordered dither — a 4×4 Bayer matrix turns a 0..1 intensity into a
// scattered on/off pattern, so shading reads as period-correct stipple
// rather than a smooth ramp.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dither = (gx, gy, v) => v > (BAYER[(gy & 3) * 4 + (gx & 3)] + 0.5) / 16;

// The seven teletext colours (fixed hardware palette — the service
// graphics keep these regardless of which channel is tuned, matching
// CH 1's tokens), plus a few illustration mixes.
const TT = {
    white:  '236, 238, 248',
    yellow: '255, 210, 31',
    amber:  '255, 156, 66',
    cyan:   '56, 225, 230',
    green:  '59, 240, 125',
    red:    '255, 51, 82',
    mag:    '255, 84, 215',
    violet: '176, 100, 255',
    blue:   '64, 132, 236',
    ocean:  '46, 116, 214',
    land:   '70, 196, 108',
    night:  '26, 40, 92',
    moon:   '158, 168, 190',
};

// Coarse continent outlines as [lon, lat] degree polygons — rasterised
// once into an equirectangular land mask, then sampled per cell as the
// globe turns.
const LAND_SHAPES = [
    [[-158, 71], [-128, 70], [-100, 69], [-84, 70], [-82, 73], [-74, 68], [-64, 60], [-56, 52],
     [-66, 47], [-70, 43], [-74, 40], [-76, 35], [-81, 31], [-81, 25], [-90, 30], [-97, 26],
     [-97, 20], [-92, 18], [-87, 16], [-83, 9], [-77, 8], [-83, 14], [-95, 16], [-105, 20],
     [-112, 24], [-117, 32], [-123, 38], [-124, 46], [-130, 52], [-141, 60], [-152, 59], [-165, 60]],
    [[-45, 60], [-30, 61], [-20, 70], [-22, 76], [-32, 82], [-46, 83], [-58, 79], [-54, 72], [-50, 64]],
    [[-77, 8], [-70, 12], [-61, 10], [-50, 0], [-44, -2], [-35, -6], [-39, -14], [-48, -25],
     [-56, -34], [-64, -41], [-69, -52], [-66, -55], [-74, -50], [-73, -41], [-71, -30],
     [-72, -18], [-78, -8], [-81, -4], [-80, 2], [-78, 6]],
    [[-16, 15], [-12, 25], [-5, 32], [2, 36], [10, 37], [18, 32], [25, 32], [33, 31], [35, 24],
     [38, 16], [43, 11], [51, 12], [49, 4], [42, -1], [40, -11], [35, -22], [26, -34], [19, -35],
     [14, -22], [9, -1], [5, 5], [-4, 5], [-10, 6]],
    [[44, -16], [50, -15], [50, -25], [45, -25]],
    [[-9, 37], [-9, 44], [-2, 49], [2, 51], [8, 54], [5, 58], [10, 63], [18, 69], [28, 71], [30, 66],
     [26, 60], [22, 56], [16, 54], [14, 46], [19, 42], [24, 41], [14, 38], [3, 42]],
    [[-5, 50], [-3, 53], [-2, 57], [-6, 58], [-8, 55], [-6, 51]],
    [[40, 68], [55, 71], [70, 73], [95, 77], [110, 76], [128, 73], [142, 72], [160, 70], [172, 67],
     [178, 65], [170, 60], [160, 61], [150, 53], [142, 46], [135, 44], [127, 40], [122, 40],
     [122, 30], [110, 21], [106, 11], [100, 6], [96, 16], [90, 22], [88, 21], [80, 8], [77, 9],
     [73, 18], [66, 25], [57, 26], [50, 30], [44, 38], [40, 44], [48, 52], [55, 56], [46, 62]],
    [[131, 33], [136, 35], [140, 38], [142, 41], [139, 42], [135, 35], [132, 32]],
    [[109, -3], [117, -2], [119, 2], [114, 5], [109, 2], [107, 0]],
    [[114, -22], [122, -18], [130, -12], [137, -12], [143, -11], [146, -18], [151, -25],
     [150, -38], [143, -39], [136, -35], [129, -32], [122, -34], [115, -34]],
    [[167, -46], [171, -44], [175, -41], [178, -38], [173, -42], [168, -45]],
];

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

        // ── Service illustration state ────────────────────────────────
        // Professional shows the supernova; Personal shows the Earth. Each
        // fades to its target so the retune static masks a clean swap.
        let isPersonal = document.documentElement.getAttribute('data-theme') === 'personal';
        let snAlpha = isPersonal ? 0 : 0.5;   // supernova opacity
        let earthAlpha = isPersonal ? 0.55 : 0;
        let burstT = 0;                        // detonation clock 0→1

        // ── Equirectangular land mask (built once) ────────────────────
        const LMW = 360, LMH = 180;
        let landMask = null;
        const buildLandMask = () => {
            try {
                const oc = document.createElement('canvas');
                oc.width = LMW; oc.height = LMH;
                const octx = oc.getContext('2d');
                if (!octx) return;
                octx.fillStyle = '#000';
                octx.fillRect(0, 0, LMW, LMH);
                octx.fillStyle = '#fff';
                for (const poly of LAND_SHAPES) {
                    octx.beginPath();
                    poly.forEach(([lo, la], i) => {
                        const x = (lo + 180) / 360 * LMW;
                        const y = (90 - la) / 180 * LMH;
                        if (i === 0) octx.moveTo(x, y); else octx.lineTo(x, y);
                    });
                    octx.closePath();
                    octx.fill();
                }
                const data = octx.getImageData(0, 0, LMW, LMH).data;
                landMask = new Uint8Array(LMW * LMH);
                for (let i = 0; i < LMW * LMH; i++) landMask[i] = data[i * 4] > 128 ? 1 : 0;
            } catch (e) {
                landMask = null;  // no mask → ocean world (still reads as a globe)
            }
        };
        const sampleLand = (lon, lat) => {
            if (!landMask) return 0;
            let lonDeg = lon * 180 / Math.PI;
            lonDeg = ((lonDeg + 180) % 360 + 360) % 360 - 180;
            const latDeg = clamp(lat * 180 / Math.PI, -89.999, 89.999);
            const ix = clamp(Math.floor((lonDeg + 180) / 360 * LMW), 0, LMW - 1);
            const iy = clamp(Math.floor((90 - latDeg) / 180 * LMH), 0, LMH - 1);
            return landMask[iy * LMW + ix];
        };

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

        // Paint one mosaic block on the graphics grid (1px gutter, like the
        // starfield, so the picture reads as assembled squares).
        const cell = (gx, gy, rgb, a) => {
            if (a <= 0.004) return;
            ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(3)})`;
            ctx.fillRect(gx * MCELL, gy * MCELL, MCELL - 1, MCELL - 1);
        };

        // Stepped per-cell twinkle — quantised, never a smooth fade.
        const cellTwinkle = (gx, gy) => {
            const step = (Math.floor(clock * 1.6) + ((gx * 3 + gy * 5) & 3)) % 4;
            return step === 0 ? 0.45 : step === 2 ? 1.3 : 1;
        };
        // Deterministic per-cell hash in 0..1 (for city-light / glint gating).
        const cellHash = (gx, gy) => {
            const n = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453;
            return n - Math.floor(n);
        };

        // ── Earth (CH 2 / LEISURE) ────────────────────────────────────
        // A mosaic globe: green continents, blue seas, white ice caps, a
        // dithered day/night terminator and amber city-glow on the night
        // side. Spin + light direction are driven by scroll, so paging down
        // turns the planet and sweeps the terminator.
        const EARTH_TILT = -0.24;
        const cET = Math.cos(EARTH_TILT), sET = Math.sin(EARTH_TILT);

        const drawEarth = (alpha) => {
            if (alpha < 0.01) return;
            const minWH = Math.min(W, H);
            const R = minWH * 0.15;
            const cx = W * 0.5;
            const cy = H * 0.62;

            const rot = clock * 0.05 + scrollY * 0.0016;         // planet spin
            const lang = clock * 0.06 + scrollY * 0.0009 + 0.9;  // sub-solar longitude
            // Light direction in view space (sun to the side, slightly high).
            let Lx = Math.cos(lang), Ly = -0.32, Lz = Math.sin(lang);
            const Ll = Math.hypot(Lx, Ly, Lz);
            Lx /= Ll; Ly /= Ll; Lz /= Ll;

            const gx0 = Math.floor((cx - R * 1.16) / MCELL);
            const gx1 = Math.ceil((cx + R * 1.16) / MCELL);
            const gy0 = Math.floor((cy - R * 1.16) / MCELL);
            const gy1 = Math.ceil((cy + R * 1.16) / MCELL);

            for (let gy = gy0; gy <= gy1; gy++) {
                for (let gx = gx0; gx <= gx1; gx++) {
                    const px = gx * MCELL + MCELL / 2;
                    const py = gy * MCELL + MCELL / 2;
                    if (py > H + MCELL) continue;
                    const nx = (px - cx) / R;
                    const ny = (py - cy) / R;
                    const rr2 = nx * nx + ny * ny;

                    // Atmospheric rim just outside the disc — a thin cyan
                    // halo, brighter on the sunlit limb.
                    if (rr2 > 1) {
                        if (rr2 > 1.30) continue;
                        const rimLit = clamp(nx * Lx + ny * Ly, -1, 1);
                        const edge = 1 - (rr2 - 1) / 0.30;
                        const ra = (0.10 + 0.22 * Math.max(0, rimLit)) * edge;
                        if (dither(gx, gy, ra)) cell(gx, gy, TT.cyan, alpha * 0.5 * edge);
                        continue;
                    }

                    const nz = Math.sqrt(1 - rr2);
                    // View-space normal → undo tilt → lon/lat.
                    const uy = ny * cET + nz * sET;      // -sin(lat)
                    const uz = -ny * sET + nz * cET;     // cos(lat)cos(lon)
                    const ux = nx;                       // cos(lat)sin(lon)
                    const lat = Math.asin(clamp(-uy, -1, 1));
                    const lon = Math.atan2(ux, uz) - rot;

                    const lit = nx * Lx + ny * Ly + nz * Lz;   // day/night dot
                    const isLand = sampleLand(lon, lat);
                    const isCap = Math.abs(lat) > 1.30;        // ~74°+ ice

                    // Terminator as a dithered band around lit ≈ 0.
                    const dayMix = clamp((lit + 0.06) / 0.34, 0, 1);
                    const isDay = dither(gx, gy, dayMix);

                    if (isDay) {
                        let col = isCap ? TT.white : isLand ? TT.land : TT.ocean;
                        let a = alpha * (0.72 + 0.28 * clamp(lit, 0, 1));
                        // specular sea glint near the sub-solar point
                        if (!isLand && !isCap && lit > 0.82 && cellHash(gx, gy) > 0.6) {
                            col = TT.white; a = alpha * 0.85;
                        }
                        cell(gx, gy, col, a);
                    } else {
                        // Night hemisphere — a faint navy disc, with amber
                        // city glimmer scattered on the dark land.
                        if (isLand && lit > -0.55 && cellHash(gx, gy) > 0.82) {
                            cell(gx, gy, TT.amber, alpha * 0.7 * cellTwinkle(gx, gy));
                        } else if (dither(gx, gy, 0.5)) {
                            cell(gx, gy, TT.night, alpha * 0.6);
                        }
                    }
                }
            }

            drawMoon(cx, cy, R, Lx, Ly, Lz, alpha);
        };

        // A small mosaic Moon on a near-edge-on orbit, phase-lit by the same
        // sun direction. Painter's order tucks it behind the globe on the
        // far half of its pass.
        const drawMoon = (ecx, ecy, R, Lx, Ly, Lz, alpha) => {
            const a = clock * 0.15 + scrollY * 0.004;
            const orbitR = R * 1.85;
            const ox = Math.cos(a) * orbitR;
            const oz = Math.sin(a) * 0.34;          // orbit tilt → depth
            if (oz < 0) return;                     // behind the Earth: hidden
            const mx = ecx + ox;
            const my = ecy - Math.sin(a) * orbitR * 0.28;
            const mr = R * 0.26;

            const gx0 = Math.floor((mx - mr) / MCELL);
            const gx1 = Math.ceil((mx + mr) / MCELL);
            const gy0 = Math.floor((my - mr) / MCELL);
            const gy1 = Math.ceil((my + mr) / MCELL);
            for (let gy = gy0; gy <= gy1; gy++) {
                for (let gx = gx0; gx <= gx1; gx++) {
                    const px = gx * MCELL + MCELL / 2;
                    const py = gy * MCELL + MCELL / 2;
                    const nx = (px - mx) / mr;
                    const ny = (py - my) / mr;
                    const rr2 = nx * nx + ny * ny;
                    if (rr2 > 1) continue;
                    const nz = Math.sqrt(1 - rr2);
                    const lit = nx * Lx + ny * Ly + nz * Lz;
                    const dayMix = clamp((lit + 0.04) / 0.3, 0, 1);
                    if (dither(gx, gy, dayMix)) {
                        cell(gx, gy, TT.moon, alpha * (0.55 + 0.45 * clamp(lit, 0, 1)));
                    } else if (dither(gx, gy, 0.35)) {
                        cell(gx, gy, TT.night, alpha * 0.5);
                    }
                }
            }
        };

        // ── Supernova (CH 1 / NEWS) ───────────────────────────────────
        // A 3D exploding star, transmitted as mosaic graphics: an expanding
        // ejecta shell (particles riding fixed directions on a sphere), a
        // tilted shockwave ring that leans into an ellipse, faint polar
        // rings (SN 1987A), a hot core and volumetric corona rays. It shares
        // the Earth's spin + tilt language, so near-side blocks read bright
        // and large, far-side dim — the whole burst turning as one solid.
        // Detonates from a point on tune-in (burstT 0→1), re-detonates on
        // each retune to CH 1.
        const SN_TILT = -0.28;
        const cSNT = Math.cos(SN_TILT), sSNT = Math.sin(SN_TILT);
        let snShell = [], snRing = [], snPolar = [], snRays = [];

        const snColor = (rad) =>
            rad < 0.26 ? TT.white :
            rad < 0.40 ? TT.yellow :
            rad < 0.55 ? TT.amber :
            rad < 0.68 ? TT.red :
            rad < 0.82 ? TT.mag :
            rad < 0.92 ? TT.violet : TT.blue;

        const buildSupernova = () => {
            snShell = [];
            const push = (rad, baseA) => {
                const [ux, uy, uz] = randUnit();
                snShell.push({
                    ux, uy, uz, rad, col: snColor(rad), baseA,
                    big: rad < 0.5 && Math.random() < 0.4,
                    phase: Math.floor(rand(0, 4)),
                });
            };
            for (let i = 0; i < 140; i++) push(rand(0.10, 0.55), rand(0.60, 0.95)); // dense inner
            for (let i = 0; i < 110; i++) push(rand(0.50, 0.80), rand(0.40, 0.75)); // mid shell
            for (let i = 0; i < 80; i++)  push(rand(0.78, 1.00), rand(0.25, 0.55)); // sparse spray

            snRing = [];
            for (let i = 0; i < 72; i++) {
                snRing.push({
                    a: (i / 72) * TAU,
                    knot: Math.random() < 0.16 ? rand(1.5, 2.3) : 1,   // bright hotspots
                    phase: Math.floor(rand(0, 4)),
                });
            }

            snPolar = [];   // the two fainter SN 1987A rings, off the equator
            for (const sign of [-1, 1]) {
                const beads = [];
                for (let i = 0; i < 44; i++) beads.push({ a: (i / 44) * TAU, phase: Math.floor(rand(0, 4)) });
                snPolar.push({ sign, beads });
            }

            snRays = [];
            for (let i = 0; i < 11; i++) {
                const [ux, uy, uz] = randUnit();
                snRays.push({ ux, uy, uz, len: rand(0.55, 1.0), phase: Math.floor(rand(0, 4)) });
            }
        };

        // Stepped twinkle keyed to a cell/bead's fixed phase.
        const twStep = (phase) => {
            const step = (Math.floor(clock * 1.6) + phase) % 4;
            return step === 0 ? 0.4 : step === 2 ? 1.35 : 1;
        };

        const drawSupernova = (alpha, burst) => {
            if (alpha < 0.01 || snShell.length === 0) return;
            const minWH = Math.min(W, H);
            const cx = W * 0.5;
            const cy = H * 0.62;
            const maxR = minWH * 0.34;

            // Detonation envelope: throw the shell out from a point with a
            // little overshoot; a bright flash decays as it flies apart.
            const expand = burst >= 1 ? 1 : (1 - Math.pow(1 - burst, 2.4)) + Math.sin(burst * Math.PI) * 0.08;
            const flash = Math.pow(1 - burst, 2.2);
            const breathe = 0.5 + 0.5 * Math.sin(clock * 0.46);

            // Shared 3D frame — spin about the vertical axis (clock + scroll,
            // like the Earth) under a fixed tilt. zr > 0 → toward the viewer.
            const spin = clock * 0.05 + scrollY * 0.001;
            const cS = Math.cos(spin), sS = Math.sin(spin);
            const rot3 = (ux, uy, uz) => {
                const xr = ux * cS + uz * sS;
                const zr0 = -ux * sS + uz * cS;
                return { x: xr, y: uy * cSNT - zr0 * sSNT, z: uy * sSNT + zr0 * cSNT };
            };

            // Project ejecta + rings once; depth (z) sorts them front/back.
            const parts = snShell.map((sp) => {
                const p = rot3(sp.ux, sp.uy, sp.uz);
                const d = sp.rad * maxR * expand;
                return { sp, sx: cx + p.x * d, sy: cy + p.y * d, depth: p.z };
            });
            const ringR = maxR * 0.66 * expand * (0.9 + 0.13 * breathe);
            const ringPts = snRing.map((bd) => {
                const p = rot3(Math.cos(bd.a), 0, Math.sin(bd.a));
                return { bd, sx: cx + p.x * ringR, sy: cy + p.y * ringR, depth: p.z, dim: 1, big: bd.knot > 1 };
            });
            const polarR = ringR * 1.5;
            for (const ring of snPolar) {
                for (const bd of ring.beads) {
                    const p = rot3(Math.cos(bd.a), ring.sign * 0.42, Math.sin(bd.a));
                    ringPts.push({ bd, sx: cx + p.x * polarR, sy: cy + p.y * polarR, depth: p.z, dim: 0.4, big: false });
                }
            }

            const drawParticle = (pt) => {
                if (pt.sy > H + MCELL) return;
                const sp = pt.sp;
                const dm = (pt.depth + 1) / 2;                 // 0 far .. 1 near
                const a = alpha * sp.baseA * (0.22 + 0.78 * dm) * twStep(sp.phase);
                if (a < 0.02) return;
                const gx = Math.floor(pt.sx / MCELL), gy = Math.floor(pt.sy / MCELL);
                cell(gx, gy, sp.col, clamp(a, 0, 0.9));
                if (sp.big && dm > 0.55) cell(gx + 1, gy, sp.col, clamp(a * 0.8, 0, 0.9));
            };
            const drawBead = (rp) => {
                if (rp.sy > H + MCELL) return;
                const dm = (rp.depth + 1) / 2;
                const a = alpha * (0.2 + 0.6 * dm) * rp.dim * rp.bd.knot * twStep(rp.bd.phase);
                if (a < 0.02) return;
                const gx = Math.floor(rp.sx / MCELL), gy = Math.floor(rp.sy / MCELL);
                cell(gx, gy, rp.bd.knot > 1.3 ? TT.white : TT.amber, clamp(a, 0, 0.95));
                if (rp.big) cell(gx, gy + 1, TT.amber, clamp(a * 0.7, 0, 0.9));
            };

            // ── Back hemisphere (behind the core) ──
            for (const pt of parts) if (pt.depth < 0) drawParticle(pt);
            for (const rp of ringPts) if (rp.depth < 0) drawBead(rp);

            // ── Volumetric corona rays — 3D directions, foreshortened + dim
            // on the far side, drawn as dithered mosaic streaks.
            for (const ray of snRays) {
                const p = rot3(ray.ux, ray.uy, ray.uz);
                const dm = (p.z + 1) / 2;
                const len = maxR * ray.len * (0.6 + 0.5 * breathe) * expand;
                const inner = maxR * 0.14 * expand;
                const a0 = alpha * (0.06 + 0.30 * dm) * twStep(ray.phase);
                if (a0 < 0.02 || len <= inner) continue;
                const steps = Math.max(2, Math.floor((len - inner) / MCELL));
                for (let s = 1; s <= steps; s++) {
                    const f = s / steps;
                    const rr = inner + (len - inner) * f;
                    const sx = cx + p.x * rr, sy = cy + p.y * rr;
                    if (sy > H + MCELL) continue;
                    const gx = Math.floor(sx / MCELL), gy = Math.floor(sy / MCELL);
                    if (dither(gx, gy, 0.5)) cell(gx, gy, f < 0.4 ? TT.yellow : f < 0.7 ? TT.amber : TT.red, a0 * (1 - f * 0.85));
                }
            }

            // ── Hot core — a glowing sphere disc, brightest at centre ──
            const coreR = maxR * 0.15 + minWH * 0.1 * flash;
            const gx0 = Math.floor((cx - coreR) / MCELL), gx1 = Math.ceil((cx + coreR) / MCELL);
            const gy0 = Math.floor((cy - coreR) / MCELL), gy1 = Math.ceil((cy + coreR) / MCELL);
            for (let gy = gy0; gy <= gy1; gy++) {
                for (let gx = gx0; gx <= gx1; gx++) {
                    const px = gx * MCELL + MCELL / 2, py = gy * MCELL + MCELL / 2;
                    if (py > H + MCELL) continue;
                    const nx = (px - cx) / coreR, ny = (py - cy) / coreR;
                    const rr2 = nx * nx + ny * ny;
                    if (rr2 > 1) continue;
                    if (rr2 > 0.7 && !dither(gx, gy, 1 - (rr2 - 0.7) / 0.3)) continue;  // stipple the rim
                    const col = rr2 < 0.34 ? TT.white : rr2 < 0.66 ? TT.yellow : TT.amber;
                    cell(gx, gy, col, clamp(alpha * (0.92 - 0.35 * rr2), 0, 0.95));
                }
            }

            // ── Expanding shockwave — a tilted ring racing outward on blast
            if (burst < 0.999) {
                const shR = burst * maxR * 1.15;
                const sa = Math.pow(1 - burst, 1.6) * 0.6 * alpha;
                if (sa > 0.02) {
                    for (let i = 0; i < 96; i++) {
                        const ang = (i / 96) * TAU;
                        const p = rot3(Math.cos(ang), 0, Math.sin(ang));
                        const sx = cx + p.x * shR, sy = cy + p.y * shR;
                        if (sy > H + MCELL) continue;
                        const gx = Math.floor(sx / MCELL), gy = Math.floor(sy / MCELL);
                        if (dither(gx, gy, 0.7)) cell(gx, gy, TT.white, sa * (0.4 + 0.6 * (p.z + 1) / 2));
                    }
                }
            }

            // ── Front hemisphere (in front of the core) ──
            for (const rp of ringPts) if (rp.depth >= 0) drawBead(rp);
            for (const pt of parts) if (pt.depth >= 0) drawParticle(pt);
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
            // Reduced motion: snap to settled targets so the single, static
            // frame shows the remnant + a fully-lit scene, no in-flight blast.
            if (reduce) {
                snAlpha = isPersonal ? 0 : 0.5;
                earthAlpha = isPersonal ? 0.55 : 0;
                burstT = 1;
            }

            ctx.clearRect(0, 0, W, H);
            drawStars();

            // Service illustrations (both early-return when faded out, so the
            // crossfade dissolves one into the other).
            drawEarth(earthAlpha);
            drawSupernova(snAlpha, burstT);

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

            // Ease the illustration crossfade + advance the detonation.
            snAlpha = lerp(snAlpha, isPersonal ? 0 : 0.5, 0.09);
            earthAlpha = lerp(earthAlpha, isPersonal ? 0.55 : 0, 0.09);
            if (!isPersonal) burstT = Math.min(1, burstT + dt / 2.6);

            draw(dt);
            rafId = requestAnimationFrame(tick);
        };

        // Retune: re-read service colours, swap the illustration, re-detonate
        // the nova, and blast static over the cut.
        const mo = new MutationObserver(() => {
            colors = readColors();
            isPersonal = document.documentElement.getAttribute('data-theme') === 'personal';
            if (!isPersonal) burstT = 0;
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
        buildLandMask();
        buildSupernova();
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
