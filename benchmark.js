const dt = 0.016;

function runOld() {
    let smokeParticles = Array.from({ length: 240 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: Math.random() * 10,
        vy: Math.random() * 10,
        life: Math.random() * 2,
        maxLife: 2,
        size: 2,
        maxSize: 10
    }));

    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
        smokeParticles = smokeParticles.filter(p => p.life < p.maxLife);
        for (const p of smokeParticles) {
            p.life += dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.984;
            p.vy *= 0.984;
        }
        // Simulate adding new particles
        if (smokeParticles.length < 240) {
            smokeParticles.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                vx: Math.random() * 10,
                vy: Math.random() * 10,
                life: 0,
                maxLife: 2,
                size: 2,
                maxSize: 10
            });
        }
    }
    return performance.now() - start;
}

function runNew() {
    let smokeParticles = Array.from({ length: 240 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: Math.random() * 10,
        vy: Math.random() * 10,
        life: Math.random() * 2,
        maxLife: 2,
        size: 2,
        maxSize: 10
    }));

    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
        const nextSmokeParticles = [];
        for (let j = 0; j < smokeParticles.length; j++) {
            const p = smokeParticles[j];
            p.life += dt;
            if (p.life < p.maxLife) {
                nextSmokeParticles.push(p);
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vx *= 0.984;
                p.vy *= 0.984;
            }
        }
        smokeParticles = nextSmokeParticles;
        // Simulate adding new particles
        if (smokeParticles.length < 240) {
            smokeParticles.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                vx: Math.random() * 10,
                vy: Math.random() * 10,
                life: 0,
                maxLife: 2,
                size: 2,
                maxSize: 10
            });
        }
    }
    return performance.now() - start;
}

const oldTime = runOld();
const newTime = runNew();
console.log(`Old: ${oldTime.toFixed(2)}ms`);
console.log(`New: ${newTime.toFixed(2)}ms`);
console.log(`Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}%`);

