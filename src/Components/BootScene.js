import React, { useEffect, useRef, useState, useCallback } from 'react';
import './BootScene.css';

// SEEGSON COLD BOOT / RESTART — the tube the whole site runs on, coming
// up. Two modes:
//   · cold    — first sign-on: power-on flash → APOLLO core log →
//               the operator plate types itself in → hand-off.
//   · restart — profile switch: shutdown log → CRT power-off collapse
//               (the profile swaps here, in the dark) → a dead beat while
//               the phosphor dot burns off → power-on into the other
//               profile. No plate: the logo belongs to the cold boot, and
//               a title card on every switch would grate.
// Any key or click skips.

// Core startup log. `tag` is the leading label, `body` the message.
// Column-aligned rows, the way the APOLLO terminals report.
const LINES = [
    { tag: 'SEEGSON SYSTEMS', body: 'CORE FIRMWARE 7.41  (C) SEEGSON CORPORATION', k: 'bios' },
    { tag: '',            body: 'PROCESSOR ......... MU/TH/UR CLASS @ 6.9375 MHZ',  k: 'bios' },
    { tag: '',            body: 'CORE MEMORY ....... 1024K OK',                     k: 'bios' },
    { tag: '',            body: 'BOOT DEVICE ....... /dev/apollo0',                 k: 'bios' },
    { tag: '',            body: '',                                                 k: 'gap'  },
    { tag: '',            body: 'APOLLO CORE STARTUP',                              k: 'hdr'  },
    { tag: '',            body: 'RESET PRIORITY COMMANDS      1980        90-',     k: 'kmsg' },
    { tag: '',            body: 'OPERATOR PROFILE LOADED      0741      X RW W',    k: 'kmsg' },
    { tag: '',            body: 'ADMINISTRATION               1023',                k: 'kmsg' },
    { tag: '',            body: 'SECURITY CLEARANCE    N1       Y            90',   k: 'kmsg' },
    { tag: '',            body: 'SEVASTOLINK SUBSYSTEM ONLINE',                     k: 'kmsg' },
    { tag: '',            body: 'SET   B    OVERRIDE   Y N          Y',             k: 'kmsg' },
    { tag: '',            body: '',                                                 k: 'gap'  },
    { tag: '[  OK  ]',    body: 'Cathode ray display manager started.',             k: 'ok'   },
    { tag: '[  OK  ]',    body: 'Personal terminal folders mounted.',               k: 'ok'   },
    { tag: '[  OK  ]',    body: 'Structural schematic feed acquired.',              k: 'ok'   },
    { tag: '[  OK  ]',    body: 'Station clock synchronised — OTTAWA.',             k: 'ok'   },
    { tag: '[  OK  ]',    body: 'Input legend bound.',                              k: 'ok'   },
    { tag: '',            body: '',                                                 k: 'gap'  },
    { tag: '',            body: 'BOOT COMPLETE                     Y',              k: 'svc'  },
    { tag: '',            body: 'sevastolink login: anthony (auto)',                k: 'login'},
];

// A restart replays an abbreviated core log. The full banner belongs to
// a cold boot; on a profile switch the viewer already knows the machine,
// and every extra line is time spent staring at a dark screen.
const RESTART_LINES = [
    { tag: 'SEEGSON SYSTEMS', body: 'CORE FIRMWARE 7.41',                       k: 'bios' },
    { tag: '',            body: '',                                             k: 'gap'  },
    { tag: '',            body: 'APOLLO CORE STARTUP',                          k: 'hdr'  },
    { tag: '',            body: 'OPERATOR PROFILE LOADED      0741      X RW W', k: 'kmsg' },
    { tag: '',            body: 'SEVASTOLINK SUBSYSTEM ONLINE',                 k: 'kmsg' },
    { tag: '',            body: '',                                             k: 'gap'  },
    { tag: '[  OK  ]',    body: 'Personal terminal folders mounted.',            k: 'ok'   },
    { tag: '[  OK  ]',    body: 'Structural schematic feed acquired.',           k: 'ok'   },
    { tag: '',            body: '',                                             k: 'gap'  },
    { tag: '',            body: 'BOOT COMPLETE                     Y',           k: 'svc'  },
];

