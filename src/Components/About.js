import React, { useState } from 'react';
import { Section } from './ui/Section';
import './About.css';

const paragraphs = [
    "I'm a fourth-year Computer Science student about to finish my last year at the University of Ottawa.",
    "I am hoping to exit Ottawa and enter Toronto for full-time positions. I am currently looking for Summer 2027 Internships or Full-time roles.",
];

const facts = [
    { label: "Based in",      value: "Ottawa, Canada" },
    { label: "Studying",      value: "Computer science, University of Ottawa" },
    { label: "Currently",     value: "Completing last year of Computer Science degree" },
    { label: "Off the clock", value: "Climbing, hiking, the gym, fashion, gaming, music" },
];

const About = () => {
    // The portrait is a real file in public/, but if it ever goes
    // missing the figure removes itself rather than leaving a broken
    // frame and a caption describing nothing.
    const [hasPortrait, setHasPortrait] = useState(true);

    return (
        <>
            <Section title="About." />

            <div className="prose about-prose">
                {paragraphs.map((text) => <p key={text.slice(0, 24)}>{text}</p>)}
            </div>

            <div className="about-detail">
                {hasPortrait && (
                    <figure className="about-portrait">
                        <img
                            src="/about-portrait.jpg"
                            alt="Anthony Le"
                            onError={() => setHasPortrait(false)}
                        />
                    </figure>
                )}

                <dl className="pairs about-facts">
                    {facts.map(({ label, value }) => (
                        <div key={label}>
                            <dt className="pair-label">{label}</dt>
                            <dd className="pair-value">{value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </>
    );
};

export default About;
