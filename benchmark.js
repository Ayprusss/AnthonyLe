const { performance } = require('perf_hooks');

const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*".repeat(10); // Long string for more clear measurement
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

function measureStringMethod() {
  let start = performance.now();
  let nextString = "";
  for (let iter = 0; iter < 10000; iter++) {
    const revealedLength = Math.floor((iter % 10) / 10 * text.length);
    nextString = text
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (i < revealedLength) return text[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join('');

    // simulate render
    const elements = nextString.split('').map((char, i) => {
        return char;
    });
  }
  let end = performance.now();
  return end - start;
}

function measureArrayMethod() {
  let start = performance.now();
  let nextArray = [];
  const textChars = text.split('');
  for (let iter = 0; iter < 10000; iter++) {
    const revealedLength = Math.floor((iter % 10) / 10 * textChars.length);
    nextArray = textChars
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (i < revealedLength) return textChars[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      });

    // simulate render
    const elements = nextArray.map((char, i) => {
        return char;
    });
  }
  let end = performance.now();
  return end - start;
}

console.log("Measuring String Method (Baseline)...");
const baseline = measureStringMethod();
console.log(`Baseline: ${baseline.toFixed(2)} ms`);

console.log("Measuring Array Method (Optimized)...");
const optimized = measureArrayMethod();
console.log(`Optimized: ${optimized.toFixed(2)} ms`);

console.log(`Improvement: ${((baseline - optimized) / baseline * 100).toFixed(2)}% faster`);

