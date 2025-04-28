import React from "react";
import "98.css";
import "./AboutComponent.css";
import { Rnd } from "react-rnd";
import resume from "../ResumeWindow/resume.pdf";
function AboutComponent( { onClose }) {


    return(
        <Rnd>
            <div className="window">
                <div className="title-bar">
                    <div className="title-bar-text">About Me</div>
                    <div className="title-bar-controls">
                        <button aria-label="Minimize"></button>
                        <button aria-label="Maximize"></button>
                        <button aria-label="Close" onClick={onClose}></button>
                    </div>
                </div>
                <div className="window-body">
                    <p>Hi there!<b> My name is Anthony Le.</b></p>
                    <p>I am currently a third-year student studying Computer Science at the Univeristy of Ottawa. I am an aspiring <b>Software Engineer</b> with vast experience around <b>web development. </b>
                      I also have experience in <b>Mobile App Development, Data Science and some Machine Learning.</b></p>
                    
                    <p>My main goal is to become a full-stack developer, and I am currently gaining experience with <b>back-end development</b> and am looking for internships or co-op opportunities to gain more experience in the field.</p>
                    <br></br>
                    <p>For the time being, my website is still in development. Please feel free to check out <a href={resume} rel="noreferrer" target="_blank">my resume</a> for my experience and information.</p>
                    <br></br>
                    <p>Want to contact me? <b>Click Here!</b></p>
                </div>
            </div>
        </Rnd>
    );
}


export default AboutComponent;