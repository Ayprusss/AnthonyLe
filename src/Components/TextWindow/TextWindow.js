import React from "react";
import "./TextWindow.css";
import "98.css";
import { Rnd } from "react-rnd";

import Resume from "../ResumeWindow/resume.pdf";
function TextWindow() {


    return(
        <Rnd>
            <div className="window">
            <div className="title-bar">
                <div className="title-bar-text">Hi there!</div>
                <div className="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Maximize"></button>
                    <button aria-label="Close"></button>
                </div>
            </div>
            <div className="window-body">
                <p> <strong>Hi there!</strong> 
                <br></br>
                <br></br>
                My name is Anthony Le, and I am currently a 
                Third-year computer science student at the University of Ottawa! 
                <br></br>
                <br></br>
                Check out what my website 
                has to offer!</p>
                <br></br>
                <ul className="tree-view">
                    <li><strong>Table of Contents:</strong></li>
                    <br></br>
                    <li>About me
                        <ul>
                            <li>My Resume <u><a href={Resume} target="_blank" rel="noreferrer noopener">(click here to download it!)</a></u> </li>
                            <li>my goals</li>
                            <li>my Interests</li>
                        </ul>
                    </li>
                    <li>
                        Experience
                        <ul>
                            <li>Projects</li>
                            <li>Professional Experience</li>
                            <li>Extra-curriculars</li>
                        </ul>
                    </li>
                    <li>Contact Me!</li>
                </ul>
            </div>
            
        </div>
        </Rnd>
        
    );
}



export default TextWindow;