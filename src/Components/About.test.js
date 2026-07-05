import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import About from './About';

jest.mock('framer-motion', () => {
  const React = require('react');
  const strip = (Tag) => React.forwardRef(({ children, ...props }, ref) => {
    const { initial, whileInView, viewport, transition, delay, ...validProps } = props;
    return <Tag ref={ref} {...validProps}>{children}</Tag>;
  });
  return { motion: { div: strip('div'), figure: strip('figure') } };
});

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
    // "based in" also appears inside the bio copy, so match all occurrences
    expect(screen.getAllByText(/Based in/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Ottawa, Canada')).toBeInTheDocument();
  });
});
