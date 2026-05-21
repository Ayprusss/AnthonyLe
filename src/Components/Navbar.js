import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import './Navbar.css';

const Navbar = ({ theme, links = [], onToggleTheme }) => {
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
                    {[...links, { id: 'contact', label: 'contact' }].map(({ id, label }) => (
                        <li key={id}>
                            <Link
                                to={id}
                                spy smooth offset={0} duration={500}
                                activeClass="active"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <button
                    className="nav-mode-btn"
                    onClick={onToggleTheme}
                    aria-label={`Switch to ${theme === 'professional' ? 'personal' : 'professional'} view`}
                >
                    {theme === 'professional' ? 'PERSONAL' : 'PROFESSIONAL'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