// Shutdown log, streamed before the tube collapses.
const SHUTDOWN_LINES = [
    { tag: '',         body: 'Profile switch requested — restarting terminal...', k: 'bios' },
    { tag: '',         body: '',                                          k: 'gap' },
    { tag: '[  OK  ]', body: 'Input legend released.',                    k: 'ok'  },
    { tag: '[  OK  ]', body: 'Schematic feed closed.',                    k: 'ok'  },
    { tag: '[  OK  ]', body: 'Station clock stopped.',                    k: 'ok'  },
    { tag: '[  OK  ]', body: 'Terminal folders unmounted.',               k: 'ok'  },
    { tag: '[  OK  ]', body: 'Cathode ray display manager stopped.',      k: 'ok'  },
    { tag: '',         body: '',                                          k: 'gap' },
    { tag: '',         body: 'Powering off.',                             k: 'login' },
];

const WORDMARK = 'AYPRUSSS';

const SHUT_MS     = 74;    // per shutdown line
const SHUT_HOLD   = 420;   // pause on "Powering off." before the collapse
const POWEROFF_MS = 600;   // CRT collapse to a dot
const DARK_MS     = 1000;  // tube dead: dot afterglow burns off, then black
const WARMUP_MS   = 620;   // power-on flash — strike, beat, then full bloom
const LINE_MS     = 58;    // per boot-log line
const PLATE_HOLD  = 340;   // beat between the log and the plate appearing
const TYPE_MS     = 90;    // per wordmark character — slow, deliberate
const NAME_DELAY  = 380;   // pause before the operator name resolves
const MARK_HOLD   = 900;   // hold on the finished plate
const LOCK_MS     = 440;   // hold on "terminal ready" (restart path)
const EXIT_MS     = 440;   // static hand-off

