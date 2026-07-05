/**
 * Drawing-sheet header.
 *
 * Renders the sheet band (drawing number box · sheet counter · rule ·
 * data readout), then the stencil sheet title and an optional note line.
 * The sheet counter digits come from the same CSS counter that stamps the
 * SHT tag on each section, so the two can never disagree.
 *
 * Props:
 *   title    – sheet title, e.g. "Skills." (rendered as h2)
 *   meta     – short readout derived from the sheet's real content,
 *              e.g. "6 assemblies · 61 items"
 *   subtitle – optional lead-in note
 */
export function SectionHeader({ title, meta, subtitle }) {
    return (
        <>
            <div className="sheet-band" aria-hidden="true">
                <span className="sheet-band-dwg">DWG AL-26</span>
                <span className="sheet-band-sht" />
                <span className="sheet-band-fill" />
                {meta && <span className="sheet-band-meta">{meta}</span>}
            </div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </>
    );
}
