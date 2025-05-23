import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import SurveyVote from '../../pages/feedback-vote';

// Mock Firebase initialization
jest.mock('../../firebase', () => ({
  db: {},
  auth: {}
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-survey-id' }),
}));

const mockSurveyData = {
  question: 'Test Question',
  description: 'Test Description',
  questionType: 'multiple-choice',
  options: {
    option1: 'Option 1',
    option2: 'Option 2'
  }
};

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => mockSurveyData
  })),
  updateDoc: jest.fn(() => Promise.resolve()),
  arrayUnion: jest.fn(data => data)
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  },
}));

jest.mock('../../contexts/auth-context', () => ({
  useAuth: jest.fn(() => ({
    user: { uid: 'test-user-id' }
  }))
}));

const mockNavigate = jest.fn();

describe('SurveyVote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and handles multiple choice survey submission', async () => {
    render(<SurveyVote />);
    
    // Wait for the survey to load
    await waitFor(() => {
      expect(screen.getByText('Test Question')).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.click(screen.getByLabelText('Option 1'));
    fireEvent.change(screen.getByLabelText('Your Full Name'), {
      target: { value: 'Test User' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          votes: expect.anything(),
          submittedBy: expect.anything()
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Thank you for your response!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows error when submitting without required fields', async () => {
    render(<SurveyVote />);

    // Wait for the survey to load
    await waitFor(() => {
      expect(screen.getByText('Test Question')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Submit'));

    expect(toast.error).toHaveBeenCalledWith('Please enter your name.');
  });
}); 