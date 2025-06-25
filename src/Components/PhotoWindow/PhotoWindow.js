import React from "react";
import "98.css";
import "./PhotoWindow.css";
import {useState} from "react";
import { Rnd } from "react-rnd";

import photo1 from "./pfp.jpg";


function PhotoWindow( { onClose }) {


    // maybe implement multiple photos as a slideshow later on

    return(

        <Rnd
            default={{
                x: 100,
                y: 100,
                width: 400,
                height: 500,
            }}
            minWidth={300}
            minHeight={400}
            dragHandleClassName='title-bar'
        >
            <div class="window"> 
            <div className="title-bar photoWindow">
            <div className="title-bar-text ">Anthony Le</div>
            <div className="title-bar-controls">
                <button aria-label="Close" onClick={onClose}></button>
            </div>
            </div>
            <div className="window-body photo-container">
            <img 
                        src={photo1} 
                        alt={`Photo: photo1`}
                        className="photo"
                    />
                
                </div>
            </div>
        </Rnd>
        
    );
}


export default PhotoWindow;
