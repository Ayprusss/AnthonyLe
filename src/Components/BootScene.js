import React, { useEffect, useRef, useState, useCallback } from 'react';
import './BootScene.css';

// The console the site starts from.
//
// A plain Linux boot: service lines stream out, a getty prompt appears,
// the username types itself in, and the session opens. It runs once per
// browser session and any key or click skips it.
//
// The hand-off is the point. On the professional session the screen
// inverts — white sweeps across the black console and the daylight page
// is underneath it. On the personal session the console is already the
// colour of the page it is opening, so it simply clears. The asymmetry
// is not a flourish; it is what the two sessions being inversions of
// each other actually looks like.

const LINES = [
    { text: 'booting anthonyle 6.9.0-1 (x86_64)', kind: 'head' },
    { text: '', kind: 'gap' },
    { text: 'Started Network Manager.',           kind: 'ok' },
    { text: 'Mounted /home/anthony.',             kind: 'ok' },
    { text: 'Reached target Basic System.',       kind: 'ok' },
    { text: 'Started OpenSSH Daemon.',            kind: 'ok' },
    { text: 'Started Display Manager.',           kind: 'ok' },
    { text: 'Reached target Graphical Interface.', kind: 'ok' },
    { text: '', kind: 'gap' },
];

const USER = 'anthony';

const START_MS  = 260;   // beat before the first line
const LINE_MS   = 62;    // per service line
const PROMPT_MS = 340;   // pause before the login prompt appears
const TYPE_MS   = 85;    // per character of the username
const HOLD_MS   = 520;   // beat on the completed prompt
const EXIT_MS   = 300;   // the inversion, matched to the session wipe

const BootScene = ({ theme, onComplete }) => {
    const [phase, setPhase] = useState('start');
    const [lineCount, setLineCount] = useState(0);
    const [typed, setTyped] = useState(0);
    const done = useRef(false);

    // White sweeping over black is a real change of state; black
    // clearing to black is not, so it gets a plain fade instead.
    const inverts = theme !== 'personal';

    const skip = useCallback(() => {
        setPhase((p) => (p === 'exit' ? p : 'exit'));
    }, []);

    useEffect(() => {
        const onKey = () => skip();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [skip]);

    useEffect(() => {
        if (phase !== 'start') return;
        const id = setTimeout(() => setPhase('log'), START_MS);
        return () => clearTimeout(id);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'log') return;
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setLineCount(i);
            if (i >= LINES.length) clearInterval(id);
        }, LINE_MS);
        return () => clearInterval(id);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'log' || lineCount < LINES.length) return;
        const id = setTimeout(() => setPhase('login'), PROMPT_MS);
        return () => clearTimeout(id);
    }, [phase, lineCount]);

    useEffect(() => {
        if (phase !== 'login') return;
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setTyped(i);
            if (i >= USER.length) {
                clearInterval(id);
                setTimeout(() => setPhase('exit'), HOLD_MS);
            }
        }, TYPE_MS);
        return () => clearInterval(id);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'exit') return;
        const id = setTimeout(() => {
            if (done.current) return;
            done.current = true;
            onComplete?.();
        }, EXIT_MS);
        return () => clearTimeout(id);
    }, [phase, onComplete]);

    const exiting = phase === 'exit';

    return (
        <div
            className={`boot${exiting ? ' is-exiting' : ''}`}
            role="button"
            tabIndex={-1}
            aria-label="Starting up. Press any key to skip."
            onClick={skip}
        >
            <div className="boot-log" aria-hidden="true">
                {LINES.slice(0, lineCount).map((line, i) => (
                    <div className={`boot-line boot-${line.kind}`} key={i}>
                        {line.kind === 'ok' && (
                            <span className="boot-ok">[&nbsp;&nbsp;ok&nbsp;&nbsp;]</span>
                        )}
                        <span className="boot-text">{line.text || ' '}</span>
                    </div>
                ))}

                {(phase === 'login' || exiting) && (
                    <div className="boot-line boot-prompt">
                        <span className="boot-text">
                            ottawa login: {USER.slice(0, typed)}
                            <span className="boot-cursor" />
                        </span>
                    </div>
                )}
            </div>

            <span className="boot-hint" aria-hidden="true">Press any key to skip</span>

            {exiting && inverts && (
                <div className="boot-invert" aria-hidden="true" />
            )}
        </div>
    );
};

export default BootScene;
