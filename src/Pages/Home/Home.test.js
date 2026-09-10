import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './Home';

// The Rail owns the session control, so the mock exposes it as two
// buttons — the same two the real one renders.
jest.mock('../../Components/Rail', () => ({ theme, onSwitch }) => (
  <div data-testid="Rail" data-theme={theme}>
    <button onClick={() => onSwitch('professional')}>professional</button>
    <button onClick={() => onSwitch('personal')}>personal</button>
  </div>
));

jest.mock('../../Components/Overview', () => () => <div data-testid="Overview" />);
jest.mock('../../Components/Experience', () => () => <div data-testid="Experience" />);
jest.mock('../../Components/Projects', () => () => <div data-testid="Projects" />);
jest.mock('../../Components/Skills', () => () => <div data-testid="Skills" />);
jest.mock('../../Components/Resume', () => () => <div data-testid="Resume" />);
jest.mock('../../Components/About', () => () => <div data-testid="About" />);
jest.mock('../../Components/Hobbies', () => () => <div data-testid="Hobbies" />);
jest.mock('../../Components/Volunteering', () => () => <div data-testid="Volunteering" />);
jest.mock('../../Components/Contact', () => () => <div data-testid="Contact" />);
jest.mock('../../Components/BootScene', () => () => <div data-testid="BootScene" />);

describe('Home Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('defaults to professional when localStorage.getItem throws', () => {
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });

    render(<Home />);

    expect(getItemSpy).toHaveBeenCalledWith('site-theme');
    expect(document.documentElement.getAttribute('data-theme')).toBe('professional');
  });

  it('ignores errors when localStorage.setItem throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('personal');

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    expect(() => render(<Home />)).not.toThrow();

    expect(setItemSpy).toHaveBeenCalledWith('site-theme', 'personal');
    expect(document.documentElement.getAttribute('data-theme')).toBe('personal');
  });

  it('initializes with the personal session if localStorage says so', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('personal');
    render(<Home />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('personal');
  });

  it('defaults to the professional session with nothing stored', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    render(<Home />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('professional');
  });

  // Without matchMedia (jsdom) the boot and the inversion are both
  // skipped, so the sections mount straight away and the swap is
  // immediate — which is exactly what a reduced-motion visitor gets.
  it('does not run the boot scene where it cannot animate', () => {
    render(<Home />);
    expect(screen.queryByTestId('BootScene')).not.toBeInTheDocument();
  });

  it('renders the professional set and swaps to the personal one', () => {
    render(<Home />);

    expect(screen.getByTestId('Projects')).toBeInTheDocument();
    expect(screen.getByTestId('Skills')).toBeInTheDocument();
    expect(screen.getByTestId('Resume')).toBeInTheDocument();
    expect(screen.queryByTestId('About')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'personal' }));

    expect(screen.getByTestId('About')).toBeInTheDocument();
    expect(screen.getByTestId('Hobbies')).toBeInTheDocument();
    expect(screen.getByTestId('Volunteering')).toBeInTheDocument();
    expect(screen.queryByTestId('Skills')).not.toBeInTheDocument();

    // Overview, Experience and Contact are in both sessions.
    expect(screen.getByTestId('Overview')).toBeInTheDocument();
    expect(screen.getByTestId('Experience')).toBeInTheDocument();
    expect(screen.getByTestId('Contact')).toBeInTheDocument();

    expect(document.documentElement.getAttribute('data-theme')).toBe('personal');
  });
});
