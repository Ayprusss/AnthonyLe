import React, { useEffect, useRef, useState, useCallback } from 'react';
import './BootScene.css';

// CH·741 COLD BOOT — a monochrome green phosphor tube runs a Linux-style
// power-on: firmware check, kernel ring buffer, systemd unit starts, a
// login, then a loading bar that fills and hands off to the service on a
// burst of static. Its own device: green-on-black, independent of whatever
// channel the site is tuned to. Plays once per session; any key/click skips.

// The boot log. `tag` is the leading bracket/label, `body` the message.
const LINES = [
    { tag: 'CH741 BIOS',   body: 'v7.41  (C) ANTHONY LE MICROSYSTEMS',      k: 'bios' },
    { tag: '',             body: 'CPU ... MOS 6502 FAMILY @ 6.9375 MHZ',    k: 'bios' },
    { tag: '',             body: 'MEMORY TEST ... 1024K OK',                k: 'bios' },
    { tag: '',             body: 'BOOT DEVICE ... /dev/ch741 (VBI)',        k: 'bios' },
    { tag: '',             body: 'Loading /vmlinuz-7.41.0-ch741 ....',      k: 'bios' },
    { tag: '',             body: '',                                        k: 'gap'  },
    { tag: '[    0.000000]', body: 'Linux version 7.41.0-ch741 (anthony@studio)', k: 'kmsg' },
    { tag: '[    0.000031]', body: 'Command line: root=/dev/ch741 ro quiet splash', k: 'kmsg' },
    { tag: '[    0.184220]', body: 'CPU0: teletext coprocessor rev 7 online', k: 'kmsg' },
    { tag: '[    0.204518]', body: 'Calibrating delay loop... 741.00 BogoMIPS', k: 'kmsg' },
    { tag: '[    0.318204]', body: 'vbi0: decoder locked on lines 14-22',   k: 'kmsg' },
    { tag: '[    0.512900]', body: 'Freeing unused kernel memory: 64K',     k: 'kmsg' },
    { tag: '',             body: '',                                        k: 'gap'  },
    { tag: '[  OK  ]',     body: 'Started Cathode Ray Display Manager.',    k: 'ok'   },
    { tag: '[  OK  ]',     body: 'Mounted Teletext Page Store (6 pages).',  k: 'ok'   },
    { tag: '[  OK  ]',     body: 'Reached target Fastext Keys (R G Y C).',  k: 'ok'   },
    { tag: '[  OK  ]',     body: 'Started Ottawa Studio Clock.',            k: 'ok'   },
    { tag: '[  OK  ]',     body: 'Started Broadcast Signal Acquisition.',   k: 'ok'   },
    { tag: '[  OK  ]',     body: 'Reached target Multi-User Broadcast.',    k: 'ok'   },
    { tag: '',             body: '',                                        k: 'gap'  },
    { tag: '',             body: 'CH741 teletext service 7.41  tty1',       k: 'svc'  },
    { tag: '',             body: 'ch741 login: anthony (auto)',             k: 'login'},
];

const WARMUP_MS   = 480;   // full-screen power-on flash
const LINE_MS     = 62;    // per boot-log line
const PROG_FROM   = 38;    // loading bar starts partway
const PROG_MS     = 22;    // per loading-bar step
const LOCK_MS     = 460;   // hold on "service ready"
const EXIT_MS     = 460;   // static hand-off

const BAR_CELLS = 22;
const bar = (pct) => {
    const on = Math.round((pct / 100) * BAR_CELLS);
    return '█'.repeat(on) + '░'.repeat(BAR_CELLS - on);
};

const BootScene = ({ onComplete }) => {
    const [phase, setPhase] = useState('warmup');   // warmup → boot → lock → exit
    const [lineCount, setLineCount] = useState(0);
    const [prog, setProg] = useState(PROG_FROM);
    const done = useRef(false);
    const rootRef = useRef(null);

    const skip = useCallback(() => {
        setPhase((p) => (p === 'exit' ? p : 'exit'));
    }, []);

    // Focus the scene so keystrokes reach it; any key or click skips.
    useEffect(() => {
        rootRef.current?.focus();
        const onKey = () => skip();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [skip]);

    // Power-on flash → begin the log.
    useEffect(() => {
        if (phase !== 'warmup') return;
        const id = setTimeout(() => setPhase('boot'), WARMUP_MS);
        return () => clearTimeout(id);
    }, [phase]);

    // Stream the boot log line by line.
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

    // After the log, fill the loading bar to 100%, then lock.
    useEffect(() => {
        if (phase !== 'boot' || lineCount < LINES.length) return;
        let p = PROG_FROM;
        const id = setInterval(() => {
            p += 3;
            setProg(Math.min(p, 100));
            if (p >= 100) { clearInterval(id); setPhase('lock'); }
        }, PROG_MS);
        return () => clearInterval(id);
    }, [phase, lineCount]);

    // Service-ready hold → static hand-off.
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

    const started = phase !== 'warmup';
    const logDone = lineCount >= LINES.length;
    const locked = phase === 'lock' || phase === 'exit';

    return (
        <div
            ref={rootRef}
            className={`boot-scene phase-${phase}`}
            role="button"
            tabIndex={-1}
            aria-label="Booting CH·741. Press any key to skip."
            onClick={skip}
        >
            {/* CRT power-on: full-screen flash */}
            {phase === 'warmup' && <div className="boot-flash" aria-hidden="true" />}

            {started && (
                <div className="boot-inner" aria-hidden="true">
                    {LINES.slice(0, lineCount).map((l, i) => (
                        <div className={`boot-line k-${l.k}`} key={i}>
                            {l.tag && <span className="boot-tag">{l.tag}</span>}
                            <span className="boot-body">{l.body || ' '}</span>
                        </div>
                    ))}

                    {logDone && (
                        <div className="boot-load">
                            <span className="boot-load-lbl">
                                {locked ? 'CH·741 SERVICE READY' : 'STARTING BROADCAST SERVICE'}
                            </span>
                            <span className="boot-bar">{bar(prog)}</span>
                            <span className="boot-pct">{String(prog).padStart(3, ' ')}%</span>
                            {!locked && <span className="boot-cursor" />}
                        </div>
                    )}
                </div>
            )}

            <span className="boot-hint" aria-hidden="true">PRESS ANY KEY TO SKIP</span>

            {/* Static hand-off into the service */}
            <div className="boot-static" aria-hidden="true" />
        </div>
    );
};

export default BootScene;
