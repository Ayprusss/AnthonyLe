import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MotionConfig } from 'framer-motion';
import './Home.css';
import '../../Components/GrainOverlay.css';
import BootScene from '../../Components/BootScene';
import Navbar from '../../Components/Navbar';
import Hero from '../../Components/Hero';
import Skills from '../../Components/Skills';
import Projects from '../../Components/Projects';
import Experience from '../../Components/Experience';
import Resume from '../../Components/Resume';
import About from '../../Components/About';
import Volunteering from '../../Components/Volunteering';
import Hobbies from '../../Components/Hobbies';
import Contact from '../../Components/Contact';
import SpaceBackground from '../../Components/SpaceBackground';

// Page sets per channel. Hero (page 100 index) and Contact (page 600)
// bookend both services; slots stay position-aligned so page numbers
// 100–600 never shift between channels.
const SECTIONS = {
    professional: [
        { id: 'skills',       label: 'skills',       Component: Skills },
        { id: 'projects',     label: 'projects',     Component: Projects },
        { id: 'experience',   label: 'experience',   Component: Experience },
        { id: 'resume',       label: 'resume',       Component: Resume },
    ],
    personal: [
        { id: 'about',        label: 'about',        Component: About },
        { id: 'volunteering', label: 'volunteering', Component: Volunteering },
        { id: 'experience',   label: 'experience',   Component: Experience },
        { id: 'hobbies',      label: 'hobbies',      Component: Hobbies },
    ],
};

// Play the sign-on once per session, and never for reduced-motion viewers.
// The matchMedia gate also keeps the scene out of jsdom (no matchMedia),
// so the section tests render the service directly.
const shouldSignOn = () => {
    try {
        if (sessionStorage.getItem('ch741-signed-on')) return false;
    } catch (_) {}
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const Home = () => {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('site-theme') === 'personal' ? 'personal' : 'professional';
        } catch {
            return 'professional';
        }
    });

    // Brief hold-roll glitch while the receiver retunes between channels.
    const [tuning, setTuning] = useState(false);
    const firstRender = useRef(true);

    // Receiver sign-on overlay before the service appears.
    const [booting, setBooting] = useState(shouldSignOn);

    const handleSignOnDone = useCallback(() => {
        try { sessionStorage.setItem('ch741-signed-on', '1'); } catch (_) {}
        setBooting(false);
        setTuning(true);   // roll the service in as it locks
        window.setTimeout(() => setTuning(false), 650);
    }, []);

    // Freeze the page behind the sign-on so nothing scrolls under it.
    useEffect(() => {
        if (!booting) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);
        return () => { document.body.style.overflow = prev; };
    }, [booting]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('site-theme', theme); } catch (_) {}
    }, [theme]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        setTuning(true);
        const id = setTimeout(() => setTuning(false), 650);
        return () => clearTimeout(id);
    }, [theme]);

    // Re-observe sections whenever the channel swaps the rendered set.
    useEffect(() => {
        document.documentElement.setAttribute('data-section', 'hero');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting)
                    document.documentElement.setAttribute('data-section', entry.target.id);
            });
        }, { rootMargin: '-30% 0px -30% 0px' });

        document.querySelectorAll('main > div[id]').forEach(s => observer.observe(s));
        return () => observer.disconnect();
    }, [theme]);

    return (
        <MotionConfig reducedMotion="user">
        <div className={`home-container${tuning ? ' is-tuning' : ''}`}>
            {/* Background stack */}
            <div className="base-bg" aria-hidden="true" />
            <SpaceBackground />

            {/* CRT glass: scanlines, aperture grille, vignette */}
            <div className="grain-overlay" aria-hidden="true" />

            {/* Receiver bezel — rounded corner shadows over everything */}
            <div className="crt-bezel" aria-hidden="true" />

            {booting && <BootScene onComplete={handleSignOnDone} />}

            <Navbar
                theme={theme}
                links={SECTIONS[theme]}
                onToggleTheme={() => setTheme(t => t === 'professional' ? 'personal' : 'professional')}
            />

            <main>
                <div id="hero"><Hero sections={SECTIONS[theme]} /></div>
                {SECTIONS[theme].map(({ id, Component }) => (
                    <div id={id} key={id}><Component /></div>
                ))}
                <div id="contact"><Contact /></div>
            </main>
        </div>
        </MotionConfig>
    );
};

export default Home;
