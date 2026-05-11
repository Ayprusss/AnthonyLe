import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Solitaire.css';

/* ── Card constants ── */
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const isRed = (suit) => suit === '♥' || suit === '♦';
const cardNum = (value) => VALUES.indexOf(value) + 1;

const DIFFICULTIES = {
    easy:   { label: 'Easy (Draw 1)',   draw: 1, limitedPasses: false },
    medium: { label: 'Medium (Draw 3)', draw: 3, limitedPasses: false },
    hard:   { label: 'Hard (Draw 3)',   draw: 3, limitedPasses: true, maxPasses: 3 },
};

/* ── Deck helpers ── */
function createShuffledDeck() {
    const deck = [];
    SUITS.forEach(suit => VALUES.forEach(value => deck.push({ suit, value, faceUp: false })));
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function dealGame() {
    const deck = createShuffledDeck();
    const tableau = Array.from({ length: 7 }, () => []);
    let idx = 0;
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= col; row++) {
            tableau[col].push({ ...deck[idx++], faceUp: row === col });
        }
    }
    return {
        stock: deck.slice(idx).map(c => ({ ...c, faceUp: false })),
        waste: [],
        foundations: [[], [], [], []],
        tableau,
        stockPasses: 0,
        moves: 0,
        won: false,
    };
}

/* ── Move validation ── */
function canToFoundation(card, foundations) {
    for (let i = 0; i < 4; i++) {
        const f = foundations[i];
        if (f.length === 0 && card.value === 'A') return i;
        if (f.length > 0) {
            const top = f[f.length - 1];
            if (top.suit === card.suit && cardNum(card.value) === cardNum(top.value) + 1) return i;
        }
    }
    return -1;
}

function canToTableauCol(cards, tableau, col) {
    const stack = tableau[col];
    const card = cards[0];
    if (stack.length === 0) return card.value === 'K';
    const top = stack[stack.length - 1];
    if (!top.faceUp) return false;
    return isRed(card.suit) !== isRed(top.suit) && cardNum(card.value) === cardNum(top.value) - 1;
}

function autoFoundation(state) {
    let s = { ...state, foundations: state.foundations.map(f => [...f]), tableau: state.tableau.map(c => [...c]), waste: [...state.waste] };
    let moved = true;
    while (moved) {
        moved = false;
        // Check waste
        if (s.waste.length > 0) {
            const card = s.waste[s.waste.length - 1];
            const fi = canToFoundation(card, s.foundations);
            if (fi >= 0) { s.foundations[fi].push({ ...card, faceUp: true }); s.waste.pop(); moved = true; }
        }
        // Check tableau tops
        for (let col = 0; col < 7; col++) {
            if (s.tableau[col].length === 0) continue;
            const card = s.tableau[col][s.tableau[col].length - 1];
            if (!card.faceUp) continue;
            const fi = canToFoundation(card, s.foundations);
            if (fi >= 0) {
                s.foundations[fi].push({ ...card, faceUp: true });
                s.tableau[col].pop();
                // Flip new top
                if (s.tableau[col].length > 0 && !s.tableau[col][s.tableau[col].length - 1].faceUp)
                    s.tableau[col][s.tableau[col].length - 1] = { ...s.tableau[col][s.tableau[col].length - 1], faceUp: true };
                moved = true;
            }
        }
    }
    return s;
}

