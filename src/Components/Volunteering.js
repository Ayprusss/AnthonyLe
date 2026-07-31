import { motion } from 'framer-motion';
import { SectionHeader } from './ui/SectionHeader';
import './Volunteering.css';

const activities = [
    {
        role: "Advisor",
        organization: "uOttaHack VII + beyond",
        period: "February 2025 - Present",
        description: "Advisor position for uOttaHack VII and all future organizer teams."
    },
    {
        role: "Director of Logistics",
        organization: "uOttaHack VII",
        period: "March 2024 - January 2025",
        description: "Director position overseeing the management of the Logistics team, fulfilling and managing all tasks to serve over 900+ hackers."
    },
    {
        role: "Community Coordinator",
        organization: "uOttaHack VI",
        period: "October 2023 - March 2024",
        description: "Coordinator part of the Community team, focused on creating and managing community events for over 800+ hackers."
    },
    {
        role: "Partnerships Coordinator",
        organization: "Software Engineering Student Association (uOttawa SESA)",
        period: "January 2025 - April 2025",
        description: "Coordinator part of the Partnerships team responsible for acquiring and negotating new and previous sponsors for events and funding."
    },
];

// Field log: volunteer roles recorded like site visits in a field book.
const Volunteering = () => {
    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <SectionHeader
                    title="Volunteering."
                    meta={`community log · ${activities.length} entries`}
                    subtitle="Communities and causes I give my time to."
                />
            </motion.div>

            <div className="rule-table vol-table">
                <div className="rule-table-head vol-head">
                    <span>Entry</span>
                    <span>Date</span>
                    <span>Record</span>
                </div>

                {activities.map((item, idx) => (
                    <motion.div
                        className="vol-row"
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                        <span className="vol-no">F{idx + 1}</span>
                        <span className="vol-period">{item.period}</span>
                        <div className="vol-body">
                            <h3 className="vol-role">{item.role}</h3>
                            <h4 className="vol-org">{item.organization}</h4>
                            <p className="vol-description">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Volunteering;
