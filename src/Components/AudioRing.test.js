import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioRing, { TRACKS } from './AudioRing';

// jsdom has no media playback and no canvas, so both are stood in for
// with plain functions (CRA resets jest.fn implementations per test).
// Without an AudioContext the ring falls back to the element's own
// volume, which is what these tests observe. jsdom also never flips
// `paused`, so every song change here starts from a paused player.

const titleShown = () =>
  screen.getByRole('complementary', { name: 'Now playing' }).querySelector('.ring-title').textContent;

const songAfter = (title, step = 1) => {
  const i = TRACKS.findIndex((t) => t.title === title);
  return TRACKS[(i + step + TRACKS.length) % TRACKS.length].title;
};

describe('AudioRing', () => {
  let original;
  let plays;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    plays = 0;
    original = {
      play: HTMLMediaElement.prototype.play,
      pause: HTMLMediaElement.prototype.pause,
      getContext: HTMLCanvasElement.prototype.getContext,
      random: Math.random,
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
    Math.random = original.random;
  });

  describe('the playlist', () => {
    it('numbers every song 1 to n with no gaps or repeats', () => {
      expect(TRACKS.map((t) => t.id)).toEqual(TRACKS.map((_, i) => i + 1));
    });

    it('lists every song in the sliding window', () => {
      render(<AudioRing />);
      const list = screen.getByRole('listbox', { name: 'Songs' });
      expect(list.querySelectorAll('[role="option"]')).toHaveLength(TRACKS.length);
      expect(screen.getAllByRole('option', { selected: true })).toHaveLength(1);
    });

    it('opens on a random song, and never the same one twice running', () => {
      Math.random = () => 0;
      const first = render(<AudioRing />);
      const opened = titleShown();
      expect(TRACKS.map((t) => t.title)).toContain(opened);
      first.unmount();

      render(<AudioRing />);
      expect(titleShown()).not.toBe(opened);
    });

    it('never opens on an explicit song', () => {
      const explicit = TRACKS.filter((t) => t.explicit).map((t) => t.title);
      [0, 0.2, 0.4, 0.6, 0.8, 0.999].forEach((r) => {
        sessionStorage.clear();
        Math.random = () => r;
        const { unmount } = render(<AudioRing />);
        expect(explicit).not.toContain(titleShown());
        unmount();
      });
    });

    it('marks the Nine Vicious songs as explicit, and only those', () => {
      expect(TRACKS.filter((t) => t.explicit).map((t) => t.id)).toEqual([1, 2]);

      render(<AudioRing />);
      screen.getAllByRole('option').forEach((option) => {
        const track = TRACKS.find((t) => option.textContent.includes(t.title));
        expect(option.querySelector('.ring-song-e') !== null).toBe(track.explicit);
      });
      // A letter to the eye, the word to a screen reader.
      const marked = screen.getAllByRole('option').filter((o) => o.querySelector('.ring-song-e'));
      marked.forEach((o) => expect(o).toHaveTextContent('Explicit'));
    });
  });

  describe('changing song', () => {
    it('skips forward and back with the buttons in the ring, wrapping at the ends', () => {
      render(<AudioRing />);
      const start = titleShown();

      fireEvent.click(screen.getByRole('button', { name: 'Next song' }));
      expect(titleShown()).toBe(songAfter(start));

      fireEvent.click(screen.getByRole('button', { name: 'Previous song' }));
      fireEvent.click(screen.getByRole('button', { name: 'Previous song' }));
      expect(titleShown()).toBe(songAfter(start, -1));
    });

    it('skipping a paused player does not start it', () => {
      render(<AudioRing />);
      fireEvent.click(screen.getByRole('button', { name: 'Next song' }));
      expect(plays).toBe(0);
    });

    it('moves one song per wheel notch over the window', () => {
      render(<AudioRing />);
      const start = titleShown();
      fireEvent.wheel(screen.getByRole('listbox', { name: 'Songs' }), { deltaY: 100 });
      expect(titleShown()).toBe(songAfter(start));
    });

    it('walks the list with the arrow keys and keeps them from the page', () => {
      const onWindowKey = jest.fn();
      window.addEventListener('keydown', onWindowKey);
      render(<AudioRing />);
      const start = titleShown();

      fireEvent.keyDown(screen.getByRole('listbox', { name: 'Songs' }), { key: 'ArrowUp' });

      expect(titleShown()).toBe(songAfter(start, -1));
      expect(onWindowKey).not.toHaveBeenCalled();
      window.removeEventListener('keydown', onWindowKey);
    });

    it('scrolling a paused player browses without starting it', () => {
      render(<AudioRing />);
      fireEvent.wheel(screen.getByRole('listbox', { name: 'Songs' }), { deltaY: 100 });
      expect(plays).toBe(0);
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    });

    it('plays a song when it is clicked', () => {
      render(<AudioRing />);
      const next = songAfter(titleShown());
      fireEvent.click(screen.getAllByRole('option').find((o) => o.textContent.includes(next)));
      expect(titleShown()).toBe(next);
      expect(plays).toBe(1);
    });

    it('moves on to the next song when one ends', () => {
      const { container } = render(<AudioRing />);
      const start = titleShown();
      fireEvent(container.querySelector('audio'), new Event('ended'));
      expect(titleShown()).toBe(songAfter(start));
      expect(plays).toBe(1);
    });
  });

  describe('playback', () => {
    it('does not load a song until asked', () => {
      const { container } = render(<AudioRing />);
      expect(container.querySelector('audio')).toHaveAttribute('preload', 'none');
      expect(container.querySelector('audio').getAttribute('src')).toMatch(/^\/?songs\//);
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
});
