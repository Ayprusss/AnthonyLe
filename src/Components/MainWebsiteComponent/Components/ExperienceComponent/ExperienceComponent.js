import React, { useRef } from "react";
import "./ExperienceComponent.css";

function ExperienceComponent({ shouldAnimate = false }) {
    const experienceSectionRef = useRef(null);

    // Experience data - you can update these with your actual experience
    const experiences = [
        {
            id: 1,
            title: "Bachelor of Science - Computer Science Student",
            company: "University of Ottawa",
            duration: "Sept 2022 - Apr 2027",
            location: "Ottawa, ON",
            description: "Developed responsive web applications using React and Node.js. Collaborated with senior developers on feature implementation and bug fixes. Participated in agile development processes and code reviews.",
            technologies: [],
            type: "education",
            current: true
        },
        {
            id: 2,
            title: "Software Engineering Intern",
            company: "Canada Revenue Agency",
            duration: "Sep 2023 - Aug 2024",
            location: "Ottawa, ON",
            description: "Built and maintained client websites using modern web technologies. Worked closely with design team to implement pixel-perfect UI components. Optimized website performance and accessibility.",
            technologies: ["HTML5", "CSS3", "JavaScript", "React", "WordPress"],
            type: "internship",
            current: false
        },
        {
            id: 3,
            title: "Community Coordinator",
            company: "UOttaHack VI",
            duration: "Oct 2023 - Jan 2024",
            location: "Ottawa, ON",
            description: "Pursuing Bachelor's degree in Computer Science with focus on software engineering and web development. Relevant coursework includes Data Structures, Algorithms, Database Systems, and Software Engineering.",
            technologies: ["Java", "Python", "C++", "SQL", "Data Structures"],
            type: "academic",
            current: false
        },
        {
            id: 4,
            title: "Director Of Logistics",
            company: "uOttaHack VII",
            duration: "Mar 2024 - Jan 2025",
            location: "Ottawa, ON",
            description: "Created custom websites and web applications for small businesses and personal clients. Managed complete project lifecycle from requirements gathering to deployment and maintenance.",
            technologies: ["React", "Node.js", "MongoDB", "Express", "AWS"],
            type: "academic",
            current: false
        },
        {
            id: 5,
            title: "Full-Stack Developer Intern",
            company: "University of Ottawa",
            duration: "Jan 2025 - Apr 2025",
            location: "Ottawa, ON",
            description: "Assisted students in introductory programming courses. Conducted lab sessions, graded assignments, and provided one-on-one tutoring for struggling students.",
            technologies: ["Java", "Python", "Teaching", "Mentoring"],
            type: "internship",
            current: false
        },
        {
            id: 6,
            title: "Full-Stack Developer Intern",
            company: "Magnet Forensics",
            duration: "Sep 2025 - Apr 2026",
            location: "Ottawa, ON",
            description: "Assisted students in introductory programming courses. Conducted lab sessions, graded assignments, and provided one-on-one tutoring for struggling students.",
            technologies: ["Java", "Python", "Teaching", "Mentoring"],
            type: "internship",
            current: true
        }
    ];

    // Sort experiences by start date (most recent first)
    const sortedExperiences = experiences.sort((a, b) => {
        // Simple sorting based on duration string - in real implementation you'd use proper dates
        return b.id - a.id;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'internship':
                return '🎓';
            case 'part-time':
                return '💼';
            case 'education':
                return '📚';
            case 'freelance':
                return '🚀';
            case 'academic':
                return '👨‍🏫';
            default:
                return '💼';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'internship':
                return 'rgba(100, 151, 188, 0.3)';
            case 'part-time':
                return 'rgba(76, 175, 80, 0.3)';
            case 'education':
                return 'rgba(156, 39, 176, 0.3)';
            case 'freelance':
                return 'rgba(255, 152, 0, 0.3)';
            case 'academic':
                return 'rgba(63, 81, 181, 0.3)';
            default:
                return 'rgba(100, 151, 188, 0.3)';
        }
    };

    // Animation functions for hover effects
    const handleExperienceMouseEnter = (e) => {
        const element = e.currentTarget;
        const card = element.querySelector('.experience-card');
        
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translateY(-5px) scale(1.02)';
        
        if (card) {
            card.style.transition = 'all 0.3s ease';
            card.style.background = 'rgba(255, 255, 255, 0.1)';
            card.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            card.style.boxShadow = '0 10px 25px rgba(255, 255, 255, 0.15)';
        }
    };

    const handleExperienceMouseLeave = (e) => {
        const element = e.currentTarget;
        const card = element.querySelector('.experience-card');
        
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translateY(0) scale(1)';
        
        if (card) {
            card.style.transition = 'all 0.3s ease';
            card.style.background = 'rgba(255, 255, 255, 0.05)';
            card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            card.style.boxShadow = 'none';
        }
    };

    const renderExperienceItem = (experience, index) => (
        <div 
            key={experience.id} 
            className={`experience-item ${experience.current ? 'current' : ''}`}
            onMouseEnter={handleExperienceMouseEnter}
            onMouseLeave={handleExperienceMouseLeave}
            style={{ animationDelay: `${index * 0.2}s` }}
        >
            {/* Timeline connector */}
            <div className="timeline-connector">
                <div 
                    className="timeline-dot"
                    style={{ backgroundColor: getTypeColor(experience.type) }}
                >
                    <span className="timeline-icon">{getTypeIcon(experience.type)}</span>
                </div>
                {index < sortedExperiences.length - 1 && <div className="timeline-line"></div>}
            </div>

            {/* Experience card */}
            <div className="experience-card">
                <div className="experience-header">
                    <div className="experience-title-section">
                        <h3 className="experience-title">{experience.title}</h3>
                        <h4 className="experience-company">{experience.company}</h4>
                    </div>
                    <div className="experience-meta">
                        <span className="experience-duration">{experience.duration}</span>
                        <span className="experience-location">{experience.location}</span>
                        {experience.current && <span className="current-badge">Current</span>}
                    </div>
                </div>

                <p className="experience-description">{experience.description}</p>

                <div className="experience-technologies">
                    {experience.technologies.map((tech, techIndex) => (
                        <span 
                            key={techIndex} 
                            className="tech-tag"
                            style={{ backgroundColor: getTypeColor(experience.type) }}
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="experience-section" ref={experienceSectionRef}>
            <h1 className="experience-header">Experience</h1>
            <div className="experience-container">
                <div className="timeline-container">
                    {sortedExperiences.map((experience, index) => 
                        renderExperienceItem(experience, index)
                    )}
                </div>
            </div>
        </div>
    );
}

export default ExperienceComponent;
