import React, { useState } from 'react';
import { Section } from './ui/Section';
import './Skills.css';

// Sixty-one names in a flat list tells a reader nothing: everything is
// equally important, so nothing is. Each group leads with what he
// actually reaches for, and the long tail is one button away for the
// person who genuinely wants to check a box against it.
const groups = [
    {
        title: 'Languages',
        main: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C#', 'SQL'],
        more: ['C++', 'Go', 'Prolog', 'Bash', 'HTML', 'CSS', 'XML'],
    },
    {
        title: 'Frontend',
        main: ['React', 'Next.js', 'Angular', 'Tailwind CSS', 'Redux'],
        more: ['React Native', 'Redux Saga', 'Framer Motion', 'MudBlazor'],
    },
    {
        title: 'Backend and data',
        main: ['Node.js', 'Express', 'Spring Boot', 'PostgreSQL', 'REST APIs'],
        more: ['Entity Framework', 'Supabase', 'PostGIS', 'MapLibre GL', 'Axios', 'MVC'],
    },
    {
        title: 'Infrastructure and tooling',
        main: ['Git', 'Docker', 'Kubernetes', 'CI/CD', 'AWS'],
        more: ['Jenkins', 'Azure', 'Firebase', 'Linux', 'Maven', 'Postman', 'Jasmine', 'Karma', 'JIRA', 'Agile'],
    },
    {
        title: 'Design',
        main: ['Figma', 'UI/UX design', 'Responsive web design'],
        more: [],
    },
];

const Skills = () => {
    const [showAll, setShowAll] = useState(false);
    const tail = groups.reduce((n, g) => n + g.more.length, 0);

    return (
        <>
            <Section
                title="Skills."
                lead="Grouped by what I reach for first, not by everything I have touched."
            />

            <div className="records skills">
                {groups.map(({ title, main, more }) => (
                    <div className="record skill-group" key={title}>
                        <h3 className="skill-title">{title}</h3>
                        <p className="skill-list">
                            {main.map((item) => (
                                <span className="skill-item" key={item}>{item}</span>
                            ))}
                            {showAll && more.map((item) => (
                                <span className="skill-item is-tail" key={item}>{item}</span>
                            ))}
                        </p>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="btn btn-secondary skills-toggle"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
            >
                {showAll ? 'Show fewer' : `Show all ${tail} more`}
            </button>
        </>
    );
};

export default Skills;
