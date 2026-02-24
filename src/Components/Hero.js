import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-scroll';
import './Hero.css';
import HeroRippleBackground from './HeroRippleBackground';

const TypewriterText = ({ text }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prevText => prevText + text[currentIndex]);
                setCurrentIndex(prevIndex => prevIndex + 1);
            }, 150);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text]);

    return (
        <span style={{ display: 'inline-block' }}>
            {currentText}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                style={{ marginLeft: '2px', fontWeight: 'normal', color: 'var(--text-main)' }}
            >
                |
            </motion.span>
        </span>
    );
};

const Hero = () => {
    return (
        <section className="hero-section">
            <motion.div
                className="hero-ripple-layer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <HeroRippleBackground />
            </motion.div>

            <div className="hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="hero-title">
                        Hi, I'm <TypewriterText text="Anthony." /> <br />
                        <span className="text-muted">4th Year Comp Sci @ uOttawa.</span>
                    </h1>
                    <p className="hero-subtitle">
                        SDE Intern @ Magnet Forensics, Exploring different worlds of Software Engineering.
                    </p>
                    <div className="hero-actions">
                        <Link to="projects" smooth={true} duration={500} className="btn-primary">
                            View Projects
                        </Link>
                        <Link to="contact" smooth={true} duration={500} className="btn-secondary">
                            Contact Me
                        </Link>
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
            >
                <Link to="skills" smooth={true} duration={500}>
                    <ArrowDown className="bounce" size={24} />
                </Link>
            </motion.div>
        </section>
    );
};

export default Hero;

