import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from './ui/SectionHeader';
import './Hobbies.css';

// TODO: swap blurbs/links for real copy + real URLs (user-supplied).
// Each hobby is a numbered figure sheet in the appendix — flip through them.
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

const sheetVariants = {
    enter: (dir) => ({
        opacity: 0,
        x: dir > 0 ? 70 : -70,
        rotate: dir > 0 ? 1.6 : -1.6,
    }),
    center: { opacity: 1, x: 0, rotate: 0 },
    exit: (dir) => ({
        opacity: 0,
        x: dir > 0 ? -70 : 70,
        rotate: dir > 0 ? -1.6 : 1.6,
    }),
};

const pad = (n) => String(n).padStart(2, '0');

const Chevron = ({ dir }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"
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
                <SectionHeader
                    title="Hobbies."
                    meta={`${total} programmes · after hours`}
                    subtitle="What I get up to when I'm away from the keyboard — flip through the channels."
                />
            </motion.div>

            <motion.div
                className="fig-deck"
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
                    className="fig-arrow fig-arrow-prev"
                    onClick={() => paginate(-1)}
                    aria-label="Previous hobby"
                >
                    <Chevron dir="prev" />
                </button>

                <div className="fig-stage" aria-live="polite">
                    {/* the sheets underneath the top one */}
                    <span className="fig-under fig-under-2" aria-hidden="true"></span>
                    <span className="fig-under fig-under-1" aria-hidden="true"></span>

                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                        <motion.article
                            key={index}
                            className="fig-sheet"
                            custom={direction}
                            variants={sheetVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.18}
                            dragMomentum={false}
                            onDragStart={() => { dragging.current = true; }}
                            onDragEnd={(e, info) => {
                                const swipe = info.offset.x;
                                if (swipe < -70 || info.velocity.x < -400) paginate(1);
                                else if (swipe > 70 || info.velocity.x > 400) paginate(-1);
                                // reset on next tick so the link click isn't swallowed
                                setTimeout(() => { dragging.current = false; }, 0);
                            }}
                        >
                            <div className="fig-sheet-band">
                                <span className="fig-no">CH 7{pad(index + 1)}</span>
                                <span className="fig-of">/ {pad(total)}</span>
                                <span className="fig-band-fill" />
                                <span className="fig-tag">{hobby.tag}</span>
                            </div>

                            <h3 className="fig-name">{hobby.name}</h3>
                            <p className="fig-blurb">{hobby.blurb}</p>

                            <div className="fig-spec">
                                {hobby.meta.label && (
                                    <>
                                        <span className="fig-spec-label">{hobby.meta.label}</span>
                                        <span className="fig-spec-value">{hobby.meta.value}</span>
                                    </>
                                )}
                            </div>

                            <a
                                className="btn-secondary fig-link"
                                href={hobby.href}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                onClick={(e) => {
                                    if (dragging.current || hobby.href === '#') e.preventDefault();
                                }}
                            >
                                {hobby.linkLabel}
                                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"
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
                    className="fig-arrow fig-arrow-next"
                    onClick={() => paginate(1)}
                    aria-label="Next hobby"
                >
                    <Chevron dir="next" />
                </button>
            </motion.div>

            {/* Sheet tabs */}
            <div className="fig-tabs" role="tablist" aria-label="Select a hobby">
                {hobbies.map((h, i) => (
                    <button
                        type="button"
                        key={h.name}
                        className={`fig-tab${i === index ? ' is-active' : ''}`}
                        onClick={() => goTo(i)}
                        role="tab"
                        aria-selected={i === index}
                        aria-label={h.name}
                    >
                        {pad(i + 1)}
                    </button>
                ))}
            </div>
        </section>
    );
};

export default Hobbies;
