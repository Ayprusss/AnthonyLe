import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { ArrowRight } from 'lucide-react';
import { TextScramble } from './ui/TextScramble';
import './Hero.css';

const ease = [0.16, 1, 0.3, 1];

const Hero = () => (
    <section className="hero-section">
        {/* Status eyebrow */}
        <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
        >
            <span className="hero-status-dot" />
            <TextScramble text="COMPUTER SCIENCE · UOTTAWA · 2026" delay={150} />
        </motion.div>

        {/* Giant name block */}
        <div className="hero-name-block">
            <motion.span
                className="hero-name-first"
                initial={{ opacity: 0, x: -48 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease }}
            >
                <TextScramble text="ANTHONY" delay={300} />
            </motion.span>
            <motion.span
                className="hero-name-last"
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.46, ease }}
            >
                <TextScramble text="LE" delay={460} noColorChange />
            </motion.span>
        </div>

        {/* Bottom row: current role + CTAs */}
        <motion.div
            className="hero-bottom"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 6, delay: 0.72, ease }}
        >
            <div className="hero-role">
                <TextScramble text="CURRENTLY" as="span" className="hero-role-label" delay={720} />
                <TextScramble text="Exploring outer space..." as="span" className="hero-role-value" delay={780} />
            </div>
            <div className="hero-actions">
                <Link to="projects" smooth duration={600} className="hero-btn-primary">
                    VIEW WORK <ArrowRight size={13} strokeWidth={2} />
                </Link>
                <Link to="contact" smooth duration={600} className="hero-btn-secondary">
                    GET IN TOUCH
                </Link>
            </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
            className="hero-scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
        >
            <div className="hero-scroll-line" />
            <span>SCROLL</span>
        </motion.div>
    </section>
);

export default Hero;
