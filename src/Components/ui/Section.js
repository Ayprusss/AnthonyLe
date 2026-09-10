/**
 * Every section opens the same way: its name, and — where there is
 * something worth saying that the content itself does not say — one
 * line of lead-in.
 *
 * The trailing period is deliberate. It closes the word, which is the
 * quietest way to make a heading feel finished when there is no colour,
 * no rule and no eyebrow label doing that job.
 *
 * Props:
 *   title – section name, written with its period, e.g. "Projects."
 *   lead  – optional single sentence
 */
export function Section({ title, lead }) {
    return (
        <header className="section-head">
            <h2 className="section-title">{title}</h2>
            {lead && <p className="section-lead">{lead}</p>}
        </header>
    );
}

export default Section;
