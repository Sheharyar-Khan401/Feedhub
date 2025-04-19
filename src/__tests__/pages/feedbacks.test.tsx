import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Feedbacks from '../../pages/feedbacks';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

// Mock auth context
jest.mock('../../contexts/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Feedbacks Page', () => {
  const renderFeedbacks = () => render(
    <BrowserRouter>
      <Feedbacks />
    </BrowserRouter>
  );

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders without crashing', () => {
    renderFeedbacks();
    expect(screen.getByRole('heading', { name: /Feedbacks/i })).toBeInTheDocument();
  });

  it('displays the feedbacks header', () => {
    renderFeedbacks();
    expect(screen.getByRole('heading', { name: /Feedbacks/i })).toBeInTheDocument();
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
    expect(mockNavigate).toHaveBeenCalledWith('/add-feedback');
  });
}); 