import React from "react";
import "98.css";
import "./PhotoWindow.css";

import PortfolioPhoto1 from "./portfolioPhoto.jpg"

import { Rnd } from "react-rnd";

function photoWindow( { onClose }) {


    // maybe implement multiple photos as a slideshow later on

    return(

        <Rnd>
            <div class="window"> 
            <div className="title-bar photoWindow">
            <div className="title-bar-text ">Anthony Le</div>
            <div className="title-bar-controls">
                <button aria-label="Close" onClick={onClose}></button>
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
