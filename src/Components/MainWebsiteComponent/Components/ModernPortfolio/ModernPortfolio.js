/* filepath: c:\Users\Antho\Downloads\personalWebsiteP3\anthonyle\src\Components\MainWebsiteComponent\Components\ModernPortfolio\ModernPortfolio.js */
import React, { useEffect, useRef } from 'react';
import './ModernPortfolio.css';

function ModernPortfolio() {
    const portfolioRef = useRef(null);
    const contentRef = useRef(null);
    const h1Ref = useRef(null);
    const h2Ref = useRef(null);
    const p1Ref = useRef(null);
    const p2Ref = useRef(null);

    // Utility functions for animation
    const lerp = (start, end, progress) => start + (end - start) * progress;
    
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgbToHex = (r, g, b) => {
        return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
    };

    const interpolateColor = (color1, color2, progress) => {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        
        const r = lerp(rgb1.r, rgb2.r, progress);
        const g = lerp(rgb1.g, rgb2.g, progress);
        const b = lerp(rgb1.b, rgb2.b, progress);
        
        return rgbToHex(r, g, b);
    };

    // Easing function for smoother animations
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    useEffect(() => {
        let animationId;
        const startTime = Date.now();
        const delayTime = 2000; // 2 second delay
        const backgroundDuration = 4000; // 4 seconds for background
        const contentDelay = 4000; // Content starts after background
        const contentDuration = 1500; // Content animation duration
        const textStagger = 300; // 300ms between each text element

        // Color stops for gradient animation
        const gradientStops = [
            { color1: '#000000', color2: '#000000' },
            { color1: '#1a1a1a', color2: '#1f1f1f' },
            { color1: '#2a2a35', color2: '#252025' },
            { color1: '#3a4555', color2: '#28252a' },
            { color1: '#4a6580', color2: '#221f26' },
            { color1: '#5a7ea0', color2: '#1e1c23' },
            { color1: '#6497bc', color2: '#1d1921' }
        ];

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;

            // Background animation
            if (elapsed >= delayTime) {
                const backgroundProgress = Math.min((elapsed - delayTime) / backgroundDuration, 1);
                const easedProgress = easeInOutCubic(backgroundProgress);
                
                // Calculate which gradient stops to interpolate between
                const totalStops = gradientStops.length - 1;
                const scaledProgress = easedProgress * totalStops;
                const stopIndex = Math.floor(scaledProgress);
                const stopProgress = scaledProgress - stopIndex;
                
                if (stopIndex < totalStops) {
                    const currentStop = gradientStops[stopIndex];
                    const nextStop = gradientStops[stopIndex + 1];
                    
                    const color1 = interpolateColor(currentStop.color1, nextStop.color1, stopProgress);
                    const color2 = interpolateColor(currentStop.color2, nextStop.color2, stopProgress);
                    
                    if (portfolioRef.current) {
                        portfolioRef.current.style.background = `linear-gradient(60deg, ${color1} 0%, ${color2} 100%)`;
                    }
                }
            }

            // Content animation
            if (elapsed >= delayTime + contentDelay) {
                const contentProgress = Math.min((elapsed - delayTime - contentDelay) / contentDuration, 1);
                const easedContentProgress = easeInOutCubic(contentProgress);
                
                if (contentRef.current) {
                    const opacity = easedContentProgress;
                    const translateY = lerp(30, 0, easedContentProgress);
                    contentRef.current.style.opacity = opacity;
                    contentRef.current.style.transform = `translateY(${translateY}px)`;
                }
            }

            // Text animations (staggered)
            const textElements = [
                { ref: h1Ref, delay: 500 },
                { ref: h2Ref, delay: 800 },
                { ref: p1Ref, delay: 1100 },
                { ref: p2Ref, delay: 1400 }
            ];

            textElements.forEach(({ ref, delay }) => {
                if (elapsed >= delayTime + contentDelay + delay) {
                    const textProgress = Math.min((elapsed - delayTime - contentDelay - delay) / 800, 1);
                    const easedTextProgress = easeInOutCubic(textProgress);
                    
                    if (ref.current) {
                        const opacity = easedTextProgress;
                        const translateX = lerp(-30, 0, easedTextProgress);
                        ref.current.style.opacity = opacity;
                        ref.current.style.transform = `translateX(${translateX}px)`;
                    }
                }
            });

            // Continue animation if not complete
            if (elapsed < delayTime + contentDelay + 2000) {
                animationId = requestAnimationFrame(animate);
            }
        };

        // Start animation
        animationId = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, []);

    return (
        <div className="modern-portfolio" ref={portfolioRef}>
            <div className="portfolio-content" ref={contentRef}>
                <h1 ref={h1Ref}>Modern Portfolio</h1>
                <h2 ref={h2Ref}>Anthony Le</h2>
                <p ref={p1Ref}>This is a modern, sleek portfolio component with Inter font.</p>
                <p ref={p2Ref}>The content stays within the window body boundaries.</p>
                
                {/* Add more content to test scrolling */}
                <div className="portfolio-section">
                    <h3>About Me</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>
                
                <div className="portfolio-section">
                    <h3>Skills</h3>
                    <p>React, JavaScript, CSS, HTML, Node.js, and many more technologies.</p>
                </div>
                
                <div className="portfolio-section">
                    <h3>Projects</h3>
                    <p>Various projects showcasing different skills and technologies.</p>
                </div>
                
                <div className="portfolio-section">
                    <h3>Experience</h3>
                    <p>Professional experience and achievements in software development.</p>
                </div>
                
                <div className="portfolio-section">
                    <h3>Contact</h3>
                    <p>Get in touch for collaborations and opportunities.</p>
                </div>
            </div>
        </div>
    );
}

export default ModernPortfolio;