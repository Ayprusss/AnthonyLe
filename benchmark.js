const { performance } = require('perf_hooks');

const count = 225;
let W = 1920, H = 1080;
let smoothNX = 0.5, smoothNY = 0.5, pageScrollY = 0;
let stars = [];
for (let i=0; i<count; i++) {
  stars.push({
    nx: Math.random(),
    ny: Math.random(),
    size: Math.random(),
    baseOpacity: Math.random(),
    parallax: 0.01,
    scrollRate: 0.01,
    twinkles: true,
    twinkleSpeed: 1,
    twinklePhase: 1,
    layer: 1
  });
}

const starRgb = '255, 255, 255';
let dummyAccumulator = 0;

// Mock ctx
const ctx = {
  beginPath: () => { dummyAccumulator++; },
  arc: () => { dummyAccumulator++; },
  fill: () => { dummyAccumulator++; },
  fillStyle: '',
  globalAlpha: 1
};

function drawOld(now) {
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
}

function drawNew(now) {
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
}

const iterations = 10000;

// Warmup
for (let i=0; i<1000; i++) drawOld(1000 + i*16);
for (let i=0; i<1000; i++) drawNew(1000 + i*16);

let startOld = performance.now();
for (let i=0; i<iterations; i++) drawOld(1000 + i*16);
let endOld = performance.now();

let startNew = performance.now();
for (let i=0; i<iterations; i++) drawNew(1000 + i*16);
let endNew = performance.now();

console.log(`Old approach: ${(endOld - startOld).toFixed(2)} ms`);
console.log(`New approach: ${(endNew - startNew).toFixed(2)} ms`);
console.log(`Improvement: ${((endOld - startOld) / (endNew - startNew)).toFixed(2)}x faster`);
