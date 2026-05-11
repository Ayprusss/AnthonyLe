import React, { useState, useEffect, useCallback } from 'react';
import '98.css';
import './Desktop.css';
import Taskbar from '../Components/Taskbar/Taskbar';
import StartMenu from '../Components/StartMenu/StartMenu';
import DesktopIcon from '../Components/DesktopIcon/DesktopIcon';
import IEBrowser from '../Components/IEBrowser/IEBrowser';
import AppWindow from '../Components/AppWindow/AppWindow';
import Minesweeper from '../Games/Minesweeper/Minesweeper';
import Solitaire from '../Games/Solitaire/Solitaire';

function makeWindowState() {
    return { open: false, minimized: false, focused: false };
}

const Desktop = () => {
    const [browser, setBrowser] = useState(makeWindowState());
    const [minesweeper, setMinesweeper] = useState(makeWindowState());
    const [solitaire, setSolitaire] = useState(makeWindowState());
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    /* ── Generic window helpers ── */
    const focusOnly = useCallback((setter) => {
        setBrowser(w => ({ ...w, focused: false }));
        setMinesweeper(w => ({ ...w, focused: false }));
        setSolitaire(w => ({ ...w, focused: false }));
        setter(w => ({ ...w, focused: true }));
    }, []);

    const openWindow = useCallback((setter) => {
        setBrowser(w => ({ ...w, focused: false }));
        setMinesweeper(w => ({ ...w, focused: false }));
        setSolitaire(w => ({ ...w, focused: false }));
        setter(w =>
            w.open && w.minimized
                ? { ...w, minimized: false, focused: true }
                : w.open
                ? { ...w, focused: true }
                : { open: true, minimized: false, focused: true }
        );
    }, []);

    const taskbarClick = useCallback((setter, state) => {
        if (state.minimized) {
            focusOnly(setter);
            setter(w => ({ ...w, minimized: false }));
        } else if (state.focused) {
            setter(w => ({ ...w, minimized: true, focused: false }));
        } else {
            focusOnly(setter);
        }
    }, [focusOnly]);

    /* ── Browser ── */
    const openBrowser = useCallback(() => openWindow(setBrowser), [openWindow]);
    const closeBrowser = useCallback(() => setBrowser(makeWindowState()), []);
    const minimizeBrowser = useCallback(() => setBrowser(w => ({ ...w, minimized: true, focused: false })), []);

    /* ── Minesweeper ── */
    const openMinesweeper = useCallback(() => openWindow(setMinesweeper), [openWindow]);
    const closeMinesweeper = useCallback(() => setMinesweeper(makeWindowState()), []);
    const minimizeMinesweeper = useCallback(() => setMinesweeper(w => ({ ...w, minimized: true, focused: false })), []);

    /* ── Solitaire ── */
    const openSolitaire = useCallback(() => openWindow(setSolitaire), [openWindow]);
    const closeSolitaire = useCallback(() => setSolitaire(makeWindowState()), []);
    const minimizeSolitaire = useCallback(() => setSolitaire(w => ({ ...w, minimized: true, focused: false })), []);

    /* ── Start menu ── */
    const closeStartMenu = useCallback(() => setIsStartMenuOpen(false), []);

    const handleOpenGame = useCallback((game) => {
        if (game === 'minesweeper') openMinesweeper();
        if (game === 'solitaire') openSolitaire();
    }, [openMinesweeper, openSolitaire]);

    const handleDesktopClick = useCallback(() => {
        closeStartMenu();
        setSelectedIcon(null);
    }, [closeStartMenu]);

    /* ── Taskbar windows list ── */
    const openWindows = [
        browser.open && {
            id: 'ie',
            title: 'Personal Website',
            minimized: browser.minimized,
            focused: browser.focused,
            onClick: () => taskbarClick(setBrowser, browser),
        },
        minesweeper.open && {
            id: 'minesweeper',
            title: 'Minesweeper',
            minimized: minesweeper.minimized,
            focused: minesweeper.focused,
            onClick: () => taskbarClick(setMinesweeper, minesweeper),
        },
        solitaire.open && {
            id: 'solitaire',
            title: 'Solitaire',
            minimized: solitaire.minimized,
            focused: solitaire.focused,
            onClick: () => taskbarClick(setSolitaire, solitaire),
        },
    ].filter(Boolean);

    return (
        <div className="win98-root win98-desktop" onClick={handleDesktopClick}>

            {/* Desktop icons */}
            <div className="win98-icon-grid">
                <DesktopIcon
                    iconType="my-computer"
                    label="My Computer"
                    selected={selectedIcon === 'my-computer'}
                    onSelect={() => setSelectedIcon('my-computer')}
                    onDoubleClick={() => {}}
                />
                <DesktopIcon
                    iconType="internet-explorer"
                    label="Personal Website"
                    selected={selectedIcon === 'internet-explorer'}
                    onSelect={() => setSelectedIcon('internet-explorer')}
                    onDoubleClick={openBrowser}
                />
                <DesktopIcon
                    iconType="recycle-bin"
                    label="Recycle Bin"
                    selected={selectedIcon === 'recycle-bin'}
                    onSelect={() => setSelectedIcon('recycle-bin')}
                    onDoubleClick={() => {}}
                />
            </div>

            {/* IE Browser window */}
            {browser.open && (
                <IEBrowser
                    minimized={browser.minimized}
                    focused={browser.focused}
                    onClose={closeBrowser}
                    onMinimize={minimizeBrowser}
                    onFocus={() => focusOnly(setBrowser)}
                />
            )}

            {/* Minesweeper window */}
            {minesweeper.open && (
                <AppWindow
                    title="Minesweeper"
                    icon="💣"
                    minimized={minesweeper.minimized}
                    focused={minesweeper.focused}
                    onClose={closeMinesweeper}
                    onMinimize={minimizeMinesweeper}
                    onFocus={() => focusOnly(setMinesweeper)}
                    defaultWidth={340}
                    defaultHeight={420}
                    minWidth={280}
                    minHeight={320}
                >
                    <Minesweeper />
                </AppWindow>
            )}

            {/* Solitaire window */}
            {solitaire.open && (
                <AppWindow
                    title="Solitaire"
                    icon="🃏"
                    minimized={solitaire.minimized}
                    focused={solitaire.focused}
                    onClose={closeSolitaire}
                    onMinimize={minimizeSolitaire}
                    onFocus={() => focusOnly(setSolitaire)}
                    defaultWidth={620}
                    defaultHeight={520}
                    minWidth={480}
                    minHeight={380}
                >
                    <Solitaire />
                </AppWindow>
            )}

            {/* Start menu */}
            {isStartMenuOpen && (
                <StartMenu
                    onClose={closeStartMenu}
                    onOpenGame={handleOpenGame}
                />
            )}

            {/* Taskbar */}
            <Taskbar
                openWindows={openWindows}
                time={time}
                isStartMenuOpen={isStartMenuOpen}
                onStartClick={(e) => {
                    e.stopPropagation();
                    setIsStartMenuOpen(prev => !prev);
                }}
            />
        </div>
    );
};

export default Desktop;
