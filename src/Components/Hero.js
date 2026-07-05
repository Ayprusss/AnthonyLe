import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const ease = [0.16, 1, 0.3, 1];

const ottawaTime = () =>
    new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date());

// Live clock for the title-block DATE cell — drafting office local time.
const LocalClock = () => {
    const [time, setTime] = useState(ottawaTime);

    useEffect(() => {
        const id = setInterval(() => setTime(ottawaTime()), 1000);
        return () => clearInterval(id);
    }, []);

    return <span className="tb-clock">{time} ET</span>;
};

// Cover sheet — giant title, drawing index, title block.
const Hero = ({ sections = [] }) => {
    const index = [...sections, { id: 'contact', label: 'contact' }];

    return (
        <section className="hero-section">
            {/* Issue line */}
            <motion.div
                className="hero-eyebrow"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease }}
            >
                <span className="hero-status-dot" />
                COMPUTER SCIENCE · UOTTAWA · ISSUED FOR REVIEW · 2026
            </motion.div>

            {/* Cover title — solid line over outline line */}
            <div className="hero-name-block">
                <motion.span
                    className="hero-name-first"
                    initial={{ opacity: 0, x: -48 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 0.3, ease }}
                >
                    ANTHONY
                </motion.span>
                <motion.span
                    className="hero-name-last"
                    initial={{ opacity: 0, x: 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 0.46, ease }}
                >
                    LE
                </motion.span>
            </div>

            {/* Drawing index + actions */}
            <motion.div
                className="hero-lower"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.72, ease }}
            >
                <div className="hero-index">
                    <p className="hero-index-caption">DRAWING INDEX</p>
                    <ul className="hero-index-list">
                        {index.map(({ id, label }, i) => (
                            <li key={id}>
                                <Link to={id} smooth duration={600} className="hero-index-row">
                                    <span className="hero-index-sht">SHT {String(i + 2).padStart(2, '0')}</span>
                                    <span className="hero-index-label">{label}</span>
                                    <span className="hero-index-dots" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="hero-actions">
                    <Link to={index[0]?.id || 'contact'} smooth duration={600} className="btn-primary">
                        VIEW WORK <ArrowRight size={13} strokeWidth={2.4} />
                    </Link>
                    <Link to="contact" smooth duration={600} className="hero-btn-quiet">
                        GET IN TOUCH
                    </Link>
                </div>
            </motion.div>

            {/* Title block */}
            <motion.div
                className="hero-titleblock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05, duration: 0.8 }}
            >
                <div className="tb-cell">
                    <span className="tb-label">Drawn by</span>
                    <span className="tb-value">ANTHONY LE</span>
                </div>
                <div className="tb-cell">
                    <span className="tb-label">Location</span>
                    <span className="tb-value">OTTAWA, CA</span>
                </div>
                <div className="tb-cell">
                    <span className="tb-label">Date</span>
                    <span className="tb-value"><LocalClock /></span>
                </div>
                <div className="tb-cell">
                    <span className="tb-label">Scale</span>
                    <span className="tb-value">NTS</span>
                </div>
                <div className="tb-cell tb-cell-sht">
                    <span className="tb-label">Sheet</span>
                    <span className="tb-value">01 / 06</span>
                </div>
            </motion.div>

            {/* Drafting convention: the set continues */}
            <motion.p
                className="hero-continued"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
            >
                CONTINUED ON SHT 02 ↓
            </motion.p>
        </section>
    );
};

export default Hero;
