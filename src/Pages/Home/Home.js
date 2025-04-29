import React from "react";
import './Home.css';
import Taskbar from "../../Components/TaskBar/Taskbar.js";
import PhotoWindow from "../../Components/PhotoWindow/PhotoWindow.js";
import TextWindow from "../../Components/TextWindow/TextWindow.js";
import ResumeWindow from "../../Components/ResumeWindow/ResumeWindow.js";
import StartDropdown from "../../Components/StartDropdown/StartDropdown.js";
import ClippyHelper from "../../Components/ClippyHelper/ClippyHelper.js";
import {useState} from "react";
import MusicPlayer from "../../Components/MusicPlayer/MusicPlayer.js";
function Home() {

    const [isTextWindowVisible, setTextWindowVisible] = useState(true);

    const closeTextWindow = () => {
        setTextWindowVisible(false);
    }

    return(
        <div>
            <div className="home">
                <div className="home-container">
                    <div className="home-left">
                    </div>
                    <div className="home-right">
                    <MusicPlayer />
                    <ClippyHelper />
                    </div>
                </div>

                {isTextWindowVisible && (
                    <TextWindow onClick={closeTextWindow}/>
                )}
                <Taskbar />
            </div>
        </div>
    );
}


export default Home;
