import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the Home component so we don't render its heavy internals (canvas, etc.)
jest.mock('./Pages/Home/Home', () => {
  return function DummyHome() {
    return <div data-testid="home-page">Home Page Content</div>;
  };
});

describe('App Component Routing', () => {
  it('renders the Home component on the default / route', () => {
    // App contains its own BrowserRouter, so rendering it directly should mount it with the / route
    render(<App />);

    // Check if the dummy Home component is present
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders correctly', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
