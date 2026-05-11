import React, { useState, useRef, useEffect, useCallback } from 'react';
import './IEBrowser.css';

const MIN_WIDTH = 380;
const MIN_HEIGHT = 280;
const TASKBAR_H = 32;

const isTouchDevice = () =>
    window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const IEIcon = () => (
    <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#003399" />
        <text x="7" y="24" fontSize="20" fill="white" fontFamily="Times New Roman, serif" fontWeight="bold" fontStyle="italic">e</text>
        <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#ffa500" strokeWidth="2.5" transform="rotate(-30 16 16)" />
    </svg>
);

const IEBrowser = ({ minimized, focused, onClose, onMinimize, onFocus }) => {
    const mobile = isTouchDevice();

    const [pos, setPos] = useState(() => ({
        x: Math.max(0, Math.floor((window.innerWidth - Math.min(960, window.innerWidth - 40)) / 2)),
        y: Math.max(0, Math.floor((window.innerHeight - TASKBAR_H - Math.min(640, window.innerHeight - TASKBAR_H - 40)) / 2)),
    }));
    const [size, setSize] = useState(() => ({
        width: Math.min(960, window.innerWidth - 40),
        height: Math.min(640, window.innerHeight - TASKBAR_H - 40),
    }));
    const [maximized, setMaximized] = useState(mobile);
    const [prevBounds, setPrevBounds] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [addressInput, setAddressInput] = useState(
        `${window.location.protocol}//${window.location.host}/site`
    );
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const iframeRef = useRef(null);
    const dragData = useRef(null);
    const resizeData = useRef(null);

    /* ── Drag ── */
    const startDrag = useCallback((e) => {
        if (maximized || e.target.closest('.title-bar-controls')) return;
        e.preventDefault();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        dragData.current = { cx, cy, px: pos.x, py: pos.y };
        setIsDragging(true);
        onFocus && onFocus();
    }, [maximized, pos, onFocus]);

    /* ── Resize ── */
    const startResize = useCallback((e) => {
        if (maximized) return;
        e.preventDefault();
        e.stopPropagation();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        resizeData.current = { cx, cy, w: size.width, h: size.height };
        setIsResizing(true);
    }, [maximized, size]);

    useEffect(() => {
        const onMove = (e) => {
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;

            if (dragData.current) {
                const dx = cx - dragData.current.cx;
                const dy = cy - dragData.current.cy;
                setPos({
                    x: clamp(dragData.current.px + dx, 0, window.innerWidth - MIN_WIDTH),
                    y: clamp(dragData.current.py + dy, 0, window.innerHeight - TASKBAR_H - 28),
                });
            }

            if (resizeData.current) {
                const dw = cx - resizeData.current.cx;
                const dh = cy - resizeData.current.cy;
                setSize({
                    width: clamp(resizeData.current.w + dw, MIN_WIDTH, window.innerWidth),
                    height: clamp(resizeData.current.h + dh, MIN_HEIGHT, window.innerHeight - TASKBAR_H),
                });
            }
        };

        const onEnd = () => {
            dragData.current = null;
            resizeData.current = null;
            setIsDragging(false);
            setIsResizing(false);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        return () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        };
    }, []);

    /* ── Maximize / Restore ── */
    const handleMaximize = useCallback(() => {
        if (maximized) {
            setMaximized(false);
            if (prevBounds) {
                setPos(prevBounds.pos);
                setSize(prevBounds.size);
                setPrevBounds(null);
            }
        } else {
            setPrevBounds({ pos, size });
            setMaximized(true);
        }
    }, [maximized, pos, size, prevBounds]);

    /* ── Navigation helpers ── */
    const iframeNav = useCallback((fn) => {
        try { fn(iframeRef.current?.contentWindow); }
        catch (_) {}
    }, []);

    const goHome = useCallback(() => {
        if (iframeRef.current) {
            iframeRef.current.src = '/site';
            setAddressInput(`${window.location.protocol}//${window.location.host}/site`);
        }
    }, []);

    const handleAddressKey = useCallback((e) => {
        if (e.key === 'Enter') {
            try {
                if (iframeRef.current) {
                    iframeRef.current.src = '/site';
                }
            } catch (_) {}
        }
    }, []);

    /* ── Window style ── */
    const style = maximized
        ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: `calc(100vh - ${TASKBAR_H}px)`, zIndex: focused ? 110 : 100 }
        : { position: 'fixed', left: pos.x, top: pos.y, width: size.width, height: size.height, zIndex: focused ? 110 : 100 };

    const visible = !minimized;

    return (
        <div
            className={`ie-window window${focused ? ' ie-window--focused' : ''}${!visible ? ' ie-window--hidden' : ''}`}
            style={style}
            onMouseDown={onFocus}
            role="dialog"
            aria-label="Internet Explorer — Personal Website"
            aria-modal="false"
        >
            {/* ── Title bar ── */}
            <div
                className="title-bar ie-title-bar"
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                onDoubleClick={handleMaximize}
            >
                <div className="title-bar-text ie-title-text">
                    <IEIcon />
                    <span>Personal Website – Microsoft Internet Explorer</span>
                </div>
                <div className="title-bar-controls">
                    <button
                        aria-label="Minimize"
                        onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                        title="Minimize"
                    />
                    <button
                        aria-label={maximized ? 'Restore' : 'Maximize'}
                        onClick={(e) => { e.stopPropagation(); handleMaximize(); }}
                        title={maximized ? 'Restore' : 'Maximize'}
                    />
                    <button
                        aria-label="Close"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        title="Close"
                    />
                </div>
            </div>

            {/* ── Window body ── */}
            <div className="window-body ie-body">

                {/* Menu bar */}
                <div className="ie-menu-bar" role="menubar" aria-label="Menu">
                    {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map(item => (
                        <button
                            key={item}
                            className="ie-menu-item"
                            role="menuitem"
                            tabIndex={-1}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="ie-toolbar" role="toolbar" aria-label="Navigation toolbar">
                    <div className="ie-nav-btns">
                        <button
                            className="ie-nav-btn"
                            title="Back"
                            aria-label="Back"
                            onClick={() => iframeNav(w => w.history.back())}
                        >
                            <span aria-hidden="true">◀</span>
                            <span className="ie-btn-label">Back</span>
                        </button>
                        <button
                            className="ie-nav-btn"
                            title="Forward"
                            aria-label="Forward"
                            onClick={() => iframeNav(w => w.history.forward())}
                        >
                            <span className="ie-btn-label">Forward</span>
                            <span aria-hidden="true">▶</span>
                        </button>
                        <button
                            className="ie-nav-btn"
                            title="Stop"
                            aria-label="Stop"
                            onClick={() => iframeNav(w => w.stop())}
                        >
                            <span aria-hidden="true">✕</span>
                            <span className="ie-btn-label">Stop</span>
                        </button>
                        <button
                            className="ie-nav-btn"
                            title="Refresh"
                            aria-label="Refresh"
                            onClick={() => iframeNav(w => w.location.reload())}
                        >
                            <span aria-hidden="true">↻</span>
                            <span className="ie-btn-label">Refresh</span>
                        </button>
                        <button
                            className="ie-nav-btn"
                            title="Home"
                            aria-label="Home"
                            onClick={goHome}
                        >
                            <span aria-hidden="true">🏠</span>
                            <span className="ie-btn-label">Home</span>
                        </button>
                    </div>

                    {/* Address bar */}
                    <div className="ie-address-row">
                        <label className="ie-address-label" htmlFor="ie-address-input">
                            Address
                        </label>
                        <div className="ie-address-field">
                            <span className="ie-address-icon" aria-hidden="true">
                                <IEIcon />
                            </span>
                            <input
                                id="ie-address-input"
                                type="text"
                                className="ie-address-input"
                                value={addressInput}
                                onChange={(e) => setAddressInput(e.target.value)}
                                onKeyDown={handleAddressKey}
                                aria-label="Address bar"
                                autoComplete="off"
                                spellCheck="false"
                            />
                        </div>
                        <button
                            className="ie-go-btn"
                            onClick={goHome}
                            aria-label="Go"
                        >
                            Go
                        </button>
                    </div>
                </div>

                {/* Toolbar divider */}
                <div className="ie-toolbar-divider" aria-hidden="true" />

                {/* Content area */}
                <div className="ie-content-area">
                    {/* Drag/resize blocker over iframe */}
                    {(isDragging || isResizing) && (
                        <div className="ie-interaction-blocker" aria-hidden="true" />
                    )}

                    {isLoading && (
                        <div className="ie-loading-bar" aria-hidden="true">
                            <div className="ie-loading-bar-fill" />
                        </div>
                    )}

                    <iframe
                        ref={iframeRef}
                        src="/site"
                        title="Anthony Le — Personal Website"
                        className="ie-iframe"
                        onLoadStart={() => setIsLoading(true)}
                        onLoad={() => setIsLoading(false)}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    />
                </div>

                {/* Status bar */}
                <div className="ie-status-bar status-bar" role="status" aria-live="polite">
                    <span className="ie-status-text">
                        {isLoading ? 'Opening page...' : 'Done'}
                    </span>
                    <div className="ie-status-spacer" />
                    <div
                        className="ie-resize-grip"
                        aria-hidden="true"
                        onMouseDown={startResize}
                        onTouchStart={startResize}
                        title="Resize"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <path d="M12 0 L12 12 L0 12 Z" fill="none" />
                            <line x1="12" y1="4" x2="4" y2="12" stroke="#808080" strokeWidth="1" />
                            <line x1="12" y1="4" x2="4" y2="12" stroke="#ffffff" strokeWidth="1" transform="translate(1,-1)" />
                            <line x1="12" y1="8" x2="8" y2="12" stroke="#808080" strokeWidth="1" />
                            <line x1="12" y1="8" x2="8" y2="12" stroke="#ffffff" strokeWidth="1" transform="translate(1,-1)" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IEBrowser;
