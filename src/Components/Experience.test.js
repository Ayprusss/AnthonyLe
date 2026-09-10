import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Experience from './Experience';

describe('Experience Component', () => {
  test('renders the Experience heading properly', () => {
    render(<Experience />);

    const heading = screen.getByRole('heading', { name: /experience\./i, level: 2 });
    expect(heading).toBeInTheDocument();
  });

  test('renders all experience roles, companies and periods', () => {
    render(<Experience />);

    // Check for Magnet Forensics
    expect(screen.getByText(/Magnet Forensics/i)).toBeInTheDocument();

    // Check for University of Ottawa
    expect(screen.getByText(/University of Ottawa/i)).toBeInTheDocument();

    // Check for Canada Revenue Agency — two postings (data analyst + software eng)
    expect(screen.getAllByText(/Canada Revenue Agency/i).length).toBe(2);

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