const BootScene = ({ mode = 'cold', onSwap, onComplete }) => {
    // A restart starts by powering down; a cold boot goes straight to warm-up.
    const [phase, setPhase] = useState(mode === 'reboot' ? 'shutdown' : 'warmup');
    const [shutCount, setShutCount] = useState(0);
    const [lineCount, setLineCount] = useState(0);
    const [typed, setTyped] = useState(0);
    const [nameIn, setNameIn] = useState(false);
    const swapped = useRef(false);
    const done = useRef(false);
    const rootRef = useRef(null);

    // Only the first sign-on gets the operator plate and the full log.
    const isCold = mode !== 'reboot';
    const log = isCold ? LINES : RESTART_LINES;

    // Swap the profile while the screen is dark — at power-off, and if the
    // viewer skips before we get there, so we never land on the old one.
    const doSwap = useCallback(() => {
        if (swapped.current) return;
        swapped.current = true;
        onSwap?.();
    }, [onSwap]);

    const skip = useCallback(() => {
        doSwap();
        setPhase((p) => (p === 'exit' ? p : 'exit'));
    }, [doSwap]);

    // Focus the scene so keystrokes reach it; any key or click skips.
    useEffect(() => {
        rootRef.current?.focus();
        const onKey = () => skip();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [skip]);

    // Shutdown log streams line by line, then holds, then collapses.
    useEffect(() => {
        if (phase !== 'shutdown') return;
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setShutCount(i);
            if (i >= SHUTDOWN_LINES.length) {
                clearInterval(id);
                setTimeout(() => setPhase('poweroff'), SHUT_HOLD);
            }
        }, SHUT_MS);
        return () => clearInterval(id);
    }, [phase]);

    // CRT power-off collapse — the profile swaps here, in the dark.
    useEffect(() => {
        if (phase !== 'poweroff') return;
        doSwap();
        const id = setTimeout(() => setPhase('dark'), POWEROFF_MS);
        return () => clearTimeout(id);
    }, [phase, doSwap]);

    // Dead tube — the collapsed dot bleeds off and nothing lights for a
    // beat before the set strikes again. Without this the power-off and
    // power-on flashes run together and read as one blink.
    useEffect(() => {
        if (phase !== 'dark') return;
        const id = setTimeout(() => setPhase('warmup'), DARK_MS);
        return () => clearTimeout(id);
    }, [phase]);

    // Power-on flash → begin the boot log.
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
            if (i >= log.length) clearInterval(id);
        }, LINE_MS);
        return () => clearInterval(id);
    }, [phase, log]);

    // Log done → the plate on a cold boot, straight to the hold otherwise.
    useEffect(() => {
        if (phase !== 'boot' || lineCount < log.length) return;
        const id = setTimeout(
            () => setPhase(isCold ? 'wordmark' : 'lock'),
            isCold ? PLATE_HOLD : LOCK_MS
        );
        return () => clearTimeout(id);
    }, [phase, lineCount, isCold, log]);

    // The plate types itself in, one character at a time. No trailing
    // cursor: the machine is printing a plate, not waiting for input.
    useEffect(() => {
        if (phase !== 'wordmark') return;
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setTyped(i);
            if (i >= WORDMARK.length) {
                clearInterval(id);
                setTimeout(() => setNameIn(true), NAME_DELAY);
                setTimeout(() => setPhase('exit'), NAME_DELAY + MARK_HOLD);
            }
        }, TYPE_MS);
        return () => clearInterval(id);
    }, [phase]);

    // Terminal-ready hold → static hand-off (restart path).
    useEffect(() => {
        if (phase !== 'lock') return;
        const id = setTimeout(() => setPhase('exit'), LOCK_MS);
        return () => clearTimeout(id);
    }, [phase]);

    // Static burst, then reveal the terminal.
    useEffect(() => {
        if (phase !== 'exit') return;
        const id = setTimeout(() => {
            if (done.current) return;
            done.current = true;
            onComplete?.();
        }, EXIT_MS);
        return () => clearTimeout(id);
    }, [phase, onComplete]);

    const showBootLog = phase === 'boot' || phase === 'lock' || (phase === 'exit' && !isCold);
    const showPlate = phase === 'wordmark' || (phase === 'exit' && isCold);

    return (
        <div
            ref={rootRef}
            className={`boot-scene phase-${phase}`}
            role="button"
            tabIndex={-1}
            aria-label="Terminal starting. Press any key to skip."
            onClick={skip}
        >
            {/* CRT power-on: full-screen flash */}
            {phase === 'warmup' && <div className="boot-flash" aria-hidden="true" />}

            {/* CRT power-off: picture collapses to a line, then a dot */}
            {phase === 'poweroff' && <div className="boot-collapse" aria-hidden="true" />}

            {/* Dead tube: the last of the phosphor dot fading in the centre */}
            {phase === 'dark' && <div className="boot-afterglow" aria-hidden="true" />}

            {phase === 'shutdown' && (
                <div className="boot-inner" aria-hidden="true">
                    {SHUTDOWN_LINES.slice(0, shutCount).map((l, i) => (
                        <div className={`boot-line k-${l.k}`} key={i}>
                            {l.tag && <span className="boot-tag">{l.tag}</span>}
                            <span className="boot-body">{l.body || ' '}</span>
                        </div>
                    ))}
                </div>
            )}

            {showBootLog && (
                <div className="boot-inner" aria-hidden="true">
                    {log.slice(0, lineCount).map((l, i) => (
                        <div className={`boot-line k-${l.k}`} key={i}>
                            {l.tag && <span className="boot-tag">{l.tag}</span>}
                            <span className="boot-body">{l.body || ' '}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Operator plate — the corporate identification card the
                terminal prints before it hands the session over. */}
            {showPlate && (
                <div className="boot-plate-wrap">
                    <div className="boot-plate">
                        <div className="boot-plate-box">
                            {/* The ghost reserves the finished width so the
                                characters land left to right instead of
                                growing outward from the centre. */}
                            <span className="boot-mark">
                                <span className="boot-mark-ghost" aria-hidden="true">{WORDMARK}</span>
                                <span className="boot-mark-live">{WORDMARK.slice(0, typed)}</span>
                            </span>
                            <span className={`boot-plate-name${nameIn ? ' is-in' : ''}`}>
                                ANTHONY LE
                            </span>
                        </div>
                        <div className={`boot-plate-rule${nameIn ? ' is-in' : ''}`}>
                            OTTAWA STATION — 1732794
                        </div>
                    </div>
                </div>
            )}

            <span className="boot-hint" aria-hidden="true">PRESS ANY KEY TO SKIP</span>

            {/* Static hand-off into the terminal */}
            <div className="boot-static" aria-hidden="true" />
        </div>
    );
};

export default BootScene;
