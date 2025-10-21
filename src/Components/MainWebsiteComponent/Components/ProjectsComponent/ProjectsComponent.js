import React, { useRef } from "react";
import "./ProjectsComponent.css";

function ProjectsComponent({ shouldAnimate = false }) {
    const projectsSectionRef = useRef(null);

    // Sample project data - you can update these later
    const projects = [
        {
            id: 1,
            title: "E-Commerce Platform",
            description: "A full-stack e-commerce application with React frontend, Node.js backend, and MongoDB database. Features include user authentication, shopping cart, payment integration, and admin dashboard.",
            technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe API"],
            image: "https://via.placeholder.com/400x250?text=E-Commerce+Platform",
            githubUrl: "https://github.com/yourusername/ecommerce-platform",
            liveUrl: "https://your-ecommerce-demo.com",
            featured: true
        },
        {
            id: 2,
            title: "Task Management App",
            description: "A collaborative task management application built with React and Firebase. Includes real-time updates, team collaboration, drag-and-drop functionality, and deadline tracking.",
            technologies: ["React", "Firebase", "Material-UI", "Redux"],
            image: "https://via.placeholder.com/400x250?text=Task+Management",
            githubUrl: "https://github.com/yourusername/task-manager",
            liveUrl: "https://your-taskmanager-demo.com",
            featured: true
        },
        {
            id: 3,
            title: "Weather Dashboard",
            description: "A responsive weather dashboard that displays current weather conditions and forecasts. Built with vanilla JavaScript and integrates with multiple weather APIs for accurate data.",
            technologies: ["JavaScript", "HTML5", "CSS3", "Weather API"],
            image: "https://via.placeholder.com/400x250?text=Weather+Dashboard",
            githubUrl: "https://github.com/yourusername/weather-dashboard",
            liveUrl: "https://your-weather-demo.com",
            featured: false
        },
        {
            id: 4,
            title: "Portfolio Website",
            description: "A modern, responsive portfolio website built with React. Features smooth animations, dynamic content, and optimized performance. The site you're currently viewing!",
            technologies: ["React", "CSS3", "JavaScript", "React Router"],
            image: "https://via.placeholder.com/400x250?text=Portfolio+Website",
            githubUrl: "https://github.com/yourusername/portfolio",
            liveUrl: "https://your-portfolio.com",
            featured: false
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
                            {project.liveUrl && (
                                <a 
                                    href={project.liveUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="project-link live-link"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span>Live Demo</span>
                                </a>
                            )}
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
