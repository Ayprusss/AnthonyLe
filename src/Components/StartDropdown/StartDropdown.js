import React, {useState} from "react";
import "./StartDropdown.css";
import "98.css";
import photo1 from "./address_book_copy.png";
import photo2 from "./address_book_user.png";
import photo3 from "./netshow-2.png";
import photo4 from "./kodak_imaging-0.png";
import photo5 from "./message_file-0.png";

function StartDropdown() {
    return(
        <div className="window start-dropdown-div">
            <div className="title-bar">
                <div className=" title-bar-text"><strong>Windows 98</strong></div>
            </div>
            <div className="windows-body">    
                <ul className="tree-view icon-list">
                    <li className="icon-item">
                        <img alt="userPhoto" src={photo4} id="icon-photo"></img>
                        <label for="icon-item" className="icon-text">My Photo</label>
                    </li>
                    <li className="icon-item">
                        <img alt="userPhoto" src={photo2} id="icon-photo"></img>
                        <label for="icon-item" className="icon-text">About</label>
                    </li>
                    <li className="icon-item">
                        <img alt="userPhoto" src={photo5} id="icon-photo"></img>
                        <label for="icon-item" className="icon-text">My Photo</label>
                    </li>
                    <li className="icon-item">
                        <img alt="phot1o" src={photo1} id="icon-photo"></img>
                        <label for="icon-item" className="icon-text">Experience</label>
                    </li>
                    <li className="icon-item">
                        <img alt="contactPhoto" id="icon-photo" src={photo3}></img>
                        <label for="icon-item" className="icon-text">Contact Me</label>
                    </li>
                </ul>
            </div>
        </div>
    );
}


export default StartDropdown;