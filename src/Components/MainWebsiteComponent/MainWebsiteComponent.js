import React, {useState, useEffect} from "react";
import "98.css"
import "./MainWebsiteComponent.css";
import { Rnd } from "react-rnd";
import ModernPortfolio from "./Components/ModernPortfolio/ModernPortfolio";

function MainWebsiteComponent({ onMinimize, onClose, restoreMaximized = false }) {
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

    // Alternative approach - calculate exact taskbar height
    const getMaximizedDimensions = () => {
        // Assuming taskbar is about 28-30px high based on your screenshot
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

    // Handle browser resize
    useEffect(() => {
        const handleBrowserResize = () => {
            if (isMaximized && !isAnimating) {
                const newMaximizedDimensions = getMaximizedDimensions();
                setWindowState(newMaximizedDimensions);
            } else if (!isMaximized && !isAnimating) {
                const newCenteredPosition = getCenteredPosition();
                setWindowState(prev => ({
                    ...prev,
                    x: newCenteredPosition.x,
                    y: newCenteredPosition.y
                }));
            }
        };

        window.addEventListener('resize', handleBrowserResize);
        return () => window.removeEventListener('resize', handleBrowserResize);
    }, [isMaximized, isAnimating]);

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
        <Rnd
            size={{ width: windowState.width, height: windowState.height }}
            position={{ x: windowState.x, y: windowState.y }}
            minWidth={300}
            minHeight={200}
            dragHandleClassName="title-bar"
            disableDragging={isMaximized || isAnimating}
            enableResizing={!isMaximized && !isAnimating}
            style={{ zIndex: 1000 }}
            className={getWindowClassName()}
            onDragStop={(e, d) => {
                if (!isMaximized && !isAnimating) {
                    setWindowState(prev => ({
                        ...prev,
                        x: d.x,
                        y: d.y
                    }));
                }
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                if (!isMaximized && !isAnimating) {
                    setWindowState({
                        x: position.x,
                        y: position.y,
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height)
                    });
                }
            }}
            resizeHandleWrapperStyle={{
                display: isMaximized || isAnimating ? 'none' : 'block'
            }}
        >
            <div className="window" style={{ width: '100%', height: '100%' }}>
                <div className="title-bar mainWebsiteWindow">
                    <div className="title-bar-text">Main Website</div>
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
                    <ModernPortfolio />
                </div>
            </div>
        </Rnd>
    );
};

export default MainWebsiteComponent;