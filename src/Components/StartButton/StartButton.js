import React, {useState} from "react";
import "98.css";
import windowslogo from "./Windows_Logo_(1992-2001).svg.png";
import "./StartButton.css";
import StartDropdown from "../StartDropdown/StartDropdown";




function StartButton() {

    const[isStartMenuVisible, setIsStartMenuVisible] = useState(false);

    const handleStartButtonClick = () => {
        setIsStartMenuVisible(!isStartMenuVisible);
    };
    
    return(
        <div className="start-button-div">
                    <button className="start-button windows-box-shadow" id="start-bar-button" onClick={handleStartButtonClick}>
                        <img src= {windowslogo} id="start-logo" alt="windows '91-01 logo"/>
                        <p className="logo-text">Start</p>
                    </button>
                    {isStartMenuVisible && <StartDropdown />}
                </div>
    );
}


export default StartButton;