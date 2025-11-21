import React, { useState } from "react";
import './Home.css';
import Taskbar from "../../Components/TaskBar/Taskbar.js";
import PhotoWindow from "../../Components/PhotoWindow/PhotoWindow.js";
import TextWindow from "../../Components/TextWindow/TextWindow.js";
import ResumeWindow from "../../Components/ResumeWindow/ResumeWindow.js";
import StartDropdown from "../../Components/StartDropdown/StartDropdown.js";
import ClippyHelper from "../../Components/ClippyHelper/ClippyHelper.js";
import MusicPlayer from "../../Components/MusicPlayer/MusicPlayer.js";
import MainWebsiteComponent from "../../Components/MainWebsiteComponent/MainWebsiteComponent.js";

function Home() {
    const [mainWebsiteVisible, setMainWebsiteVisible] = useState(false);
    const [mainWebsiteOpen, setMainWebsiteOpen] = useState(false);
    const [wasMaximized, setWasMaximized] = useState(false); // Track if it was maximized when minimized

    const handleMainWebsiteOpen = () => {
        setMainWebsiteOpen(true);
        setMainWebsiteVisible(true);
        setWasMaximized(false);
    };

    const handleMainWebsiteMinimize = (isCurrentlyMaximized) => {
        setMainWebsiteVisible(false);
        setWasMaximized(isCurrentlyMaximized); // Store the maximized state
    };

    const handleMainWebsiteRestore = () => {
        setMainWebsiteVisible(true);
        // The wasMaximized state will be passed to component to restore
    };

    const handleMainWebsiteClose = () => {
        setMainWebsiteVisible(false);
        setMainWebsiteOpen(false);
        setWasMaximized(false); // Reset when closed
    };

    return(
        <div>
            <div className="home">
                <div className="home-container">
                    <div className="home-left">
                    </div>
                    <div className="home-right">
                    <MusicPlayer />
                    </div>
                </div>

                {/*isTextWindowVisible && (
                    <TextWindow onClick={closeTextWindow}/>
                )*/}

                {mainWebsiteVisible && mainWebsiteOpen && (
                    <MainWebsiteComponent 
                        onMinimize={handleMainWebsiteMinimize}
                        onClose={handleMainWebsiteClose}
                        restoreMaximized={wasMaximized}
                    />
                )}
                
                <Taskbar 
                    mainWebsiteOpen={mainWebsiteOpen}
                    mainWebsiteVisible={mainWebsiteVisible}
                    onMainWebsiteRestore={handleMainWebsiteRestore}
                    onMainWebsiteOpen={handleMainWebsiteOpen}
                />
            </div>
        </div>
    );
}

export default Home;
