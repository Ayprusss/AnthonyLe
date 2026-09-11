import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioRing from './AudioRing';

// jsdom has no media playback and no canvas, so both are stood in for
// with plain functions (CRA resets jest.fn implementations per test).
// Without an AudioContext the ring falls back to the element's own
// volume, which is what these tests observe.

describe('AudioRing', () => {
  let original;
  let plays;

  beforeEach(() => {
    localStorage.clear();
    plays = 0;
    original = {
      play: HTMLMediaElement.prototype.play,
      pause: HTMLMediaElement.prototype.pause,
      getContext: HTMLCanvasElement.prototype.getContext,
    };
    HTMLMediaElement.prototype.play = function play() {
      plays += 1;
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function pause() {
      this.dispatchEvent(new Event('pause'));
    };
    HTMLCanvasElement.prototype.getContext = () => null;
  });

  afterEach(() => {
    HTMLMediaElement.prototype.play = original.play;
    HTMLMediaElement.prototype.pause = original.pause;
    HTMLCanvasElement.prototype.getContext = original.getContext;
  });

  it('says what is playing', () => {
    render(<AudioRing />);
    const region = screen.getByRole('complementary', { name: 'Now playing' });
    expect(region).toHaveTextContent('Love Crazy');
    expect(region).toHaveTextContent('Nine Vicious');
  });

  it('does not load the song until asked', () => {
    const { container } = render(<AudioRing />);
    expect(container.querySelector('audio')).toHaveAttribute('preload', 'none');
  });

  it('plays on press and offers pause while playing', () => {
    render(<AudioRing />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(plays).toBe(1);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('follows the element when something else pauses it', () => {
    const { container } = render(<AudioRing />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    fireEvent(container.querySelector('audio'), new Event('pause'));
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('sets and remembers the volume', () => {
    const { container } = render(<AudioRing />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveValue('0.6');

    fireEvent.change(slider, { target: { value: '0.25' } });

    expect(slider).toHaveValue('0.25');
    expect(container.querySelector('audio').volume).toBe(0.25);
    expect(localStorage.getItem('ambient-volume')).toBe('0.25');
  });

  it('picks up a remembered volume', () => {
    localStorage.setItem('ambient-volume', '0.3');
    render(<AudioRing />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveValue('0.3');
  });
});
