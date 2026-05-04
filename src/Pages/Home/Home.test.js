import React from 'react';
import { render } from '@testing-library/react';
import Home from './Home';

// Mock child components
jest.mock('../../Components/Navbar', () => ({ mode, onToggleMode }) => (
  <div data-testid="Navbar" data-mode={mode} onClick={onToggleMode} />
));
jest.mock('../../Components/Hero', () => () => <div data-testid="Hero" />);
jest.mock('../../Components/Skills', () => () => <div data-testid="Skills" />);
jest.mock('../../Components/Projects', () => () => <div data-testid="Projects" />);
jest.mock('../../Components/Experience', () => () => <div data-testid="Experience" />);
jest.mock('../../Components/Resume', () => () => <div data-testid="Resume" />);
jest.mock('../../Components/Contact', () => () => <div data-testid="Contact" />);
jest.mock('../../Components/SpaceBackground', () => () => <canvas data-testid="SpaceBackground" />);

describe('Home Component', () => {
  let originalIntersectionObserver;

  beforeEach(() => {
    // Mock IntersectionObserver
    originalIntersectionObserver = global.IntersectionObserver;
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    });
    global.IntersectionObserver = mockIntersectionObserver;

    // Clear localStorage and document attributes before each test
    localStorage.clear();
    document.documentElement.removeAttribute('data-mode');
    document.documentElement.removeAttribute('data-section');
  });

  afterEach(() => {
    // Restore IntersectionObserver and mocks
    global.IntersectionObserver = originalIntersectionObserver;
    jest.restoreAllMocks();
  });

  it('sets mode to dark if localStorage.getItem throws an error', () => {
    // Spy on getItem to throw an error
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });

    render(<Home />);

    expect(getItemSpy).toHaveBeenCalledWith('site-mode');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('ignores errors when localStorage.setItem throws', () => {
    // Return light mode so it initializes with light
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('light');

    // Spy on setItem to throw an error
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    // Should not throw and crash the render
    expect(() => {
      render(<Home />);
    }).not.toThrow();

    expect(setItemSpy).toHaveBeenCalledWith('site-mode', 'light');
    expect(document.documentElement.getAttribute('data-mode')).toBe('light');
  });

  it('initializes with light mode if localStorage has site-mode=light', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('light');

    render(<Home />);

    expect(document.documentElement.getAttribute('data-mode')).toBe('light');
  });

  it('initializes with dark mode if localStorage has no site-mode', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    render(<Home />);

    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });
});
