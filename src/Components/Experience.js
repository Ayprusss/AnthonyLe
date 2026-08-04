import { motion } from 'framer-motion';
import { SectionHeader } from './ui/SectionHeader';
import './Experience.css';

const experiences = [
    {
        role: "Data Analyst Intern",
        company: "Canada Revenue Agency",
        period: "June 2026 - Present",
        description: ""
    },
    {
        role: "Software Developer Intern",
        company: "Magnet Forensics",
        period: "September 2025 - April 2026",
        description: "Working on the Magnet AXIOM product, contributing to the development and maintenance of the software."
    },
    {
        role: "Software Developer Intern",
        company: "University of Ottawa",
        period: "January 2025 - April 2025",
        description: "Developed and maintained the university's co-op portal as well as various co-op related tools and services for students."
    },
    {
        role: "Software Engineering Intern",
        company: "Canada Revenue Agency",
        period: "September 2023 - August 2024",
        description: "Developed, tested and maintained various UI infrastructure and products for Government products and services."
    }
];

// Revision table: every posting is a revision of the engineer.
// Latest revision carries the highest number, drafting-style.
const Experience = () => {
    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <SectionHeader
                    title="Experience."
                    meta={`service record · ${experiences.length} entries`}
                />
            </motion.div>

            <div className="rule-table rev-table">
                <div className="rule-table-head rev-head">
                    <span>Ref</span>
                    <span>Period</span>
                    <span>Record</span>
                </div>

                {experiences.map((exp, idx) => (
                    <motion.div
                        className="rev-row"
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                        <span className="rev-no">
                            {String(experiences.length - idx).padStart(2, '0')}
                        </span>
                        <span className="rev-period">{exp.period}</span>
                        <div className="rev-body">
                            <h3 className="rev-role">{exp.role}</h3>
                            <h4 className="rev-company">{exp.company}</h4>
                            {exp.description && (
                                <p className="rev-description">{exp.description}</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Experience;
