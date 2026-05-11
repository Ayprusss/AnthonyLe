import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AppWindow.css';

const TASKBAR_H = 32;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const isTouchDevice = () =>
    window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

const AppWindow = ({
    title,
    icon,
    children,
    onClose,
    onMinimize,
    minimized,
    focused,
    onFocus,
    defaultWidth = 500,
    defaultHeight = 550,
    minWidth = 280,
    minHeight = 200,
    resizable = true,
}) => {
    const mobile = isTouchDevice();

    const [pos, setPos] = useState(() => ({
        x: clamp(
            Math.floor((window.innerWidth - Math.min(defaultWidth, window.innerWidth - 40)) / 2),
            0, window.innerWidth - minWidth
        ),
        y: clamp(
            Math.floor((window.innerHeight - TASKBAR_H - Math.min(defaultHeight, window.innerHeight - TASKBAR_H - 60)) / 2),
            0, window.innerHeight - TASKBAR_H - 80
        ),
    }));
    const [size, setSize] = useState({
        width: Math.min(defaultWidth, window.innerWidth - 20),
        height: Math.min(defaultHeight, window.innerHeight - TASKBAR_H - 20),
    });
    const [maximized, setMaximized] = useState(mobile);
    const [prevBounds, setPrevBounds] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const dragData = useRef(null);
    const resizeData = useRef(null);

    const startDrag = useCallback((e) => {
        if (maximized || e.target.closest('.title-bar-controls')) return;
        e.preventDefault();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        dragData.current = { cx, cy, px: pos.x, py: pos.y };
        setIsDragging(true);
        onFocus && onFocus();
    }, [maximized, pos, onFocus]);

    const startResize = useCallback((e) => {
        if (maximized || !resizable) return;
        e.preventDefault();
        e.stopPropagation();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        resizeData.current = { cx, cy, w: size.width, h: size.height };
        setIsResizing(true);
    }, [maximized, size, resizable]);

    useEffect(() => {
        const onMove = (e) => {
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            if (dragData.current) {
                setPos({
                    x: clamp(dragData.current.px + cx - dragData.current.cx, 0, window.innerWidth - minWidth),
                    y: clamp(dragData.current.py + cy - dragData.current.cy, 0, window.innerHeight - TASKBAR_H - 28),
                });
            }
            if (resizeData.current) {
                setSize({
                    width: clamp(resizeData.current.w + cx - resizeData.current.cx, minWidth, window.innerWidth),
                    height: clamp(resizeData.current.h + cy - resizeData.current.cy, minHeight, window.innerHeight - TASKBAR_H),
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
    }, [minWidth, minHeight]);

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

    const style = maximized
        ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: `calc(100vh - ${TASKBAR_H}px)`, zIndex: focused ? 110 : 100 }
        : { position: 'fixed', left: pos.x, top: pos.y, width: size.width, height: size.height, zIndex: focused ? 110 : 100 };

    if (minimized) return null;

    return (
        <div
            className={`app-window window${focused ? ' app-window--focused' : ''}`}
            style={style}
            onMouseDown={onFocus}
            role="dialog"
            aria-label={title}
        >
            <div
                className="title-bar app-window-titlebar"
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                onDoubleClick={handleMaximize}
            >
                <div className="title-bar-text app-window-title-text">
                    {icon && <span className="app-window-icon" aria-hidden="true">{icon}</span>}
                    <span>{title}</span>
                </div>
                <div className="title-bar-controls">
                    <button aria-label="Minimize" onClick={(e) => { e.stopPropagation(); onMinimize(); }} />
                    <button
                        aria-label={maximized ? 'Restore' : 'Maximize'}
                        onClick={(e) => { e.stopPropagation(); handleMaximize(); }}
                    />
                    <button aria-label="Close" onClick={(e) => { e.stopPropagation(); onClose(); }} />
                </div>
            </div>

            <div className="window-body app-window-body">
                {(isDragging || isResizing) && (
                    <div className="app-window-interact-blocker" aria-hidden="true" />
                )}
                {children}
            </div>

            {resizable && !maximized && (
                <div
                    className="app-window-resize-grip"
                    onMouseDown={startResize}
                    onTouchStart={startResize}
                    aria-hidden="true"
                    title="Resize"
                />
            )}
        </div>
    );
};

export default AppWindow;
