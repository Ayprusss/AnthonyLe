import React from "react";
import "98.css";
import "./PhotoWindow.css";

function photoWindow() {
    return(
        <div class="window" style="width: 300px"> 
            <div className="title-bar photoWindow">
            <div className="title-bar-text ">{}</div>
                <button aria-label="Minimize"></button>
                <button aria-label="Maximize"></button>
                <button aria-label="Close"></button>
            </div>
        </div>
    );
}


export default photoWindow;