/* ── Component ── */
export default function Solitaire() {
    const [difficulty, setDifficulty] = useState('easy');
    const [game, setGame] = useState(() => dealGame());
    const [selected, setSelected] = useState(null); // { from:'waste'|'foundation'|'tableau', fromIdx:number, cardIdx:number }
    const [menuOpen, setMenuOpen] = useState(false);
    const [time, setTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const menuRef = useRef(null);
    const timerRef = useRef(null);

    const { draw, limitedPasses, maxPasses } = DIFFICULTIES[difficulty];

    const newGame = useCallback((diff = difficulty) => {
        setGame(dealGame());
        setSelected(null);
        setTime(0);
        setPlaying(false);
        clearInterval(timerRef.current);
    }, [difficulty]);

    const changeDifficulty = useCallback((diff) => {
        setDifficulty(diff);
        setGame(dealGame());
        setSelected(null);
        setTime(0);
        setPlaying(false);
        clearInterval(timerRef.current);
        setMenuOpen(false);
    }, []);

    useEffect(() => {
        if (playing) timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
        else clearInterval(timerRef.current);
        return () => clearInterval(timerRef.current);
    }, [playing]);

    useEffect(() => {
        if (!menuOpen) return;
        const h = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [menuOpen]);

    const ensurePlaying = useCallback(() => {
        if (!playing && !game.won) setPlaying(true);
    }, [playing, game.won]);

    /* ── Stock click ── */
    const handleStock = useCallback(() => {
        if (game.won) return;
        setSelected(null);
        ensurePlaying();

        setGame(prev => {
            const g = { ...prev, waste: [...prev.waste], stock: [...prev.stock] };
            if (g.stock.length === 0) {
                if (limitedPasses && g.stockPasses >= maxPasses) return g;
                g.stock = g.waste.reverse().map(c => ({ ...c, faceUp: false }));
                g.waste = [];
                g.stockPasses = (g.stockPasses || 0) + 1;
                return g;
            }
            const toDraw = Math.min(draw, g.stock.length);
            const drawn = g.stock.splice(g.stock.length - toDraw, toDraw).map(c => ({ ...c, faceUp: true }));
            g.waste = [...g.waste, ...drawn];
            g.moves++;
            return g;
        });
    }, [game.won, ensurePlaying, draw, limitedPasses, maxPasses]);

    /* ── Get cards for a selection ── */
    const getCards = useCallback((from, fromIdx, cardIdx, g) => {
        if (from === 'waste') return [g.waste[g.waste.length - 1]];
        if (from === 'foundation') return [g.foundations[fromIdx][g.foundations[fromIdx].length - 1]];
        if (from === 'tableau') return g.tableau[fromIdx].slice(cardIdx);
        return [];
    }, []);

    /* ── Execute move ── */
    const executeMove = useCallback((to, toIdx) => {
        if (!selected) return false;
        const { from, fromIdx, cardIdx } = selected;
        const g = { ...game, foundations: game.foundations.map(f => [...f]), tableau: game.tableau.map(c => [...c]), waste: [...game.waste] };
        const cards = getCards(from, fromIdx, cardIdx, game);
        if (!cards || cards.length === 0) return false;

        let valid = false;
        if (to === 'foundation') {
            if (cards.length !== 1) return false;
            const fi = canToFoundation(cards[0], g.foundations);
            if (fi >= 0) { g.foundations[fi].push({ ...cards[0], faceUp: true }); valid = true; toIdx = fi; }
        } else if (to === 'tableau') {
            if (canToTableauCol(cards, g.tableau, toIdx)) {
                cards.forEach(c => g.tableau[toIdx].push({ ...c, faceUp: true }));
                valid = true;
            }
        }
        if (!valid) return false;

        // Remove from source
        if (from === 'waste') g.waste.pop();
        else if (from === 'foundation') g.foundations[fromIdx].pop();
        else if (from === 'tableau') {
            g.tableau[fromIdx] = g.tableau[fromIdx].slice(0, cardIdx);
            // Flip top card
            if (g.tableau[fromIdx].length > 0 && !g.tableau[fromIdx][g.tableau[fromIdx].length - 1].faceUp)
                g.tableau[fromIdx][g.tableau[fromIdx].length - 1] = { ...g.tableau[fromIdx][g.tableau[fromIdx].length - 1], faceUp: true };
        }

        g.moves++;
        g.won = g.foundations.every(f => f.length === 13);
        if (g.won) { setPlaying(false); clearInterval(timerRef.current); }
        setGame(g);
        setSelected(null);
        return true;
    }, [selected, game, getCards]);

    /* ── Click handlers ── */
    const handleWasteClick = useCallback(() => {
        if (game.won || game.waste.length === 0) { setSelected(null); return; }
        ensurePlaying();
        if (selected?.from === 'waste') { setSelected(null); return; }
        if (selected) {
            const moved = executeMove('tableau', -1); // try auto
            if (!moved) {
                // Try to move to foundation
                const g = game;
                const cards = getCards(selected.from, selected.fromIdx, selected.cardIdx, g);
                if (cards?.length === 1) {
                    const fi = canToFoundation(cards[0], g.foundations);
                    if (fi >= 0) { executeMove('foundation', fi); return; }
                }
                setSelected(null);
            }
        } else {
            setSelected({ from: 'waste', fromIdx: 0, cardIdx: game.waste.length - 1 });
        }
    }, [game, selected, ensurePlaying, executeMove, getCards]);

    const handleFoundationClick = useCallback((fi) => {
        if (game.won) return;
        if (selected) {
            const moved = executeMove('foundation', fi);
            if (!moved) setSelected(null);
        } else if (game.foundations[fi].length > 0) {
            setSelected({ from: 'foundation', fromIdx: fi, cardIdx: game.foundations[fi].length - 1 });
        }
    }, [game, selected, executeMove]);

    const handleTableauClick = useCallback((col, cardIdx) => {
        if (game.won) return;
        const col_arr = game.tableau[col];
        const card = col_arr[cardIdx];
        if (!card) {
            // Empty column
            if (selected) {
                executeMove('tableau', col);
            }
            return;
        }
        if (!card.faceUp) {
            // Can't select face-down unless it's the top
            if (cardIdx === col_arr.length - 1) {
                // Flip it
                const g = { ...game, tableau: game.tableau.map(c => [...c]) };
                g.tableau[col][cardIdx] = { ...card, faceUp: true };
                g.moves++;
                setGame(g);
                setSelected(null);
            }
            return;
        }
        if (selected) {
            // Same card: deselect
            if (selected.from === 'tableau' && selected.fromIdx === col && selected.cardIdx === cardIdx) {
                setSelected(null);
                return;
            }
            // Try to move selected onto this card (the target is the top of col)
            const moved = executeMove('tableau', col);
            if (!moved) {
                // Re-select this card
                ensurePlaying();
                setSelected({ from: 'tableau', fromIdx: col, cardIdx });
            }
        } else {
            ensurePlaying();
            setSelected({ from: 'tableau', fromIdx: col, cardIdx });
        }
    }, [game, selected, executeMove, ensurePlaying]);

    const handleDoubleClickCard = useCallback((from, fromIdx, cardIdx) => {
        if (game.won) return;
        const cards = getCards(from, fromIdx, cardIdx, game);
        if (!cards || cards.length !== 1) return;
        const g = { ...game, foundations: game.foundations.map(f => [...f]), tableau: game.tableau.map(c => [...c]), waste: [...game.waste] };
        const fi = canToFoundation(cards[0], g.foundations);
        if (fi < 0) return;
        g.foundations[fi].push({ ...cards[0], faceUp: true });
        if (from === 'waste') g.waste.pop();
        else if (from === 'foundation') g.foundations[fromIdx].pop();
        else if (from === 'tableau') {
            g.tableau[fromIdx].pop();
            if (g.tableau[fromIdx].length > 0 && !g.tableau[fromIdx][g.tableau[fromIdx].length - 1].faceUp)
                g.tableau[fromIdx][g.tableau[fromIdx].length - 1] = { ...g.tableau[fromIdx][g.tableau[fromIdx].length - 1], faceUp: true };
        }
        g.moves++;
        g.won = g.foundations.every(f => f.length === 13);
        if (g.won) { setPlaying(false); clearInterval(timerRef.current); }
        setGame(g);
        setSelected(null);
    }, [game, getCards]);

    const handleAutoComplete = useCallback(() => {
        setGame(prev => {
            const g = autoFoundation(prev);
            g.won = g.foundations.every(f => f.length === 13);
            if (g.won) { setPlaying(false); clearInterval(timerRef.current); }
            return g;
        });
    }, []);

    /* ── Render helpers ── */
    const isSelected = (from, fromIdx, cardIdx) =>
        selected?.from === from && selected?.fromIdx === fromIdx && selected?.cardIdx <= cardIdx &&
        (from !== 'tableau' || cardIdx >= selected?.cardIdx);

    const renderCard = (card, from, fromIdx, cardIdx, style = {}) => {
        const sel = isSelected(from, fromIdx, cardIdx);
        return (
            <div
                key={`${from}-${fromIdx}-${cardIdx}`}
                className={`sol-card${sel ? ' sol-card--selected' : ''}${isRed(card.suit) ? ' sol-card--red' : ''}`}
                style={style}
                onClick={(e) => {
                    e.stopPropagation();
                    if (from === 'waste') handleWasteClick();
                    else if (from === 'foundation') handleFoundationClick(fromIdx);
                    else handleTableauClick(fromIdx, cardIdx);
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (from !== 'tableau' || cardIdx === game.tableau[fromIdx].length - 1)
                        handleDoubleClickCard(from, fromIdx, cardIdx);
                }}
                role="button"
                aria-label={`${card.value}${card.suit}`}
                tabIndex={0}
            >
                <span className="sol-card-tl">{card.value}<br />{card.suit}</span>
                <span className="sol-card-suit">{card.suit}</span>
                <span className="sol-card-br">{card.value}<br />{card.suit}</span>
            </div>
        );
    };

    const renderFacedown = (from, fromIdx, cardIdx, style = {}, onClick) => (
        <div
            key={`fd-${from}-${fromIdx}-${cardIdx}`}
            className="sol-card sol-card--facedown"
            style={style}
            onClick={onClick}
            role="button"
            aria-label="Face down card"
            tabIndex={-1}
        />
    );

    const renderEmptyPile = (label, onClick) => (
        <div className="sol-empty-pile" onClick={onClick} role="button" aria-label={label} tabIndex={0}>
            <span>{label}</span>
        </div>
    );

    const canRedeal = !limitedPasses || game.stockPasses < (maxPasses || 1);
    const stockEmpty = game.stock.length === 0;

    return (
        <div className="solitaire" onClick={() => setSelected(null)}>

            {/* Menu bar */}
            <div className="sol-menubar" role="menubar" onClick={e => e.stopPropagation()}>
                <div className="sol-menu-wrap" ref={menuRef}>
                    <button
                        className={`sol-menu-btn${menuOpen ? ' sol-menu-btn--active' : ''}`}
                        onClick={() => setMenuOpen(o => !o)}
                    >
                        Game
                    </button>
                    {menuOpen && (
                        <div className="sol-dropdown" role="menu">
                            <button role="menuitem" onClick={() => { newGame(); setMenuOpen(false); }}>
                                New Game
                            </button>
                            <button role="menuitem" onClick={() => { handleAutoComplete(); setMenuOpen(false); }}>
                                Auto Complete
                            </button>
                            <div className="sol-dropdown-sep" />
                            {Object.entries(DIFFICULTIES).map(([key, { label }]) => (
                                <button
                                    key={key}
                                    role="menuitem"
                                    onClick={() => changeDifficulty(key)}
                                >
                                    {difficulty === key ? '✓ ' : '  '}{label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top row: stock + waste + spacer + foundations */}
            <div className="sol-top-row" onClick={e => e.stopPropagation()}>
                {/* Stock */}
                <div className="sol-pile-slot" onClick={handleStock}>
                    {game.stock.length > 0
                        ? <div className="sol-card sol-card--facedown sol-card--stock" aria-label="Stock pile" tabIndex={0} />
                        : <div className={`sol-empty-pile${!canRedeal ? ' sol-empty-pile--exhausted' : ''}`} aria-label="Redeal stock" role="button" tabIndex={0}>
                            <span>{canRedeal ? '↺' : '✕'}</span>
                          </div>
                    }
                </div>

                {/* Waste */}
                <div className="sol-pile-slot">
                    {game.waste.length > 0 ? (
                        <div className="sol-waste-stack">
                            {game.waste.slice(-3).map((card, i) => {
                                const absIdx = game.waste.length - game.waste.slice(-3).length + i;
                                const isTop = absIdx === game.waste.length - 1;
                                return renderCard(card, 'waste', 0, absIdx, {
                                    position: i < game.waste.slice(-3).length - 1 ? 'absolute' : 'relative',
                                    left: i < game.waste.slice(-3).length - 1 ? `${i * 14}px` : undefined,
                                    top: 0,
                                    zIndex: i + 1,
                                    pointerEvents: isTop ? 'auto' : 'none',
                                });
                            })}
                        </div>
                    ) : renderEmptyPile('', () => {})}
                </div>

                <div className="sol-spacer" />

                {/* Foundations */}
                {game.foundations.map((f, fi) => (
                    <div
                        key={fi}
                        className="sol-pile-slot"
                        onClick={() => handleFoundationClick(fi)}
                    >
                        {f.length > 0
                            ? renderCard(f[f.length - 1], 'foundation', fi, f.length - 1)
                            : <div className="sol-empty-pile" role="button" aria-label={`Foundation ${fi + 1}`} tabIndex={0}>
                                <span>A</span>
                              </div>
                        }
                    </div>
                ))}
            </div>

            {/* Tableau */}
            <div className="sol-tableau" onClick={e => e.stopPropagation()}>
                {game.tableau.map((col, ci) => (
                    <div
                        key={ci}
                        className="sol-tableau-col"
                        onClick={() => col.length === 0 && handleTableauClick(ci, -1)}
                    >
                        {col.length === 0 && renderEmptyPile('', () => handleTableauClick(ci, -1))}
                        {col.map((card, idx) => {
                            const faceDown = !card.faceUp;
                            const offset = idx === 0 ? 0 : faceDown
                                ? col[idx - 1].faceUp ? 18 : 16
                                : 26;
                            const style = { marginTop: idx === 0 ? 0 : offset };
                            if (faceDown)
                                return renderFacedown('tableau', ci, idx, style, (e) => { e.stopPropagation(); handleTableauClick(ci, idx); });
                            return <div key={`tab-${ci}-${idx}`} style={style} onClick={e => { e.stopPropagation(); handleTableauClick(ci, idx); }} onDoubleClick={e => { e.stopPropagation(); if (idx === col.length - 1) handleDoubleClickCard('tableau', ci, idx); }}>
                                {renderCard(card, 'tableau', ci, idx)}
                            </div>;
                        })}
                    </div>
                ))}
            </div>

            {/* Status bar */}
            <div className="sol-statusbar">
                <span>Moves: {game.moves}</span>
                <span>Time: {time}s</span>
                {limitedPasses && <span>Passes: {game.stockPasses}/{maxPasses}</span>}
            </div>

            {/* Win overlay */}
            {game.won && (
                <div className="sol-overlay" role="status">
                    <div className="sol-overlay-box">
                        <p>🎉 You Win!</p>
                        <p className="sol-overlay-sub">{game.moves} moves · {time}s</p>
                        <button onClick={() => newGame()}>New Game</button>
                    </div>
                </div>
            )}
        </div>
    );
}
