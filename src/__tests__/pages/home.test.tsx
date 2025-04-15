import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/home';

describe('Home Page', () => {
  const renderHome = () => render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );

  it('renders without crashing', () => {
    renderHome();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('displays the welcome message', () => {
    renderHome();
    expect(screen.getByText(/Welcome to Feedhub/i)).toBeInTheDocument();
  });
}); 