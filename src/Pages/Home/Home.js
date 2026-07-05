import React, { useEffect, useState, useRef } from 'react';
import { MotionConfig } from 'framer-motion';
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

// Section sets per print. Hero (cover sheet) and Contact (transmittal)
// bookend both sets; slots stay position-aligned so sheet numbers 01–06
// never shift between prints.
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

    const crossHRef = useRef(null);
    const crossVRef = useRef(null);
    const bubbleRef = useRef(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('site-theme', theme); } catch (_) {}
    }, [theme]);

    // Re-observe sections whenever the print swaps the rendered set.
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

    // Drafting crosshair: hairlines track instantly, the detail bubble lags.
    useEffect(() => {
        const h = crossHRef.current;
        const v = crossVRef.current;
        const bubble = bubbleRef.current;
        if (!h || !v || !bubble) return;

        let mouseX = 0, mouseY = 0;
        let bubX = 0, bubY = 0;
        let rafId = null;

        const onMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            h.style.transform = `translateY(${mouseY}px)`;
            v.style.transform = `translateX(${mouseX}px)`;
        };

        const lerp = (a, b, t) => a + (b - a) * t;

        const tick = () => {
            bubX = lerp(bubX, mouseX, 0.2);
            bubY = lerp(bubY, mouseY, 0.2);
            bubble.style.transform = `translate(${bubX}px, ${bubY}px)`;
            rafId = requestAnimationFrame(tick);
        };

        document.addEventListener('mousemove', onMove);
        rafId = requestAnimationFrame(tick);

        const onEnter = () => bubble.classList.add('hover');
        const onLeave = () => bubble.classList.remove('hover');

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
        <MotionConfig reducedMotion="user">
        <div className="home-container">
            {/* Drafting crosshair cursor */}
            <div className="crosshair-h" ref={crossHRef} aria-hidden="true" />
            <div className="crosshair-v" ref={crossVRef} aria-hidden="true" />
            <div className="cursor-bubble" ref={bubbleRef} aria-hidden="true">
                <div className="cursor-bubble-inner" />
            </div>

            {/* Background stack */}
            <div className="base-bg" aria-hidden="true" />
            <SpaceBackground />

            {/* Paper-tooth filter */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
                <filter id="grainFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </svg>
            <div className="grain-overlay" aria-hidden="true" />

            {/* Fixed drawing-sheet frame */}
            <div className="sheet-frame" aria-hidden="true">
                <span className="sheet-frame-tick top" />
                <span className="sheet-frame-tick bottom" />
            </div>

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
