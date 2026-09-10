import React from 'react';
import './Overview.css';

// The opening screen.
//
// The name is the only thing on the site set in capitals and the only
// thing allowed to be loud, which is what makes it read as a nameplate
// rather than as a label. Everything under it is quiet on purpose.
//
// What follows the name differs by session, because the toggle changing
// what he tells you about himself is the entire reason there are two
// sessions. Same shape, same rhythm, different answer.

const COPY = {
    professional: {
        blurb:
            'Fourth-year computer science student at the University of Ottawa. ',
        availability: 'Open to new-grad software roles and summer 2027 internships.',
        facts: [
            { label: 'Currently',  value: 'Studying last year of Computer Science.' },
            { label: 'Studying',   value: 'Computer science, University of Ottawa' },
            { label: 'Based in',   value: 'Ottawa, Canada' },
            { label: 'Working in', value: 'Python, TypeScript, C#, React' },
        ],
    },
    personal: {
        blurb:
            'I play video games, like hiking and exercising and am struggling to top my first V6.',
        availability: '',
        facts: [
            { label: 'Climbing',   value: 'Trying to surpass V6' },
            { label: 'On repeat',  value: 'Underground rap' },
            { label: 'Based in',   value: 'Ottawa, Canada' },
            { label: 'Also',       value: 'Hiking, gaming, fashion, the gym' },
        ],
    },
};

const Overview = ({ theme }) => {
    const { blurb, availability, facts } = COPY[theme] || COPY.professional;

    return (
        <div className="overview">
            <h1 className="overview-name">
                <span>Anthony</span>
                <span>Le</span>
            </h1>

            <hr className="rule overview-rule" />

            <p className="lead overview-blurb">{blurb}</p>

            <div className="overview-cta">
                <a className="btn btn-primary" href="#contact">Contact</a>
                <span className="meta">{availability}</span>
            </div>

            <dl className="pairs overview-facts">
                {facts.map(({ label, value }) => (
                    <div key={label}>
                        <dt className="pair-label">{label}</dt>
                        <dd className="pair-value">{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};

export default Overview;
