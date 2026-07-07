/**
 * Teletext page header.
 *
 * Renders the service header bar (page number · channel ident · rule ·
 * data readout), then the headline and an optional lead-in note.
 * The page number comes from the same CSS counter that stamps the corner
 * tag on each section, so the two can never disagree.
 *
 * Props:
 *   title    – page headline, e.g. "Skills." (rendered as h2)
 *   meta     – short readout derived from the page's real content,
 *              e.g. "61 items listed"
 *   subtitle – optional lead-in note
 */
export function SectionHeader({ title, meta, subtitle }) {
    return (
        <>
            <div className="page-bar" aria-hidden="true">
                <span className="page-bar-no" />
                <span className="page-bar-ch">CH·741</span>
                <span className="page-bar-fill" />
                {meta && <span className="page-bar-meta">{meta}</span>}
            </div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </>
    );
}
