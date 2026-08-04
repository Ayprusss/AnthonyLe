import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './ui/SectionHeader';
import { Download, ExternalLink, Paperclip } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './Resume.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Attached reproduction: the résumé pinned to the drawing set.
const Resume = () => {
    const [width, setWidth] = useState(800);
    const containerRef = useRef(null);

    useEffect(() => {
        let ticking = false;
        const updateWidth = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (containerRef.current) {
                        const containerWidth = containerRef.current.offsetWidth;
                        setWidth(Math.min(containerWidth - 40, 800));
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            setWidth(Math.min(containerWidth - 40, 800));
        }

        window.addEventListener('resize', updateWidth, { passive: true });
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const onDocumentLoadSuccess = () => {};

    return (
        <section className="section-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
            >
                <SectionHeader title="Resume." meta="hard copy · pdf on file" />
            </motion.div>

            <motion.div
                className="resume-content"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="resume-card" ref={containerRef}>
                    <div className="resume-header">
                        <Paperclip size={22} className="resume-icon" aria-hidden="true" />
                        <div>
                            <h3 className="resume-title">Anthony Le — Resume</h3>
                            <p className="resume-subtitle">HARD COPY · TRANSMITTED IN FULL · PRINTS AT A4</p>
                        </div>
                    </div>

                    <div className="resume-actions">
                        <a
                            href="/Resume_Anthony_Le.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                        >
                            <ExternalLink size={15} />
                            <span>Open in Tab</span>
                        </a>
                        <a
                            href="/Resume_Anthony_Le.pdf"
                            download="Resume_Anthony_Le.pdf"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                        >
                            <Download size={15} />
                            <span>Download PDF</span>
                        </a>
                    </div>

                    <div className="pdf-viewer-container">
                        <Document
                            file="/Resume_Anthony_Le.pdf"
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="pdf-document"
                            loading={<div className="pdf-loading">RECEIVING PAGE…</div>}
                        >
                            <Page
                                pageNumber={1}
                                width={width}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="pdf-page"
                            />
                        </Document>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default Resume;
