import React, { useState } from "react";
import "98.css";
import windowslogo from "./Windows_Logo_(1992-2001).svg.png";
import "./StartButton.css";



function StartButton() {


    
    return(

        <div className="start-menu">
            <div className="start-button-div">
                        <button className="start-button windows-box-shadow" id="start-bar-button">
                            <img src= {windowslogo} id="start-logo" alt="windows '91-01 logo"/>
                            <p className="logo-text">Start</p>
                        </button>
                    </div>
        </div>
    );
}


export default StartButton;