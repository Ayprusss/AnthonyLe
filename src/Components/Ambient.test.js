import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Ambient from './Ambient';

// CRA resets jest.fn implementations before every test, so the browser
// stand-ins below are plain functions installed per test.

const desktop = (query) => ({
  matches: query.includes('min-width'),
  media: query,
  addEventListener() {},
  removeEventListener() {},
});

describe('Ambient', () => {
  let getContext;

  beforeEach(() => {
    getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = () => null;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = getContext;
    delete window.matchMedia;
    delete document.documentElement.clientWidth;
  });

  it('renders nothing where it cannot tell the window is a desktop', () => {
    const { container } = render(<Ambient theme="professional" />);
    expect(container).toBeEmptyDOMElement();
  });

  describe('on a desktop window', () => {
    beforeEach(() => {
      window.matchMedia = desktop;
      Object.defineProperty(document.documentElement, 'clientWidth', {
        configurable: true,
        value: 1600,
      });
    });

    it('draws the point wave on the professional session', () => {
      const { container } = render(<Ambient theme="professional" />);
      expect(container.querySelector('canvas.point-wave')).toBeInTheDocument();
      expect(screen.queryByRole('complementary', { name: 'Now playing' })).not.toBeInTheDocument();
    });

    it('plays the song on the personal session', () => {
      const { container } = render(<Ambient theme="personal" />);
      expect(screen.getByRole('complementary', { name: 'Now playing' })).toBeInTheDocument();
      expect(container.querySelector('canvas.point-wave')).not.toBeInTheDocument();
    });

    it('stays out of a window with no room beside the column', () => {
      Object.defineProperty(document.documentElement, 'clientWidth', {
        configurable: true,
        value: 200,
      });
      const { container } = render(<Ambient theme="personal" />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
