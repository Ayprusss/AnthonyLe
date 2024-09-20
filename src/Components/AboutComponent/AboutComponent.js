import React from "react";
import "98.css";
import "./AboutComponent.css";

function AboutComponent() {


    return(
        <div className="window">
            <div className="title-bar">
                <div className="title-bar-text">About Me</div>
                <div className="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Maximize"></button>
                    <button aria-label="Close"></button>
                </div>
            </div>
            <div class="window-body">
                
            </div>
        </div>


    );
}