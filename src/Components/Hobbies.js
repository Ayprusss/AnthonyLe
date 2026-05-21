import { motion } from 'framer-motion';
import { TextScramble } from './ui/TextScramble';
import './Hobbies.css';

// TODO: replace placeholder hobbies + descriptions with real copy (user-supplied).
const hobbies = [
    {
        name: "Rock Climbing",
        description: "Placeholder — what you love about climbing, indoor vs outdoor, favourite spots or grades.",
    },
    {
        name: "Photography",
        description: "Placeholder — the kind of photography you shoot and what draws you to it.",
    },
    {
        name: "Travel",
        description: "Placeholder — places you've been or want to go, and what travel means to you.",
    },
    {
        name: "Gaming",
        description: "Placeholder — genres or titles you enjoy and why.",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const Hobbies = () => {
    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <TextScramble text="Hobbies." as="h2" className="section-title" inView />
                <div className="section-divider"></div>
                <p className="section-subtitle">
                    What I get up to when I'm away from the keyboard.
                </p>
            </motion.div>

            <motion.div
                className="hobbies-grid"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {hobbies.map((hobby, idx) => (
                    <motion.div className="hobby-card" key={idx} variants={itemVariants}>
                        <h3 className="hobby-name">{hobby.name}</h3>
                        <p className="hobby-description">{hobby.description}</p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default Hobbies;
