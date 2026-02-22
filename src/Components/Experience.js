import React from 'react';
import { motion } from 'framer-motion';
import './Experience.css';

const experiences = [
    {
        role: "Software Developer Intern",
        company: "Magnet Forensics",
        period: "September 2025 - Present",
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

const Experience = () => {
    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="section-title">Experience.</h2>
                <div className="section-divider"></div>
            </motion.div>

            <div className="experience-timeline">
                {experiences.map((exp, idx) => (
                    <motion.div
                        className="timeline-item"
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                    >
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="timeline-header">
                                <h3 className="role-title">{exp.role}</h3>
                                <span className="period">{exp.period}</span>
                            </div>
                            <h4 className="company-name">{exp.company}</h4>
                            <p className="role-description">{exp.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Experience;
