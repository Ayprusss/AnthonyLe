import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Minesweeper.css';

const DIFFICULTIES = {
    beginner:     { rows: 9,  cols: 9,  mines: 10, label: 'Beginner' },
    intermediate: { rows: 16, cols: 16, mines: 40, label: 'Intermediate' },
    expert:       { rows: 16, cols: 30, mines: 99, label: 'Expert' },
};

const NUM_COLORS = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];

function makeBoard(rows, cols) {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => ({
            r, c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
        }))
    );
}

function placeMines(board, rows, cols, mineCount, safeR, safeC) {
    const safe = new Set();
    for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
            const nr = safeR + dr, nc = safeC + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
                safe.add(nr * cols + nc);
        }

    const candidates = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (!safe.has(r * cols + c)) candidates.push([r, c]);

    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    for (let i = 0; i < Math.min(mineCount, candidates.length); i++) {
        const [r, c] = candidates[i];
        newBoard[r][c].isMine = true;
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (newBoard[r][c].isMine) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++)
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine)
                        count++;
                }
            newBoard[r][c].adjacentMines = count;
        }
    }
    return newBoard;
}

function floodReveal(board, rows, cols, startR, startC) {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const queue = [[startR, startC]];
    const visited = new Set();

    while (queue.length > 0) {
        const [r, c] = queue.shift();
        const key = r * cols + c;
        if (visited.has(key)) continue;
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        const cell = newBoard[r][c];
        if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;
        visited.add(key);
        cell.isRevealed = true;
        if (cell.adjacentMines === 0) {
            for (let dr = -1; dr <= 1; dr++)
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    queue.push([r + dr, c + dc]);
                }
        }
    }
    return newBoard;
}

function checkWin(board) {
    return board.every(row => row.every(cell => cell.isMine || cell.isRevealed));
}

function padNum(n, digits = 3) {
    return String(Math.max(0, Math.min(999, Math.floor(n)))).padStart(digits, '0');
}

