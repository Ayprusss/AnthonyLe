import React, { useEffect, useState } from 'react';
import './Home.css';
import '../../Components/GrainOverlay.css';
import Navbar from '../../Components/Navbar';
import Hero from '../../Components/Hero';
import Skills from '../../Components/Skills';
import Projects from '../../Components/Projects';
import Experience from '../../Components/Experience';
import Resume from '../../Components/Resume';
import Contact from '../../Components/Contact';
import VectorPaintingBackground from '../../Components/VectorVanGogh/VectorPaintingBackground';

const Home = () => {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('site-mode') === 'light' ? 'light' : 'dark';
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    try {
      localStorage.setItem('site-mode', mode);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-section', 'hero');

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          document.documentElement.setAttribute('data-section', entry.target.id);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('main > div[id]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-container">
      {/* ── Global background layers ── */}
      <div 
        className="base-bg" 
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -3,
          backgroundColor: 'var(--bg-color)',
          transition: 'background-color 0.8s ease'
        }}
      />
      <VectorPaintingBackground />

      {/* SVG filter definition (invisible) */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="grainFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="saturate"
            values="0"
          />
        </filter>
      </svg>
      <div className="grain-overlay" aria-hidden="true" />

      {/* ── Navigation ── */}
      <Navbar
        mode={mode}
        onToggleMode={() => setMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'))}
      />

      {/* ── Content sections ── */}
      <main>
        <div id="hero"><Hero /></div>
        <div id="skills"><Skills /></div>
        <div id="projects"><Projects /></div>
        <div id="experience"><Experience /></div>
        <div id="resume"><Resume /></div>
        <div id="contact"><Contact /></div>
      </main>
    </div>
  );
};

export default Home;
