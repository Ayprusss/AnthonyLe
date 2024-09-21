import React from "react";
import './Home.css';
import Taskbar from "../../Components/TaskBar/Taskbar.js";
import PhotoWindow from "../../Components/PhotoWindow/PhotoWindow.js";
import TextWindow from "../../Components/TextWindow/TextWindow.js";
import StartDropdown from "../../Components/StartDropdown/StartDropdown.js";
import ResumeWindow from "../../Components/ResumeWindow/ResumeWindow.js";
function Home() {
    return(
        <div>
            <div className="home">
                <div className="right"></div>
                <div className="center"></div>
                <div className="left"></div>
                <PhotoWindow />
                <TextWindow />
                <StartDropdown />
                <ResumeWindow />
                <Taskbar />
            </div>
        </div>
    );
}


export default Home;
