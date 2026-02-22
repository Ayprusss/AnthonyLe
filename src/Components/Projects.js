import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Frown } from 'lucide-react';
import './Projects.css';

// const projects = [
// ];

const Projects = () => {
    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="section-title">Projects.</h2>
                <div className="section-divider"></div>
            </motion.div>

            {/* <div className="projects-grid">
                {projects.map((project, idx) => (
                    <motion.div
                        className="project-card"
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                        <div className="project-header">
                            <h3 className="project-title">{project.title}</h3>
                            <div className="project-links">
                                <a href={project.github} target="_blank" rel="noreferrer"><Github size={20} /></a>
                                <a href={project.live} target="_blank" rel="noreferrer"><ExternalLink size={20} /></a>
                            </div>
                        </div>
                        <p className="project-description">{project.description}</p>
                        <div className="project-tech">
                            {project.tech.map((t, i) => (
                                <span key={i}>{t}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div> */}

            <motion.div
                className="projects-empty"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6rem 0',
                    color: 'var(--text-muted)',
                    gap: '1rem'
                }}
            >
                <Frown size={48} strokeWidth={1.5} />
                <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>projects to come.</p>
            </motion.div>
        </section>
    );
};

export default Projects;
