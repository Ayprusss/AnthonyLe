import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './ui/SectionHeader';
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
        title: 'Crux',
        description: 'A full-stack web application that serves as a comprehensive climbing map platform, allowing users to discover, share, and manage climbing locations worldwide.',
        tech: ['Next.js', 'Tailwind CSS', 'MapLibre GL', 'Supabase', 'PostGIS', 'TypeScript', 'HTML'],
        github: 'https://github.com/Ayprusss/crux',
    },
    {
        title: 'Nine Vicious Detector',
        description: 'A real-time computer vision app detecting two of underground rapper Nine Vicious\'s famous hand signs from a live webcam feed using a custom-trained YOLOv7n model, opening up a corresponding youtube music video per sign.',
        tech: ['Python', 'yaml', 'OpenCV', 'Ultralytics - YOLOv8n', 'Roboflow', 'Pytorch-ROCm 7.2.1', 'OpenCV', 'MediaPipe', 'stdlib webbrowser'],
        github: 'https://github.com/Ayprusss/9-vicious-detector',
    }
];

const DETAIL_LETTERS = 'ABCDEFGHIJ';

// Each project is a detail drawing: callout bubble, notes, materials strip.
const Projects = () => {
    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <SectionHeader
                    title="Projects."
                    meta={`${projects.length} programmes · ${projects.filter(p => p.live).length} on air`}
                />
            </motion.div>

            <div className="detail-grid">
                {projects.map((project, idx) => (
                    <motion.div
                        className="detail-panel"
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: (idx % 2) * 0.12 }}
                    >
                        <header className="detail-top">
                            <span className="detail-bubble" aria-hidden="true">
                                {DETAIL_LETTERS[idx]}
                            </span>
                            <span className="detail-caption">PROG. {DETAIL_LETTERS[idx]}</span>
                            {project.live && <span className="detail-asbuilt">ON AIR</span>}
                            <span className="detail-top-fill" />
                            <div className="detail-links">
                                {project.github && (
                                    <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} source on GitHub`}>
                                        <Github size={16} />
                                    </a>
                                )}
                                {project.live && (
                                    <a href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} live site`}>
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        </header>

                        <h3 className="detail-title">{project.title}</h3>
                        <p className="detail-description">{project.description}</p>

                        <footer className="detail-matl">
                            <span className="detail-matl-label">MATL</span>
                            <span className="detail-matl-list">
                                {project.tech.map((t, i) => (
                                    <span key={i}>{t}</span>
                                ))}
                            </span>
                        </footer>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Projects;
