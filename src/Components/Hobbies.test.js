import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hobbies from './Hobbies';

describe('Hobbies Component', () => {
  test('renders the Hobbies heading', () => {
    render(<Hobbies />);
    expect(screen.getByRole('heading', { name: /hobbies\./i, level: 2 })).toBeInTheDocument();
  });

  // The carousel is gone: every hobby is on the page at once, so there
  // is nothing to page through and nothing hidden behind an arrow.
  test('renders every hobby', () => {
    render(<Hobbies />);
    const names = [
      /Rock Climbing/i,
      /Music/i,
      /Gaming/i,
      /Fashion/i,
      /Exercising/i,
      /Hiking/i,
    ];
    names.forEach((name) => {
      expect(screen.getByRole('heading', { name, level: 3 })).toBeInTheDocument();
    });
  });

  test('leads with rock climbing', () => {
    render(<Hobbies />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent(/Rock Climbing/i);
  });

  test('only links out where there is somewhere to go', () => {
    render(<Hobbies />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(2);
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
