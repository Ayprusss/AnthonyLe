import React from "react";
import "98.css";
import "./AboutComponent.css";
import { Rnd } from "react-rnd";
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
                    <p>Hi there! My name is XYZ. I am a passionate Software Engineer with a keen interest in creating . 
                        I have experience in various web technologies including React, JavaScript, HTML, and CSS.
                         In my free time, I enjoy learning new programming languages and exploring the latest trends in web development.</p>
                </div>
            </div>
        </Rnd>
    );
}


export default AboutComponent;