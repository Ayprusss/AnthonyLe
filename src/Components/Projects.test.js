import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Projects from './Projects';

// Mock framer-motion to bypass animation requirements during tests
jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef(({ children, ...props }, ref) => {
      // Exclude framer-motion specific props to prevent React warnings
      const { initial, whileInView, viewport, transition, delay, ...validProps } = props;
      return <div ref={ref} {...validProps}>{children}</div>;
    }),
  },
}));

// Mock TextScramble
jest.mock('./ui/TextScramble', () => ({
  TextScramble: ({ text, as: Tag = 'span', className }) => <Tag className={className}>{text}</Tag>,
}));

describe('Projects Component', () => {
  beforeEach(() => {
    // Mock IntersectionObserver which is used by TextScramble
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  test('renders the Projects heading properly', () => {
    render(<Projects />);
    const heading = screen.getByRole('heading', { name: /projects\./i, level: 2 });
    expect(heading).toBeInTheDocument();
  });

  test('renders all project titles', () => {
    render(<Projects />);
    expect(screen.getByText('Gladius')).toBeInTheDocument();
    expect(screen.getByText('dejavu')).toBeInTheDocument();
    expect(screen.getByText('"PPPTAILORINGCOURIER"')).toBeInTheDocument();
    expect(screen.getByText('Crux')).toBeInTheDocument();
  });

  test('renders project descriptions', () => {
    render(<Projects />);
    expect(screen.getByText(/A multi-agent AI pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/A full webstore project mocking "Vuja De"/i)).toBeInTheDocument();
    expect(screen.getByText(/A UI-focused webstore mock built for SEG 3125/i)).toBeInTheDocument();
    expect(screen.getByText(/A full-stack web application that serves as a comprehensive climbing map platform/i)).toBeInTheDocument();
  });

  test('renders tech stacks for projects', () => {
    render(<Projects />);
    // Checking a few specific tech items from different projects
    expect(screen.getByText('Claude Code')).toBeInTheDocument();
    expect(screen.getByText('Pydantic')).toBeInTheDocument();
    expect(screen.getByText('Vite.js')).toBeInTheDocument();
    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('MapLibre GL')).toBeInTheDocument();
    expect(screen.getByText('PostGIS')).toBeInTheDocument();
  });

  test('renders external links correctly with security attributes', () => {
    render(<Projects />);
    const links = screen.getAllByRole('link');

    // Total links expected: 4 github + 2 live = 6 links
    expect(links.length).toBe(6);

    const expectedUrls = [
        'https://github.com/Ayprusss/Gladius',
        'https://github.com/Ayprusss/dejavu',
        'https://dejavustudio.xyz/',
        'https://github.com/Ayprusss/PPPTAILORINGCOURIER',
        'https://ppptailoringcourier.vercel.app/',
        'https://github.com/Ayprusss/crux'
    ];

    expectedUrls.forEach(url => {
        const link = links.find(l => l.getAttribute('href') === url);
        expect(link).toBeDefined();
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
