import React from "react";
import "98.css";
import clippyPng from "./clippy.png";
import "./ClippyHelper.css";

function ClippyHelper() {
    
    return(
        <div className="clippy-helper">
            <div className="left">
                <div className="clippy-text">
                    <p>Hi! I'm Clippy! I'm here to help you with your resume!</p>
                    <p>Click on the start button and select "Resume" to get started!</p>
                </div>
            </div>
            <div className="right">
                <img src={clippyPng} className="clippy" alt="clippy"></img>
            </div>
        </div>
    );
}


export default ClippyHelper;