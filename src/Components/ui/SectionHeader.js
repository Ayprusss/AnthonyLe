/**
 * Folder header — the inverse-video strip every Seegson terminal page
 * opens with, then the folder name and an optional lead-in.
 *
 * The ref cell reads from the same CSS counter that orders the sections,
 * so the bar and the reading order can never disagree. The bar closes on
 * a filled block, as every bar in the game does.
 *
 * Props:
 *   title    – folder name, e.g. "Skills." (rendered as h2)
 *   meta     – readout derived from the page's real content,
 *              e.g. "61 items listed"
 *   subtitle – optional lead-in note
 */
export function SectionHeader({ title, meta, subtitle }) {
    return (
        <>
            <div className="page-bar" aria-hidden="true">
                <span className="page-bar-no" />
                <span className="page-bar-path">
                    SEEGSON <i>{'//'}</i> PERSONAL TERMINAL <i>{'//'}</i>{' '}
                    {String(title).replace(/\.$/, '')}
                </span>
                <span className="page-bar-fill" />
                {meta && <span className="page-bar-meta">{meta}</span>}
                <span className="page-bar-end" />
            </div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </>
    );
}
