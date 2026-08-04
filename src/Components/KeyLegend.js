import React, { useEffect, useRef, useState, useCallback } from 'react';
import { scroller } from 'react-scroll';
import './KeyLegend.css';

// The input legend every Seegson terminal wears along its bottom edge.
//
// The keys are real. A legend that lies is decoration; one that works is
// the interface, so the arrows genuinely move a cursor down the folder
// column, Enter genuinely opens the highlighted folder, and PgUp/PgDn
// genuinely page between them. Mouse scrolling, tabbing and typing are
// left completely alone — this is an extra way in, never the only one.

const KEYS = [
    { key: '↑↓', label: 'HIGHLIGHT' },
    { key: 'ENTER', label: 'SELECT' },
    { key: 'PGUP/PGDN', label: 'SCROLL' },
    { key: 'Q', label: 'PROFILE' },
];

// Typing in the contact form must never be intercepted.
const isTyping = (el) =>
    !!el && (el.isContentEditable || !!el.closest('input, textarea, select'));

const KeyLegend = ({ sections = [], onToggleTheme }) => {
    // Folder order matches the hero's index: hero, then each section, then
    // contact. The cursor indexes into the section list only — the hero
    // isn't a folder, it's the desk you're sitting at.
    const folders = [...sections.map(s => s.id), 'contact'];
    const [cursor, setCursor] = useState(-1);
    const [hint, setHint] = useState(null);
    const foldersRef = useRef(folders);
    foldersRef.current = folders;

    const goTo = useCallback((id) => {
        scroller.scrollTo(id, { smooth: true, duration: 500, offset: -50 });
    }, []);

    // Paint the cursor onto the hero's folder boxes. Driving the DOM
    // directly keeps Hero free of cursor state it has no other use for.
    useEffect(() => {
        const boxes = document.querySelectorAll('.hero-folder');
        boxes.forEach((b, i) => b.classList.toggle('is-cursor', i === cursor));
    }, [cursor]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (isTyping(e.target)) return;

            const list = foldersRef.current;
            if (!list.length) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setCursor(c => Math.min(c + 1, list.length - 1));
                    setHint('HIGHLIGHT');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setCursor(c => Math.max(c - 1, 0));
                    setHint('HIGHLIGHT');
                    break;
                case 'Enter': {
                    // Enter on a real control belongs to that control.
                    if (e.target !== document.body && e.target.closest('a, button')) return;
                    if (cursor < 0) return;
                    e.preventDefault();
                    goTo(list[cursor]);
                    setHint('SELECT');
                    break;
                }
                case 'PageDown':
                case 'PageUp': {
                    e.preventDefault();
                    const step = e.key === 'PageDown' ? 1 : -1;
                    // Page relative to whichever folder is on screen now, so
                    // this works whether or not the cursor has been moved.
                    const current = document.documentElement.getAttribute('data-section');
                    const at = list.indexOf(current);
                    const from = at >= 0 ? at : cursor;
                    const next = Math.max(0, Math.min(from + step, list.length - 1));
                    setCursor(next);
                    goTo(list[next]);
                    setHint('SCROLL');
                    break;
                }
                case 'q':
                case 'Q':
                    e.preventDefault();
                    onToggleTheme?.();
                    setHint('PROFILE');
                    break;
                default:
                    return;
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [cursor, goTo, onToggleTheme]);

    // Reset the cursor when the profile swaps the folder set out.
    useEffect(() => { setCursor(-1); }, [sections]);

    // Flash the key that was just used, then let it settle.
    useEffect(() => {
        if (!hint) return;
        const id = setTimeout(() => setHint(null), 400);
        return () => clearTimeout(id);
    }, [hint]);

    return (
        <div className="key-legend" role="note" aria-label="Keyboard controls">
            {KEYS.map(({ key, label }) => (
                <span
                    key={label}
                    className={`kl-item${hint === label ? ' is-hit' : ''}`}
                >
                    <span className="kl-key">{key}</span>
                    <span className="kl-label">{label}</span>
                </span>
            ))}
        </div>
    );
};

export default KeyLegend;
