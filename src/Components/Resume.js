import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './Resume.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Resume = () => {
    const [width, setWidth] = useState(800);
    const containerRef = useRef(null);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Determine responsive width depending on screen size
                const containerWidth = containerRef.current.offsetWidth;
                // Add some padding deduction
                setWidth(Math.min(containerWidth - 40, 800)); 
            }
        };
        
        updateWidth();
        window.addEventListener('resize', updateWidth);
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
                <h2 className="section-title">Resume.</h2>
                <div className="section-divider"></div>
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
                        <FileText size={32} className="resume-icon" />
                        <div>
                            <h3 className="resume-title">Anthony Le - Resume</h3>
                            <p className="resume-subtitle">Software Developer Intern</p>
                        </div>
                    </div>
                    
                    <div className="resume-actions">
                        <a 
                            href="/Resume_Anthony_Le.pdf" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="resume-btn primary-btn"
                        >
                            <ExternalLink size={18} />
                            <span>Open in Tab</span>
                        </a>
                        <a 
                            href="/Resume_Anthony_Le.pdf" 
                            download="Resume_Anthony_Le.pdf"
                            className="resume-btn secondary-btn"
                        >
                            <Download size={18} />
                            <span>Download PDF</span>
                        </a>
                    </div>
                    
                    {/* The Library Viewer */}
                    <div className="pdf-viewer-container">
                        <Document
                            file="/Resume_Anthony_Le.pdf"
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="pdf-document"
                            loading={<div className="pdf-loading">Loading PDF...</div>}
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
