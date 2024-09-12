import React, {useState, useEffect} from "react";
import "./Taskbar.css";
import "98.css";
import windowslogo from "./Windows_Logo_(1992-2001).svg.png";
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
    

    //TODO: either create new Start-button component in Components folder or find way to make this shit work lolol.
    return(
        <div className="taskbar reverse-windows-box-shadow">
            <div className="left">
                <div className="class-button-div">
                    <label className="start-button windows-box-shadow" id="start-bar-button">
                        <img src= {windowslogo} id="start-logo" alt="windows '91-01 logo"/>
                        <p className="logo-text">Start</p>
                    </label>
                </div>
            </div>  
            <div className="center">
                <div className="mini-div"></div>
            </div>
            <div className="right"> 
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