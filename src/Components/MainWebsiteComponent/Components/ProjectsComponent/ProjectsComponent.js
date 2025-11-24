import React, { useRef } from "react";
import "./ProjectsComponent.css";

import photo1 from "./ppptailoringcourier.png";
import photo2 from "./ehotels.png";
import photo3 from "./AnthonyLe.png";

function ProjectsComponent({ shouldAnimate = false }) {
    const projectsSectionRef = useRef(null);

    // Sample project data - you can update these later
    const projects = [
        {
            id: 1,
            title: "PPPTAILORINGCOURIER",
            description: "A front-end focused website made in React mimicking a clothing brand that provides tailoring services. Provides Minimalist design upholding UI principles and features and AI chatbot. Backend and Admin page on its way.",
            technologies: ["React", "CSS", "HTML", "UI Principles"],
            image: photo1,
            githubUrl: "https://github.com/Ayprusss/PPPTAILORINGCOURIER",
            liveUrl: "https://ppptailoringcourier.vercel.app/home",
            featured: true
        },
        {
            id: 2,
            title: "eHotels",
            description: "A full-stack project made with a PERN stack showcasing a hotel reservation website. Features both a client and admin side and has full ",
            technologies: ["React", "Firebase", "Material-UI", "Redux"],
            image: photo2,
            githubUrl: "https://github.com/Ayprusss/eHotels-Project",
            liveUrl: null,
            featured: true
        },
        {
            id: 3,
            title: "Health Management App",
            description: "Mobile App made with Java showcasing a management app for a hospital for both client and admin.",
            technologies: ["Java", "Android Studio"],
            image: "https://via.placeholder.com/400x250?text=Weather+Dashboard",
            githubUrl: "https://github.com/Ayprusss/Health-Management-App",
            liveUrl: null,
            featured: false
        },
        {
            id: 4,
            title: "Portfolio Website",
            description: "The site you're currently viewing!",
            technologies: ["React", "CSS3", "JavaScript", "HTML"],
            image: photo3,
            githubUrl: "https://github.com/Ayprusss/AnthonyLe",
            liveUrl: "https://ayprusss.dev",
            featured: true
        }
    ];

    // Animation functions for hover effects
    const handleProjectMouseEnter = (e) => {
        const element = e.currentTarget;
        const projectCard = element.querySelector('.project-card');
        
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translateY(-8px) scale(1.02)';
        
        if (projectCard) {
            projectCard.style.transition = 'all 0.3s ease';
            projectCard.style.background = 'rgba(255, 255, 255, 0.1)';
            projectCard.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            projectCard.style.boxShadow = '0 12px 30px rgba(255, 255, 255, 0.15)';
        }
    };

    const handleProjectMouseLeave = (e) => {
        const element = e.currentTarget;
        const projectCard = element.querySelector('.project-card');
        
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translateY(0) scale(1)';
        
        if (projectCard) {
            projectCard.style.transition = 'all 0.3s ease';
            projectCard.style.background = 'rgba(255, 255, 255, 0.05)';
            projectCard.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            projectCard.style.boxShadow = 'none';
        }
    };

    const renderProjectCard = (project) => (
        <div 
            key={project.id} 
            className={`project-item ${project.featured ? 'featured' : ''}`}
            onMouseEnter={handleProjectMouseEnter}
            onMouseLeave={handleProjectMouseLeave}
        >
            <div className="project-card">
                <div className="project-image-container">
                    <img 
                        src={project.image} 
                        alt={project.title}
                        className="project-image"
                        onError={(e) => {
                            e.target.src = `https://via.placeholder.com/400x250?text=${encodeURIComponent(project.title)}`;
                        }}
                    />
                    <div className="project-overlay">
                        <div className="project-links">
                            {project.githubUrl && (
                                <a 
                                    href={project.githubUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="project-link github-link"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span>GitHub</span>
                                </a>
                            )}
                            <div 
                                className={`project-link live-link ${!project.liveUrl ? 'crossed-out' : ''}`}
                                onClick={project.liveUrl ? (e) => e.stopPropagation() : undefined}
                            >
                                {project.liveUrl ? (
                                    <a 
                                        href={project.liveUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="live-demo-link"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span>Live Demo</span>
                                    </a>
                                ) : (
                                    <span>Live Demo</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    
                    <div className="project-technologies">
                        {project.technologies.map((tech, index) => (
                            <span key={index} className="tech-tag">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="projects-section" ref={projectsSectionRef}>
            <h1 className="projects-header">Projects</h1>
            <div className="projects-container">
                <div className="projects-grid">
                    {projects.map(project => renderProjectCard(project))}
                </div>
            </div>
        </div>
    );
}

export default ProjectsComponent;
