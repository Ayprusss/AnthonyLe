import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MotionConfig } from 'framer-motion';
import './Home.css';
import '../../Components/GrainOverlay.css';
import BootScene from '../../Components/BootScene';
import Navbar from '../../Components/Navbar';
import KeyLegend from '../../Components/KeyLegend';
import Hero from '../../Components/Hero';
import Skills from '../../Components/Skills';
import Projects from '../../Components/Projects';
import Experience from '../../Components/Experience';
import Resume from '../../Components/Resume';
import About from '../../Components/About';
import Volunteering from '../../Components/Volunteering';
import Hobbies from '../../Components/Hobbies';
import Contact from '../../Components/Contact';
import Schematic from '../../Components/Schematic';

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

// Whether the receiver can run its CRT boot animations. False for
// reduced-motion viewers and in jsdom (no matchMedia) — so those swap the
// channel instantly and the section tests render the service directly.
const canBootAnimate = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Play the first sign-on once per session (and only where we can animate).
const shouldSignOn = () => {
    try {
        if (sessionStorage.getItem('ch741-signed-on')) return false;
    } catch (_) {}
    return canBootAnimate();
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

    // Boot overlay state: 'cold' first sign-on, 'reboot' channel switch, or
    // null when the service is live. The channel toggled into on a reboot is
    // held here until the tube goes dark mid-cycle.
    const [bootMode, setBootMode] = useState(() => (shouldSignOn() ? 'cold' : null));
    const pendingTheme = useRef(null);
    const booting = bootMode !== null;

    // TUNE — restart the receiver into the other channel. Without animation
    // (reduced motion / tests) just swap. Ignored mid-cycle.
    const handleToggle = useCallback(() => {
        if (bootMode) return;
        const next = theme === 'professional' ? 'personal' : 'professional';
        if (!canBootAnimate()) { setTheme(next); return; }
        pendingTheme.current = next;
        setBootMode('reboot');
    }, [bootMode, theme]);

    // Swap the channel while the tube is dark (power-off / skip).
    const handleSwap = useCallback(() => {
        if (pendingTheme.current) {
            setTheme(pendingTheme.current);
            pendingTheme.current = null;
        }
    }, []);

    const handleBootDone = useCallback(() => {
        try { sessionStorage.setItem('ch741-signed-on', '1'); } catch (_) {}
        setBootMode(null);
        setTuning(true);   // roll the service in as it locks
        window.setTimeout(() => setTuning(false), 650);
    }, []);

    // Freeze the page behind the boot overlay so nothing scrolls under it.
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
        // On a reboot the channel changes mid-cycle behind the overlay; the
        // reveal roll is fired by handleBootDone instead.
        if (booting) return;
        setTuning(true);
        const id = setTimeout(() => setTuning(false), 650);
        return () => clearTimeout(id);
    }, [theme, booting]);

    // Re-observe sections whenever the channel swaps the rendered set, or
    // once the sign-on completes and the service mounts.
    useEffect(() => {
        if (booting) return;
        document.documentElement.setAttribute('data-section', 'hero');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting)
                    document.documentElement.setAttribute('data-section', entry.target.id);
            });
        }, { rootMargin: '-30% 0px -30% 0px' });

        document.querySelectorAll('main > div[id]').forEach(s => observer.observe(s));
        return () => observer.disconnect();
    }, [theme, booting]);

    return (
        <MotionConfig reducedMotion="user">
        <div className={`home-container${tuning ? ' is-tuning' : ''}`}>
            {/* Background stack */}
            <div className="base-bg" aria-hidden="true" />
            <Schematic />

            {/* CRT glass: scanlines, aperture grille, vignette */}
            <div className="grain-overlay" aria-hidden="true" />

            {/* Receiver bezel — rounded corner shadows over everything */}
            <div className="crt-bezel" aria-hidden="true" />

            {booting && (
                <BootScene
                    mode={bootMode}
                    onSwap={handleSwap}
                    onComplete={handleBootDone}
                />
            )}

            {/* The service — navbar and pages — mounts only once the tube
                finishes booting, so nothing shows over the boot/reboot. */}
            {!booting && (
                <>
                    <Navbar
                        theme={theme}
                        links={SECTIONS[theme]}
                        onToggleTheme={handleToggle}
                    />

                    <main>
                        <div id="hero"><Hero sections={SECTIONS[theme]} /></div>
                        {SECTIONS[theme].map(({ id, Component }) => (
                            <div id={id} key={id}><Component /></div>
                        ))}
                        <div id="contact"><Contact /></div>
                    </main>

                    <KeyLegend
                        sections={SECTIONS[theme]}
                        onToggleTheme={handleToggle}
                    />
                </>
            )}
        </div>
        </MotionConfig>
    );
};

export default Home;
