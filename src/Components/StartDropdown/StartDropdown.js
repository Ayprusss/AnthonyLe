import React from "react";
import "./StartDropdown.css";
import "98.css";

import websitePhoto from "./windows-explorer.png"
function StartDropdown({
    onMainWebsiteOpen,
    closeStartMenu
}) {
    const handleWebsiteClick = () => {
        if (onMainWebsiteOpen) {
            onMainWebsiteOpen();
        }
        if (closeStartMenu) {
            closeStartMenu();
        }
    };
    
    return (
        <div className="window start-dropdown-div">
            <div className="title-bar">
                <div className="title-bar-text"><strong>Windows 98</strong></div>
            </div>
            <div className="windows-body">
                <ul className="tree-view icon-list">
                    <li className="icon-item" onClick={handleWebsiteClick} style={{ cursor: 'pointer' }}>
                        <img alt="userPhoto" src={websitePhoto} id="icon-photo"></img>
                        <label htmlFor="icon-item" className="icon-text">My Website</label>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default StartDropdown;