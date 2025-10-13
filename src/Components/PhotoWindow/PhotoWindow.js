import React from "react";
import "98.css";
import "./PhotoWindow.css";
import {useState} from "react";
import { Rnd } from "react-rnd";

import photo1 from "./pfp.jpg";


//NOTE: USE THIS AS REFERENCE IF YOU WANT TO MAKE MORE RESIZEABLE AND ADJUSTABLE COMPONENTS

function PhotoWindow( { onClose }) {
    const [windowState, setWindowState] = useState({
        x: 100,
        y: 100,
        width: 400,
        height: 500
    });

    const handleDrag = (e, data) => {
        setWindowState(prev => ({
            ...prev,
            x: data.x,
            y: data.y
        }));
    };

    const handleResize = (e, direction, ref, delta, position) => {
        setWindowState({
            x: position.x,
            y: position.y,
            width: ref.offsetWidth,
            height: ref.offsetHeight
        });
    };

    return(
        <Rnd
            size={{ width: windowState.width, height: windowState.height }}
            position={{ x: windowState.x, y: windowState.y }}
            minWidth={300}
            minHeight={400}
            dragHandleClassName='title-bar'
            onDrag={handleDrag}
            onResize={handleResize}
            enableResizing={true}
        >
            <div className="window"> 
                <div className="title-bar photoWindow">
                    <div className="title-bar-text">Anthony Le</div>
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
