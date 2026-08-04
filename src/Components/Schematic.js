import React, { useEffect, useRef } from 'react';
import './Schematic.css';

// The readout the terminal keeps on screen behind everything else — a
// vector wireframe plotted from straight segments. No curves, no fills,
// no gradients; depth is faked the way a pen plotter would fake it, with
// a hidden-line pass that dashes the far side of the figure.
//
// Each profile analyses a different object, because each profile is a
// different job:
//   · SEEGSON STANDARD — SEVASTOPOL STATION, the structure you work on.
//   · SEVASTOLINK      — the specimen. Not a structure at all, and the
//                        reason the amber screens exist.
// Both are built as a vertex list plus an edge index list and projected
// by hand each frame. Scrolling turns whichever is loaded: paging from
// the top of the site to the bottom walks it through most of a
// revolution, so the readout is a scroll position as much as a picture.

const TAU = Math.PI * 2;

// ── Model construction ───────────────────────────────────────────────

// Per-model framing:
//   yaw0 — the angle the figure is filed at. The station reads from
//          anywhere; the specimen is only recognisable in three-quarter,
//          where the cranium and the tail are both off-axis.
//   fit  — normalize() equalises the *bounding* span, which flatters the
//          station (a compact disc) and oversells the specimen (mostly a
//          thin tail). This corrects for how much of that span is mass.
//   ox/oy — centre as a fraction of the viewport. The specimen sits
//          right of centre so its cranium clears the name block.
const model = ({ yaw0 = 0, fit = 1, ox = 0.5, oy = 0.62 } = {}) =>
    ({ V: [], E: [], callouts: [], yaw0, fit, ox, oy });
const vert = (m, x, y, z) => m.V.push([x, y, z]) - 1;
const edge = (m, a, b) => m.E.push([a, b]);
// Close a run of indices into a polygon.
const loop = (m, idx) => idx.forEach((v, i) => edge(m, v, idx[(i + 1) % idx.length]));

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];
const norm = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
};

// Sweep a ring of `sides` vertices along a spine polyline to make a tube.
// This is the only primitive the creature needs — head, neck, torso,
// tail and limbs are all the same operation with different spines.
// A radius of 0 collapses that ring to a point, which is how the tapers
// and the snout close off.
const tube = (m, pts, radii, sides = 6, squash = 1) => {
    const rings = [];
    for (let i = 0; i < pts.length; i++) {
        const prev = pts[Math.max(0, i - 1)];
        const next = pts[Math.min(pts.length - 1, i + 1)];
        const T = norm(sub(next, prev));
        // Any reference that isn't parallel to the tangent gives a stable
        // frame; near-vertical spines need the other one.
        const ref = Math.abs(T[1]) > 0.94 ? [0, 0, 1] : [0, 1, 0];
        const S = norm(cross(T, ref));
        const U = norm(cross(S, T));
        const r = radii[i];
        const ring = [];
        for (let k = 0; k < sides; k++) {
            const a = (k / sides) * TAU;
            const c = Math.cos(a) * r;
            const s = Math.sin(a) * r * squash;
            ring.push(vert(m,
                pts[i][0] + S[0] * c + U[0] * s,
                pts[i][1] + S[1] * c + U[1] * s,
                pts[i][2] + S[2] * c + U[2] * s));
        }
        if (r > 0.001) loop(m, ring);
        if (i > 0) rings[i - 1].forEach((v, k) => edge(m, v, ring[k]));
        rings.push(ring);
    }
    return rings;
};

// Mirror a tube across x — every limb is built once and reflected.
const mirrorX = (pts) => pts.map(([x, y, z]) => [-x, y, z]);

// Centre each model on its own bounding box and scale it to a common
// radius, so the hidden-line test can assume a centroid at the origin
// and the two figures read at the same size on screen.
const normalize = (m) => {
    const lo = [Infinity, Infinity, Infinity];
    const hi = [-Infinity, -Infinity, -Infinity];
    for (const v of m.V) {
        for (let i = 0; i < 3; i++) {
            if (v[i] < lo[i]) lo[i] = v[i];
            if (v[i] > hi[i]) hi[i] = v[i];
        }
    }
    const c = [0, 1, 2].map(i => (lo[i] + hi[i]) / 2);
    const span = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) || 1;
    const k = 2 / span;
    m.V = m.V.map(v => [(v[0] - c[0]) * k, (v[1] - c[1]) * k, (v[2] - c[2]) * k]);
    return m;
};

