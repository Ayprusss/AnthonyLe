import React from "react";
import "98.css";
import "./PhotoWindow.css";

import "98.css"
import PortfolioPhoto1 from "./portfolioPhoto.jpg"

import { Rnd } from "react-rnd";
function photoWindow() {


    // maybe implement multiple photos as a slideshow later on

    return(

        <Rnd>
            <div class="window"> 
            <div className="title-bar photoWindow">
            <div className="title-bar-text ">Anthony Le</div>
            <div className="title-bar-controls">
                 <button aria-label="Minimize"></button>
                <button aria-label="Maximize"></button>
                <button aria-label="Close"></button>
            </div>
            </div>
            <div className="window-body">
                <img src={PortfolioPhoto1} className="photo" alt="beautiful me :3"/>
            </div>
        </div>
        </Rnd>
        
    );
}


export default photoWindow;
