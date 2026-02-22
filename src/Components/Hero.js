import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-scroll';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-section">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h1 className="hero-title">
                    Hi, I'm Anthony. <br />
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
