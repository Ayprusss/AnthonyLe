import React, { useEffect, useState } from 'react';
import './Home.css';
import Navbar from '../../Components/Navbar';
import Hero from '../../Components/Hero';
import Skills from '../../Components/Skills';
import Projects from '../../Components/Projects';
import Experience from '../../Components/Experience';
import Contact from '../../Components/Contact';

const Home = () => {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('site-mode') === 'light' ? 'light' : 'dark';
    } catch (error) {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    try {
      localStorage.setItem('site-mode', mode);
    } catch (error) {
      // Ignore storage failures and keep current mode in memory.
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
      <Navbar
        mode={mode}
        onToggleMode={() => setMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'))}
      />
      <main>
        <div id="hero"><Hero /></div>
        <div id="skills"><Skills /></div>
        <div id="projects"><Projects /></div>
        <div id="experience"><Experience /></div>
        <div id="contact"><Contact /></div>
      </main>
    </div>
  );
};

export default Home;
