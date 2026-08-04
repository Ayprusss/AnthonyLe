import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

// The terminal's index screen: a folder column down the left, the
// operator's record on the right. Everything the machine knows about
// who's logged in, laid out the way a Seegson set lays it out.

const ease = [0.16, 1, 0.3, 1];

const stationDate = () =>
    new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Toronto',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    }).format(new Date()).toUpperCase();

const stationTime = () =>
    new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date());

// Station local time, ticking.
const LocalClock = () => {
    const [time, setTime] = useState(stationTime);

    useEffect(() => {
        const id = setInterval(() => setTime(stationTime()), 1000);
        return () => clearInterval(id);
    }, []);

    return <span className="hero-clock">{time}</span>;
};

const Hero = ({ sections = [] }) => {
    const folders = [...sections, { id: 'contact', label: 'contact' }];

    return (
        <section className="hero-section">
            {/* Where you are in the machine. */}
            <motion.div
                className="hero-path"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease }}
            >
                <span className="hero-path-node">NODE 741</span>
                {/* The middle of the path drops away on narrow screens —
                    the node and where you are still read. */}
                <span className="hero-path-mid">SEEGSON</span>
                <span className="hero-path-sep hero-path-mid">{'//'}</span>
                <span className="hero-path-mid">PERSONAL TERMINAL</span>
                <span className="hero-path-sep">{'//'}</span>
                <span>ROOT</span>
                <span className="hero-path-fill" />
                <span className="hero-path-date">{stationDate()}</span>
            </motion.div>

            <div className="hero-body">
                {/* Folder column — the terminal's own index. */}
                <motion.aside
                    className="hero-folders"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.45, ease }}
                >
                    <p className="hero-folders-cap">FOLDERS</p>
                    <ul className="hero-folders-list">
                        {folders.map(({ id, label }, i) => (
                            <li key={id}>
                                <Link to={id} smooth duration={600} className="hero-folder">
                                    <span className="hero-folder-ref">{String(i + 2).padStart(2, '0')}</span>
                                    <span className="hero-folder-name">{label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </motion.aside>

                <div className="hero-main">
                    <motion.div
                        className="hero-eyebrow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3, ease }}
                    >
                        <span className="hero-status-dot" />
                        COMPUTER SCIENCE · UOTTAWA · SESSION ACTIVE · 2026
                    </motion.div>

                    {/* The operator. Inverse video for the given name, lit
                        phosphor for the surname — the set's two ways of
                        shouting, used once each. */}
                    <div className="hero-name-block">
                        <motion.span
                            className="hero-name-first"
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease }}
                        >
                            ANTHONY
                        </motion.span>
                        <motion.span
                            className="hero-name-last"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.55, ease }}
                        >
                            LE
                        </motion.span>
                    </div>

                    <motion.div
                        className="hero-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.78, ease }}
                    >
                        <Link to={folders[0]?.id || 'contact'} smooth duration={600} className="btn-primary">
                            OPEN FIRST FOLDER <ArrowRight size={13} strokeWidth={2.4} />
                        </Link>
                        <Link to="contact" smooth duration={600} className="hero-btn-quiet">
                            SEND A MESSAGE
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Operator record — what the terminal reports about this session. */}
            <motion.div
                className="hero-titleblock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05, duration: 0.8 }}
            >
                <div className="tb-cell">
                    <span className="tb-label">Terminal user</span>
                    <span className="tb-value">ANTHONY LE</span>
                </div>
                <div className="tb-cell">
                    <span className="tb-label">Station</span>
                    <span className="tb-value">OTTAWA, CA</span>
                </div>
                <div className="tb-cell">
                    <span className="tb-label">Local time</span>
                    <span className="tb-value"><LocalClock /> ET</span>
                </div>
                <div className="tb-cell">
                    <span className="tb-label">Session</span>
                    <span className="tb-value tb-online">ONLINE</span>
                </div>
                <div className="tb-cell tb-cell-page">
                    <span className="tb-label">Folders</span>
                    <span className="tb-value">{folders.length} AVAILABLE</span>
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
