import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';
import emailjs from '@emailjs/browser';
import '@testing-library/jest-dom';

// Mock framer-motion to bypass animation requirements during tests
jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef(({ children, ...props }, ref) => {
      // Exclude framer-motion specific props to prevent React warnings
      const { initial, whileInView, viewport, transition, ...validProps } = props;
      return <div ref={ref} {...validProps}>{children}</div>;
    }),
  },
}));

// Mock @emailjs/browser
jest.mock('@emailjs/browser', () => ({
  sendForm: jest.fn(),
}));

describe('Contact Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the contact form properly', () => {
    render(<Contact />);

    expect(screen.getByRole('heading', { name: /contact/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/subject/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  test('allows users to fill out the form', async () => {
    render(<Contact />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const subjectInput = screen.getByPlaceholderText(/subject/i);
    const messageInput = screen.getByPlaceholderText(/your message/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(subjectInput, 'Test Subject');
    await userEvent.type(messageInput, 'Test Message');

    expect(emailInput).toHaveValue('test@example.com');
    expect(subjectInput).toHaveValue('Test Subject');
    expect(messageInput).toHaveValue('Test Message');
  });

  test('handles successful form submission', async () => {
    // Mock the sendForm function to resolve successfully
    emailjs.sendForm.mockResolvedValue({ text: 'OK' });

    render(<Contact />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const subjectInput = screen.getByPlaceholderText(/subject/i);
    const messageInput = screen.getByPlaceholderText(/your message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(subjectInput, 'Test Subject');
    await userEvent.type(messageInput, 'Test Message');

    fireEvent.click(submitButton);

    // Assert that the button state changes
    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Assert that emailjs was called with correct parameters
    expect(emailjs.sendForm).toHaveBeenCalledWith(
      'ayprusss_email_service',
      'template_30qbmwr',
      expect.any(HTMLFormElement),
      'ajgDW7hgrON568ajG'
    );

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/message submitted. thanks!/i)).toBeInTheDocument();
    });

    // Check if form is reset (the input values should be empty)
    expect(emailInput).toHaveValue('');
    expect(subjectInput).toHaveValue('');
    expect(messageInput).toHaveValue('');
  });

  test('handles failed form submission', async () => {
    // Mock the sendForm function to reject
    emailjs.sendForm.mockRejectedValue({ text: 'Error' });

    render(<Contact />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const subjectInput = screen.getByPlaceholderText(/subject/i);
    const messageInput = screen.getByPlaceholderText(/your message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(subjectInput, 'Test Subject');
    await userEvent.type(messageInput, 'Test Message');

    fireEvent.click(submitButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/error occurred. please try again./i)).toBeInTheDocument();
    });

    // Check that button is re-enabled
    expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled();
  });
});
