/* filepath: c:\Users\Antho\Downloads\personalWebsiteP3\anthonyle\src\Components\MainWebsiteComponent\Components\ModernPortfolio\ModernPortfolio.js */
import React, { useEffect, useRef, useState } from 'react';
import './ModernPortfolio.css';
import HeaderComponent from '../HeaderComponent/HeaderComponent.js';
import SkillsSectionComponent from '../SkillsSectionComponent/SkillsSectionComponent.js';
import ProjectsComponent from '../ProjectsComponent/ProjectsComponent.js';
import ExperienceComponent from '../ExperienceComponent/ExperienceComponent.js';
import ContactComponent from '../ContactComponent/ContactComponent.js';
import FooterComponent from '../FooterComponent/FooterComponent.js';
function ModernPortfolio({ initialAnimationState = null, onAnimationComplete }) {
    const portfolioRef = useRef(null);
    const contentRef = useRef(null);
    const typingTextRef = useRef(null);
    const cursorRef = useRef(null);
    const subheaderRef = useRef(null);
    const headerRef = useRef(null);
    
    // Initialize state from props if available
    const [animationsCompleted, setAnimationsCompleted] = useState(
        initialAnimationState ? initialAnimationState.completed : false
    );
    const [currentDisplayText, setCurrentDisplayText] = useState(
        initialAnimationState ? initialAnimationState.text : ''
    );
    const [typingComplete, setTypingComplete] = useState(
        initialAnimationState ? initialAnimationState.completed : false
    );
    const [subheaderAnimated, setSubheaderAnimated] = useState(
        initialAnimationState ? initialAnimationState.completed : false
    );
    const [headerAnimated, setHeaderAnimated] = useState(
        initialAnimationState ? initialAnimationState.completed : false
    );
    const [currentSection, setCurrentSection] = useState('home');

    // Scroll spy effect to update current section based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const scrollContainer = document.querySelector('.modern-portfolio');
            if (!scrollContainer) return;
            
            const sections = [
                { id: 'home', element: document.querySelector('.hero-section') },
                { id: 'skills', element: document.querySelector('.skills-section-wrapper') },
                { id: 'projects', element: document.querySelector('.projects-section-wrapper') },
                { id: 'experience', element: document.querySelector('.experience-section-wrapper') },
                { id: 'contact', element: document.querySelector('.contact-section-wrapper') }
            ];
            
            let currentSectionId = 'home';
            
            // Find which section is currently in view
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.element) {
                    const rect = section.element.getBoundingClientRect();
                    const containerRect = scrollContainer.getBoundingClientRect();
                    
                    // Check if section is in viewport (with some offset for header)
                    if (rect.top <= containerRect.top + 100) {
                        currentSectionId = section.id;
                        break;
                    }
                }
            }
            
            setCurrentSection(currentSectionId);
        };
        
        const scrollContainer = document.querySelector('.modern-portfolio');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            
            // Initial call
            handleScroll();
            
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [animationsCompleted]); // Only start after animations are complete

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

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    // Separate effect for cursor blinking only (always runs when typing complete)
    useEffect(() => {
        let cursorAnimationId;
        
        const animateCursor = () => {
            const currentTime = Date.now();
            
            if (cursorRef.current && typingComplete) {
                const showCursor = Math.floor(currentTime / 500) % 2 === 0;
                cursorRef.current.style.opacity = showCursor ? 1 : 0;
            }
            
            cursorAnimationId = requestAnimationFrame(animateCursor);
        };
        
        // Start cursor animation if typing is complete
        if (typingComplete) {
            cursorAnimationId = requestAnimationFrame(animateCursor);
        }
        
        return () => {
            if (cursorAnimationId) {
                cancelAnimationFrame(cursorAnimationId);
            }
        };
    }, [typingComplete]);

    // Combined effect for subheader and header animation (runs only once)
    useEffect(() => {
        // Only run if typing is complete AND animations haven't been completed yet
        if (!typingComplete || (subheaderAnimated && headerAnimated)) {
            return;
        }

        let animationId;
        let startTime = null;
        const delay = 1500; // Delay after cursor starts blinking
        const duration = 1000; // Animation duration
        
        const animateElements = () => {
            const currentTime = Date.now();
            
            // Start animation timer
            if (startTime === null) {
                startTime = currentTime;
            }
            
            const elapsed = currentTime - startTime;
            
            if (elapsed >= delay) {
                const progress = Math.min((elapsed - delay) / duration, 1);
                const easedProgress = easeInOutCubic(progress);
                
                // Animate subheader
                if (subheaderRef.current && !subheaderAnimated) {
                    const opacity = easedProgress;
                    const translateY = lerp(20, 0, easedProgress);
                    subheaderRef.current.style.opacity = opacity;
                    subheaderRef.current.style.transform = `translateY(${translateY}px)`;
                }
                
                // Animate header with same timing
                if (headerRef.current && !headerAnimated) {
                    const opacity = easedProgress;
                    const translateY = lerp(-20, 0, easedProgress);
                    headerRef.current.style.opacity = opacity;
                    headerRef.current.style.transform = `translateY(${translateY}px)`;
                    
                    // Ensure pointer events are enabled during and after animation
                    headerRef.current.style.pointerEvents = 'auto';
                }
                
                // Mark animations as completed
                if (progress >= 1) {
                    setSubheaderAnimated(true);
                    setHeaderAnimated(true);
                    setAnimationsCompleted(true);
                    
                    // Ensure final state has proper pointer events
                    if (headerRef.current) {
                        headerRef.current.style.pointerEvents = 'auto';
                        headerRef.current.style.zIndex = '1000';
                    }
                    
                    // Notify parent component
                    if (onAnimationComplete) {
                        const animationState = {
                            completed: true,
                            text: currentDisplayText || 'Anthony Le.'
                        };
                        onAnimationComplete(animationState);
                    }
                    return; // Stop the animation loop
                }
            }
            
            animationId = requestAnimationFrame(animateElements);
        };
        
        // Start animation
        animationId = requestAnimationFrame(animateElements);
        
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [typingComplete, subheaderAnimated, headerAnimated, currentDisplayText, onAnimationComplete]);

    // Main animation effect (only runs once)
    useEffect(() => {
        // If animations are already completed, set up the final state immediately
        if (animationsCompleted) {
            // Set final background
            if (portfolioRef.current) {
                portfolioRef.current.style.background = `linear-gradient(60deg, #6497bc 0%, #1d1921 100%)`;
            }
            
            // Set final content state
            if (contentRef.current) {
                contentRef.current.style.opacity = 1;
                contentRef.current.style.transform = 'translateY(0px)';
            }
            
            // Set final typing state
            if (typingTextRef.current) {
                typingTextRef.current.textContent = currentDisplayText || 'Anthony Le.';
                if (typingTextRef.current.parentElement) {
                    typingTextRef.current.parentElement.style.opacity = 1;
                    typingTextRef.current.parentElement.style.transform = 'translateX(0)';
                }
            }
            
            // Set final subheader state
            if (subheaderRef.current) {
                subheaderRef.current.style.opacity = 1;
                subheaderRef.current.style.transform = 'translateY(0)';
            }
            
            // Set final header state with proper interaction
            if (headerRef.current) {
                headerRef.current.style.opacity = 1;
                headerRef.current.style.transform = 'translateY(0)';
                headerRef.current.style.pointerEvents = 'auto';
                headerRef.current.style.zIndex = '1000';
            }
            
            setTypingComplete(true);
            setSubheaderAnimated(true);
            setHeaderAnimated(true);
            return; // Don't run animations again
        }

        let animationId;
        const startTime = Date.now();
        const delayTime = 2000;
        const backgroundDuration = 4000;
        const contentDelay = 4000;
        const contentDuration = 1500;

        // Typing animation variables
        const typingStartDelay = 6000;
        const text1 = "Hi!";
        const text2 = "Anthony Le.";
        const typeSpeed = 150;
        const deleteSpeed = 100;
        const pauseDuration = 1500;

        let typingPhase = 'waiting';
        let currentText = '';
        let charIndex = 0;
        let lastTypingTime = 0;

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

            // Typing animation
            if (elapsed >= delayTime + typingStartDelay) {
                if (typingPhase === 'waiting') {
                    typingPhase = 'typing1';
                    charIndex = 0;
                    lastTypingTime = currentTime;
                }
                
                if (typingPhase === 'typing1') {
                    if (currentTime - lastTypingTime >= typeSpeed) {
                        if (charIndex < text1.length) {
                            currentText = text1.slice(0, charIndex + 1);
                            charIndex++;
                            lastTypingTime = currentTime;
                        } else {
                            typingPhase = 'pausing';
                            lastTypingTime = currentTime;
                        }
                    }
                }
                
                if (typingPhase === 'pausing') {
                    if (currentTime - lastTypingTime >= pauseDuration) {
                        typingPhase = 'deleting';
                        lastTypingTime = currentTime;
                    }
                }
                
                if (typingPhase === 'deleting') {
                    if (currentTime - lastTypingTime >= deleteSpeed) {
                        if (currentText.length > 0) {
                            currentText = currentText.slice(0, -1);
                            lastTypingTime = currentTime;
                        } else {
                            typingPhase = 'typing2';
                            charIndex = 0;
                            lastTypingTime = currentTime;
                        }
                    }
                }
                
                if (typingPhase === 'typing2') {
                    if (currentTime - lastTypingTime >= typeSpeed) {
                        if (charIndex < text2.length) {
                            currentText = text2.slice(0, charIndex + 1);
                            charIndex++;
                            lastTypingTime = currentTime;
                        } else {
                            typingPhase = 'complete';
                            // Mark typing as completed and save final text
                            setTypingComplete(true);
                            setCurrentDisplayText(text2);
                        }
                    }
                }
                
                // Update the typing text
                if (typingTextRef.current) {
                    typingTextRef.current.textContent = currentText;
                    
                    // Show the typing text and h1 container
                    if (typingTextRef.current.parentElement) {
                        typingTextRef.current.parentElement.style.opacity = 1;
                        typingTextRef.current.parentElement.style.transform = 'translateX(0)';
                    }
                }
            }

            // Continue animation until typing is complete
            if (typingPhase !== 'complete') {
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
    }, []); // Remove dependencies to prevent re-running

    const handleNavigation = (sectionId) => {
        setCurrentSection(sectionId);
        
        // Find the target section and scroll to it
        let targetElement = null;
        
        switch(sectionId) {
            case 'home':
                targetElement = document.querySelector('.hero-section');
                break;
            case 'skills':
                targetElement = document.querySelector('.skills-section-wrapper');
                break;
            case 'projects':
                targetElement = document.querySelector('.projects-section-wrapper');
                break;
            case 'experience':
                targetElement = document.querySelector('.experience-section-wrapper');
                break;
            case 'contact':
                targetElement = document.querySelector('.contact-section-wrapper');
                break;
            default:
                targetElement = document.querySelector('.hero-section');
        }
        
        if (targetElement) {
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };
    
    return (
        <div className="modern-portfolio-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Header positioned absolutely within container */}
            <div 
                ref={headerRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    opacity: animationsCompleted ? 1 : 0,
                    transform: animationsCompleted ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'none',
                    pointerEvents: animationsCompleted ? 'auto' : 'none',
                    width: '100%'
                }}
            >
                <HeaderComponent 
                    onNavigate={handleNavigation}
                    currentSection={currentSection}
                />
            </div>
            
            {/* Scrollable content */}
            <div className="modern-portfolio" ref={portfolioRef}>
            <div className="portfolio-content" ref={contentRef}>
                <div className="hero-section" id="home">
                    <h1 style={{
                        fontSize: 'clamp(2rem, 8vw, 5rem)', // Responsive font size
                        fontWeight: '700',
                        margin: '0 0 1rem 0',
                        letterSpacing: '-1px',
                        opacity: animationsCompleted ? 1 : 0,
                        transform: animationsCompleted ? 'translateX(0)' : 'translateX(-30px)',
                        minHeight: 'auto', // Changed from fixed height
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        color: 'white',
                        textAlign: 'center',
                        wordBreak: 'break-word' // Prevent text overflow
                    }}>
                        <span 
                            ref={typingTextRef}
                            style={{
                                display: 'inline-block',
                                color: 'white'
                            }}
                        >
                            {animationsCompleted ? currentDisplayText : ''}
                        </span>
                        <span 
                            ref={cursorRef} 
                            style={{
                                opacity: 0,
                                marginLeft: '2px',
                                fontSize: 'clamp(2rem, 8vw, 5rem)', // Match h1 font size
                                fontWeight: '700',
                                color: 'white',
                                display: 'inline-block'
                            }}
                        >
                            |
                        </span>
                    </h1>
                    
                    <h2 
                        ref={subheaderRef}
                        style={{
                            fontSize: 'clamp(1rem, 3vw, 1.4rem)', // Responsive subheader size
                            fontWeight: '400',
                            margin: '0 0 0 0',
                            letterSpacing: '0.5px',
                            opacity: animationsCompleted ? 1 : 0,
                            transform: animationsCompleted ? 'translateY(0)' : 'translateY(20px)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            textAlign: 'center',
                            maxWidth: '100%',
                            wordWrap: 'break-word'
                        }}
                    >
                        4th Year Comp Sci @ uOttawa | Software Developer
                    </h2>
                    
                    {/* Scroll down indicator */}
                    <div 
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginTop: '3rem',
                            opacity: animationsCompleted ? 1 : 0,
                            transform: animationsCompleted ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            const skillsSection = document.querySelector('.skills-section-wrapper');
                            if (skillsSection) {
                                skillsSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        <div 
                            style={{
                                fontSize: '2rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                                animation: 'bounce 2s infinite',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.color = 'rgba(255, 255, 255, 1)';
                                e.target.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            ↓
                        </div>
                        <div 
                            style={{
                                fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                                color: 'rgba(255, 255, 255, 0.6)',
                                marginTop: '0.5rem',
                                textAlign: 'center',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                            }}
                        >
                            scroll down.
                        </div>
                    </div>
                </div>
                
                <div className="skills-section-wrapper" id="skills">
                    <SkillsSectionComponent 
                        shouldAnimate={headerAnimated && subheaderAnimated}
                    />
                </div>
                
                <div className="projects-section-wrapper" id="projects">
                    <ProjectsComponent 
                        shouldAnimate={headerAnimated && subheaderAnimated}
                    />
                </div>
                
                <div className="experience-section-wrapper" id="experience">
                    <ExperienceComponent 
                        shouldAnimate={headerAnimated && subheaderAnimated}
                    />
                </div>
                
                <div className="contact-section-wrapper" id="contact">
                    <ContactComponent 
                        shouldAnimate={headerAnimated && subheaderAnimated}
                    />
                </div>
                
                <FooterComponent />
            </div>
        </div>
        </div>
    );
};

export default ModernPortfolio;