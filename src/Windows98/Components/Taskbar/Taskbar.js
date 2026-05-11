import React from 'react';
import './Taskbar.css';

const WindowsLogoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="win98-logo-icon">
        <rect x="0" y="0" width="7" height="7" fill="#ff0000" />
        <rect x="9" y="0" width="7" height="7" fill="#00aa00" />
        <rect x="0" y="9" width="7" height="7" fill="#0000ff" />
        <rect x="9" y="9" width="7" height="7" fill="#ffff00" />
    </svg>
);

const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
};

const Taskbar = ({ openWindows = [], time, isStartMenuOpen, onStartClick }) => {
    return (
        <div className="win98-taskbar" role="toolbar" aria-label="Taskbar">
            {/* Start button */}
            <button
                className={`win98-start-btn${isStartMenuOpen ? ' win98-start-btn--active' : ''}`}
                onClick={onStartClick}
                aria-haspopup="menu"
                aria-expanded={isStartMenuOpen}
            >
                <WindowsLogoIcon />
                <span>Start</span>
            </button>

            {/* Taskbar separator */}
            <div className="win98-taskbar-sep" aria-hidden="true" />

            {/* Open windows */}
            <div className="win98-taskbar-windows" role="group" aria-label="Open windows">
                {openWindows.map(win => (
                    <button
                        key={win.id}
                        className={`win98-taskbar-window-btn${win.focused && !win.minimized ? ' win98-taskbar-window-btn--active' : ''}`}
                        onClick={win.onClick}
                        title={win.title}
                        aria-pressed={win.focused && !win.minimized}
                    >
                        <span className="win98-taskbar-ie-icon" aria-hidden="true">
                            <IEIconSmall />
                        </span>
                        <span className="win98-taskbar-window-title">{win.title}</span>
                    </button>
                ))}
            </div>

            {/* System tray */}
            <div className="win98-system-tray" aria-label="System clock">
                <time className="win98-clock" dateTime={time?.toISOString()}>
                    {time ? formatTime(time) : ''}
                </time>
            </div>
        </div>
    );
};

const IEIconSmall = () => (
    <svg width="14" height="14" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="11" fill="#003399" />
        <text x="6" y="21" fontSize="17" fill="white" fontFamily="Arial" fontWeight="bold" fontStyle="italic">e</text>
        <ellipse cx="14" cy="14" rx="13" ry="5" fill="none" stroke="#ffa500" strokeWidth="2.5" transform="rotate(-30 14 14)" />
    </svg>
);

export default Taskbar;
