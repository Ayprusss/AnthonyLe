import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import './Navbar.css';

const NAV_LINKS = ['skills', 'projects', 'experience', 'resume', 'contact'];

const Navbar = ({ mode, onToggleMode }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 60);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-inner">
                <Link to="hero" smooth duration={500} className="nav-logo">
                    AL<span className="nav-logo-period">.</span>
                </Link>

                <ul className="nav-links">
                    {NAV_LINKS.map(s => (
                        <li key={s}>
                            <Link
                                to={s}
                                spy smooth offset={0} duration={500}
                                activeClass="active"
                            >
                                {s}
                            </Link>
                        </li>
                    ))}
                </ul>

                <button
                    className="nav-mode-btn"
                    onClick={onToggleMode}
                    aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {mode === 'dark' ? 'LIGHT' : 'DARK'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
