import React from "react";
import './Home.css';
import Taskbar from "../../Components/TaskBar/Taskbar.js";

function Home() {
    return(
        <div>
            <div className="home">
                <Taskbar />
            </div>
        </div>
    );
}


export default Home;
