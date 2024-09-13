import React from "react";
import './Home.css';
import Taskbar from "../../Components/TaskBar/Taskbar.js";
import PhotoWindow from "../../Components/PhotoWindow/PhotoWindow.js";
import TextWindow from "../../Components/TextWindow/TextWindow.js";
function Home() {
    return(
        <div>
            <div className="home">
                <PhotoWindow />
                <TextWindow />
                <Taskbar />
            </div>
        </div>
    );
}


export default Home;
