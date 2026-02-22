import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <Link to="hero" spy={true} smooth={true} duration={500} className="nav-logo">
                    <img src="/ppp-logo-white.png" alt="Logo" className="nav-logo-img" />
                </Link>
                <ul className="nav-menu">
                    <li><Link to="skills" spy={true} smooth={true} offset={0} duration={500} activeClass="active">Skills</Link></li>
                    <li><Link to="projects" spy={true} smooth={true} offset={0} duration={500} activeClass="active">Projects</Link></li>
                    <li><Link to="experience" spy={true} smooth={true} offset={0} duration={500} activeClass="active">Experience</Link></li>
                    <li><Link to="contact" spy={true} smooth={true} offset={0} duration={500} activeClass="active">Contact</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
