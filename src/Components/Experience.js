import { Section } from './ui/Section';

const experiences = [
    {
        role: "Data Analyst Intern",
        company: "Canada Revenue Agency",
        period: "June 2026 - Present",
        description: "Developed 235 Internal Generated Workbooks mapping to Government databases for extraction-related purposes through scripting "
    },
    {
        role: "Software Developer Intern",
        company: "Magnet Forensics",
        period: "September 2025 - April 2026",
        description: "Worked on Magnet AXIOM, contributing to the development and maintenance of the software."
    },
    {
        role: "Software Developer Intern",
        company: "University of Ottawa",
        period: "January 2025 - April 2025",
        description: "Built and maintained the university's co-op portal, along with the co-op tools and services students use around it."
    },
    {
        role: "Software Engineering Intern",
        company: "Canada Revenue Agency",
        period: "September 2023 - August 2024",
        description: "Developed, tested and maintained UI infrastructure for government products and services."
    }
];

// Reverse-chronological. The dates lead each record, which means the
// timeline can be scanned straight down the left edge without a rail
// drawn to help it, and the company follows — that is the word anyone
// scanning a résumé is actually looking for.
const Experience = () => (
    <>
        <Section title="Experience." />

        <div className="records">
            {experiences.map((exp, idx) => (
                <article className="record" key={idx}>
                    <p className="micro rec-period">{exp.period}</p>
                    <h3 className="rec-title">{exp.company}</h3>
                    <p className="rec-sub">{exp.role}</p>
                    {exp.description && (
                        <p className="rec-body">{exp.description}</p>
                    )}
                </article>
            ))}
        </div>
    </>
);

export default Experience;
