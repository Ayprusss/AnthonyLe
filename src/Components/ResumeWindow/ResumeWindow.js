import React from "react";
import "98.css";
import "./ResumeWindow.css";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {version as pdfjsVersion} from "pdfjs-dist"

import Resume from "./resume.pdf";
import { Rnd } from "react-rnd";
function ResumeWindow() {
    return(
        <Rnd
        
            default={{
                x: 100,
                y: 100,
                width: 750,
                height: 600,
            }}
            minWidth={600}
            minHeight={400}>
            <div className="window resume-window">
            <div className="title-bar">
                <div className="title-bar-text">My Resume</div>
                <div className="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Maximize"></button>
                    <button aria-label="Close"></button>
                </div>
            </div>

            <div className="windows-body resume-body">
                <Worker className="pdf-viewer"workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`}>
                    <Viewer fileUrl={Resume}
                    defaultScale={1.2}/>
                </Worker>
            </div>
        </div>
        </Rnd>
    );
}

export default ResumeWindow;