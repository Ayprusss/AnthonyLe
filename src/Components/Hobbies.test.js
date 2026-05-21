import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hobbies from './Hobbies';

jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef(({ children, ...props }, ref) => {
      const { initial, whileInView, viewport, transition, delay, variants, ...validProps } = props;
      return <div ref={ref} {...validProps}>{children}</div>;
    }),
  },
}));

jest.mock('./ui/TextScramble', () => ({
  TextScramble: ({ text, as: Tag = 'span', className }) => <Tag className={className}>{text}</Tag>,
}));

describe('Hobbies Component', () => {
  test('renders the Hobbies heading', () => {
    render(<Hobbies />);
    const heading = screen.getByRole('heading', { name: /hobbies\./i, level: 2 });
    expect(heading).toBeInTheDocument();
  });

  test('renders the seeded hobbies', () => {
    render(<Hobbies />);
    expect(screen.getByRole('heading', { name: /Rock Climbing/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Photography/i, level: 3 })).toBeInTheDocument();
  });
});
