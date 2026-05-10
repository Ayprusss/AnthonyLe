import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from './Hero';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, transition, delay, whileInView, viewport, ...validProps } = props;
      return <div ref={ref} {...validProps}>{children}</div>;
    }),
    span: require('react').forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, transition, delay, whileInView, viewport, ...validProps } = props;
      return <span ref={ref} {...validProps}>{children}</span>;
    }),
  },
}));

// Mock TextScramble
jest.mock('./ui/TextScramble', () => ({
  TextScramble: ({ text, as: Tag = 'span', className }) => {
    return <Tag className={className}>{text}</Tag>;
  }
}));

// Mock react-scroll Link
jest.mock('react-scroll', () => ({
  Link: ({ children, to, className }) => (
    <a href={`#${to}`} data-to={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock lucide-react ArrowRight
jest.mock('lucide-react', () => ({
  ArrowRight: () => <svg data-testid="arrow-right-icon" />
}));

describe('Hero Component', () => {
  test('renders the hero status eyebrow with text', () => {
    render(<Hero />);
    expect(screen.getByText('COMPUTER SCIENCE · UOTTAWA · 2026')).toBeInTheDocument();
  });

  test('renders the giant name block correctly', () => {
    render(<Hero />);
    expect(screen.getByText('ANTHONY')).toBeInTheDocument();
    expect(screen.getByText('LE')).toBeInTheDocument();
  });

  test('renders the current role correctly', () => {
    render(<Hero />);
    expect(screen.getByText('CURRENTLY')).toBeInTheDocument();
    expect(screen.getByText('Exploring outer space...')).toBeInTheDocument();
  });

  test('renders call to action links with correct destinations', () => {
    render(<Hero />);
    const viewWorkLink = screen.getByText('VIEW WORK');
    expect(viewWorkLink).toBeInTheDocument();
    expect(viewWorkLink).toHaveAttribute('data-to', 'projects');

    const getInTouchLink = screen.getByText('GET IN TOUCH');
    expect(getInTouchLink).toBeInTheDocument();
    expect(getInTouchLink).toHaveAttribute('data-to', 'contact');
  });

  test('renders scroll indicator', () => {
    render(<Hero />);
    expect(screen.getByText('SCROLL')).toBeInTheDocument();
  });
});
