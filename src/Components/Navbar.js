import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-scroll';
import './Navbar.css';

// Terminal status bar — the strip every Seegson screen wears along its
// top edge: operator ident, the open folder set, the profile key, and
// the station clock. Inverse video throughout, so the folder you're in
// is punched back out of the bar rather than tinted.

const stationTime = () =>
    new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date());

const PROFILE_NAME = {
    professional: 'SEEGSON STANDARD',
    personal: 'SEVASTOLINK',
};

const Navbar = ({ theme, links = [], onToggleTheme }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [clock, setClock] = useState(stationTime);
    const progressRef = useRef(null);

    useEffect(() => {
        const id = setInterval(() => setClock(stationTime()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // How far through the terminal's contents we've read.
                    const max = document.documentElement.scrollHeight - window.innerHeight;
                    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
                    if (progressRef.current) {
                        progressRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Mobile folder list: lock page scroll while open, close on Escape.
    useEffect(() => {
        if (!menuOpen) return;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    const allLinks = [...links, { id: 'contact', label: 'contact' }];
    const nextProfile = theme === 'professional' ? 'personal' : 'professional';

    return (
        <>
        <nav className="navbar">
            <div className="nav-inner">
                <Link to="hero" smooth duration={500} className="nav-logo" onClick={() => setMenuOpen(false)}>
                    <span className="nav-logo-mark">SEEGSON</span>
                    <span className="nav-logo-sub">PERSONAL TERMINAL</span>
                </Link>

                <ul className="nav-links">
                    {allLinks.map(({ id, label }) => (
                        <li key={id}>
                            <Link to={id} spy smooth offset={0} duration={500} activeClass="active">
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="nav-actions">
                    <button
                        className="nav-profile-btn"
                        onClick={onToggleTheme}
                        aria-label={`Switch to the ${nextProfile} profile`}
                    >
                        <span className="nav-key">Q</span>
                        <span className="nav-profile-label">PROFILE:</span>
                        {PROFILE_NAME[theme]}
                    </button>

                    <span className="nav-clock">{clock}</span>

                    <button
                        className={`nav-burger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label={menuOpen ? 'Close folder list' : 'Open folder list'}
                        aria-expanded={menuOpen}
                        aria-controls="nav-mobile-menu"
                    >
                        <span className="nav-burger-line" />
                        <span className="nav-burger-line" />
                    </button>
                </div>
            </div>

            <div className="nav-progress" aria-hidden="true">
                <div className="nav-progress-fill" ref={progressRef} />
            </div>
        </nav>

        {/* Mobile folder list — kept OUTSIDE <nav> on purpose: the navbar is a
            fixed strip, so a fixed overlay nested inside it would be clipped
            to that strip. As a sibling it stays viewport-fixed. */}
        <div
            id="nav-mobile-menu"
            className={`nav-mobile ${menuOpen ? 'open' : ''}`}
            aria-hidden={!menuOpen}
        >
            <p className="nav-mobile-caption">FOLDERS</p>
            <ul className="nav-mobile-list">
                {allLinks.map(({ id, label }, i) => (
                    <li key={id} style={{ transitionDelay: menuOpen ? `${0.06 + i * 0.05}s` : '0s' }}>
                        <Link
                            to={id}
                            smooth offset={0} duration={500}
                            tabIndex={menuOpen ? 0 : -1}
                            onClick={() => setMenuOpen(false)}
                        >
                            <span className="nav-mobile-num">{String(i + 2).padStart(2, '0')}</span>
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
        </>
    );
};

export default Navbar;
