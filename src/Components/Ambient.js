import React, { useEffect, useState } from 'react';
import './Ambient.css';
import PointWave from './PointWave';
import AudioRing from './AudioRing';

// The right-hand side of the page.
//
// The column is flush left and capped at a comfortable measure, which
// on a desktop monitor leaves most of the window empty. This fills that
// space with one quiet visual per session — a field of points on the
// professional side, the song on the personal side — and nothing on a
// phone or a narrow window, where there is no space to fill and the
// canvas would only cost battery.
//
// The gate is in script rather than CSS on purpose: a panel hidden with
// display:none still mounts its canvas and still fetches its audio.

const DESKTOP = '(min-width: 1040px) and (hover: hover)';
const MIN_ROOM = 300;  // below this the visual would be a postage stamp

const useMediaQuery = (query) => {
    const supported = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
    const [matches, setMatches] = useState(() => supported && window.matchMedia(query).matches);

    useEffect(() => {
        if (!supported) return;
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        onChange();
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, [query, supported]);

    return matches;
};

// Where the free space starts: the column's right edge. The name is set
// wide and heavy enough to overhang that edge by up to a hundred pixels,
// though, so its painted extent is measured too and handed to the
// visual as a margin to keep clear. Starting the panel past the name
// instead would cost a 1280px window the panel altogether.
const measure = () => {
    const main = document.getElementById('main');
    const left = Math.ceil(main ? main.getBoundingClientRect().right : 0);

    // The corner the name occupies, in panel coordinates, as it sits
    // with the page scrolled to the top.
    let clearX = 0;
    let clearY = 0;
    const name = document.querySelector('.overview-name');
    if (name && typeof document.createRange === 'function') {
        const range = document.createRange();
        range.selectNodeContents(name);
        if (typeof range.getBoundingClientRect === 'function') {
            const r = range.getBoundingClientRect();
            const panelTop = parseFloat(getComputedStyle(document.documentElement)
                .getPropertyValue('--bar-h')) || 56;
            clearX = Math.max(0, Math.ceil(r.right + 24 - left));
            clearY = clearX ? Math.ceil(r.bottom + window.scrollY - panelTop + 24) : 0;
        }
    }
    return { left, clearX, clearY, room: document.documentElement.clientWidth - left };
};

const Ambient = ({ theme }) => {
    const desktop = useMediaQuery(DESKTOP);
    const [frame, setFrame] = useState(null);

    useEffect(() => {
        if (!desktop) return;
        let raf = 0;

        const update = () => {
            raf = 0;
            const next = measure();
            setFrame((prev) =>
                prev && Object.keys(next).every((k) => prev[k] === next[k]) ? prev : next);
        };
        const queue = () => { if (!raf) raf = requestAnimationFrame(update); };

        update();
        window.addEventListener('resize', queue);
        // The scrollbar coming and going (the boot locks scrolling)
        // changes the width without a resize event.
        const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(queue) : null;
        ro?.observe(document.documentElement);
        // The name's width is only known once Archivo has loaded.
        document.fonts?.ready.then(queue);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', queue);
            ro?.disconnect();
        };
    }, [desktop]);

    if (!desktop || !frame || frame.room < MIN_ROOM) return null;

    return (
        <div className="ambient" style={{ left: frame.left }}>
            {/* The ring is round and centred, so it clears the name's
                corner on its own; the wave fills the panel and has to be
                told where to thin out. */}
            {theme === 'personal'
                ? <AudioRing />
                : <PointWave clearX={frame.clearX} clearY={frame.clearY} />}
        </div>
    );
};

export default Ambient;
