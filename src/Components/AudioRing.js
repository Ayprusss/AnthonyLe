import React, { useEffect, useRef, useState } from 'react';
import './AudioRing.css';
import { clamp, fitCanvas, reducedMotion, token } from './ui/canvas';

// The personal side's panel: the song, drawn as it plays.
//
// The ring is the spectrum, bent into a circle and mirrored. Bass sits
// at twelve o'clock, the bands sweep down both sides through the mids,
// and treble meets at six — so a kick lights the top, a vocal the
// flanks, a hi-hat the bottom, and every region keeps its place. Each
// band is a spoke of dots, so this side is made of the same points as
// the professional one. The dotted circle inside the spokes is the raw
// waveform.
//
// It answers to the music and nothing else. Browsers will not start
// audio on their own, so until Play is pressed the ring is still.

const TRACK = {
    title: 'Love Crazy',
    artist: 'Nine Vicious',
    file: 'Nine Vicious - Love Crazy (prod. ahmad).mp3',
};
const SRC = `${process.env.PUBLIC_URL}/${encodeURIComponent(TRACK.file)}`;

// Spectrum. Bands are log-spaced because hearing is: spaced linearly,
// everything above 2kHz would take nine tenths of the circle.
const BANDS = 64;             // per side
const F_LO = 32;
const F_HI = 16000;
const REGIONS = [
    { label: 'Bass',   from: F_LO, to: 250 },
    { label: 'Mids',   from: 250,  to: 4000 },
    { label: 'Treble', from: 4000, to: F_HI },
];
// Music carries less energy the higher it goes, so each octave is lifted
// a little; without it the bottom of the ring would never light.
const MIN_DB = -90;
const MAX_DB = -15;           // headroom, so a sustained 808 is not pinned
const SLOPE = 8;              // byte levels per octave, ~2.5dB
const FLOOR = 70;             // byte level that reads as silence
const GAMMA = 1.2;            // keeps quiet passages from lighting everything
const ATTACK = 0.55;
const RELEASE = 0.12;
const WAVE_SPAN = 512;        // time-domain samples wrapped around the circle

const VOLUME_KEY = 'ambient-volume';
const TAU = Math.PI * 2;

const position = (hz) => Math.log(hz / F_LO) / Math.log(F_HI / F_LO);

const readVolume = () => {
    try {
        const v = parseFloat(localStorage.getItem(VOLUME_KEY));
        return Number.isFinite(v) ? clamp(v, 0, 1) : 0.6;
    } catch (_) {
        return 0.6;
    }
};

const buildBands = (rate, fftSize) => {
    const binHz = rate / fftSize;
    const ratio = F_HI / F_LO;
    return Array.from({ length: BANDS }, (_, b) => {
        const fLo = F_LO * ratio ** (b / BANDS);
        const fHi = F_LO * ratio ** ((b + 1) / BANDS);
        return {
            lo: fLo / binHz,
            hi: fHi / binHz,
            tilt: SLOPE * Math.log2(Math.sqrt(fLo * fHi) / F_LO),
        };
    });
};

// One band's loudness, 0–1. Narrow bass bands are narrower than an FFT
// bin, so they read between bins; wide treble bands take their peak,
// which keeps transients sharp where an average would blur them.
const bandLevel = (freq, band) => {
    let v;
    if (band.hi - band.lo < 1) {
        const c = (band.lo + band.hi) / 2;
        const i = Math.floor(c);
        const fr = c - i;
        v = freq[i] * (1 - fr) + freq[Math.min(i + 1, freq.length - 1)] * fr;
    } else {
        v = 0;
        const end = Math.min(Math.ceil(band.hi), freq.length);
        for (let i = Math.floor(band.lo); i < end; i++) if (freq[i] > v) v = freq[i];
    }
    return clamp((v + band.tilt - FLOOR) / (255 - FLOOR), 0, 1) ** GAMMA;
};

