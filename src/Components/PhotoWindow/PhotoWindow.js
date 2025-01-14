import React from "react";
import "98.css";
import "./PhotoWindow.css";
import {useState} from "react";
import { Rnd } from "react-rnd";

import photo1 from "./portfolioPhoto.jpg";
import photo2 from "./photo1.jpg";
import photo3 from "./photo8.jpg"
import photo4 from "./photo14.jpg";
import photo5 from "./photo6.jpg";
import photo6 from "./photo7.jpg";
import photo9 from "./photo9.jpg";
import photo10 from "./photo11.jpg";
import photo11 from "./photo13.jpg";
import photo12 from "./photo15.jpg";


function PhotoWindow( { onClose }) {


    // maybe implement multiple photos as a slideshow later on

    const photoJson = {
        1: photo1,
        2: photo2,
        3: photo3,
        4: photo4,
        5: photo5,
        6: photo6,
        7: photo9,
        8: photo10,
        9: photo11,
        10: photo12
    }

    const [photoIndex, setPhotoIndex] = useState(1);

    const handleNextPhoto = () => {
        setPhotoIndex(prevIndex => prevIndex === 10 ? 1 : prevIndex + 1);
    }

    const handlePreviousPhoto = () => {
        setPhotoIndex(prevIndex => prevIndex === 1 ? 10 : prevIndex - 1);
    }
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
                        src={photoJson[photoIndex]} 
                        alt={`Photo ${photoIndex}`}
                        className="photo"
                    />
                <div className="photo-controls">
                    <button onClick={handlePreviousPhoto}>Previous</button>
                    <span>{photoIndex} / 10</span>
                    <button onClick={handleNextPhoto}>Next</button>
                </div> 
                </div>
            </div>
        </Rnd>
        
    );
}


export default PhotoWindow;
