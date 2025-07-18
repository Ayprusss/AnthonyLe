import React from 'react';
import "98.css";
import "./ExperienceComponent.css";
import { Rnd } from "react-rnd";
import { useState } from "react";
import MiniExperienceComponent from "../MiniExperienceComponent/MiniExperienceComponent";


function ExperienceComponent({ onClose }) {


    const [isExpInfoComponentVisible, setExpInfoComponentVisible] = useState(false);
    const [selectedItemData, setSelectedItemData] = useState(null);

    const openExpInfoComponent = (data) => {
        setSelectedItemData(data);
        setExpInfoComponentVisible(true);

    }
    const closeExpInfoComponent = () => {
        setExpInfoComponentVisible(false);
        setSelectedItemData(null);
    };


    const internshipsList = {
        "1": {
            title: "Software Engineering Intern at University of Ottawa",
            description: "Developed full-stack C# services and modernized mobile app components using React Native and TypeScript to enhance the co-op platform's performance and usability.",
            date: "Jan. 2025 - Apr. 2025",
            experienceList: {
                "languages": "C#, TypeScript, JavaScript, SQL",
                "frameworks and libraries": "React redux, React Native, Axios, MudBlazor, Redux Saga, MVC Entity Framework",
                "Developer Tools and libraries": "Visual Studio, Visual Studio Codem Github, Microsoft SQL Server, JIRA",
            }
        },
        "2": {
            title: "Software Engineering Intern at Canada Revenue Agency",
            description: "Engineered Angular and Spring Boot components to modernize internal applications and improved testing efficiency by streamlining Angular unit tests with Jasmine and Karma.",
            date: "Sep. 2023 - Aug. 2024",
            experienceList: {
                "languages": "Java, TypeScript, HTML, CSS, SQL",
                "frameworks and libraries": "Angular, Spring Boot, Angular Material",
                "Developer Tools": "Eclipse, Visual Studio Code, Github, Microsoft SQL Server, Jenkins, JIRA",
            }
        },
    };

    const projectsList = {
    "1": {
        title: "Portfolio website",
        description: "This website! A personal portfolio website showcasing projects, experience contact information.",
        link: "",
        experienceList: {
            "languages": "HTML, CSS, JavaScript",
            "frameworks and libraries": "React, React-RND, React-PDF, React-Viewer",
            "Developer Tools": "Visual Studio Code, GitHub",
        },
    }, 
    "2": {
        title: "PPPTAILORINGCOURIER",
        description: "Front-end web application mimicking a tailoring courier and webstore business, simulating a real-world business.",
        link: "https://ppptailoringcourier.vercel.app/",
        experienceList: {
            "languages": "HTML, CSS, JavaScript",
            "frameworks and libraries": "React.js, OpenAI API",
            "Developer Tools": "Visual Studio Code, GitHub, HuggingFace Spaces, Amazon EC2",
        },
    },
    "3": {
        title: "Health App Management System",
        description: "Android Mobile Application allowing users and admins to manage, arrange and track appointments with doctors.",
        link: "https://github.com/Ayprusss/eHotels-Project",
        experienceList: {
            "languages": "Java, SQL, XML",
            "frameworks and libraries": "Firebase, MVC pattern",
            "Developer Tools": "Android Studio, GitHub",
        },
    }
    };

    const extracurricularsList = {
        "1": {
            title: "Logistics Team Leader at uOttaHack VII",
            description: "Leader role in charge of organizing, managing and overseeing the logistical aspects of uOttaHack VII, the largest hackathon in Ottawa.",
            pointsList : {
                "1": "Spearheaded logistics for Ottawa's largest hackathon, providing food, accommodations and merchandise for 850+ participants.",
                "2": "Supervised and supported team members, ensuring task completion and team flexibility while also facilitating problem-solving to address logistical challenges.",
                "3": "Led key logistical aspects of the three-day event, including food provisions, floor planning, organizer scheduling, and prize procurement.",
            }
        },
        "2": {
            title: "Community Team Coordinator at uOttaHack VI",
            description: "Coordinated community engagement and events for uOttaHack VI.",
            pointsList: {
                "1": "Planned and executed tech-focused and school-based events for the uOttaHack community, successfully attracting over 300 participants in the past year.",
                "2": "Coordinated a Computer Architecture study session, engaging more than 100 students+ and fostering collaborative learning.",
                "3": "Played a key role in organizing uOttaHack VI, Ottawa's Largest hackathon that provided networking, community-enriching and skill-building opportunities for 650 participants across Ontario."
            }

        },
        "3": {
            title: "Sponsorsship Member at SESA",
            description: "Sponsorship member at SESA, the Software Engineering Student Association at the University of Ottawa.",
        }
    };
    return (
        <Rnd
            default={{
                x: 100,
                y: 100,
                width: 600,
                height: 500,
            }}
            style={{zIndex: 100}}
            dragHandleClassName="title-bar"
            >
            <div className="window-div">
                <div className="window experience-window">
                    <div className="title-bar">
                        <div className="title-bar-text">My Experience</div>
                            <div className="title-bar-controls">
                                <button aria-label="Minimize"></button>
                                <button aria-label="Maximize"></button>
                                <button aria-label="Close" onClick={onClose}></button>
                            </div>
                        </div>
                    <div className="window-body experience-body">
                        <p className="experience-window-header"><strong>Experience</strong></p>
                        {/*  <p>list of experience, projects and extracurriculars done throughout my time at University.</p>*/}
                        <p>Please feel free to click on any of the items. Each item will bring you to a new window with <b>more details.</b></p>
                        <ul className="tree-view experience-list">
                            <li><strong>Internships</strong></li>
                            <ul>
                                {Object.values(internshipsList).map((internship, index) => (
                                    <li 
                                        key={index} 
                                        className="clickable-item"
                                        onClick={() => openExpInfoComponent(internship)}>
                                        {internship.title}
                                    </li>
                                ))}
                            </ul>
                            <br></br>
                            <li><strong>Projects</strong></li>
                            <ul>
                                {Object.values(projectsList).map((project, index) => (
                                    <li key={index}
                                        className="clickable-item"
                                        onClick={() => openExpInfoComponent(project)}>
                                        {project.title}
                                    </li>
                                ))}
                            </ul>
                            <br></br>
                            <li><strong>Extracurriculars</strong></li>
                            <ul>
                                {Object.values(extracurricularsList).map((extracurricular, index) => (
                                    <li key={index}
                                    className="clickable-item"
                                    onClick={() => openExpInfoComponent(extracurricular)}>
                                        {extracurricular.title}
                                    </li>
                                ))}
                            </ul>
                        </ul>   
                    </div>
                </div>

                {isExpInfoComponentVisible && (
                    <div>
                    <MiniExperienceComponent
                        onClose={closeExpInfoComponent}
                        data={selectedItemData} />
                    </div>
                )}
            </div>
        </Rnd>
        
    );
}


export default ExperienceComponent;