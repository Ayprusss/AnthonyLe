import React from 'react';
import './Home.css';
import Navbar from '../../Components/Navbar';
import Hero from '../../Components/Hero';
import Skills from '../../Components/Skills';
import Projects from '../../Components/Projects';
import Experience from '../../Components/Experience';
import Contact from '../../Components/Contact';

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
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