// ── SEVASTOPOL STATION ───────────────────────────────────────────────
// A ring truss on eight spoke trusses around a core spindle, with three
// asymmetric docking arms and a comms mast.
const buildStation = () => {
    const m = model({ fit: 1.2 });
    const RING_R = 1.0;
    const RING_SEG = 24;      // a 24-gon — straight chords, not a circle
    const RING_H = 0.11;
    const SPINDLE_R = 0.17;
    const SPINDLE_H = 0.62;
    const SPOKES = 8;

    const spindleTop = [];
    const spindleBot = [];
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        const x = Math.cos(a) * SPINDLE_R;
        const z = Math.sin(a) * SPINDLE_R;
        spindleTop.push(vert(m, x, SPINDLE_H, z));
        spindleBot.push(vert(m, x, -SPINDLE_H, z));
    }
    loop(m, spindleTop);
    loop(m, spindleBot);
    spindleTop.forEach((t, i) => edge(m, t, spindleBot[i]));

    const capTop = vert(m, 0, SPINDLE_H + 0.3, 0);
    const capBot = vert(m, 0, -SPINDLE_H - 0.3, 0);
    spindleTop.forEach(t => edge(m, t, capTop));
    spindleBot.forEach(b => edge(m, b, capBot));

    const ringUp = [];
    const ringDn = [];
    for (let i = 0; i < RING_SEG; i++) {
        const a = (i / RING_SEG) * TAU;
        const x = Math.cos(a) * RING_R;
        const z = Math.sin(a) * RING_R;
        ringUp.push(vert(m, x, RING_H, z));
        ringDn.push(vert(m, x, -RING_H, z));
    }
    loop(m, ringUp);
    loop(m, ringDn);
    ringUp.forEach((u, i) => {
        edge(m, u, ringDn[i]);
        // Diagonal bracing every other bay — reads as a truss, not a tube.
        if (i % 2 === 0) edge(m, u, ringDn[(i + 1) % RING_SEG]);
    });

    for (let s = 0; s < SPOKES; s++) {
        const a = (s / SPOKES) * TAU;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const inner = vert(m, cos * SPINDLE_R, 0, sin * SPINDLE_R);
        const k = Math.round((s / SPOKES) * RING_SEG) % RING_SEG;
        const mid = vert(m, cos * (SPINDLE_R + RING_R) * 0.5, 0.13, sin * (SPINDLE_R + RING_R) * 0.5);
        edge(m, inner, mid);
        edge(m, mid, ringUp[k]);
        edge(m, inner, ringDn[k]);
        edge(m, mid, ringDn[k]);
    }

    const arm = (angle, len, rise) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const base = vert(m, cos * RING_R, 0, sin * RING_R);
        const tip = vert(m, cos * (RING_R + len), rise, sin * (RING_R + len));
        edge(m, base, tip);
        const w = 0.09;
        const c = [
            vert(m, cos * (RING_R + len) - sin * w, rise + w, sin * (RING_R + len) + cos * w),
            vert(m, cos * (RING_R + len) + sin * w, rise + w, sin * (RING_R + len) - cos * w),
            vert(m, cos * (RING_R + len) + sin * w, rise - w, sin * (RING_R + len) - cos * w),
            vert(m, cos * (RING_R + len) - sin * w, rise - w, sin * (RING_R + len) + cos * w),
        ];
        loop(m, c);
        c.forEach(v => edge(m, tip, v));
        return tip;
    };
    const dock1 = arm(0.4, 0.42, 0.10);
    arm(2.6, 0.30, -0.14);
    arm(4.5, 0.36, 0.06);

    const mastTip = vert(m, 0, SPINDLE_H + 1.05, 0);
    edge(m, capTop, mastTip);
    for (let i = 1; i <= 3; i++) {
        const y = SPINDLE_H + 0.3 + (0.75 * i) / 3.4;
        const w = 0.16 - i * 0.035;
        edge(m, vert(m, -w, y, 0), vert(m, w, y, 0));
        edge(m, vert(m, 0, y, -w), vert(m, 0, y, w));
    }

    m.callouts = [
        { v: mastTip,   text: 'COMMS MAST', dx: 200, dy: 96 },
        { v: ringUp[6], text: 'HAB RING A', dx: 84,  dy: 26 },
        { v: dock1,     text: 'DOCK 3',     dx: -92, dy: 34 },
        { v: capBot,    text: 'SPINDLE',    dx: -86, dy: -22 },
    ];
    return normalize(m);
};

