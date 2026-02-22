import React from 'react';
import { motion } from 'framer-motion';
import './Skills.css';

const skillCategories = [
    {
        title: "Frontend",
        skills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "TailwindCSS", "Framer Motion"]
    },
    {
        title: "Backend",
        skills: ["Node.js", "Python", "SQL", "PostgreSQL", "REST APIs"]
    },
    {
        title: "Tools & Cloud",
        skills: ["Git", "GitHub", "AWS", "Vercel", "Docker", "Postman"]
    },
    {
        title: "Design",
        skills: ["Figma", "UI/UX Design", "Responsive Web Design"]
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const Skills = () => {
    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="section-title">Skills.</h2>
                <div className="section-divider"></div>
                <p className="section-subtitle">
                    Technologies and tools I work with to build digital products.
                </p>
            </motion.div>

            <div className="skills-categories-container">
                {skillCategories.map((category, catIndex) => (
                    <motion.div
                        key={catIndex}
                        className="skill-category"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                    >
                        <h3 className="skill-category-title">{category.title}</h3>
                        <motion.div
                            className="skills-grid"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            {category.skills.map((skill, index) => (
                                <motion.div key={index} className="skill-pill" variants={itemVariants}>
                                    {skill}
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Skills;
