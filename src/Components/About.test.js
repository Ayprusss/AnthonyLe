import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import About from './About';

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

describe('About Component', () => {
  test('renders the About heading', () => {
    render(<About />);
    const heading = screen.getByRole('heading', { name: /about\./i, level: 2 });
    expect(heading).toBeInTheDocument();
  });

  test('renders the at-a-glance facts', () => {
    render(<About />);
    expect(screen.getByText(/Based in/i)).toBeInTheDocument();
    expect(screen.getByText(/Ottawa, Canada/i)).toBeInTheDocument();
  });
});