// ── SPECIMEN ─────────────────────────────────────────────────────────
// The organism, plotted the way a lab terminal would plot it: swept
// cross-sections along a spine. Hunched biped, elongated smooth cranium,
// dorsal tubes, and a segmented tail longer than the body — the
// silhouette has to survive being reduced to fifty stray lines, so the
// skull and the tail carry most of the budget.
const buildSpecimen = () => {
    const m = model({ yaw0: -1.15, fit: 0.72, ox: 0.6, oy: 0.6 });

    // Cranium — the long smooth dome, swept from the snout backwards.
    const skull = tube(m, [
        [0, 1.30, 0.62], [0, 1.34, 0.44], [0, 1.40, 0.22],
        [0, 1.44, -0.05], [0, 1.45, -0.34], [0, 1.42, -0.62],
    ], [0.03, 0.10, 0.15, 0.16, 0.11, 0.02], 6, 0.85);

    // Neck, then torso: shoulders, chest, waist, hips.
    tube(m, [
        [0, 1.24, 0.10], [0, 1.10, -0.02], [0, 0.96, -0.10],
    ], [0.10, 0.12, 0.14], 6, 0.9);

    tube(m, [
        [0, 0.94, -0.10], [0, 0.72, -0.04], [0, 0.46, -0.02],
        [0, 0.20, -0.06], [0, -0.02, -0.14],
    ], [0.22, 0.26, 0.22, 0.17, 0.20], 6, 0.85);

    // Tail — four-sided so it reads as segmented bone rather than pipe.
    const tail = tube(m, [
        [0, -0.02, -0.16], [0, -0.06, -0.42], [0, -0.14, -0.70],
        [0, -0.24, -0.98], [0, -0.30, -1.26], [0, -0.26, -1.52],
        [0, -0.12, -1.74], [0, 0.10, -1.90], [0, 0.36, -1.98],
        [0, 0.62, -1.96],
    ], [0.17, 0.13, 0.11, 0.09, 0.075, 0.06, 0.05, 0.04, 0.03, 0.015], 4, 1);

    // Barb.
    const barb = vert(m, 0, 0.78, -2.08);
    tail[tail.length - 1].forEach(v => edge(m, v, barb));

    // Dorsal tubes — two pairs, angled back off the shoulders.
    const dorsals = [
        [[0.13, 0.86, -0.22], [0.20, 1.02, -0.48]],
        [[0.15, 0.68, -0.24], [0.25, 0.84, -0.54]],
    ];
    let dorsalTip = null;
    for (const d of dorsals) {
        const r = tube(m, d, [0.055, 0.010], 4, 1);
        dorsalTip = dorsalTip ?? r[r.length - 1][0];
        tube(m, mirrorX(d), [0.055, 0.010], 4, 1);
    }

    // Arms — long and thin, with three splayed digits at the wrist.
    const armPts = [
        [0.20, 0.88, -0.06], [0.42, 0.60, 0.10],
        [0.40, 0.30, 0.32], [0.36, 0.14, 0.44],
    ];
    const armR = [0.075, 0.05, 0.038, 0.018];
    const armL = tube(m, armPts, armR, 4, 1);
    const armR2 = tube(m, mirrorX(armPts), armR, 4, 1);

    const digits = [[0.30, 0.02, 0.56], [0.38, 0.01, 0.58], [0.45, 0.05, 0.52]];
    let digitTip = null;
    for (const [rings, s] of [[armL, 1], [armR2, -1]]) {
        const wrist = rings[3][0];
        for (const d of digits) {
            const t = vert(m, s * d[0], d[1], d[2]);
            edge(m, wrist, t);
            digitTip = digitTip ?? t;
        }
    }

    // Legs — digitigrade: knee forward, ankle back, toes forward again.
    const legPts = [
        [0.16, -0.06, -0.12], [0.26, -0.44, 0.14],
        [0.22, -0.82, -0.14], [0.22, -1.02, 0.06],
    ];
    const legR = [0.11, 0.075, 0.05, 0.03];
    const legL = tube(m, legPts, legR, 4, 1);
    const legRr = tube(m, mirrorX(legPts), legR, 4, 1);
    // Toes.
    for (const [rings, s] of [[legL, 1], [legRr, -1]]) {
        const ankle = rings[3][0];
        edge(m, ankle, vert(m, s * 0.18, -1.08, 0.24));
        edge(m, ankle, vert(m, s * 0.27, -1.08, 0.20));
    }

    m.callouts = [
        { v: skull[4][0], text: 'CRANIUM',     dx: 82,  dy: -34 },
        { v: dorsalTip,   text: 'DORSAL TUBE', dx: 88,  dy: 22 },
        { v: tail[7][0],  text: 'CAUDAL SEG 08', dx: -96, dy: 30 },
        { v: digitTip,    text: 'PHALANGES',   dx: 76,  dy: 62 },
    ];
    return normalize(m);
};

