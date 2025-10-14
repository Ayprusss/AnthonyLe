/* filepath: c:\Users\Antho\Downloads\personalWebsiteP3\anthonyle\src\Components\MainWebsiteComponent\Components\HeaderComponent\HeaderComponent.js */
import React, { useState, useEffect } from 'react';
import './HeaderComponent.css';
import logo from './assets/ppp-logo-white.png';

function HeaderComponent({ onNavigate, currentSection = 'home' }) {
    const [activeSection, setActiveSection] = useState(currentSection);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Navigation items (removed icons)
    const navigationItems = [
        { id: 'home', label: 'Home' },
        { id: 'skills', label: 'Skills' },
        { id: 'projects', label: 'Projects' },
        { id: 'experience', label: 'Experience' },
        { id: 'contact', label: 'Contact' }
    ];

    // Update active section when prop changes
    useEffect(() => {
        setActiveSection(currentSection);
    }, [currentSection]);

    // Handle navigation click
    const handleNavClick = async (e, sectionId) => {
        e.preventDefault();
        
        if (sectionId === activeSection || isAnimating) {
            return; // Don't navigate if already on section or animating
        }

        setIsAnimating(true);
        
        // Close mobile menu if open
        setIsMobileMenuOpen(false);
        
        // Add a small delay for visual feedback
        setTimeout(() => {
            setActiveSection(sectionId);
            
            // Call parent navigation handler
            if (onNavigate) {
                onNavigate(sectionId);
            }
            
            // Reset animation state
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
        }, 150);
    };

    // Handle mobile menu toggle
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu when clicking outside (but not on the toggle button)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && 
                !event.target.closest('.mobile-menu') && 
                !event.target.closest('.mobile-toggle')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    return (
        <header className="header-component">
            <nav className="navigation-bar">
                <div className="nav-container">
                    {/* Logo/Brand - Replace emoji with logo */}
                    <div className="nav-brand">
                        <img 
                            src={logo} 
                            alt="Anthony Le Logo" 
                            className="brand-logo"
                        />
                    </div>

                    {/* Desktop Navigation Links */}
                    <ul className="nav-links desktop-nav">
                        {navigationItems.map((item) => (
                            <li 
                                key={item.id}
                                className={`nav-item ${activeSection === item.id ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
                            >
                                <a
                                    href={`#${item.id}`}
                                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={(e) => handleNavClick(e, item.id)}
                                    aria-label={`Navigate to ${item.label}`}
                                >
                                    <span className="nav-text">{item.label}</span>
                                    <span className="nav-underline"></span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile menu toggle */}
                    <button 
                        className={`mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>
                </div>

                {/* Progress indicator (for future use) */}
                <div className="nav-progress">
                    <div 
                        className="progress-bar"
                        style={{
                            transform: `translateX(${navigationItems.findIndex(item => item.id === activeSection) * 20}%)`
                        }}
                    ></div>
                </div>
            </nav>

            {/* Mobile Navigation Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <ul className="mobile-nav-links">
                    {navigationItems.map((item) => (
                        <li 
                            key={item.id}
                            className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
                        >
                            <a
                                href={`#${item.id}`}
                                className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
                                onClick={(e) => handleNavClick(e, item.id)}
                                aria-label={`Navigate to ${item.label}`}
                            >
                                <span className="mobile-nav-text">{item.label}</span>
                                <span className="mobile-nav-underline"></span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
}

export default HeaderComponent;