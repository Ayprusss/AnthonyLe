import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Home.css';

import BootScene from '../../Components/BootScene';
import Rail from '../../Components/Rail';
import Overview from '../../Components/Overview';

import Experience from '../../Components/Experience';
import Projects from '../../Components/Projects';
import Skills from '../../Components/Skills';
import Resume from '../../Components/Resume';
import About from '../../Components/About';
import Hobbies from '../../Components/Hobbies';
import Volunteering from '../../Components/Volunteering';
import Contact from '../../Components/Contact';
import Ambient from '../../Components/Ambient';

// Two sessions of one page. Overview and Contact bookend both; the four
// sections between them are what changes, because what a hiring manager
// wants to know and what someone curious about the person wants to know
// are not the same four things.
//
// Professional leads with Experience — it is the first thing anyone
// scanning a portfolio looks for, and burying it under a skills dump
// costs the reader the one thing they came for.
const SECTIONS = {
    professional: [
        { id: 'experience',   label: 'Experience',   Component: Experience },
        { id: 'projects',     label: 'Projects',     Component: Projects },
        { id: 'skills',       label: 'Skills',       Component: Skills },
        { id: 'resume',       label: 'Résumé',       Component: Resume },
    ],
    personal: [
        { id: 'about',        label: 'About',        Component: About },
        { id: 'hobbies',      label: 'Hobbies',      Component: Hobbies },
        { id: 'volunteering', label: 'Volunteering', Component: Volunteering },
        { id: 'experience',   label: 'Experience',   Component: Experience },
    ],
};

const GROUND = { professional: '#ffffff', personal: '#000000' };

// Whether this visitor gets the boot and the inversion at all. False for
// reduced-motion viewers and in jsdom, where there is no matchMedia — so
// tests render the page directly with no overlay in the way.
const canAnimate = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The boot runs once per browser session, not once per page load.
const shouldBoot = () => {
    try {
        if (sessionStorage.getItem('booted')) return false;
    } catch (_) {}
    return canAnimate();
};

const Home = () => {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('site-theme') === 'personal' ? 'personal' : 'professional';
        } catch (_) {
            return 'professional';
        }
    });

    const [booting, setBooting] = useState(shouldBoot);
    const [activeId, setActiveId] = useState('overview');

    // The session swap is a single wipe of the incoming ground colour
    // travelling across the page. It is mounted only while it runs: when
    // it unmounts, the page underneath is already that exact colour, so
    // there is nothing to animate back out.
    const [wipe, setWipe] = useState(null);
    const swapTimer = useRef(null);

    const sections = SECTIONS[theme];
    const navItems = [
        { id: 'overview', label: 'Overview' },
        ...sections.map(({ id, label }) => ({ id, label })),
        { id: 'contact', label: 'Contact' },
    ];

    const switchTo = useCallback((next) => {
        if (next === theme || wipe) return;
        if (!canAnimate()) { setTheme(next); return; }

        // Cover first, swap underneath, then drop the cover.
        setWipe(GROUND[next]);
        swapTimer.current = setTimeout(() => {
            setTheme(next);
            setWipe(null);
        }, 300);
    }, [theme, wipe]);

    useEffect(() => () => clearTimeout(swapTimer.current), []);

    const handleBootDone = useCallback(() => {
        try { sessionStorage.setItem('booted', '1'); } catch (_) {}
        setBooting(false);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme === 'personal' ? 'dark' : 'light';
        try { localStorage.setItem('site-theme', theme); } catch (_) {}
    }, [theme]);

    // Hold the page still behind the boot overlay. The content is mounted
    // underneath the whole time so the boot's final wipe reveals a page
    // that is already laid out rather than one that pops in.
    useEffect(() => {
        if (!booting) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);
        return () => { document.body.style.overflow = previous; };
    }, [booting]);

    // Which section the reader is in. Measured from scroll position
    // rather than an IntersectionObserver: a section shorter than the
    // observer band never reports, and Contact is exactly that short.
    useEffect(() => {
        if (booting) return;
        let queued = false;

        const measure = () => {
            queued = false;
            const ids = ['overview', ...sections.map((s) => s.id), 'contact'];
            const line = 96; // just below the top bar

            // At the very bottom the last section may never reach the
            // line, so the end of the page always means the last entry.
            const atBottom =
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
            if (atBottom) { setActiveId(ids[ids.length - 1]); return; }

            let current = ids[0];
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= line) current = id;
            }
            setActiveId(current);
        };

        const onScroll = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [booting, sections]);

    return (
        <>
            <a className="skip-link" href="#main">Skip to content</a>

            <Rail
                theme={theme}
                items={navItems}
                activeId={activeId}
                onSwitch={switchTo}
            />

            <main id="main" className="content">
                <section id="overview" className="section">
                    <Overview theme={theme} />
                </section>

                {sections.map(({ id, Component }) => (
                    <section id={id} className="section" key={`${theme}-${id}`}>
                        <Component />
                    </section>
                ))}

                <section id="contact" className="section">
                    <Contact />
                </section>
            </main>

            <Ambient theme={theme} />

            {wipe && (
                <div className="swap-wipe" style={{ background: wipe }} aria-hidden="true" />
            )}

            {booting && <BootScene theme={theme} onComplete={handleBootDone} />}
        </>
    );
};

export default Home;
