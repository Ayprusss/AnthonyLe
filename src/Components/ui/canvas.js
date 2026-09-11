// The few pieces the two ambient canvases share.

export const reducedMotion = () =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Session tokens are read from the stylesheet at draw time rather than
// written into the scripts, so the canvases take their colour from the
// same six roles as everything else on the page.
export const token = (name, fallback) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

// Match the backing store to the element at device resolution, capped at
// 2x — past that the fill cost keeps growing and nobody can see it.
export const fitCanvas = (canvas, ctx) => {
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: width, h: height, dpr };
};

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
};