const MODELS = {
    professional: buildStation(),
    personal: buildSpecimen(),
};
// Reusable projected-vertex buffers, one per model.
const BUFFERS = {
    professional: MODELS.professional.V.map(() => ({ x: 0, y: 0, z: 0 })),
    personal: MODELS.personal.V.map(() => ({ x: 0, y: 0, z: 0 })),
};

const readPhosphor = () => {
    const css = getComputedStyle(document.documentElement);
    return css.getPropertyValue('--phos-rgb').trim() || '53, 255, 91';
};
const readProfile = () =>
    document.documentElement.getAttribute('data-theme') === 'personal'
        ? 'personal' : 'professional';

const lerp = (a, b, t) => a + (b - a) * t;

const Schematic = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let reduce = reduceQuery.matches;

        let W = 0, H = 0, dpr = 1;
        let phos = readPhosphor();
        let profile = readProfile();
        let clock = 0;
        let rafId = null;
        let last = performance.now();

        let staticT = 0;    // retune snow, 1 → 0
        let jitterT = 0;    // vector jitter after a profile switch, 1 → 0

        // One figure dissolves into the other behind the switch static.
        const fade = {
            professional: profile === 'professional' ? 1 : 0,
            personal: profile === 'personal' ? 1 : 0,
        };

        const scrollProgress = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            return max > 0 ? Math.min(window.scrollY / max, 1) : 0;
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
            if (reduce) draw();
        };

        // ── Graticule — the plot's paper ──────────────────────────────
        const drawGrid = () => {
            const g = 40;
            ctx.lineWidth = 1;
            ctx.setLineDash([]);
            ctx.strokeStyle = `rgba(${phos}, 0.045)`;
            ctx.beginPath();
            for (let x = (W % g) / 2; x < W; x += g) {
                ctx.moveTo(Math.round(x) + 0.5, 0);
                ctx.lineTo(Math.round(x) + 0.5, H);
            }
            for (let y = (H % g) / 2; y < H; y += g) {
                ctx.moveTo(0, Math.round(y) + 0.5);
                ctx.lineTo(W, Math.round(y) + 0.5);
            }
            ctx.stroke();

            // Margin ticks — long every fifth, as a plotter would rule them.
            ctx.strokeStyle = `rgba(${phos}, 0.16)`;
            ctx.beginPath();
            let i = 0;
            for (let y = (H % g) / 2; y < H; y += g, i++) {
                const len = i % 5 === 0 ? 12 : 6;
                ctx.moveTo(0, Math.round(y) + 0.5);
                ctx.lineTo(len, Math.round(y) + 0.5);
                ctx.moveTo(W, Math.round(y) + 0.5);
                ctx.lineTo(W - len, Math.round(y) + 0.5);
            }
            ctx.stroke();
        };

        // ── Projection ────────────────────────────────────────────────
        // Scroll drives yaw directly; pitch nods through the scroll so the
        // figure opens from edge-on to three-quarter and back.
        const project = (key) => {
            const V = MODELS[key].V;
            const P = BUFFERS[key];
            const sp = scrollProgress();
            const yaw = MODELS[key].yaw0 + sp * 2.6 + clock * 0.05;
            const pitch = -0.28 + Math.sin(sp * Math.PI) * 0.18;

            const cy = Math.cos(yaw), sy = Math.sin(yaw);
            const cp = Math.cos(pitch), spi = Math.sin(pitch);

            // Small and set low: this is a readout the interface is drawn
            // over, not a picture the interface sits on.
            const scale = Math.min(W, H) * 0.24 * MODELS[key].fit;
            const ox = W * MODELS[key].ox;
            const oy = H * MODELS[key].oy;
            const focal = 3.4;

            for (let i = 0; i < V.length; i++) {
                const [x0, y0, z0] = V[i];
                const x1 = x0 * cy + z0 * sy;
                const z1 = -x0 * sy + z0 * cy;
                const y2 = y0 * cp - z1 * spi;
                const z2 = y0 * spi + z1 * cp;
                const w = focal / (focal - z2);
                P[i].x = ox + x1 * scale * w;
                P[i].y = oy - y2 * scale * w;
                P[i].z = z2;
            }
        };

        // ── Hidden-line pass ──────────────────────────────────────────
        // An edge whose midpoint sits behind the model centre is on the
        // far side: draw it dashed and dim. Near edges draw solid, with a
        // wide faint pass underneath for phosphor bloom — cheaper and
        // crisper than a shadow blur.
        const drawEdges = (key, a) => {
            if (a < 0.01) return;
            const { E } = MODELS[key];
            const P = BUFFERS[key];
            const jx = jitterT > 0 ? jitterT * 2.5 : 0;
            const rnd = () => (jx ? (Math.random() - 0.5) * jx * 2 : 0);

            ctx.setLineDash([2, 4]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(${phos}, ${(0.13 * a).toFixed(3)})`;
            ctx.beginPath();
            for (const [i, j] of E) {
                if (P[i].z + P[j].z >= 0) continue;
                ctx.moveTo(P[i].x + rnd(), P[i].y + rnd());
                ctx.lineTo(P[j].x + rnd(), P[j].y + rnd());
            }
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.lineWidth = 3;
            ctx.strokeStyle = `rgba(${phos}, ${(0.04 * a).toFixed(3)})`;
            ctx.beginPath();
            for (const [i, j] of E) {
                if (P[i].z + P[j].z < 0) continue;
                ctx.moveTo(P[i].x, P[i].y);
                ctx.lineTo(P[j].x, P[j].y);
            }
            ctx.stroke();

            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(${phos}, ${(0.3 * a).toFixed(3)})`;
            ctx.beginPath();
            for (const [i, j] of E) {
                if (P[i].z + P[j].z < 0) continue;
                ctx.moveTo(P[i].x + rnd(), P[i].y + rnd());
                ctx.lineTo(P[j].x + rnd(), P[j].y + rnd());
            }
            ctx.stroke();

            ctx.fillStyle = `rgba(${phos}, ${(0.38 * a).toFixed(3)})`;
            for (let i = 0; i < P.length; i++) {
                if (P[i].z < 0) continue;
                ctx.fillRect(Math.round(P[i].x) - 1, Math.round(P[i].y) - 1, 2, 2);
            }
        };

        // ── Callouts — leader line, elbow, label. Hero region only. ──
        const drawCallouts = (key, alpha) => {
            if (alpha < 0.02) return;
            const P = BUFFERS[key];
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(${phos}, ${(alpha * 0.22).toFixed(3)})`;
            ctx.fillStyle = `rgba(${phos}, ${(alpha * 0.4).toFixed(3)})`;
            ctx.font = '11px Jixellation, monospace';
            ctx.textBaseline = 'middle';

            for (const c of MODELS[key].callouts) {
                const p = P[c.v];
                if (!p || p.z < -0.2) continue;          // hidden round the back
                const ex = p.x + c.dx;
                const ey = p.y + c.dy;
                const tail = c.dx > 0 ? 44 : -44;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(ex, ey);
                ctx.lineTo(ex + tail, ey);
                ctx.stroke();
                ctx.textAlign = c.dx > 0 ? 'left' : 'right';
                ctx.fillText(c.text, ex + tail + (c.dx > 0 ? 6 : -6), ey);
                ctx.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, 4, 4);
            }
        };

        // ── Profile-switch snow — bridges the palette swap ──
        const drawStatic = () => {
            if (staticT <= 0) return;
            const c = 8;
            const cols = Math.ceil(W / c);
            const rows = Math.ceil(H / c);
            const n = cols * rows * staticT * 0.35;
            for (let i = 0; i < n; i++) {
                ctx.fillStyle = `rgba(${phos}, ${(0.1 + Math.random() * 0.6) * staticT})`;
                ctx.fillRect(
                    ((Math.random() * cols) | 0) * c,
                    ((Math.random() * rows) | 0) * c,
                    c - 1, c - 1
                );
            }
        };

        const draw = () => {
            // The readout belongs to the index screen. Past the hero it
            // dims to a trace — still turning with the scroll, no longer
            // crossing the text you're trying to read.
            const near = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.6));
            // A phone has no room for atmosphere: at that size the figure
            // lands straight on the content.
            const small = W < 700;
            const base = (0.26 + 0.74 * near) * (small ? 0.4 : 1);

            ctx.clearRect(0, 0, W, H);
            drawGrid();
            for (const key of ['professional', 'personal']) {
                if (fade[key] < 0.01) continue;
                project(key);
                drawEdges(key, base * fade[key]);
                if (!small) drawCallouts(key, near * fade[key]);
            }
            if (!reduce) drawStatic();
        };

        const tick = (now) => {
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;
            clock += dt;
            if (staticT > 0) staticT = Math.max(0, staticT - dt / 0.35);
            if (jitterT > 0) jitterT = Math.max(0, jitterT - dt / 0.3);
            fade.professional = lerp(fade.professional, profile === 'professional' ? 1 : 0, 0.12);
            fade.personal = lerp(fade.personal, profile === 'personal' ? 1 : 0, 0.12);
            draw();
            rafId = requestAnimationFrame(tick);
        };

        // Profile switch: re-read the phosphor, swap the figure, snow over
        // the cut, and shake the vectors as the deflection coils settle.
        const mo = new MutationObserver(() => {
            phos = readPhosphor();
            profile = readProfile();
            if (!reduce) { staticT = 1; jitterT = 1; }
            if (reduce) {
                // No loop to ease the crossfade, so cut straight over.
                fade.professional = profile === 'professional' ? 1 : 0;
                fade.personal = profile === 'personal' ? 1 : 0;
                draw();
            }
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const onMotionChange = (e) => {
            reduce = e.matches;
            if (reduce) {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
                staticT = 0;
                jitterT = 0;
                fade.professional = profile === 'professional' ? 1 : 0;
                fade.personal = profile === 'personal' ? 1 : 0;
                draw();
            } else if (!rafId) {
                last = performance.now();
                rafId = requestAnimationFrame(tick);
            }
        };
        if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onMotionChange);

        // With motion reduced there's no loop, so scrolling has to redraw
        // for the figure to still turn with the page.
        const onScroll = () => { if (reduce) draw(); };

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

    return <canvas ref={canvasRef} className="schematic-canvas" aria-hidden="true" />;
};

export default Schematic;
