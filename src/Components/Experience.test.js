import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Experience from './Experience';

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

describe('Experience Component', () => {
  test('renders the Experience heading properly', () => {
    render(<Experience />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  test('renders all experience roles, companies and periods', () => {
    render(<Experience />);

    // Check for Magnet Forensics
    expect(screen.getByText(/Magnet Forensics/i)).toBeInTheDocument();

    // Check for University of Ottawa
    expect(screen.getByText(/University of Ottawa/i)).toBeInTheDocument();

    // Check for Canada Revenue Agency
    expect(screen.getByText(/Canada Revenue Agency/i)).toBeInTheDocument();

    // Check for roles
    const sdiRoles = screen.getAllByText(/Software Developer Intern/i);
    expect(sdiRoles.length).toBe(2);

    expect(screen.getByText(/Software Engineering Intern/i)).toBeInTheDocument();

    // Check for periods
    expect(screen.getByText(/September 2025 - April 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/January 2025 - April 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/September 2023 - August 2024/i)).toBeInTheDocument();
  });
});
