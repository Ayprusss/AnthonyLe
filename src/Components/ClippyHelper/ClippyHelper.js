import React from "react";
import "98.css";
import clippyPng from "./clippy.png";
import "./ClippyHelper.css";
import { useState, useEffect } from "react";


function ClippyHelper() {


    const [clippyIndex, setClippyIndex] = useState(1);
    const [clippyGoodAnswer, setClippyGoodAnswer] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [showFinalMessage, setShowFinalMessage] = useState(false);

    const handleResponseClick = (isGood) => {
        if (isGood) {
            setClippyGoodAnswer(true);
            setIsVisible(false);
        } else {
            if (clippyIndex >= 5) {
                setShowFinalMessage(true);
                setTimeout(() => {
                    setIsVisible(false);
                }, 1000);
            } else {
                setClippyIndex(prev => prev + 1);
            }
        }
    };

    useEffect(() => {
        return () => clearTimeout();
    }, []);

    if (!isVisible) return null;


    const clippyResponses = {
        1:"Hi! I'm Clippy! Just to help you here, to take a look at this guy's info, try clicking the start button in the bottom left corner.",
        2: "What did you just say? Are you seriously punking me for trying to help you?",
        3: "What are you calling me outdated for? I'm here for nostalgia!",
        4 : "Hey you're being so rude. I'm just trying to help you out here.",
        5 : "I'm just trying to help you, I could just let you figure out how to navigate this guy's trash-ass website.",

    }

    const clippyFinalNegativeResponse = "Wow okay man. Whatever."

    const clippyGoodAnswers = {
        1: "Thanks!",
        2: "No sorry, have a good one.",
        3: "you're right, I shouldn't be saying these things.",
        4: "You're right. I'll go click the Start button then, thanks.",
        5: "Thank you for your service."
    }
    
    const clippyBadAnswers = {
        1 : "Hey not today Clippy... You're terrible!",
        2: "Yeah! You're outdated anyways!",
        3: "The person who created you wasn't even born when you were relevant.",
        4: "Why should I? All of your answers are pre-programmed! you're not even a GPT-Wrapped Clippy.",
        5 : "I don't care I don't need your help. Just go away."
    }


    return(
        <div className="clippy-container">
            <div className="clippy-helper">
                <div className="left">
                        <div className="clippy-text">
                            <p className="clippy-message">
                            {showFinalMessage 
                                ? clippyFinalNegativeResponse 
                                : clippyResponses[clippyIndex]
                            }
                            </p>
                            {!showFinalMessage && (
                                <ul className="clippy-list">
                                    <li className="clippy-response" onClick={() => handleResponseClick(true)}>
                                        {clippyGoodAnswers[clippyIndex]}
                                    </li>
                                    <li className="clippy-response" onClick={()=> handleResponseClick(false)}>
                                        {clippyBadAnswers[clippyIndex]}
                                    </li>
                                </ul>
                            )}
                        </div>                
                </div>
                <div className="right">
                    <img src={clippyPng} className="clippy" alt="clippy"></img>
                </div>
            </div>
        </div>
    );
}


export default ClippyHelper;