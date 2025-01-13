import React from "react";
import "./StartDropdown.css";
import "98.css";
import photo1 from "./address_book_copy.png";
import photo2 from "./address_book_user.png";
import photo3 from "./netshow-2.png";
import photo4 from "./kodak_imaging-0.png";
import photo5 from "./message_file-0.png";

function StartDropdown({
    setPhotoVisible,
    setAboutVisible,
    setResumeVisible,
    setExperienceVisible,
    setContactVisible
}) {


    const handleResumeClick = () => {
        console.log('Resume click triggered');
        setResumeVisible(true);
    }

    const handleAboutClick = () => {
        console.log('About click triggered');
        setAboutVisible(true);
    };

    const handleContactClick = () => {
        console.log('Contact click triggered');
        setContactVisible(true);
    };

    const handlePhotoClick = () => {
        console.log('Photo click triggered');
        setPhotoVisible(true);
    };

    const handleExperienceClick = () => {
        console.log('Experience click triggered');
        setExperienceVisible(true);
    };
    
    return (
        <div className="window start-dropdown-div">
            <div className="title-bar">
                <div className="title-bar-text"><strong>Windows 98</strong></div>
            </div>
            <div className="windows-body">
                <ul className="tree-view icon-list">
                    <li className="icon-item" onClick={handlePhotoClick}>
                        <img alt="userPhoto" src={photo4} id="icon-photo"></img>
                        <label htmlFor="icon-item" className="icon-text">My Photo</label>
                    </li>
                    <li className="icon-item" onClick={handleAboutClick}>
                        <img alt="userPhoto" src={photo2} id="icon-photo"></img>
                        <label htmlFor="icon-item" className="icon-text">About</label>
                    </li>
                    <li className="icon-item" onClick={handleResumeClick}>
                        <img alt="userPhoto" src={photo5} id="icon-photo"></img>
                        <label htmlFor="icon-item" className="icon-text">My Resume</label>
                    </li>
                    <li className="icon-item" onClick={handleExperienceClick}>
                        <img alt="phot1o" src={photo1} id="icon-photo"></img>
                        <label htmlFor="icon-item" className="icon-text">Experience</label>
                    </li>
                    <li className="icon-item" onClick={handleContactClick}>
                        <img alt="contactPhoto" id="icon-photo" src={photo3}></img>
                        <label htmlFor="icon-item" className="icon-text">Contact Me</label>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default StartDropdown;