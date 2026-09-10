import React from 'react';
import { Section } from './ui/Section';
import './Resume.css';

const FILE = '/Resume_Anthony_Le.pdf';

// What used to be an embedded PDF page rendered by pdf.js. A picture of
// a document is not a document: it could not be searched, it did not
// reflow on a phone, and it cost half a megabyte of JavaScript plus a
// worker fetched from a third-party CDN. Say what is in the file, then
// hand over the file.
const contents = [
    'Four Internship Experiences at three different companies',
    'Computer science at the University of Ottawa',
    'Selected projects and the stack behind each',
];

const Resume = () => (
    <>
        <Section
            title="Résumé."
            lead="View my current resume below."
        />

        <ul className="resume-contents">
            {contents.map((line) => (
                <li className="resume-item" key={line}>{line}</li>
            ))}
        </ul>

        <div className="resume-actions">
            <a
                className="btn btn-primary"
                href={FILE}
                target="_blank"
                rel="noopener noreferrer"
            >
                Open in tab
            </a>
            <a
                className="btn btn-secondary"
                href={FILE}
                download="Resume_Anthony_Le.pdf"
                rel="noopener noreferrer"
          >
                Download PDF
            </a>
        </div>
    </>
);

export default Resume;
