import React from 'react';
import "98.css";
import "./MiniExperienceComponent.css";


function MiniExperienceComponent({ onClose, data }) {

    return(
            
                <div className="window mini-experience-window">
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
                            <button className="mini-exp-button"aria-label="Close" onClick={onClose}>Close</button>
                        </div>
                    </div>
        );
}

export default MiniExperienceComponent;