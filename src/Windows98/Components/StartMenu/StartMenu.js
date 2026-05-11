import React, { useState, useRef, useEffect } from 'react';
import './StartMenu.css';

const StartMenu = ({ onClose, onOpenGame }) => {
    const [programsOpen, setProgramsOpen] = useState(false);
    const [gamesOpen, setGamesOpen] = useState(false);
    const programsRef = useRef(null);

    useEffect(() => {
        if (!programsOpen) setGamesOpen(false);
    }, [programsOpen]);

    const handleItemClick = (e) => {
        e.stopPropagation();
        onClose();
    };

    const openGame = (game) => {
        onOpenGame && onOpenGame(game);
        onClose();
    };

    return (
        <div
            className="win98-start-menu"
            role="menu"
            aria-label="Start menu"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Left banner */}
            <div className="win98-start-menu-banner" aria-hidden="true">
                <span className="win98-start-menu-banner-text">Windows</span>
                <span className="win98-start-menu-banner-text win98-start-menu-banner-text--bold">98</span>
            </div>

            {/* Menu items */}
            <div className="win98-start-menu-items" role="group">

                {/* Programs — with cascade */}
                <div
                    className="win98-start-menu-item-wrap"
                    ref={programsRef}
                    onMouseEnter={() => setProgramsOpen(true)}
                    onMouseLeave={() => setProgramsOpen(false)}
                >
                    <button
                        className={`win98-start-menu-item${programsOpen ? ' win98-start-menu-item--active' : ''}`}
                        role="menuitem"
                        aria-haspopup="true"
                        aria-expanded={programsOpen}
                    >
                        <span className="win98-start-menu-item-icon" aria-hidden="true">📁</span>
                        <span className="win98-start-menu-item-label">Programs</span>
                        <span className="win98-start-menu-item-arrow" aria-hidden="true">▶</span>
                    </button>

                    {/* Programs submenu */}
                    {programsOpen && (
                        <div className="win98-submenu" role="menu" aria-label="Programs">

                            {/* Games folder — with cascade */}
                            <div
                                className="win98-submenu-item-wrap"
                                onMouseEnter={() => setGamesOpen(true)}
                                onMouseLeave={() => setGamesOpen(false)}
                            >
                                <button
                                    className={`win98-start-menu-item${gamesOpen ? ' win98-start-menu-item--active' : ''}`}
                                    role="menuitem"
                                    aria-haspopup="true"
                                    aria-expanded={gamesOpen}
                                >
                                    <span className="win98-start-menu-item-icon" aria-hidden="true">🎮</span>
                                    <span className="win98-start-menu-item-label">Games</span>
                                    <span className="win98-start-menu-item-arrow" aria-hidden="true">▶</span>
                                </button>

                                {/* Games submenu */}
                                {gamesOpen && (
                                    <div className="win98-submenu win98-submenu--nested" role="menu" aria-label="Games">
                                        <button
                                            className="win98-start-menu-item"
                                            role="menuitem"
                                            onClick={() => openGame('minesweeper')}
                                        >
                                            <span className="win98-start-menu-item-icon" aria-hidden="true">💣</span>
                                            <span className="win98-start-menu-item-label">Minesweeper</span>
                                        </button>
                                        <button
                                            className="win98-start-menu-item"
                                            role="menuitem"
                                            onClick={() => openGame('solitaire')}
                                        >
                                            <span className="win98-start-menu-item-icon" aria-hidden="true">🃏</span>
                                            <span className="win98-start-menu-item-label">Solitaire</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Other menu items */}
                {[
                    { icon: '⭐', label: 'Favorites', arrow: true },
                    { icon: '📄', label: 'Documents', arrow: true },
                    { icon: '⚙️', label: 'Settings', arrow: true },
                    { icon: '🔍', label: 'Find', arrow: true },
                    { icon: '❓', label: 'Help' },
                    { icon: '▶', label: 'Run...' },
                ].map((item) => (
                    <button
                        key={item.label}
                        className="win98-start-menu-item"
                        role="menuitem"
                        onClick={handleItemClick}
                        onMouseEnter={() => setProgramsOpen(false)}
                    >
                        <span className="win98-start-menu-item-icon" aria-hidden="true">{item.icon}</span>
                        <span className="win98-start-menu-item-label">{item.label}</span>
                        {item.arrow && (
                            <span className="win98-start-menu-item-arrow" aria-hidden="true">▶</span>
                        )}
                    </button>
                ))}

                {/* Divider */}
                <div className="win98-start-menu-divider" role="separator" aria-hidden="true" />

                {/* Shut Down */}
                <button
                    className="win98-start-menu-item"
                    role="menuitem"
                    onClick={handleItemClick}
                    onMouseEnter={() => setProgramsOpen(false)}
                >
                    <span className="win98-start-menu-item-icon" aria-hidden="true">🖥️</span>
                    <span className="win98-start-menu-item-label">Shut Down...</span>
                </button>
            </div>
        </div>
    );
};

export default StartMenu;
