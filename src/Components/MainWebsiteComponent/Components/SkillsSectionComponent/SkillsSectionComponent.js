import React, { useRef } from "react";
import "./SkillsSectionComponent.css";

function SkillsSectionComponent({ shouldAnimate = false }) { 
    const skillsSectionRef = useRef(null);

    // Sample data for skills - you can update these later
    const languages = [
        { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
        { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
        { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
        { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
        { name: 'C++', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
        { name: 'C#', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' }
    ];

    const frameworks = [
        { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
        { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
        { name: 'Express', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
        { name: 'Angular', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
        { name: 'Vue.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
        { name: 'Django', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg' }
    ];

    const developerTools = [
        { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
        { name: 'VS Code', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
        { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
        { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
        { name: 'MySQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
        { name: 'AWS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg' }
    ];

    // Animation functions for hover effects
    const handleMouseEnter = (e) => {
        const element = e.currentTarget;
        const skillName = element.querySelector('.skill-name');
        
        // Animate to white background with black text
        element.style.transition = 'all 0.3s ease';
        element.style.background = 'white';
        element.style.transform = 'translateY(-5px) scale(1.05)';
        element.style.boxShadow = '0 8px 20px rgba(255, 255, 255, 0.3)';
        element.style.border = '1px solid rgba(255, 255, 255, 0.8)';
        
        // Specifically animate the text to black
        if (skillName) {
            skillName.style.transition = 'color 0.3s ease';
            skillName.style.color = 'black';
        }
    };

    const handleMouseLeave = (e) => {
        const element = e.currentTarget;
        const skillName = element.querySelector('.skill-name');
        
        // Animate back to transparent
        element.style.transition = 'all 0.3s ease';
        element.style.background = 'transparent';
        element.style.transform = 'translateY(0) scale(1)';
        element.style.boxShadow = 'none';
        element.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        
        // Specifically animate the text back to white
        if (skillName) {
            skillName.style.transition = 'color 0.3s ease';
            skillName.style.color = 'white';
        }
    };

    const renderSkillTable = (skills, title) => (
        <div className="skill-category">
            <h3 className="category-title">{title}</h3>
            <div className="skills-grid">
                {skills.map((skill, index) => (
                    <div 
                        key={index} 
                        className="skill-item"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <img 
                            src={skill.icon} 
                            alt={skill.name}
                            className="skill-icon"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64x64?text=' + skill.name.charAt(0);
                            }}
                        />
                        <span className="skill-name">{skill.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return(
        <div className="skills-section" ref={skillsSectionRef}>
            <h1 className="skills-header">Skills</h1>
            <div className="skills-container">
                {renderSkillTable(languages, "Programming Languages")}
                {renderSkillTable(frameworks, "Frameworks & Libraries")}
                {renderSkillTable(developerTools, "Developer Tools & Technologies")}
            </div>
        </div>
    );
};

export default SkillsSectionComponent;