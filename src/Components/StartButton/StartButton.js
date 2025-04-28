import React, { useState } from "react";
import "98.css";
import windowslogo from "./Windows_Logo_(1992-2001).svg.png";
import "./StartButton.css";
import StartDropdown from "../StartDropdown/StartDropdown";
import AboutComponent from "../AboutComponent/AboutComponent";
import PhotoWindow from "../PhotoWindow/PhotoWindow";
import ResumeWindow from "../ResumeWindow/ResumeWindow";
import ExperienceComponent from "../ExperienceComponent/ExperienceComponent";
import ContactComponent from "../ContactComponent/ContactComponent";

function StartButton() {
    const [isStartMenuVisible, setIsStartMenuVisible] = useState(false);
    const [isPhotoVisible, setPhotoVisible] = useState(false);
    const [isAboutVisible, setAboutVisible] = useState(false);
    const [isResumeVisible, setResumeVisible] = useState(false);
    const [isContactVisible, setContactVisible] = useState(false);
    const [isExperienceVisible, setExperienceVisible] = useState(false);

    const handleStartButtonClick = () => {
        setIsStartMenuVisible(!isStartMenuVisible);
    };

    const handleResumeVisibility = (value) => {
        console.log('Setting resume visibility to: ', value);
        setResumeVisible(value);
    }

    const handlePhotoVisibility = (value) => {
        console.log('Setting photo visibility to: ', value);
        setPhotoVisible(value);
    }

    const handleAboutVisibility = (value) => {
        console.log('Setting about visibility to: ', value);
        setAboutVisible(value);
    }

    const handleExperienceVisibility = (value) => {
        console.log('Setting experience visibility to: ', value);
        setExperienceVisible(value);

    }

    const handleContactVisibility = (value) => {
        console.log('Setting photo visibility to: ', value);
        setContactVisible(value);
    }

    return (
        <div className="start-button-div">
            <button className="start-button windows-box-shadow" id="start-bar-button" onClick={handleStartButtonClick}>
                <img src={windowslogo} id="start-logo" alt="windows '91-01 logo" />
                <p className="logo-text">Start</p>
            </button>
            {isStartMenuVisible && (
                <StartDropdown
                    setPhotoVisible={handlePhotoVisibility}
                    setAboutVisible={handleAboutVisibility}
                    setResumeVisible={handleResumeVisibility}
                    setExperienceVisible={handleExperienceVisibility}
                    setContactVisible={handleContactVisibility}
                />
            )}
            {isPhotoVisible && (
                <div className="altered-window2">
                    <PhotoWindow onClose={() => handlePhotoVisibility(false)}/>
                </div>            
            )}

            
            {isAboutVisible && (
                <div className="altered-window3">
                    <AboutComponent onClose={() => handleAboutVisibility(false)}/>
                </div>
            )}
            {isResumeVisible && (
                <div className="altered-window1">
                    <ResumeWindow onClose={() => handleResumeVisibility(false)}/>
                </div>
            )}
            

            {isExperienceVisible && (
                <div className="altered-window1">
                    <ExperienceComponent onClose={() => handleExperienceVisibility(false)}/>
                </div>
            )}

            {isContactVisible && (
                <div className="altered-window2">
                    <ContactComponent onClose={() => handleContactVisibility(false)}/>
                </div>
            )}
            {/*Need to add the same behaviour; onClick behaviours for all  */}
            {/* {isExperienceVisible && <ExperienceComponent />} */}
            {/* {isContactVisible && <ContactComponent />} */}
        </div>
    );
}

export default StartButton;