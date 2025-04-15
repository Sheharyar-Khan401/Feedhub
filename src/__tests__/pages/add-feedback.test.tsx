import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddFeedback from '../../pages/add-feedback';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      add: jest.fn(),
    })),
  },
}));

describe('Add Feedback Page', () => {
  const renderAddFeedback = () => render(
    <BrowserRouter>
      <AddFeedback />
    </BrowserRouter>
  );

  it('renders without crashing', () => {
    renderAddFeedback();
    expect(screen.getByTestId('add-feedback-page')).toBeInTheDocument();
  });

  it('displays the add feedback form', () => {
    renderAddFeedback();
    expect(screen.getByText(/Add New Feedback/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderAddFeedback();
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    renderAddFeedback();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'Test Feedback' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'This is a test feedback description' },
    });

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/feedbacks');
    });
  });
}); 