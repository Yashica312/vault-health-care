import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  }),
}));

describe('Vault Health app shell', () => {
  it('renders the landing page content', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/All your medical records/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Vault Health/i).length).toBeGreaterThan(0);
  });
});
