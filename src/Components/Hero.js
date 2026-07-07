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

const ottawaDate = () =>
    new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Toronto',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    }).format(new Date()).toUpperCase();

// Live clock in the service header — studio local time.
const LocalClock = () => {
    const [time, setTime] = useState(ottawaTime);

    useEffect(() => {
        const id = setInterval(() => setTime(ottawaTime()), 1000);
        return () => clearInterval(id);
    }, []);

    return <span className="hero-clock">{time}</span>;
};

// Fastext key colours, in remote-control order.
const FASTEXT = ['red', 'green', 'yellow', 'cyan'];

// Page 100 — the service index.
const Hero = ({ sections = [] }) => {
    const index = [...sections, { id: 'contact', label: 'contact' }];
    // Four fastext keys: the first three pages plus contact.
    const fastext = [...sections.slice(0, 3), { id: 'contact', label: 'contact' }];

    return (
        <section className="hero-section">
            {/* Service header bar */}
            <motion.div
                className="hero-ceefax"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease }}
            >
                <span className="hero-ceefax-page">P100</span>
                <span className="hero-ceefax-svc">CH·741 ANTHONY LE SERVICE</span>
                <span className="hero-ceefax-fill" />
                <span className="hero-ceefax-date">{ottawaDate()}</span>
                <LocalClock />
            </motion.div>

            {/* Status line */}
            <motion.div
                className="hero-eyebrow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease }}
            >
                <span className="hero-status-dot" />
                COMPUTER SCIENCE · UOTTAWA · NOW BROADCASTING · 2026
            </motion.div>

            {/* Headline — double-height rows on service colour */}
            <div className="hero-name-block">
                <motion.span
                    className="hero-name-first"
                    initial={{ opacity: 0, x: -48 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease }}
                >
                    ANTHONY
                </motion.span>
                <motion.span
                    className="hero-name-last"
                    initial={{ opacity: 0, x: 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.55, ease }}
                >
                    LE
                </motion.span>
            </div>

            {/* Page index + actions */}
            <motion.div
                className="hero-lower"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.78, ease }}
            >
                <div className="hero-index">
                    <p className="hero-index-caption">PAGE INDEX</p>
                    <ul className="hero-index-list">
                        {index.map(({ id, label }, i) => (
                            <li key={id}>
                                <Link to={id} smooth duration={600} className="hero-index-row">
                                    <span className="hero-index-label">{label}</span>
                                    <span className="hero-index-dots" aria-hidden="true" />
                                    <span className="hero-index-page">{i + 2}00</span>
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

            {/* Studio status row */}
            <motion.div
                className="hero-titleblock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05, duration: 0.8 }}
            >
                <div className="tb-cell">
                    <span className="tb-label">Broadcast by</span>
                    <span className="tb-value">ANTHONY LE</span>
                </div>
                <div className="tb-cell">
                    <span className="tb-label">Studio</span>
                    <span className="tb-value">OTTAWA, CA</span>
                </div>
                <div className="tb-cell">
                    <span className="tb-label">Time</span>
                    <span className="tb-value"><LocalClock /> ET</span>
                </div>
                <div className="tb-cell">
                    <span className="tb-label">Status</span>
                    <span className="tb-value tb-onair">ON AIR</span>
                </div>
                <div className="tb-cell tb-cell-page">
                    <span className="tb-label">Page</span>
                    <span className="tb-value">100 / 600</span>
                </div>
            </motion.div>

            {/* Fastext row — the coloured keys on the remote */}
            <motion.div
                className="hero-fastext"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6, ease }}
            >
                {fastext.map(({ id, label }, i) => (
                    <Link
                        key={id}
                        to={id}
                        smooth
                        duration={600}
                        className={`fastext-key fastext-${FASTEXT[i]}`}
                    >
                        {label}
                    </Link>
                ))}
            </motion.div>
        </section>
    );
};

export default Hero;
