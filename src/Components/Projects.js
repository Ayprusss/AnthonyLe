import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink } from 'lucide-react';
import './Projects.css';

const projects = [
    {
        title: 'Gladius',
        description:
            'A multi-agent AI pipeline utilizing three different instances of the Claude Code CLI. Orchestrates complex tasks through planning, execution, and review phases with an interactive REPL.',
        tech: ['Python', 'Claude Code', 'Pydantic'],
        github: 'https://github.com/Ayprusss/Gladius',
    },
    {
        title: 'dejavu',
        description:
            'A full webstore project mocking "Vuja De" — a complete e-commerce experience with a dedicated backend and frontend, featuring product browsing, and a modern storefront UI.',
        tech: ['JavaScript', 'CSS', 'HTML', 'Express', 'Supabase', 'Vite.js', 'Stripe'],
        github: 'https://github.com/Ayprusss/dejavu',
        live: 'https://dejavustudio.xyz/'
    },
    {
        title: '"PPPTAILORINGCOURIER"',
        description:
            'A UI-focused webstore mock built for SEG 3125, featuring a tailoring courier service interface with an integrated chatbot, responsive design, and a polished user experience.',
        tech: ['JavaScript', 'CSS', 'HTML', 'React'],
        github: 'https://github.com/Ayprusss/PPPTAILORINGCOURIER',
        live: 'https://ppptailoringcourier.vercel.app/',
    },
    {
        title: 'Crux',
        description: 'A full-stack web application that serves as a comprehensive climbing map platform, allowing users to discover, share, and manage climbing locations worldwide.',
        tech: ['Next.js', 'Tailwind CSS', 'MapLibre GL', 'Supabase', 'PostGIS'],
        github: 'https://github.com/Ayprusss/crux',
    }
];

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

            <div className="projects-grid">
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
                                {project.github && (
                                    <a href={project.github} target="_blank" rel="noreferrer">
                                        <Github size={20} />
                                    </a>
                                )}
                                {project.live && (
                                    <a href={project.live} target="_blank" rel="noreferrer">
                                        <ExternalLink size={20} />
                                    </a>
                                )}
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
            </div>
        </section>
    );
};

export default Projects;
