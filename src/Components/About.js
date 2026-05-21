import { motion } from 'framer-motion';
import { TextScramble } from './ui/TextScramble';

import './About.css';

// TODO: replace placeholder copy with real bio + facts (user-supplied).
const paragraphs = [
    "I am a fourth-year Computer Science student at the University of Ottawa. After finishing my Software Developer Internship at Magnet Forensics, I am now currently on summer break exploring more about the world of Computer Science and relaxing at home.",
    "I am based in Ottawa, Ontario, and hope to explore the world in the future. After hours, I enjoy Rock climbing, Gaming, Music (Particularly Underground Rap), Hiking, Exercising and Fashion.",
];

const facts = [
    { label: "Based in", value: "Ottawa, Canada" },
    { label: "Currently", value: "Stuck on top of Mt. Fuji" },
    { label: "Studying", value: "Computer Science" },
    { label: "Off the clock", value: "Climbing, Fashion, Gaming, Exercising, Hiking, Music" },
];

const About = () => {
    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <TextScramble text="About." as="h2" className="section-title" inView />
                <div className="section-divider"></div>
                <p className="section-subtitle">
                    Computer Science Student at the University of Ottawa.
                </p>
            </motion.div>

            <div className="about-content">
                <motion.div
                    className="about-bio"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {paragraphs.map((text, idx) => (
                        <p className="about-paragraph" key={idx}>{text}</p>
                    ))}
                </motion.div>

                <div className="about-rail">
                    {/* TODO: drop a real portrait at public/about-portrait.jpg (4:5 crop). Until then the NO SIGNAL placeholder shows. */}
                    <motion.figure
                        className="about-portrait"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <div className="about-portrait-frame">
                            <img
                                src="/about-portrait.jpg"
                                alt="Anthony Le"
                                className="about-portrait-img"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="about-portrait-placeholder" aria-hidden="true">
                                <span className="about-portrait-ph-label">NO SIGNAL</span>
                            </div>
                            <span className="about-portrait-scan" aria-hidden="true"></span>
                        </div>
                        <figcaption className="about-portrait-caption">
                            <span className="about-portrait-tag">FIG.01</span>
                            <span>Anthony Le — Ottawa</span>
                        </figcaption>
                    </motion.figure>

                    <motion.div
                        className="about-facts-wrap"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <dl className="about-facts">
                            {facts.map((fact, idx) => (
                                <div className="about-fact" key={idx}>
                                    <dt className="about-fact-label">{fact.label}</dt>
                                    <dd className="about-fact-value">{fact.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
