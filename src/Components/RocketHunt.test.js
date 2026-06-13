import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RocketHunt, { scoreValue, MAX_AMMO, ROUND_TIME } from './RocketHunt';

// Strip framer-motion animation props; passthrough AnimatePresence.
jest.mock('framer-motion', () => {
  const React = require('react');
  const strip = (Tag) => React.forwardRef(({ children, ...props }, ref) => {
    const {
      initial, animate, exit, whileInView, whileHover, whileTap, viewport,
      transition, delay, variants, custom, drag, dragConstraints, dragElastic,
      dragMomentum, dragSnapToOrigin, onDragStart, onDragEnd, ...valid
    } = props;
    return <Tag ref={ref} {...valid}>{children}</Tag>;
  });
  const motion = new Proxy({}, { get: (_, tag) => strip(tag) });
  return { motion, AnimatePresence: ({ children }) => <>{children}</> };
});

// ── Canvas / animation environment stubs (jsdom lacks these) ──────────
const gradientStub = { addColorStop: () => {} };
const ctxStub = new Proxy(
  { createLinearGradient: () => gradientStub, createRadialGradient: () => gradientStub },
  {
    get: (target, prop) => (prop in target ? target[prop] : () => undefined),
    set: () => true,
  }
);

// NOTE: CRA's Jest preset enables `resetMocks: true`, which clears jest.fn
// implementations before every test. These stubs use PLAIN functions so they
// survive the reset (a reset jest.fn would return undefined → null context).
beforeAll(() => {
  global.Path2D = class { constructor() {} };
  HTMLCanvasElement.prototype.getContext = () => ctxStub;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};
  window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
});

beforeEach(() => {
  localStorage.clear();
  document.body.classList.remove('rockethunt-active');
});

describe('scoreValue', () => {
  it('awards 100 for a standard rocket', () => {
    expect(scoreValue({ kind: 'rocket', gold: false })).toBe(100);
  });
  it('awards 300 for a gold rocket', () => {
    expect(scoreValue({ kind: 'rocket', gold: true })).toBe(300);
  });
  it('penalizes 150 for an asteroid', () => {
    expect(scoreValue({ kind: 'asteroid' })).toBe(-150);
  });
  it('returns 0 for no target', () => {
    expect(scoreValue(null)).toBe(0);
  });
});

describe('RocketHunt PiP launcher', () => {
  it('renders the picture-in-play panel with an expand button and hi-score', () => {
    render(<RocketHunt />);
    expect(screen.getByRole('button', { name: /EXPAND/i })).toBeInTheDocument();
    expect(screen.getByText(/HI 0/)).toBeInTheDocument();
  });

  it('reads the persisted hi-score from localStorage', () => {
    localStorage.setItem('rockethunt-hiscore', '4200');
    render(<RocketHunt />);
    expect(screen.getByText(/HI 4200/)).toBeInTheDocument();
  });
});

describe('RocketHunt game flow', () => {
  it('expands to the ready screen and starts a round on START', () => {
    render(<RocketHunt />);

    // Expand → fullscreen ready card
    fireEvent.click(screen.getByRole('button', { name: /EXPAND/i }));
    expect(screen.getByText('ROCKET HUNT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /INSERT COIN/i })).toBeInTheDocument();
    // marks the body so the global custom cursor hides during play
    expect(document.body.classList.contains('rockethunt-active')).toBe(true);

    // Start → Round 1 countdown title card + HUD
    fireEvent.click(screen.getByRole('button', { name: /INSERT COIN/i }));
    expect(screen.getByText('ROUND 1')).toBeInTheDocument();
    expect(screen.getByText('Round')).toBeInTheDocument(); // HUD label
  });

  it('shows a full magazine of shells in the HUD when a round starts', () => {
    render(<RocketHunt />);
    fireEvent.click(screen.getByRole('button', { name: /EXPAND/i }));
    fireEvent.click(screen.getByRole('button', { name: /INSERT COIN/i }));

    const loaded = document.querySelectorAll('.rockethunt-shell.is-loaded');
    expect(loaded.length).toBe(MAX_AMMO);
  });

  it('closes back to the PiP launcher and clears the body flag', () => {
    render(<RocketHunt />);
    fireEvent.click(screen.getByRole('button', { name: /EXPAND/i }));
    expect(screen.queryByRole('button', { name: /EXPAND/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Close game/i }));
    expect(screen.getByRole('button', { name: /EXPAND/i })).toBeInTheDocument();
    expect(document.body.classList.contains('rockethunt-active')).toBe(false);
  });
});

describe('RocketHunt constants', () => {
  it('exposes two rounds of 30 seconds with a 6-shell magazine', () => {
    expect(ROUND_TIME).toBe(30);
    expect(MAX_AMMO).toBe(6);
  });
});
