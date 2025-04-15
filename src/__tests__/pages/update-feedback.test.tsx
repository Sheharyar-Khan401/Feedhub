import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UpdateFeedback from '../../pages/update-feedback';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => ({
          data: () => ({
            title: 'Existing Feedback',
            description: 'Existing Description',
          }),
        })),
        update: jest.fn(),
      })),
    })),
  },
}));

describe('Update Feedback Page', () => {
  const renderUpdateFeedback = () => render(
    <BrowserRouter>
      <UpdateFeedback />
    </BrowserRouter>
  );

  it('renders without crashing', () => {
    renderUpdateFeedback();
    expect(screen.getByTestId('update-feedback-page')).toBeInTheDocument();
  });

  it('displays the update feedback form with existing data', async () => {
    renderUpdateFeedback();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Feedback')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    renderUpdateFeedback();
    
    // Clear the form
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: '' },
    });

    const submitButton = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
    });
  });

  it('updates the feedback with new data', async () => {
    renderUpdateFeedback();
    
    // Update the form
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'Updated Feedback' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Updated Description' },
    });

    const submitButton = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/feedbacks');
    });
  });
}); 