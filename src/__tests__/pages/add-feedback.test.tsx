import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddFeedback from '../../pages/add-feedback';
import * as FeedbackContext from '../../contexts/feedback-context';

// Increase default timeout for all tests
jest.setTimeout(30000);

// Mock services
jest.mock('../../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../models/firebaseModel', () => ({
  addFeedbackToDb: jest.fn().mockResolvedValue('mock-feedback-id'),
  fetchFeedbacksFromDb: jest.fn().mockResolvedValue({ createdFeedbacks: [], votedFeedbacks: [] }),
  updateFeedbackInDb: jest.fn().mockResolvedValue(undefined),
  deleteFeedbackFromDb: jest.fn().mockResolvedValue(undefined),
  fetchFeedbackFromDb: jest.fn().mockResolvedValue({}),
}));

// Mock react-quill CSS import
jest.mock('react-quill/dist/quill.snow.css', () => ({}));

// Mock react-quill
jest.mock('react-quill', () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      data-testid="quill-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Mock auth context
jest.mock('../../contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
    },
    loading: false,
  }),
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Add Feedback Page', () => {
  const mockAddFeedback = jest.fn().mockResolvedValue('mock-feedback-id');
  const mockUpdateFeedback = jest.fn().mockResolvedValue(undefined);
  const mockDeleteFeedback = jest.fn().mockResolvedValue(undefined);
  const mockGetFeedback = jest.fn().mockResolvedValue({});
  const mockRefreshFeedbacks = jest.fn().mockResolvedValue(undefined);
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock the feedback context
    jest.spyOn(FeedbackContext, 'useFeedback').mockImplementation(() => ({
      addFeedback: mockAddFeedback,
      updateFeedback: mockUpdateFeedback,
      deleteFeedback: mockDeleteFeedback,
      getFeedback: mockGetFeedback,
      refreshFeedbacks: mockRefreshFeedbacks,
      loading: false,
      error: null,
      severity: 'info',
      createdFeedbacks: [],
      votedFeedbacks: [],
    }));
  });

  const renderAddFeedback = () => render(
    <BrowserRouter>
      <AddFeedback />
    </BrowserRouter>
  );

  it('renders the stepper with correct steps', () => {
    renderAddFeedback();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Survey Details')).toBeInTheDocument();
  });

  it('shows personal information form on first step', () => {
    renderAddFeedback();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('allows navigation between steps', async () => {
    renderAddFeedback();
    
    // Fill in required fields in first step
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    // Move to next step
    fireEvent.click(screen.getByText('Next'));

    // Check if second step is rendered
    expect(screen.getByLabelText('Survey Question')).toBeInTheDocument();
    expect(screen.getByTestId('quill-editor')).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    renderAddFeedback();

    // Fill in first step
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    // Move to next step
    fireEvent.click(screen.getByText('Next'));

    // Fill in second step
    fireEvent.change(screen.getByLabelText('Survey Question'), {
      target: { value: 'Test Question' },
    });
    fireEvent.change(screen.getByTestId('quill-editor'), {
      target: { value: 'Test Description' },
    });

    // Fill in multiple choice options
    const option1Input = screen.getByLabelText('Option 1');
    const option2Input = screen.getByLabelText('Option 2');
    fireEvent.change(option1Input, { target: { value: 'Option 1' } });
    fireEvent.change(option2Input, { target: { value: 'Option 2' } });

    // Move to final step
    fireEvent.click(screen.getByText('Finish'));

    // Wait for the success message and submit button
    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 6 });
      expect(heading).toHaveTextContent('All Steps Completed');
    });

    // Submit the form
    fireEvent.click(screen.getByText('Submit'));

    // Verify the feedback was added
    await waitFor(() => {
      expect(mockAddFeedback).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        question: 'Test Question',
        description: 'Test Description',
        questionType: 'multiple-choice',
        options: ['Option 1', 'Option 2'],
        ratingScale: {
          min: 1,
          max: 5,
          step: 1,
        },
      });
    });

    // Verify toast was called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Survey successfully created! An email with the survey link has been sent.');
    });
  });
}); 