const PlayIcon = () => (
    <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1 11 6l-8.5 5z" /></svg>
);
const PauseIcon = () => (
    <svg viewBox="0 0 12 12" aria-hidden="true">
        <rect x="2" y="1" width="3" height="10" />
        <rect x="7" y="1" width="3" height="10" />
    </svg>
);

const AudioRing = () => {
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const graphRef = useRef(null);
    const wakeRef = useRef(() => {});
    const playingRef = useRef(false);

    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(readVolume);
    const [box, setBox] = useState(null);

    // ── Drawing ────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas && typeof canvas.getContext === 'function' && canvas.getContext('2d');
        if (!ctx) return undefined;

        const still = reducedMotion();
        const level = new Float32Array(BANDS);
        const cos = new Float32Array(BANDS * 2);
        const sin = new Float32Array(BANDS * 2);
        for (let b = 0; b < BANDS; b++) {
            const off = ((b + 0.5) / BANDS) * Math.PI;
            cos[b] = Math.cos(-Math.PI / 2 + off);
            sin[b] = Math.sin(-Math.PI / 2 + off);
            cos[BANDS + b] = Math.cos(-Math.PI / 2 - off);
            sin[BANDS + b] = Math.sin(-Math.PI / 2 - off);
        }

        let w = 0;
        let h = 0;
        let cx = 0;
        let cy = 0;
        let r0 = 0;
        let pitch = 0;
        let dots = 0;
        let dot = 0;
        let labelled = false;
        let colours = null;
        let layer = null;
        let raf = 0;

        // The parts that never move — the unlit grid of every spoke, the
        // region ticks and their names — are painted once per size.
        const paintLayer = (dpr) => {
            layer = document.createElement('canvas');
            layer.width = canvas.width;
            layer.height = canvas.height;
            const g = layer.getContext('2d');
            if (!g) { layer = null; return; }
            g.setTransform(dpr, 0, 0, dpr, 0, 0);

            g.fillStyle = colours.rule;
            g.beginPath();
            for (let k = 0; k < BANDS * 2; k++) {
                for (let d = 0; d < dots; d++) {
                    const r = r0 + d * pitch;
                    const x = cx + cos[k] * r;
                    const y = cy + sin[k] * r;
                    g.moveTo(x + dot / 2, y);
                    g.arc(x, y, dot / 2, 0, TAU);
                }
            }
            g.fill();

            if (!labelled) return;
            const outer = r0 + dots * pitch;

            // Hairline ticks where one region hands over to the next.
            g.strokeStyle = colours.mute;
            g.lineWidth = 1;
            g.beginPath();
            [250, 4000].forEach((hz) => {
                const off = position(hz) * Math.PI;
                [-Math.PI / 2 + off, -Math.PI / 2 - off].forEach((a) => {
                    g.moveTo(cx + Math.cos(a) * (outer + 2), cy + Math.sin(a) * (outer + 2));
                    g.lineTo(cx + Math.cos(a) * (outer + 12), cy + Math.sin(a) * (outer + 12));
                });
            });
            g.stroke();

            g.fillStyle = colours.mute;
            g.font = `500 12.5px ${colours.font}`;
            g.textBaseline = 'middle';
            REGIONS.forEach(({ label, from, to }) => {
                const mid = ((position(from) + position(to)) / 2) * Math.PI;
                // Bass and treble straddle the axis, so they get one
                // label on it; the mids are named on both flanks.
                const angles = label === 'Mids'
                    ? [-Math.PI / 2 + mid, -Math.PI / 2 - mid]
                    : [label === 'Bass' ? -Math.PI / 2 : Math.PI / 2];
                angles.forEach((a) => {
                    const c = Math.cos(a);
                    g.textAlign = Math.abs(c) < 0.3 ? 'center' : c > 0 ? 'left' : 'right';
                    g.fillText(label, cx + c * (outer + 20), cy + Math.sin(a) * (outer + 20));
                });
            });
        };

        const layout = () => {
            const fit = fitCanvas(canvas, ctx);
            w = fit.w;
            h = fit.h;
            colours = {
                ink: token('--ink-max', '#fff'),
                rule: token('--rule', '#2e2e2e'),
                mute: token('--mute', '#9b9b9b'),
                font: token('--font', 'sans-serif'),
            };
            cx = w / 2;
            cy = h / 2;
            const outer = Math.min(Math.min(w, h) / 2 - 20, 330);
            // Room for the region names only once the ring is big enough
            // that giving it up would not starve the spokes.
            labelled = outer >= 170;
            r0 = clamp(outer * 0.5, 84, 150);
            const spoke = Math.max(outer - (labelled ? 36 : 0) - r0, 24);
            pitch = clamp(spoke / 16, 4.5, 8);
            dots = Math.max(3, Math.floor(spoke / pitch));
            dot = clamp(pitch * 0.42, 1.6, 3.2);
            setBox(Math.round(r0 * 1.3));
            paintLayer(fit.dpr);
        };

        // Returns whether anything is still moving.
        const drawFrame = () => {
            const graph = graphRef.current;
            if (graph) {
                graph.analyser.getByteFrequencyData(graph.freq);
                graph.analyser.getByteTimeDomainData(graph.wave);
            }

            let moving = false;
            for (let b = 0; b < BANDS; b++) {
                const target = graph && playingRef.current ? bandLevel(graph.freq, graph.bands[b]) : 0;
                level[b] += (target - level[b]) * (target > level[b] ? ATTACK : RELEASE);
                if (level[b] < 0.002) level[b] = 0;
                else moving = true;
            }

            ctx.clearRect(0, 0, w, h);
            if (layer) ctx.drawImage(layer, 0, 0, w, h);
            ctx.fillStyle = colours.ink;

            // Lit dots, whole ones in a single fill.
            ctx.beginPath();
            for (let k = 0; k < BANDS * 2; k++) {
                const full = Math.floor(level[k % BANDS] * dots);
                for (let d = 0; d < full; d++) {
                    const r = r0 + d * pitch;
                    const x = cx + cos[k] * r;
                    const y = cy + sin[k] * r;
                    ctx.moveTo(x + dot / 2, y);
                    ctx.arc(x, y, dot / 2, 0, TAU);
                }
            }
            ctx.fill();

            // The outermost dot of each spoke carries the remainder as
            // opacity, so spokes grow smoothly rather than a dot at a time.
            for (let k = 0; k < BANDS * 2; k++) {
                const lit = level[k % BANDS] * dots;
                const full = Math.floor(lit);
                const frac = lit - full;
                if (frac < 0.05 || full >= dots) continue;
                const r = r0 + full * pitch;
                ctx.globalAlpha = frac;
                ctx.beginPath();
                ctx.arc(cx + cos[k] * r, cy + sin[k] * r, dot / 2, 0, TAU);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // The waveform, mirrored like the spectrum so the ring stays
            // symmetric.
            const rw = r0 - pitch * 1.8;
            const swing = pitch * 2.2;
            ctx.beginPath();
            for (let k = 0; k < BANDS * 2; k++) {
                const i = Math.floor((((k % BANDS) + 0.5) / BANDS) * WAVE_SPAN);
                const sample = graph && playingRef.current ? (graph.wave[i] - 128) / 128 : 0;
                const r = rw + sample * swing;
                const x = cx + cos[k] * r;
                const y = cy + sin[k] * r;
                ctx.moveTo(x + dot / 2, y);
                ctx.arc(x, y, dot / 2, 0, TAU);
            }
            ctx.fill();

            return moving || playingRef.current;
        };

        const loop = () => {
            raf = 0;
            if (drawFrame()) raf = requestAnimationFrame(loop);
        };

        // Nothing runs while nothing is playing: once the spokes have
        // fallen back after a pause, the loop stops until Play.
        wakeRef.current = () => {
            if (still || raf || !colours) return;
            raf = requestAnimationFrame(loop);
        };

        // Sizing waits a frame: the session attribute on <html> is set by
        // Home after this effect runs, and the colours have to be read after.
        raf = requestAnimationFrame(() => {
            raf = 0;
            layout();
            drawFrame();
            if (playingRef.current) wakeRef.current();
        });

        const ro = typeof ResizeObserver === 'function'
            ? new ResizeObserver(() => {
                if (!colours) return;
                layout();
                if (!raf) drawFrame();
            })
            : null;
        ro?.observe(canvas);

        return () => {
            cancelAnimationFrame(raf);
            ro?.disconnect();
            wakeRef.current = () => {};
        };
    }, []);

    // ── Audio ──────────────────────────────────────────────────────────
    // The graph is built inside the first Play press — the gesture is what
    // lets the browser start audio at all. Volume is applied after the
    // analyser, so turning the song down does not shrink the ring: it
    // shows the music, not the slider.
    const ensureGraph = () => {
        if (graphRef.current) return graphRef.current;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const audio = audioRef.current;
        if (!Ctx || !audio) return null;
        try {
            const ctx = new Ctx();
            const source = ctx.createMediaElementSource(audio);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 4096;
            analyser.smoothingTimeConstant = 0.55;
            analyser.minDecibels = MIN_DB;
            analyser.maxDecibels = MAX_DB;
            const gain = ctx.createGain();
            gain.gain.value = volume;
            source.connect(analyser);
            analyser.connect(gain);
            gain.connect(ctx.destination);
            audio.volume = 1;
            graphRef.current = {
                ctx,
                analyser,
                gain,
                freq: new Uint8Array(analyser.frequencyBinCount),
                wave: new Uint8Array(analyser.fftSize),
                bands: buildBands(ctx.sampleRate, analyser.fftSize),
            };
        } catch (_) {
            return null;
        }
        return graphRef.current;
    };

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (!audio.paused) {
            audio.pause();
            return;
        }
        const graph = ensureGraph();
        if (graph && graph.ctx.state === 'suspended') graph.ctx.resume();
        const started = audio.play();
        if (started && typeof started.catch === 'function') started.catch(() => {});
    };

    useEffect(() => {
        const graph = graphRef.current;
        if (graph) graph.gain.gain.setTargetAtTime(volume, graph.ctx.currentTime, 0.015);
        else if (audioRef.current) audioRef.current.volume = volume;
        try { localStorage.setItem(VOLUME_KEY, String(volume)); } catch (_) {}
    }, [volume]);

    // Leaving the personal session takes the player with it, so the song
    // stops with it. A detached <audio> would otherwise keep playing.
    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            if (audio && !audio.paused) audio.pause();
            graphRef.current?.ctx.close().catch(() => {});
            graphRef.current = null;
        };
    }, []);

    // The button follows the element, not the click, so media keys and
    // the browser's own controls keep it honest.
    const onPlay = () => {
        playingRef.current = true;
        setPlaying(true);
        wakeRef.current();
    };
    const onPause = () => {
        playingRef.current = false;
        setPlaying(false);
        wakeRef.current();
    };

    return (
        <aside className="ring" aria-label="Now playing">
            <canvas ref={canvasRef} className="ring-canvas" aria-hidden="true" />

            <div className="ring-controls" style={box ? { width: box } : undefined}>
                <p className="ring-title">{TRACK.title}</p>
                <p className="micro ring-artist">{TRACK.artist}</p>

                <div className="ring-row">
                    <button
                        type="button"
                        className="btn btn-primary ring-play"
                        aria-label={playing ? 'Pause' : 'Play'}
                        onClick={toggle}
                    >
                        {playing ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <input
                        type="range"
                        className="ring-volume"
                        aria-label="Volume"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                    />
                </div>
            </div>

            <audio
                ref={audioRef}
                src={SRC}
                preload="none"
                loop
                onPlay={onPlay}
                onPause={onPause}
            />
        </aside>
    );
};

export default AudioRing;
