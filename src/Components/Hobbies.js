import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextScramble } from './ui/TextScramble';
import './Hobbies.css';

// TODO: swap blurbs/links for real copy + real URLs (user-supplied).
// Each card is a "channel" in the transmission deck — tune through them.
const hobbies = [
    {
        name: "Rock Climbing",
        tag: "VERTICAL",
        blurb: "Currently a V5 Climber. I don't want to say that I have plateau'd, but every climbing session is one step closer to me admitting it....",
        meta: { label: "Discipline", value: "Bouldering" },
        href: "#",
        linkLabel: "View sends",
    },
    {
        name: "Hiking",
        tag: "TRAILS",
        blurb: "Haven't been on a hike in a long while, but I'm looking to do many hiking trips in the future before my back is blown.",
        meta: { label: "", value: "" },
        href: "#",
        linkLabel: "See the routes",
    },
    {
        name: "Exercising",
        tag: "STRENGTH",
        blurb: "I currently rock climb more than I do traditional exercises, but they really are the same thing...",
        meta: { label: "Focus", value: "U/L split" },
        href: "#",
        linkLabel: "Open the split",
    },
    {
        name: "Fashion",
        tag: "STYLE",
        blurb: "Brought into the fashion scene during the HYPEBEAST era, my style has definitely changed, with some of my outfits being questionable...",
        meta: { label: "Leaning", value: "Archive · Gorpcore · Japanese + Korean designers" },
        href: "#",
        linkLabel: "Browse fits",
    },
    {
        name: "Music",
        tag: "AUDIO",
        blurb: "I love music for the genres I really enjoy and I try to be invested in the music that I don't really enjoy.",
        meta: { label: "On repeat", value: "Underground rap" },
        href: "https://open.spotify.com/user/22qrv4t4f3u3nxmxtgiybk6ui?si=6f49106d14154a20",
        linkLabel: "Open playlist",
    },
    {
        name: "Gaming",
        tag: "PLAY",
        blurb: "I have spent way too much time on my first playthrough of Elden Ring and have sinked too many hours into League of Legends and Valorant.",
        meta: { label: "Genre", value: "Competitive · RPG" },
        href: "https://steamcommunity.com/id/Ayprusss/",
        linkLabel: "View library",
    },
];

const cardVariants = {
    enter: (dir) => ({
        opacity: 0,
        x: dir > 0 ? 90 : -90,
        rotateY: dir > 0 ? 14 : -14,
        scale: 0.9,
    }),
    center: { opacity: 1, x: 0, rotateY: 0, scale: 1 },
    exit: (dir) => ({
        opacity: 0,
        x: dir > 0 ? -90 : 90,
        rotateY: dir > 0 ? -14 : 14,
        scale: 0.9,
    }),
};

const pad = (n) => String(n).padStart(2, '0');

const Chevron = ({ dir }) => (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === 'prev' ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
);

const Hobbies = () => {
    const [[index, direction], setState] = useState([0, 0]);
    const total = hobbies.length;
    const dragging = useRef(false);

    const paginate = useCallback((dir) => {
        setState(([i]) => [(i + dir + total) % total, dir]);
    }, [total]);

    const goTo = useCallback((target) => {
        setState(([i]) => [target, target > i ? 1 : -1]);
    }, []);

    const onKeyDown = (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); paginate(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); paginate(-1); }
    };

    const hobby = hobbies[index];
    const isExternal = /^https?:\/\//.test(hobby.href);

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
                    What I get up to when I'm away from the keyboard — tune through the channels.
                </p>
            </motion.div>

            <motion.div
                className="hobby-deck"
                role="group"
                aria-roledescription="carousel"
                aria-label="Hobbies"
                tabIndex={0}
                onKeyDown={onKeyDown}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <button
                    type="button"
                    className="hobby-arrow hobby-arrow-prev"
                    onClick={() => paginate(-1)}
                    aria-label="Previous hobby"
                >
                    <Chevron dir="prev" />
                </button>

                <div className="hobby-stage" aria-live="polite">
                    <span className="hobby-ghost hobby-ghost-2" aria-hidden="true"></span>
                    <span className="hobby-ghost hobby-ghost-1" aria-hidden="true"></span>

                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                        <motion.article
                            key={index}
                            className="hobby-card-rot"
                            custom={direction}
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.18}
                            dragMomentum={false}
                            onDragStart={() => { dragging.current = true; }}
                            onDragEnd={(e, info) => {
                                const swipe = info.offset.x;
                                if (swipe < -70 || info.velocity.x < -400) paginate(1);
                                else if (swipe > 70 || info.velocity.x > 400) paginate(-1);
                                // reset on next tick so the explore link click isn't swallowed
                                setTimeout(() => { dragging.current = false; }, 0);
                            }}
                        >
                            <span className="hobby-corner hobby-corner-tl" aria-hidden="true"></span>
                            <span className="hobby-corner hobby-corner-br" aria-hidden="true"></span>

                            <div className="hobby-card-top">
                                <span className="hobby-ch">
                                    <span className="hobby-ch-num">CH.{pad(index + 1)}</span>
                                    <span className="hobby-ch-total"> / {pad(total)}</span>
                                </span>
                                <span className="hobby-tag">{hobby.tag}</span>
                            </div>

                            <h3 className="hobby-name">{hobby.name}</h3>
                            <p className="hobby-blurb">{hobby.blurb}</p>

                            <div className="hobby-meta">
                                <span className="hobby-meta-label">{hobby.meta.label}</span>
                                <span className="hobby-meta-value">{hobby.meta.value}</span>
                            </div>

                            <a
                                className="btn-secondary hobby-explore"
                                href={hobby.href}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                onClick={(e) => {
                                    if (dragging.current || hobby.href === '#') e.preventDefault();
                                }}
                            >
                                {hobby.linkLabel}
                                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"
                                    fill="none" stroke="currentColor" strokeWidth="1.6"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h13M12 6l6 6-6 6" />
                                </svg>
                            </a>
                        </motion.article>
                    </AnimatePresence>
                </div>

                <button
                    type="button"
                    className="hobby-arrow hobby-arrow-next"
                    onClick={() => paginate(1)}
                    aria-label="Next hobby"
                >
                    <Chevron dir="next" />
                </button>
            </motion.div>

            <div className="hobby-dots" role="tablist" aria-label="Select a hobby">
                {hobbies.map((h, i) => (
                    <button
                        type="button"
                        key={h.name}
                        className={`hobby-dot${i === index ? ' is-active' : ''}`}
                        onClick={() => goTo(i)}
                        role="tab"
                        aria-selected={i === index}
                        aria-label={h.name}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hobbies;
