import React from 'react';
import { Section } from './ui/Section';
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
        title: 'dejavu',
        description:
            'A full webstore project mocking "Vuja De" — a complete e-commerce experience with a dedicated backend and frontend, featuring product browsing, and a modern storefront UI.',
        tech: ['JavaScript', 'CSS', 'HTML', 'Express', 'Supabase', 'Vite.js', 'Stripe'],
        github: 'https://github.com/Ayprusss/dejavu',
    },
    {
        title: 'Nine Vicious Detector',
        description: 'A real-time computer vision app detecting two of underground rapper Nine Vicious\'s famous hand signs from a live webcam feed using a custom-trained YOLOv7n model, opening up a corresponding youtube music video per sign.',
        // 'OpenCV' appeared twice in this list; the duplicate is dropped
        // so the tech names can key off themselves.
        tech: ['Python', 'yaml', 'OpenCV', 'Ultralytics - YOLOv8n', 'Roboflow', 'Pytorch-ROCm 7.2.1', 'MediaPipe', 'stdlib webbrowser'],
        github: 'https://github.com/Ayprusss/9-vicious-detector',
    },
    {
        title: '"PPPTAILORINGCOURIER"',
        description:
            'A UI-focused webstore mock built for SEG 3125, featuring a tailoring courier service interface with an integrated chatbot, responsive design, and a polished user experience.',
        tech: ['JavaScript', 'CSS', 'HTML', 'React'],
        github: 'https://github.com/Ayprusss/PPPTAILORINGCOURIER',
        live: 'https://ppptailoringcourier.vercel.app/',
    },
];

// Links are labelled by where they go rather than by an icon, because
// "Source" and "Live site" are two different promises and a pair of
// unlabelled glyphs makes the reader guess which is which.
const ProjectLinks = ({ project }) => (
    <div className="link-row proj-links">
        {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer">
                Source<span className="sr-only"> for {project.title}</span>
            </a>
        )}
        {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer">
                Live site<span className="sr-only"> for {project.title}</span>
            </a>
        )}
    </div>
);

// The first project is given room and the rest are a list. Five equal
// panels tell a reader that five things matter equally, which is never
// true — ranking them is the most useful thing this section can do.
const Projects = () => {
    const [lead, ...rest] = projects;

    return (
        <>
            <Section title="Projects." />

            <article className="lead-record">
                <h3 className="lead-title">{lead.title}</h3>
                <p className="lead-body">{lead.description}</p>
                <p className="inline-list proj-tech">
                    {lead.tech.map((t) => <span key={t}>{t}</span>)}
                </p>
                <ProjectLinks project={lead} />
            </article>

            <div className="records">
                {rest.map((project) => (
                    <article className="record" key={project.title}>
                        <h3 className="rec-title">{project.title}</h3>
                        <p className="rec-body">{project.description}</p>
                        <p className="inline-list proj-tech">
                            {project.tech.map((t) => <span key={t}>{t}</span>)}
                        </p>
                        <ProjectLinks project={project} />
                    </article>
                ))}
            </div>
        </>
    );
};

export default Projects;
