import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UpdateFeedback from '../../pages/update-feedback';
import { FeedbackProvider } from '../../contexts/feedback-context';

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'test-id',
  }),
}));

// Mock Firebase
jest.mock('../../services/firebase-service', () => ({
  fetchFeedbackFromDb: jest.fn(() => Promise.resolve({
    name: 'Test User',
    email: 'test@example.com',
    question: 'Existing Feedback',
    description: 'Existing Description',
    questionType: 'multiple-choice',
    options: ['Option 1', 'Option 2'],
    ratingScale: {
      min: 1,
      max: 5,
      step: 1,
    },
  })),
  updateFeedbackInDb: jest.fn(() => Promise.resolve()),
}));

// Mock react-quill
jest.mock('react-quill', () => ({
  __esModule: true,
  default: () => <div data-testid="quill-editor" />,
}));

// Mock auth context
jest.mock('../../contexts/auth-context', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' }
  })
}));

describe('Update Feedback Page', () => {
  const renderUpdateFeedback = () => render(
    <BrowserRouter>
      <FeedbackProvider>
        <UpdateFeedback />
      </FeedbackProvider>
    </BrowserRouter>
  );

  const moveToSurveyDetails = async () => {
    await act(async () => {
      // Fill in personal information
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      
      // Move to next step
      fireEvent.click(screen.getByText('Next'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Survey Details')).toBeInTheDocument();
    });
  };

  it('renders without crashing', async () => {
    await act(async () => {
      renderUpdateFeedback();
    });
    expect(screen.getByTestId('update-feedback-page')).toBeInTheDocument();
  });

  it('displays the update feedback form with existing data', async () => {
    await act(async () => {
      renderUpdateFeedback();
    });
    
    // Wait for personal information to load
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('Test User');
      expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
    });

    // Move to survey details
    await moveToSurveyDetails();

    // Check survey details
    await waitFor(() => {
      expect(screen.getByLabelText('Survey Question')).toHaveValue('Existing Feedback');
      expect(screen.getByTestId('quill-editor')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    await act(async () => {
      renderUpdateFeedback();
    });
    
    // Clear the form fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: '' },
      });
    });
    
    // Try to move to next step without filling required fields
    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    // Wait for error messages to appear
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      
      // Check if the inputs have error state
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      
      // Check for error messages
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('updates the feedback with new data', async () => {
    await act(async () => {
      renderUpdateFeedback();
    });
    
    // Fill in personal information and move to survey details
    await moveToSurveyDetails();

    // Update survey details
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Survey Question'), {
        target: { value: 'Updated Feedback' },
      });

      // Submit the form
      fireEvent.click(screen.getByText('Submit'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Survey Details')).toBeInTheDocument();
    });
  });
}); 