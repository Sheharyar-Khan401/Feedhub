import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddFeedback from '../../pages/add-feedback';

// Mock services
jest.mock('../../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../models/firebaseModel', () => ({
  addFeedbackToDb: jest.fn().mockResolvedValue('mock-feedback-id'),
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
  const renderAddFeedback = () => render(
    <BrowserRouter>
      <AddFeedback />
    </BrowserRouter>
  );

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

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

  it('allows navigation between steps', () => {
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

    // Move to second step
    fireEvent.click(screen.getByText('Next'));

    // Fill in second step
    fireEvent.change(screen.getByLabelText('Survey Question'), {
      target: { value: 'Test Question' },
    });
    fireEvent.change(screen.getByTestId('quill-editor'), {
      target: { value: 'Test Description' },
    });

    // Complete the form
    fireEvent.click(screen.getByText('Finish'));

    // Check if success message appears
    await waitFor(() => {
      expect(screen.getByText('All Steps Completed')).toBeInTheDocument();
    });

    // Submit the form
    fireEvent.click(screen.getByText('Submit'));

    // Verify toast was called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Survey created and link sent!');
    });
  });
}); 