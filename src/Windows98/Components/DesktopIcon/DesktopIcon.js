import React, { useRef, useCallback } from 'react';
import './DesktopIcon.css';

const MyComputerIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        {/* Monitor */}
        <rect x="3" y="2" width="26" height="20" rx="2" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
        <rect x="5" y="4" width="22" height="14" fill="#000080" />
        {/* Stand */}
        <rect x="12" y="22" width="8" height="3" fill="#c0c0c0" />
        <rect x="9" y="25" width="14" height="2" fill="#808080" />
        {/* Indicator light */}
        <circle cx="16" cy="20" r="1" fill="#00ff00" />
    </svg>
);

const IEIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        {/* Globe background */}
        <circle cx="16" cy="16" r="14" fill="#003399" />
        <circle cx="16" cy="16" r="14" fill="none" stroke="#6699ff" strokeWidth="0.5" />
        {/* Italic e */}
        <text x="7" y="24" fontSize="20" fill="white" fontFamily="Times New Roman, serif" fontWeight="bold" fontStyle="italic">e</text>
        {/* Orbital ring */}
        <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#ffa500" strokeWidth="2.5" transform="rotate(-30 16 16)" />
    </svg>
);

const RecycleBinIcon = ({ hasItems = false }) => (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        {/* Bin body */}
        <path d="M8 12 L10 28 L22 28 L24 12 Z" fill={hasItems ? '#c0c0c0' : '#e0e0e0'} stroke="#808080" strokeWidth="1" />
        {/* Lid */}
        <rect x="6" y="9" width="20" height="3" rx="1" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
        {/* Handle */}
        <rect x="13" y="6" width="6" height="4" rx="1" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
        {/* Lines on bin */}
        <line x1="13" y1="15" x2="12" y2="26" stroke="#808080" strokeWidth="1" />
        <line x1="16" y1="15" x2="16" y2="26" stroke="#808080" strokeWidth="1" />
        <line x1="19" y1="15" x2="20" y2="26" stroke="#808080" strokeWidth="1" />
    </svg>
);

const ICONS = {
    'my-computer': MyComputerIcon,
    'internet-explorer': IEIcon,
    'recycle-bin': RecycleBinIcon,
};

const DesktopIcon = ({ iconType, label, selected, onSelect, onDoubleClick }) => {
    const clickTimer = useRef(null);
    const clickCount = useRef(0);

    const handleClick = useCallback((e) => {
        e.stopPropagation();
        onSelect && onSelect();
        clickCount.current += 1;

        if (clickCount.current === 1) {
            clickTimer.current = setTimeout(() => {
                clickCount.current = 0;
            }, 300);
        } else if (clickCount.current === 2) {
            clearTimeout(clickTimer.current);
            clickCount.current = 0;
            onDoubleClick && onDoubleClick();
        }
    }, [onSelect, onDoubleClick]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            onDoubleClick && onDoubleClick();
        }
    }, [onDoubleClick]);

    const IconComponent = ICONS[iconType] || IEIcon;

    return (
        <div
            className={`win98-desktop-icon${selected ? ' win98-desktop-icon--selected' : ''}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`${label} (double-click to open)`}
        >
            <div className="win98-desktop-icon-img">
                <IconComponent />
            </div>
            <span className="win98-desktop-icon-label">{label}</span>
        </div>
    );
};

export default DesktopIcon;
