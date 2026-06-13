import React, { useEffect, useState, useRef } from 'react';
import './Home.css';
import '../../Components/GrainOverlay.css';
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
import RocketHunt from '../../Components/RocketHunt';

// Section sets per theme. Hero and Contact bookend both sets (rendered separately).
// Slots stay position-aligned so ghost section numbers (01–06) never shift.
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

const Home = () => {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('site-theme') === 'personal' ? 'personal' : 'professional';
        } catch {
            return 'professional';
        }
    });

    const cursorDotRef  = useRef(null);
    const cursorRingRef = useRef(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('site-theme', theme); } catch (_) {}
    }, [theme]);

    // Re-observe sections whenever the theme swaps the rendered set.
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

    // Lagged cursor ring + instant dot
    useEffect(() => {
        const dot  = cursorDotRef.current;
        const ring = cursorRingRef.current;
        if (!dot || !ring) return;

        let mouseX = 0, mouseY = 0;
        let ringX  = 0, ringY  = 0;
        let rafId  = null;

        const onMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        };

        const lerp = (a, b, t) => a + (b - a) * t;

        const tick = () => {
            ringX = lerp(ringX, mouseX, 0.13);
            ringY = lerp(ringY, mouseY, 0.13);
            ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
            rafId = requestAnimationFrame(tick);
        };

        document.addEventListener('mousemove', onMove);
        rafId = requestAnimationFrame(tick);

        const onEnter = () => ring.classList.add('hover');
        const onLeave = () => ring.classList.remove('hover');

        const attach = () => {
            document.querySelectorAll('a, button').forEach(el => {
                el.removeEventListener('mouseenter', onEnter);
                el.removeEventListener('mouseleave', onLeave);
                el.addEventListener('mouseenter', onEnter);
                el.addEventListener('mouseleave', onLeave);
            });
        };

        attach();
        const mo = new MutationObserver(attach);
        mo.observe(document.body, { childList: true, subtree: true });

        return () => {
            document.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(rafId);
            mo.disconnect();
        };
    }, []);

    return (
        <div className="home-container">
            {/* Custom cursor */}
            <div className="cursor-dot"  ref={cursorDotRef}  aria-hidden="true" />
            <div className="cursor-ring" ref={cursorRingRef} aria-hidden="true">
                <div className="cursor-ring-inner" />
            </div>

            {/* Background stack */}
            <div className="base-bg" aria-hidden="true" />
            <SpaceBackground />

            {/* Grain filter */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
                <filter id="grainFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </svg>
            <div className="grain-overlay" aria-hidden="true" />

            <Navbar
                theme={theme}
                links={SECTIONS[theme]}
                onToggleTheme={() => setTheme(t => t === 'professional' ? 'personal' : 'professional')}
            />

            <main>
                <div id="hero"><Hero /></div>
                {SECTIONS[theme].map(({ id, Component }) => (
                    <div id={id} key={id}><Component /></div>
                ))}
                <div id="contact"><Contact /></div>
            </main>

            {/* Personal-mode arcade easter-egg (PiP launcher → fullscreen game) */}
            {theme === 'personal' && <RocketHunt />}
        </div>
    );
};

export default Home;
