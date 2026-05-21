import { motion } from 'framer-motion';
import { TextScramble } from './ui/TextScramble';
import './Volunteering.css';

// TODO: replace placeholder descriptions with real copy (user-supplied).
const activities = [
    {
        role: "Hackathon Organizer",
        organization: "uOttaHack",
        period: "2024 - Present",
        description: "Placeholder — describe your role helping run uOttaHack: what you organized, the scale of the event, and what you contributed to the community."
    },
    {
        role: "Member",
        organization: "SESA (Software Engineering Student Association)",
        period: "2023 - Present",
        description: "Placeholder — describe your involvement with SESA: events, initiatives, and the impact you had on fellow students."
    },
];

const Volunteering = () => {
    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <TextScramble text="Volunteering." as="h2" className="section-title" inView />
                <div className="section-divider"></div>
                <p className="section-subtitle">
                    Communities and causes I give my time to.
                </p>
            </motion.div>

            <div className="volunteering-timeline">
                {activities.map((item, idx) => (
                    <motion.div
                        className="vol-item"
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                    >
                        <div className="vol-content">
                            <div className="vol-header">
                                <h3 className="vol-role">{item.role}</h3>
                                <span className="vol-period">{item.period}</span>
                            </div>
                            <h4 className="vol-org">{item.organization}</h4>
                            <p className="vol-description">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Volunteering;
