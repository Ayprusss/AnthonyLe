import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hobbies from './Hobbies';

jest.mock('framer-motion', () => {
  const React = require('react');
  const strip = (Tag) => React.forwardRef(({ children, ...props }, ref) => {
    const {
      initial, animate, exit, whileInView, whileHover, whileTap, viewport,
      transition, delay, variants, custom, drag, dragConstraints, dragElastic,
      dragMomentum, dragSnapToOrigin, onDragStart, onDragEnd, ...valid
    } = props;
    return <Tag ref={ref} {...valid}>{children}</Tag>;
  });
  const motion = new Proxy({}, { get: (_, tag) => strip(tag) });
  return { motion, AnimatePresence: ({ children }) => <>{children}</> };
});

jest.mock('./ui/TextScramble', () => ({
  TextScramble: ({ text, as: Tag = 'span', className }) => <Tag className={className}>{text}</Tag>,
}));

describe('Hobbies Component', () => {
  test('renders the Hobbies heading', () => {
    render(<Hobbies />);
    expect(screen.getByRole('heading', { name: /hobbies\./i, level: 2 })).toBeInTheDocument();
  });

  test('shows the first hobby as the active card', () => {
    render(<Hobbies />);
    expect(screen.getByRole('heading', { name: /Rock Climbing/i, level: 3 })).toBeInTheDocument();
  });

  test('renders carousel navigation controls', () => {
    render(<Hobbies />);
    expect(screen.getByRole('button', { name: /next hobby/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous hobby/i })).toBeInTheDocument();
  });

  test('advances to the next hobby when the next arrow is clicked', () => {
    render(<Hobbies />);
    fireEvent.click(screen.getByRole('button', { name: /next hobby/i }));
    expect(screen.getByRole('heading', { name: /Hiking/i, level: 3 })).toBeInTheDocument();
  });

  test('wraps to the last hobby when going previous from the first', () => {
    render(<Hobbies />);
    fireEvent.click(screen.getByRole('button', { name: /previous hobby/i }));
    expect(screen.getByRole('heading', { name: /Gaming/i, level: 3 })).toBeInTheDocument();
  });
});
