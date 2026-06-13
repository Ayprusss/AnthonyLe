import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';

// Mock child components. Navbar exposes the theme + toggle so we can drive it.
jest.mock('../../Components/Navbar', () => ({ theme, onToggleTheme }) => (
  <div data-testid="Navbar" data-theme={theme} onClick={onToggleTheme} />
));
jest.mock('../../Components/Hero', () => () => <div data-testid="Hero" />);
jest.mock('../../Components/Skills', () => () => <div data-testid="Skills" />);
jest.mock('../../Components/Projects', () => () => <div data-testid="Projects" />);
jest.mock('../../Components/Experience', () => () => <div data-testid="Experience" />);
jest.mock('../../Components/Resume', () => () => <div data-testid="Resume" />);
jest.mock('../../Components/About', () => () => <div data-testid="About" />);
jest.mock('../../Components/Volunteering', () => () => <div data-testid="Volunteering" />);
jest.mock('../../Components/Hobbies', () => () => <div data-testid="Hobbies" />);
jest.mock('../../Components/Contact', () => () => <div data-testid="Contact" />);
jest.mock('../../Components/SpaceBackground', () => () => <canvas data-testid="SpaceBackground" />);
jest.mock('../../Components/RocketHunt', () => () => <div data-testid="RocketHunt" />);

describe('Home Component', () => {
  let originalIntersectionObserver;

  beforeEach(() => {
    originalIntersectionObserver = global.IntersectionObserver;
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    });
    global.IntersectionObserver = mockIntersectionObserver;

    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-section');
  });

  afterEach(() => {
    global.IntersectionObserver = originalIntersectionObserver;
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

    expect(() => {
      render(<Home />);
    }).not.toThrow();

    expect(setItemSpy).toHaveBeenCalledWith('site-theme', 'personal');
    expect(document.documentElement.getAttribute('data-theme')).toBe('personal');
  });

  it('initializes with personal theme if localStorage has site-theme=personal', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('personal');

    render(<Home />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('personal');
  });

  it('defaults to professional theme if localStorage has no site-theme', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    render(<Home />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('professional');
  });

  it('renders professional sections by default and swaps to personal sections on toggle', () => {
    render(<Home />);

    // Professional set
    expect(screen.getByTestId('Skills')).toBeInTheDocument();
    expect(screen.getByTestId('Projects')).toBeInTheDocument();
    expect(screen.getByTestId('Resume')).toBeInTheDocument();
    expect(screen.queryByTestId('About')).not.toBeInTheDocument();
    // RocketHunt arcade is personal-mode only
    expect(screen.queryByTestId('RocketHunt')).not.toBeInTheDocument();

    // Toggle via the Navbar mock
    fireEvent.click(screen.getByTestId('Navbar'));

    // Personal set
    expect(screen.getByTestId('About')).toBeInTheDocument();
    expect(screen.getByTestId('Volunteering')).toBeInTheDocument();
    expect(screen.getByTestId('Hobbies')).toBeInTheDocument();
    expect(screen.queryByTestId('Skills')).not.toBeInTheDocument();
    expect(screen.getByTestId('RocketHunt')).toBeInTheDocument();

    // Shared sections persist across both themes
    expect(screen.getByTestId('Hero')).toBeInTheDocument();
    expect(screen.getByTestId('Experience')).toBeInTheDocument();
    expect(screen.getByTestId('Contact')).toBeInTheDocument();

    expect(document.documentElement.getAttribute('data-theme')).toBe('personal');
  });
});
