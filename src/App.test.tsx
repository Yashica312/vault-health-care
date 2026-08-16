import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './pages/Landing';

describe('Vault Health landing page', () => {
  it('renders the real Vault Health hero content', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /all your medical records\./i })).toBeInTheDocument();
    expect(screen.getByText(/One secure place\./i)).toBeInTheDocument();
    expect(screen.getAllByText(/Vault Health/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Get Started Free/i })).toBeInTheDocument();
  });
});
