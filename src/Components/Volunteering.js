import { Section } from './ui/Section';


const activities = [
    {
        role: "Advisor",
        organization: "uOttaHack VII and beyond",
        period: "February 2025 - Present",
        description: "Advising uOttaHack VII and every organizing team after it."
    },
    {
        role: "Partnerships Coordinator",
        organization: "Software Engineering Student Association (uOttawa SESA)",
        period: "January 2025 - April 2025",
        description: "Acquired and renegotiated sponsors for association events and funding."
    },
    {
        role: "Director of Logistics",
        organization: "uOttaHack VII",
        period: "March 2024 - January 2025",
        description: "Ran the logistics team and everything it had to deliver for more than 900 hackers."
    },
    {
        role: "Community Coordinator",
        organization: "uOttaHack VI",
        period: "October 2023 - March 2024",
        description: "Built and ran community events for more than 800 hackers."
    },
];

// Deliberately the same shape as Experience: same rules, same order of
// information, dates leading. Two lists of roles held over time should
// not be read two different ways.
const Volunteering = () => (
    <>
        <Section title="Volunteering." lead="Communities I give time to." />

        <div className="records">
            {activities.map((item, idx) => (
                <article className="record" key={idx}>
                    <p className="micro rec-period">{item.period}</p>
                    <h3 className="rec-title">{item.organization}</h3>
                    <p className="rec-sub">{item.role}</p>
                    <p className="rec-body">{item.description}</p>
                </article>
            ))}
        </div>
    </>
);

export default Volunteering;
