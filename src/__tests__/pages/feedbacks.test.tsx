import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Feedbacks from '../../pages/feedbacks';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe('Feedbacks Page', () => {
  const renderFeedbacks = () => render(
    <BrowserRouter>
      <Feedbacks />
    </BrowserRouter>
  );

  it('renders without crashing', () => {
    renderFeedbacks();
    expect(screen.getByTestId('feedbacks-page')).toBeInTheDocument();
  });

  it('displays the feedback list header', () => {
    renderFeedbacks();
    expect(screen.getByText(/Feedback List/i)).toBeInTheDocument();
  });

  it('shows the add feedback button', () => {
    renderFeedbacks();
    const addButton = screen.getByRole('button', { name: /Add Feedback/i });
    expect(addButton).toBeInTheDocument();
  });

  it('navigates to add feedback page when add button is clicked', () => {
    renderFeedbacks();
    const addButton = screen.getByRole('button', { name: /Add Feedback/i });
    fireEvent.click(addButton);
    expect(window.location.pathname).toBe('/add-feedback');
  });
}); 