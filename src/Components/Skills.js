import { motion } from 'framer-motion';
import { SectionHeader } from './ui/SectionHeader';
import './Skills.css';

const skillCategories = [
    {
        title: "Languages",
        skills: ["Python", "Java", "C#", "C++", "JavaScript", "TypeScript", "HTML", "CSS", "SQL", "Prolog", "Go", "XML", "Bash"]
    },
    {
        title: "Frontend",
        skills: ["React.JS", "React Native", "Angular", "TailwindCSS", "React Redux", "Redux Saga", "MudBlazor", "Next.js", "Framer Motion"]
    },
    {
        title: "Backend & API",
        skills: ["Node.Js", "Express.js", "Springboot", "REST API", "MVC", "Entity Framework", "Axios", "PostgreSQL", "Supabase", "PostGIS", "MapLibre GL"]
    },
    {
        title: "Tools & DevOps",
        skills: ["Git", "GitHub", "Docker", "Kubernetes", "Jenkins", "CI/CD Development", "Agile", "JIRA", "Jasmine", "Karma", "Maven"]
    },
    {
        title: "IDEs, OS & Cloud",
        skills: ["VsCode", "Visual Studio", "Cursor", "CoPilot", "Android Studio", "Notepad++", "Eclipse", "Linux", "Operating Systems", "AWS", "Microsoft Azure", "Firebase", "Postman", "Google Claude CLI"]
    },
    {
        title: "Design",
        skills: ["Figma", "UI/UX Design", "Responsive Web Design"]
    }
];

// Bill of materials: each category is an assembly, each skill a line item.
const Skills = () => {
    const totalItems = skillCategories.reduce((n, c) => n + c.skills.length, 0);

    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <SectionHeader
                    title="Skills."
                    meta={`${totalItems} items listed`}
                    subtitle="Technologies and tools I work with to build digital products."
                />
            </motion.div>

            <div className="rule-table bom-table">
                <div className="rule-table-head bom-head">
                    <span>Row</span>
                    <span>Listing</span>
                    <span>Qty</span>
                </div>

                {skillCategories.map((category, catIndex) => (
                    <motion.div
                        key={catIndex}
                        className="bom-row"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.45, delay: catIndex * 0.08 }}
                    >
                        <div className="bom-assy">
                            <span className="bom-assy-no">A{catIndex + 1}</span>
                            <h3 className="bom-assy-title">{category.title}</h3>
                        </div>
                        <div className="bom-items">
                            {category.skills.map((skill, index) => (
                                <span className="bom-item" key={index}>{skill}</span>
                            ))}
                        </div>
                        <span className="bom-qty">{String(category.skills.length).padStart(2, '0')}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Skills;
