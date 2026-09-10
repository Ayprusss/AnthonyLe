import React, { useEffect, useRef, useCallback } from 'react';
import './Rail.css';

// Top bar and index rail.
//
// The rail replaces what used to be a fixed status bar plus a fixed
// key-legend strip along the bottom. One index, always visible, always
// showing where you are — and the shortcuts it used to advertise
// permanently now live behind the ? button, because a legend pinned to
// every screen is chrome that earns its space exactly once.

const LINKS = [
    { label: 'GitHub',   href: 'https://github.com/Ayprusss' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/anthonykhle/' },
    { label: 'Email',    href: 'mailto:anthonykhle@gmail.com' },
];

const SHORTCUTS = [
    { keys: '↑ ↓', action: 'Move between sections' },
    { keys: 'P',   action: 'Switch session' },
    { keys: '?',   action: 'Show this list' },
];

// Typing in the contact form must never be intercepted.
const isTyping = (el) =>
    !!el && (el.isContentEditable || !!el.closest('input, textarea, select'));

const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
            ? 'auto' : 'smooth',
        block: 'start',
    });
};

const Rail = ({ theme, items, activeId, onSwitch }) => {
    const [helpOpen, setHelpOpen] = React.useState(false);
    const helpButtonRef = useRef(null);
    const helpCloseRef = useRef(null);
    const listRef = useRef(null);

    const itemsRef = useRef(items);
    itemsRef.current = items;
    const activeRef = useRef(activeId);
    activeRef.current = activeId;

    const step = useCallback((delta) => {
        const ids = itemsRef.current.map((i) => i.id);
        const from = ids.indexOf(activeRef.current);
        const next = Math.min(Math.max((from < 0 ? 0 : from) + delta, 0), ids.length - 1);
        scrollToSection(ids[next]);
    }, []);

    // The keys are real, so they are bound to the same actions the
    // pointer has and nothing else.
    useEffect(() => {
        const onKey = (e) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            if (e.key === 'Escape' && helpOpen) {
                setHelpOpen(false);
                helpButtonRef.current?.focus();
                return;
            }
            if (isTyping(e.target)) return;

            if (e.key === 'ArrowDown')      { e.preventDefault(); step(1); }
            else if (e.key === 'ArrowUp')   { e.preventDefault(); step(-1); }
            else if (e.key === '?')         { e.preventDefault(); setHelpOpen(true); }
            else if (e.key.toLowerCase() === 'p') {
                e.preventDefault();
                onSwitch(theme === 'professional' ? 'personal' : 'professional');
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [step, onSwitch, theme, helpOpen]);

    useEffect(() => {
        if (helpOpen) helpCloseRef.current?.focus();
    }, [helpOpen]);

    // On the narrow layout the index is a horizontal strip; keep the
    // section you are in inside it as the page scrolls.
    useEffect(() => {
        const el = listRef.current?.querySelector('[aria-current="true"]');
        if (el && window.innerWidth < 1040) {
            el.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
    }, [activeId]);

    const onNavClick = (e, id) => {
        e.preventDefault();
        scrollToSection(id);
    };

    return (
        <>
            <header className="bar">
                <a
                    className="bar-name"
                    href="#overview"
                    onClick={(e) => onNavClick(e, 'overview')}
                >
                    Anthony Le
                </a>

                <div className="bar-right">
                    {/* Both options stay visible and the current one is
                        filled in. A single toggle would show the state or
                        the affordance, never both. */}
                    <div className="seg" role="group" aria-label="Session">
                        <button
                            type="button"
                            className="seg-btn"
                            aria-pressed={theme === 'professional'}
                            onClick={() => onSwitch('professional')}
                        >
                            Professional
                        </button>
                        <button
                            type="button"
                            className="seg-btn"
                            aria-pressed={theme === 'personal'}
                            onClick={() => onSwitch('personal')}
                        >
                            Personal
                        </button>
                    </div>

                    <button
                        type="button"
                        className="bar-help"
                        ref={helpButtonRef}
                        onClick={() => setHelpOpen(true)}
                        aria-label="Keyboard shortcuts"
                    >
                        ?
                    </button>
                </div>
            </header>

            <nav className="rail" aria-label="Sections">
                <ul className="rail-list" ref={listRef}>
                    {items.map(({ id, label }) => (
                        <li key={id}>
                            <a
                                href={`#${id}`}
                                className="rail-link"
                                aria-current={id === activeId ? 'true' : undefined}
                                onClick={(e) => onNavClick(e, id)}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>

                <hr className="rule rail-rule" />

                <ul className="rail-links">
                    {LINKS.map(({ label, href }) => (
                        <li key={label}>
                            <a
                                href={href}
                                target={href.startsWith('http') ? '_blank' : undefined}
                                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {helpOpen && (
                <div
                    className="help-scrim"
                    onClick={() => { setHelpOpen(false); helpButtonRef.current?.focus(); }}
                >
                    <div
                        className="help"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Keyboard shortcuts"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="help-title">Keyboard shortcuts</h2>
                        <dl className="help-list">
                            {SHORTCUTS.map(({ keys, action }) => (
                                <div className="help-row" key={keys}>
                                    <dt className="help-keys">{keys}</dt>
                                    <dd className="help-action">{action}</dd>
                                </div>
                            ))}
                        </dl>
                        <button
                            type="button"
                            className="btn btn-secondary help-close"
                            ref={helpCloseRef}
                            onClick={() => { setHelpOpen(false); helpButtonRef.current?.focus(); }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Rail;
