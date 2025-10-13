import React, {useState, useEffect} from "react";
import "./Taskbar.css";
import "98.css";

import StartButton from "../StartButton/StartButton.js";

function Taskbar({ mainWebsiteOpen, mainWebsiteVisible, onMainWebsiteRestore }) {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const currentTime = `${hours}:${minutes}:${seconds}`;
            setTime(currentTime);
        };  

        updateTime();
        const intervalId = setInterval(updateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const handleExplorerClick = () => {
        if (!mainWebsiteVisible && onMainWebsiteRestore) {
            onMainWebsiteRestore();
        }
    };

    return(
        <div className="taskbar windows-box-shadow">
            <div className="taskbar-left">
                <StartButton />
                {mainWebsiteOpen && (
                    <button 
                        className={`taskbar-item explorer-button ${mainWebsiteVisible ? 'active' : ''}`}
                        onClick={handleExplorerClick}
                        title="Internet Explorer"
                    >
                        <div className="taskbar-icon">
                            <img 
                                src="/windows-explorer.png" 
                                alt="Explorer" 
                                className="explorer-icon"
                            />
                        </div>
                        <span className="taskbar-text">Internet Explorer</span>
                    </button>
                )}
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