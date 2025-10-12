import React, {useState, useEffect} from "react";
import "./Taskbar.css";
import "98.css";

import StartButton from "../StartButton/StartButton.js";
function Taskbar() {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const currentTime = `${hours}:${minutes}:${seconds}`;
            console.log("current time: ", currentTime);
            setTime(currentTime);
        };  
        

        updateTime();
        const intervalId = setInterval(updateTime, 1000);


        return () => clearInterval(intervalId);
    }, []);
    

    //For now, clock will NOT be a separate component. That will change later on.
    return(
        <div className="taskbar windows-box-shadow">
            <div className="taskbar-left">
                <StartButton />
            </div>  
            <div className="taskbar-center">
            </div>
            <div className="taskbar-right"> 
                <div className="clock windows-box-shadow">
                    <div id="show-time" className="clock-text">
                        {time}
                    </div>
                </div>
            </div>
        </div>
    );
}



export default Taskbar;