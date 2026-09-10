import React from 'react';
import { render, screen } from '@testing-library/react';
import Resume from './Resume';
import '@testing-library/jest-dom';

describe('Resume Component Security Fix', () => {
  test('all links have rel="noopener noreferrer"', () => {
    render(<Resume />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(2); // One for "Open in Tab", one for "Download PDF"

    links.forEach(link => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('download link has correct security and download attributes', () => {
    render(<Resume />);
    const downloadLink = screen.getByRole('link', { name: /download pdf/i });
    expect(downloadLink).toHaveAttribute('href', '/Resume_Anthony_Le.pdf');
    expect(downloadLink).toHaveAttribute('download', 'Resume_Anthony_Le.pdf');
    expect(downloadLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('open in tab link has correct security and target attributes', () => {
    render(<Resume />);
    const openTabLink = screen.getByRole('link', { name: /open in tab/i });
    expect(openTabLink).toHaveAttribute('href', '/Resume_Anthony_Le.pdf');
    expect(openTabLink).toHaveAttribute('target', '_blank');
    expect(openTabLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