export default function Minesweeper() {
    const [difficulty, setDifficulty] = useState('beginner');
    const [board, setBoard] = useState(() => makeBoard(9, 9));
    const [gameState, setGameState] = useState('idle'); // idle | playing | won | lost
    const [flagCount, setFlagCount] = useState(0);
    const [time, setTime] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [pressedFace, setPressedFace] = useState(false);
    const [explodedCell, setExplodedCell] = useState(null);

    const timerRef = useRef(null);
    const menuRef = useRef(null);

    const { rows, cols, mines } = DIFFICULTIES[difficulty];

    const startNewGame = useCallback((diff = difficulty) => {
        const { rows: r, cols: c } = DIFFICULTIES[diff];
        setBoard(makeBoard(r, c));
        setGameState('idle');
        setFlagCount(0);
        setTime(0);
        setExplodedCell(null);
        clearInterval(timerRef.current);
    }, [difficulty]);

    const changeDifficulty = useCallback((diff) => {
        setDifficulty(diff);
        startNewGame(diff);
        setMenuOpen(false);
    }, [startNewGame]);

    useEffect(() => {
        if (gameState === 'playing') {
            timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState]);

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    const handleReveal = useCallback((r, c) => {
        if (gameState === 'won' || gameState === 'lost') return;
        const cell = board[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        let currentBoard = board;

        if (gameState === 'idle') {
            currentBoard = placeMines(board, rows, cols, mines, r, c);
            setGameState('playing');
        }

        if (currentBoard[r][c].isMine) {
            // Reveal all mines
            const revealedBoard = currentBoard.map(row => row.map(cell =>
                cell.isMine ? { ...cell, isRevealed: true } : cell
            ));
            setExplodedCell({ r, c });
            setBoard(revealedBoard);
            setGameState('lost');
            clearInterval(timerRef.current);
            return;
        }

        const newBoard = floodReveal(currentBoard, rows, cols, r, c);
        if (checkWin(newBoard)) {
            setBoard(newBoard);
            setGameState('won');
            clearInterval(timerRef.current);
        } else {
            setBoard(newBoard);
        }
    }, [board, gameState, rows, cols, mines]);

    const handleFlag = useCallback((e, r, c) => {
        e.preventDefault();
        if (gameState === 'won' || gameState === 'lost') return;
        const cell = board[r][c];
        if (cell.isRevealed) return;

        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        const newFlagged = !newBoard[r][c].isFlagged;
        newBoard[r][c].isFlagged = newFlagged;
        setBoard(newBoard);
        setFlagCount(f => newFlagged ? f + 1 : f - 1);
    }, [board, gameState]);

    const handleChord = useCallback((r, c) => {
        if (gameState !== 'playing') return;
        const cell = board[r][c];
        if (!cell.isRevealed || cell.adjacentMines === 0) return;

        let neighborFlags = 0;
        const neighbors = [];
        for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    if (board[nr][nc].isFlagged) neighborFlags++;
                    else if (!board[nr][nc].isRevealed) neighbors.push([nr, nc]);
                }
            }

        if (neighborFlags !== cell.adjacentMines) return;

        let currentBoard = board.map(row => row.map(c => ({ ...c })));
        let hitMine = false;
        let exploded = null;
        for (const [nr, nc] of neighbors) {
            if (currentBoard[nr][nc].isMine) {
                hitMine = true;
                exploded = { r: nr, c: nc };
            }
        }
        if (hitMine) {
            const revealedBoard = currentBoard.map(row => row.map(cell =>
                cell.isMine ? { ...cell, isRevealed: true } : cell
            ));
            setExplodedCell(exploded);
            setBoard(revealedBoard);
            setGameState('lost');
            clearInterval(timerRef.current);
            return;
        }
        for (const [nr, nc] of neighbors) {
            currentBoard = floodReveal(currentBoard, rows, cols, nr, nc);
        }
        if (checkWin(currentBoard)) {
            setBoard(currentBoard);
            setGameState('won');
            clearInterval(timerRef.current);
        } else {
            setBoard(currentBoard);
        }
    }, [board, gameState, rows, cols]);

    const faceEmoji = gameState === 'won' ? '😎' : gameState === 'lost' ? '😵' : pressedFace ? '😮' : '🙂';
    const remaining = mines - flagCount;

    return (
        <div className="minesweeper" onClick={() => setMenuOpen(false)}>

            {/* Menu bar */}
            <div className="ms-menubar" role="menubar" onClick={e => e.stopPropagation()}>
                <div className="ms-menu-item-wrap" ref={menuRef}>
                    <button
                        className={`ms-menu-btn${menuOpen ? ' ms-menu-btn--active' : ''}`}
                        onClick={() => setMenuOpen(o => !o)}
                    >
                        Game
                    </button>
                    {menuOpen && (
                        <div className="ms-dropdown" role="menu">
                            <button role="menuitem" onClick={() => { startNewGame(); setMenuOpen(false); }}>
                                New Game
                            </button>
                            <div className="ms-dropdown-sep" />
                            {Object.entries(DIFFICULTIES).map(([key, { label }]) => (
                                <button
                                    key={key}
                                    role="menuitem"
                                    className={difficulty === key ? 'ms-dropdown-checked' : ''}
                                    onClick={() => changeDifficulty(key)}
                                >
                                    {difficulty === key ? '✓ ' : '  '}{label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Header: mine counter + face + timer */}
            <div className="ms-header">
                <div className="ms-lcd" aria-label={`${remaining} mines remaining`}>
                    {padNum(remaining)}
                </div>
                <button
                    className="ms-face-btn"
                    aria-label="New Game"
                    onMouseDown={() => setPressedFace(true)}
                    onMouseUp={() => { setPressedFace(false); startNewGame(); }}
                    onMouseLeave={() => setPressedFace(false)}
                >
                    {faceEmoji}
                </button>
                <div className="ms-lcd" aria-label={`${time} seconds`}>
                    {padNum(time)}
                </div>
            </div>

            {/* Board */}
            <div
                className="ms-board-wrap"
                role="grid"
                aria-label="Minesweeper board"
            >
                <div
                    className="ms-board"
                    style={{ gridTemplateColumns: `repeat(${cols}, 26px)` }}
                >
                    {board.map((row, r) =>
                        row.map((cell, c) => {
                            const isExploded = explodedCell?.r === r && explodedCell?.c === c;
                            let content = '';
                            let className = 'ms-cell';

                            if (cell.isFlagged && !cell.isRevealed) {
                                content = '🚩';
                                className += ' ms-cell--unrevealed';
                            } else if (!cell.isRevealed) {
                                className += ' ms-cell--unrevealed';
                            } else if (cell.isMine) {
                                content = '💣';
                                className += isExploded ? ' ms-cell--exploded' : ' ms-cell--mine';
                            } else {
                                className += ' ms-cell--revealed';
                                if (cell.adjacentMines > 0) content = cell.adjacentMines;
                            }

                            return (
                                <button
                                    key={`${r}-${c}`}
                                    className={className}
                                    style={cell.adjacentMines > 0 && cell.isRevealed && !cell.isMine
                                        ? { color: NUM_COLORS[cell.adjacentMines] }
                                        : {}
                                    }
                                    onClick={() => handleReveal(r, c)}
                                    onDoubleClick={() => handleChord(r, c)}
                                    onContextMenu={(e) => handleFlag(e, r, c)}
                                    aria-label={
                                        cell.isFlagged ? 'Flagged cell' :
                                        cell.isRevealed && cell.isMine ? 'Mine' :
                                        cell.isRevealed ? `${cell.adjacentMines} adjacent mines` :
                                        'Hidden cell'
                                    }
                                    aria-pressed={cell.isRevealed}
                                >
                                    {content}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Win/Lose overlay */}
            {(gameState === 'won' || gameState === 'lost') && (
                <div className="ms-overlay" role="status">
                    <div className="ms-overlay-box">
                        <p>{gameState === 'won' ? '🎉 You win!' : '💥 Game Over!'}</p>
                        <p className="ms-overlay-time">
                            {gameState === 'won' ? `Time: ${time}s` : 'Better luck next time'}
                        </p>
                        <button onClick={() => startNewGame()}>New Game</button>
                    </div>
                </div>
            )}
        </div>
    );
}
