import React from "react";
import './Home.css';
import Taskbar from "../../Components/TaskBar/Taskbar.js";
import PhotoWindow from "../../Components/PhotoWindow/PhotoWindow.js";
import TextWindow from "../../Components/TextWindow/TextWindow.js";
import ResumeWindow from "../../Components/ResumeWindow/ResumeWindow.js";
import StartDropdown from "../../Components/StartDropdown/StartDropdown.js";
import ClippyHelper from "../../Components/ClippyHelper/ClippyHelper.js";

function Home() {
    return(
        <div>
            <div className="home">
                <div className="home-container">

                    <div className="home-left">
                    </div>
                    <div className="home-right">
                    <ClippyHelper />
                    </div>
                </div>
                <TextWindow />
                <Taskbar />
            </div>
        </div>
    );
}


export default Home;
