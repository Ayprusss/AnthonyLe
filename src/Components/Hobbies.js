import React from 'react';
import { Section } from './ui/Section';
import './Hobbies.css';

// All six are on the page.
//
// These used to live in a carousel, which meant five of the six were
// hidden behind an arrow at any moment — a lot of interaction spent
// concealing six short paragraphs from someone who came here to read
// them. Climbing leads because it is the one he actually does most.
const hobbies = [
    {
        name: "Rock Climbing",
        blurb: "Currently a V5 climber. I don't want to say I've plateaued, but every session is one step closer to admitting it.",
        meta: { label: "Discipline", value: "Bouldering" },
    },
    {
        name: "Music",
        blurb: "I love music for the genres I really enjoy, and I try to stay invested in the music I don't.",
        meta: { label: "On repeat", value: "Underground rap" },
        href: "https://open.spotify.com/user/22qrv4t4f3u3nxmxtgiybk6ui?si=6f49106d14154a20",
        linkLabel: "Open playlist",
    },
    {
        name: "Gaming",
        blurb: "Played for far too long on my first playthrough of Elden Ring, and far too many hours in League of Legends and Valorant.",
        meta: { label: "Genre", value: "Competitive and RPG" },
        href: "https://steamcommunity.com/id/Ayprusss/",
        linkLabel: "View library",
    },
    {
        name: "Fashion",
        blurb: "Pulled into it during the HYPEBEAST era. My style has moved on since, though some of the outfits along the way were questionable.",
        meta: { label: "Leaning", value: "Archive, Japanese and Korean designers" },
        href: "https://www.grailed.com/Ayprusss",
        linkLabel: "View Listings",
    },
    {
        name: "Exercising",
        blurb: "I climb more than I lift these days, which I maintain is the same thing.",
        meta: { label: "Focus", value: "Upper/lower split" },
    },
    {
        name: "Hiking",
        blurb: "It has been a while. I want to get a lot of trips in before my back gives out.",
        meta: null,
    },
];

const Detail = ({ meta }) =>
    meta ? (
        <p className="hobby-meta">
            <span className="pair-label">{meta.label}</span>
            <span className="pair-value">{meta.value}</span>
        </p>
    ) : null;

const Hobbies = () => {
    const [lead, ...rest] = hobbies;

    return (
        <>
            <Section title="Hobbies." lead="What I get up to away from a keyboard." />

            <article className="lead-record">
                <h3 className="lead-title">{lead.name}</h3>
                <p className="lead-body">{lead.blurb}</p>
                <Detail meta={lead.meta} />
            </article>

            <div className="records hobbies">
                {rest.map((hobby) => (
                    <article className="record" key={hobby.name}>
                        <h3 className="rec-title">{hobby.name}</h3>
                        <p className="rec-body">{hobby.blurb}</p>
                        <Detail meta={hobby.meta} />
                        {hobby.href && (
                            <p className="link-row hobby-link">
                                <a href={hobby.href} target="_blank" rel="noopener noreferrer">
                                    {hobby.linkLabel}
                                </a>
                            </p>
                        )}
                    </article>
                ))}
            </div>
        </>
    );
};

export default Hobbies;
