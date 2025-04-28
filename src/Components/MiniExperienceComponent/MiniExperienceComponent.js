import React from 'react';
import "98.css";
import "./MiniExperienceComponent.css";
import { Rnd } from "react-rnd";
import ReactDOM from 'react-dom';


function MiniExperienceComponent({ onClose, data }) {

    const content = (
            <Rnd
                default={{
                    x:150,
                    y:150,
                    width: 400,
                    height: 400}}
                style={{pointerEvents: "auto"
                }}
                bounds="window"
                dragHandleClassName='title-bar'>
                <div className="window mini-experience-window">
                    <div className="title-bar">
                        <div className="title-bar-text">My Experience</div>
                        <div className="title-bar-controls">
                            <button aria-label="Minimize"></button>
                            <button aria-label="Maximize"></button>
                            <button aria-label="Close" onClick={onClose}></button> 
                        </div>
                    </div>
                        <div className="window-body mini-experience-body">
                            <p className="mini-experience-header"><b>{data.title}</b></p>
                            <br></br>
                            {data.date && (
                                <b>{data.date}</b>
                            )}
                            {data.description && (
                                <>
                                    <p className="mini-experience-subheader"><strong>description</strong></p>
                                    <p className="mini-experience-text">{data.description}</p>
                                </>
                            )}

                            {data.link && (
                                <p className="mini-experience-text"><a href={data.link} style={{textDecoration: "none"}} rel="noreferrer" target="_blank">link here:</a></p>
                            )}

                            {(data.experienceList || data.pointsList) && ( 
                                <ul className="tree-view">
                                {data.experienceList && (
                                    <>
                                            {Object.entries(data.experienceList).map(([key, value]) => (
                                                <React.Fragment key={key}>
                                                    <li><strong>{key}</strong></li>
                                                    <ul>
                                                        <li>{value}</li>
                                                    </ul>
                                                </React.Fragment>
                                            ))}
                                    </>
                                )}

                                    {data.pointsList && (
                                        <>
                                        <li className="mini-experience-subheader"><strong>Achievements</strong></li>
                                                {Object.entries(data.pointsList).map(([key, value]) => (
                                                    <React.Fragment key={key}>
                                                        <ul>
                                                            <li>{value}</li>
                                                        </ul>
                                                    </React.Fragment>
                                                ))}
                                        </>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </Rnd>
        );

    return ReactDOM.createPortal(
        content,
        document.body
    );
}

export default MiniExperienceComponent;