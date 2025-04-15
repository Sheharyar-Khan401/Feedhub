import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SurveyVote from '../../pages/survey-vote';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => ({
          data: () => ({
            question: 'Test Survey Question',
            options: ['Option 1', 'Option 2', 'Option 3'],
            votes: {},
          }),
        })),
        update: jest.fn(),
      })),
    })),
  },
}));

describe('Survey Vote Page', () => {
  const renderSurveyVote = () => render(
    <BrowserRouter>
      <SurveyVote />
    </BrowserRouter>
  );

  it('renders without crashing', () => {
    renderSurveyVote();
    expect(screen.getByTestId('survey-vote-page')).toBeInTheDocument();
  });

  it('displays the survey question and options', async () => {
    renderSurveyVote();
    
    await waitFor(() => {
      expect(screen.getByText('Test Survey Question')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  it('allows voting for an option', async () => {
    renderSurveyVote();
    
    await waitFor(() => {
      const voteButton = screen.getByRole('button', { name: /Vote for Option 1/i });
      fireEvent.click(voteButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Thank you for voting!/i)).toBeInTheDocument();
    });
  });

  it('prevents multiple votes', async () => {
    renderSurveyVote();
    
    await waitFor(() => {
      const voteButton = screen.getByRole('button', { name: /Vote for Option 1/i });
      fireEvent.click(voteButton);
    });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Vote for Option 1/i })).not.toBeInTheDocument();
    });
  });
}); 