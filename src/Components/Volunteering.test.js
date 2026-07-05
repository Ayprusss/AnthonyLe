import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Volunteering from './Volunteering';

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef(({ children, ...props }, ref) => {
      const { initial, whileInView, viewport, transition, delay, ...validProps } = props;
      return <div ref={ref} {...validProps}>{children}</div>;
    }),
  },
}));

jest.mock('./ui/TextScramble', () => ({
  TextScramble: ({ text, as: Tag = 'span', className }) => <Tag className={className}>{text}</Tag>,
}));

describe('Volunteering Component', () => {
  test('renders the Volunteering heading', () => {
    render(<Volunteering />);
    const heading = screen.getByRole('heading', { name: /volunteering\./i, level: 2 });
    expect(heading).toBeInTheDocument();
  });

  test('renders the seeded organizations', () => {
    render(<Volunteering />);
    // Three uOttaHack roles are seeded (VI, VII, VII + beyond)
    expect(screen.getAllByRole('heading', { name: /uOttaHack/i, level: 4 }).length).toBe(3);
    expect(screen.getByRole('heading', { name: /SESA/i, level: 4 })).toBeInTheDocument();
  });
});
