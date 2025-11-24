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
        { name: 'C#', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
        { name: 'HTML', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'}, 
        { name: 'Prolog', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prolog/prolog-original.svg' },
        { name: 'Go', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg' },
        { name: 'SQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
        { name: 'XML', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xml/xml-original.svg' },
    ];

    const frameworks = [
        { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
        { name: 'React.JS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
        { name: 'React Native', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
        { name: 'React Redux', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg' },
        { name: 'Redux Saga', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg' },
        { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
        { name: 'Express.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
        { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
        { name: 'Angular', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
        { name: 'Vue.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
        { name: 'Spring Boot', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
        { name: 'Jasmine', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jasmine/jasmine-plain.svg' },
        { name: 'Karma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/karma/karma-original.svg' },
        { name: 'Maven', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/maven/maven-original.svg' },
        { name: 'Axios', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg' },
        { name: 'MudBlazor', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blazor/blazor-original.svg' }
    ];

    const developerTools = [
        { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
        { name: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
        { name: 'VS Code', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
        { name: 'Visual Studio', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-plain.svg' },
        { name: 'Android Studio', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/androidstudio/androidstudio-original.svg' },
        { name: 'Eclipse', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eclipse/eclipse-original.svg' },
        { name: 'Notepad++', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/notepadplusplus/notepadplusplus-original.svg' },
        { name: 'Cursor', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
        { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
        { name: 'Kubernetes', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },
        { name: 'Jenkins', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg' },
        { name: 'Firebase', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg' },
        { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
        { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
        { name: 'MySQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
        { name: 'Postman', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' },
        { name: 'JIRA', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg' },
        { name: 'Bash', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg' },
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