import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Volunteering from './Volunteering';

describe('Volunteering Component', () => {
  test('renders the Volunteering heading', () => {
    render(<Volunteering />);
    const heading = screen.getByRole('heading', { name: /volunteering\./i, level: 2 });
    expect(heading).toBeInTheDocument();
  });

  test('renders the seeded organizations', () => {
    render(<Volunteering />);
    // Three uOttaHack roles are seeded (VI, VII, VII + beyond)
    expect(screen.getAllByRole('heading', { name: /uOttaHack/i, level: 3 }).length).toBe(3);
    expect(screen.getByRole('heading', { name: /SESA/i, level: 3 })).toBeInTheDocument();
  });
});
