import { motion } from 'framer-motion';
import { TextScramble } from './ui/TextScramble';
import './About.css';

// TODO: replace placeholder copy with real bio + facts (user-supplied).
const paragraphs = [
    "Placeholder bio paragraph one. A short narrative about who I am beyond the resume — what drew me to building things, and the kind of work that keeps me curious.",
    "Placeholder bio paragraph two. A little on where I'm based, what I'm exploring right now, and what I care about outside of shipping code.",
];

const facts = [
    { label: "Based in", value: "Ottawa, Canada" },
    { label: "Currently", value: "Software Developer Intern" },
    { label: "Studying", value: "Computer Science" },
    { label: "Off the clock", value: "Climbing, photography, travel" },
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
                    The person behind the portfolio.
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
        </section>
    );
};

export default About;
