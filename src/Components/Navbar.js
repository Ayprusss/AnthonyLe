import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-scroll';
import './Navbar.css';

const Navbar = ({ theme, links = [], onToggleTheme }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const progressRef = useRef(null);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 60);
                    // Red-pencil progress: how far through the drawing set
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

    // Mobile index: lock page scroll while open, close on Escape.
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

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-progress" aria-hidden="true">
                <div className="nav-progress-fill" ref={progressRef} />
            </div>

            <div className="nav-inner">
                <Link to="hero" smooth duration={500} className="nav-logo" onClick={() => setMenuOpen(false)}>
                    <span className="nav-logo-dwg">DWG</span>
                    AL-26
                </Link>

                <ul className="nav-links">
                    {allLinks.map(({ id, label }, i) => (
                        <li key={id}>
                            <Link
                                to={id}
                                spy smooth offset={0} duration={500}
                                activeClass="active"
                            >
                                <span className="nav-link-num">{String(i + 2).padStart(2, '0')}</span>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="nav-actions">
                    <button
                        className="nav-mode-btn"
                        onClick={onToggleTheme}
                        aria-label={`Switch to ${theme === 'professional' ? 'personal' : 'professional'} view`}
                    >
                        <span className="nav-mode-prefix">RE-PRINT:</span>
                        {theme === 'professional' ? 'PERSONAL' : 'PROFESSIONAL'}
                    </button>

                    <button
                        className={`nav-burger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        aria-controls="nav-mobile-menu"
                    >
                        <span className="nav-burger-line" />
                        <span className="nav-burger-line" />
                    </button>
                </div>
            </div>

            {/* Mobile drawing index — numbers match the SHT tags on the sheets */}
            <div
                id="nav-mobile-menu"
                className={`nav-mobile ${menuOpen ? 'open' : ''}`}
                aria-hidden={!menuOpen}
            >
                <p className="nav-mobile-caption">DRAWING INDEX</p>
                <ul className="nav-mobile-list">
                    {allLinks.map(({ id, label }, i) => (
                        <li key={id} style={{ transitionDelay: menuOpen ? `${0.06 + i * 0.05}s` : '0s' }}>
                            <Link
                                to={id}
                                smooth offset={0} duration={500}
                                tabIndex={menuOpen ? 0 : -1}
                                onClick={() => setMenuOpen(false)}
                            >
                                <span className="nav-mobile-num">SHT {String(i + 2).padStart(2, '0')}</span>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
