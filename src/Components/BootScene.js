import React, { useEffect, useRef, useState, useCallback } from 'react';
import './BootScene.css';

// CH·741 SIGN·ON — the receiver signing on before the service appears.
// A CRT warms up, the teletext decoder runs its power-on self-test,
// acquires the signal, locks to PAGE 100, then hands off to the site on a
// burst of static. Plays once per session; any key or click skips it.

// Decoder self-test log. Each line reveals in sequence with a dot-leader
// and a status read-out — the same grammar as the page index and listings.
const LINES = [
    { k: 'POWER RAIL',              v: '5.0V',      s: 'ok' },
    { k: 'CHARACTER ROM G0/G1',     v: 'LOADED',    s: 'ok' },
    { k: 'DISPLAY RAM 1024B',       v: 'OK',        s: 'ok' },
    { k: 'FASTEXT KEYS',            v: 'R G Y C',   s: 'key' },
    { k: 'VBI ACQUISITION L14',     v: 'LOCK',      s: 'ok' },
    { k: 'MASTER CLOCK 6.9375MHz',  v: 'LOCK',      s: 'ok' },
    { k: 'PAGE STORE',              v: '6 PAGES',   s: 'ok' },
];

// Colour-bar strip flashed on signal lock — EBU test card in service colours.
const BARS = ['white', 'yellow', 'cyan', 'grn', 'mag', 'red', 'bar'];

const WARMUP_MS  = 600;   // tube warm-up
const LINE_MS    = 110;   // per self-test line
const PAGE_FROM  = 82;    // page counter starts mid-acquisition
const PAGE_MS    = 20;    // per counter step
const LOCK_MS    = 640;   // "signal locked" hold
const EXIT_MS    = 480;   // static hand-off

const pad3 = (n) => `00${n}`.slice(-3);

const BootScene = ({ onComplete }) => {
    const [phase, setPhase] = useState('warmup');   // warmup → boot → lock → exit
    const [lineCount, setLineCount] = useState(0);
    const [page, setPage] = useState(PAGE_FROM);
    const done = useRef(false);
    const rootRef = useRef(null);

    const skip = useCallback(() => {
        setPhase((p) => (p === 'exit' ? p : 'exit'));
    }, []);

    // Focus the scene so keystrokes reach it, and wire any-key / click skip.
    useEffect(() => {
        rootRef.current?.focus();
        const onKey = () => skip();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [skip]);

    // Warm-up → begin the self-test.
    useEffect(() => {
        if (phase !== 'warmup') return;
        const id = setTimeout(() => setPhase('boot'), WARMUP_MS);
        return () => clearTimeout(id);
    }, [phase]);

    // Stream the self-test lines one at a time.
    useEffect(() => {
        if (phase !== 'boot') return;
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setLineCount(i);
            if (i >= LINES.length) clearInterval(id);
        }, LINE_MS);
        return () => clearInterval(id);
    }, [phase]);

    // Once every line is up, roll the page counter to 100, then lock.
    useEffect(() => {
        if (phase !== 'boot' || lineCount < LINES.length) return;
        let p = PAGE_FROM;
        const id = setInterval(() => {
            p += 1;
            setPage(p);
            if (p >= 100) { clearInterval(id); setPhase('lock'); }
        }, PAGE_MS);
        return () => clearInterval(id);
    }, [phase, lineCount]);

    // Signal-lock hold → static hand-off.
    useEffect(() => {
        if (phase !== 'lock') return;
        const id = setTimeout(() => setPhase('exit'), LOCK_MS);
        return () => clearTimeout(id);
    }, [phase]);

    // Static burst, then reveal the service.
    useEffect(() => {
        if (phase !== 'exit') return;
        const id = setTimeout(() => {
            if (done.current) return;
            done.current = true;
            onComplete?.();
        }, EXIT_MS);
        return () => clearTimeout(id);
    }, [phase, onComplete]);

    const locked = phase === 'lock' || phase === 'exit';

    return (
        <div
            ref={rootRef}
            className={`boot-scene phase-${phase}`}
            role="button"
            tabIndex={-1}
            aria-label="Starting CH·741 broadcast service. Press any key to skip."
            onClick={skip}
        >
            {/* CRT power-on sweep */}
            {phase === 'warmup' && <div className="boot-flash" aria-hidden="true" />}

            {phase !== 'warmup' && (
                <div className="boot-inner" aria-hidden="true">
                    <div className="boot-head">
                        <span className="boot-brand">CH·741</span>
                        <span className="boot-sub">TELETEXT DECODER · SIGN&nbsp;ON</span>
                    </div>

                    <div className="boot-rule" />

                    <div className="boot-log">
                        {LINES.slice(0, lineCount).map((l) => (
                            <div className="boot-row" key={l.k}>
                                <span className="boot-row-k">{l.k}</span>
                                <span className="boot-dots" />
                                <span className={`boot-row-v v-${l.s}`}>{l.v}</span>
                            </div>
                        ))}

                        {lineCount >= LINES.length && (
                            <div className="boot-acquire">
                                {locked ? 'DECODING PAGE 100' : 'ACQUIRING PAGE'}
                                <span className="boot-count">[ {pad3(page)} ]</span>
                                {!locked && <span className="boot-cursor" />}
                            </div>
                        )}
                    </div>

                    <div className="boot-rule" />

                    <div className={`boot-lock${locked ? ' is-on' : ''}`}>
                        <span className="boot-lock-tag">SIGNAL LOCKED</span>
                        <span className="boot-lock-svc">CH·741 ANTHONY LE SERVICE</span>
                    </div>

                    <div className={`boot-bars${locked ? ' is-on' : ''}`}>
                        {BARS.map((c) => (
                            <span key={c} className={`boot-bar bar-${c}`} />
                        ))}
                    </div>
                </div>
            )}

            <span className="boot-hint" aria-hidden="true">PRESS ANY KEY TO ENTER</span>

            {/* Static hand-off into the service */}
            <div className="boot-static" aria-hidden="true" />
        </div>
    );
};

export default BootScene;
