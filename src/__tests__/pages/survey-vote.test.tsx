import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SurveyVote from '../../pages/survey-vote';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {},
}));

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'test-id',
  }),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      question: 'Test Survey Question',
      description: 'Test Description',
      questionType: 'multiple-choice',
      options: ['Option 1', 'Option 2', 'Option 3'],
      votes: [],
      submittedBy: [],
    }),
  })),
  updateDoc: jest.fn(() => Promise.resolve()),
  arrayUnion: jest.fn(x => x),
}));

// Mock auth context
jest.mock('../../contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
    },
  }),
}));

describe('Survey Vote Page', () => {
  const renderSurveyVote = () => render(
    <BrowserRouter>
      <SurveyVote />
    </BrowserRouter>
  );

  it('renders without crashing', () => {
    renderSurveyVote();
    expect(screen.getByRole('heading', { name: /Loading.../i })).toBeInTheDocument();
  });

  it('displays the survey question and options', async () => {
    renderSurveyVote();
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Survey Question' })).toBeInTheDocument();
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    });
  });

  it('allows voting for an option', async () => {
    renderSurveyVote();
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Survey Question' })).toBeInTheDocument();
    });

    // Fill in the required fields
    fireEvent.change(screen.getByLabelText('Your Full Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.click(screen.getByLabelText('Option 1'));

    // Submit the vote
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
  });

  it('prevents multiple votes', async () => {
    // Mock the survey data to show that the user has already voted
    const getDocMock = jest.requireMock('firebase/firestore').getDoc;
    getDocMock.mockImplementationOnce(() => Promise.resolve({
      exists: () => true,
      data: () => ({
        question: 'Test Survey Question',
        description: 'Test Description',
        questionType: 'multiple-choice',
        options: ['Option 1', 'Option 2', 'Option 3'],
        votes: [],
        submittedBy: ['test-user-id'],
      }),
    }));

    renderSurveyVote();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Already Submitted' })).toBeDisabled();
    });
  });
}); 