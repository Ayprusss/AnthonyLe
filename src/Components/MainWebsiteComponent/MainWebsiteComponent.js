import React, {useState, useEffect} from "react";
import "98.css"
import "./MainWebsiteComponent.css";
import { Rnd } from "react-rnd";
import ModernPortfolio from "./Components/ModernPortfolio/ModernPortfolio";

function MainWebsiteComponent({ onMinimize, onClose, restoreMaximized = false, portfolioAnimationState = null, onPortfolioAnimationComplete }) {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationType, setAnimationType] = useState('');
    
    // Calculate center position
    const getCenteredPosition = () => {
        const windowWidth = 700;
        const windowHeight = 500;
        const centerX = (window.innerWidth - windowWidth) / 2;
        const centerY = (window.innerHeight - windowHeight) / 2;
        
        return {
            x: Math.max(0, centerX),
            y: Math.max(0, centerY),
            width: windowWidth,
            height: windowHeight
        };
    };

    const [windowState, setWindowState] = useState(getCenteredPosition());
    const [originalPosition, setOriginalPosition] = useState(getCenteredPosition());

    // Restore maximized state when component becomes visible
    useEffect(() => {
        if (restoreMaximized && !isMaximized) {
            handleMaximize();
        }
    }, [restoreMaximized]);

    const getMaximizedDimensions = () => {
        const taskbarHeight = 28;
        return {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight - taskbarHeight
        };
    };

    const handleMaximize = () => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        
        if (isMaximized) {
            setAnimationType('minimizing');
            setTimeout(() => {
                setWindowState(originalPosition);
                setIsMaximized(false);
                setIsAnimating(false);
                setAnimationType('');
            }, 250);
        } else {
            setAnimationType('maximizing');
            setOriginalPosition({...windowState});
            setTimeout(() => {
                setWindowState(getMaximizedDimensions());
                setIsMaximized(true);
                setIsAnimating(false);
                setAnimationType('');
            }, 250);
        }
    };

    const handleMinimize = () => {
        if (onMinimize) {
            // Pass the current maximized state to parent
            onMinimize(isMaximized);
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    // Handle portfolio animation completion
    const handlePortfolioAnimationComplete = (animationState) => {
        if (onPortfolioAnimationComplete) {
            onPortfolioAnimationComplete(animationState);
        }
    };

    // Clamp function to keep values within bounds
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    // Handle position updates with clamping
    const updatePosition = (newX, newY, newWidth = windowState.width, newHeight = windowState.height) => {
        const taskbarHeight = 28;
        const maxX = window.innerWidth - newWidth;
        const maxY = window.innerHeight - taskbarHeight - newHeight;
        
        const clampedX = clamp(newX, 0, Math.max(0, maxX));
        const clampedY = clamp(newY, 0, Math.max(0, maxY));
        
        return { x: clampedX, y: clampedY, width: newWidth, height: newHeight };
    };

    // Handle browser resize
    useEffect(() => {
        const handleBrowserResize = () => {
            if (isMaximized && !isAnimating) {
                const newMaximizedDimensions = getMaximizedDimensions();
                setWindowState(newMaximizedDimensions);
            } else if (!isMaximized && !isAnimating) {
                const newState = updatePosition(windowState.x, windowState.y, windowState.width, windowState.height);
                setWindowState(newState);
            }
        };

        window.addEventListener('resize', handleBrowserResize);
        return () => window.removeEventListener('resize', handleBrowserResize);
    }, [isMaximized, isAnimating, windowState]);

    useEffect(() => {
        if (isMaximized && !isAnimating) {
            const currentMaximizedDimensions = getMaximizedDimensions();
            setWindowState(currentMaximizedDimensions);
        }
    }, [isMaximized]);

    const getWindowClassName = () => {
        let className = "main-website-animated";
        if (animationType === 'maximizing') {
            className += " main-website-maximizing";
        } else if (animationType === 'minimizing') {
            className += " main-website-minimizing";
        }
        return className;
    };

    return(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 999
        }}>
            <Rnd
                size={{ width: windowState.width, height: windowState.height }}
                position={{ x: windowState.x, y: windowState.y }}
                minWidth={300}
                minHeight={200}
                dragHandleClassName="title-bar"
                disableDragging={isMaximized || isAnimating}
                enableResizing={!isMaximized && !isAnimating}
                style={{ 
                    zIndex: 1000,
                    pointerEvents: 'auto',
                    position: 'relative'
                }}
                className={getWindowClassName()}
                onDragStop={(e, d) => {
                    if (!isMaximized && !isAnimating) {
                        const newState = updatePosition(d.x, d.y);
                        setWindowState(newState);
                    }
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    if (!isMaximized && !isAnimating) {
                        const newWidth = parseInt(ref.style.width);
                        const newHeight = parseInt(ref.style.height);
                        const newState = updatePosition(position.x, position.y, newWidth, newHeight);
                        setWindowState(newState);
                    }
                }}
                resizeHandleWrapperStyle={{
                    display: isMaximized || isAnimating ? 'none' : 'block'
                }}
            >
                <div className="window" style={{ width: '100%', height: '100%' }}>
                    <div className="title-bar mainWebsiteWindow">
                        <div className="title-bar-text">Ayprusss.dev</div>
                        <div className="title-bar-controls">
                            <button aria-label="Minimize" onClick={handleMinimize}></button>
                            <button 
                                aria-label="Maximize" 
                                onClick={handleMaximize}
                                disabled={isAnimating}
                            ></button>
                            <button aria-label="Close" onClick={handleClose}></button>
                        </div>
                    </div>
                    <div className="window-body mainWebsiteBody" style={{ height: 'calc(100% - 32px)', padding: 0, margin: 0 }}>
                        <ModernPortfolio 
                            initialAnimationState={portfolioAnimationState}
                            onAnimationComplete={handlePortfolioAnimationComplete}
                        />
                    </div>
                </div>
            </Rnd>
        </div>
    );
};

export default MainWebsiteComponent;