import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Portal from '../portal/portal';
import { AuthProvider } from '../portal/Context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('Authentication Flow', () => {
  it('shows error message on failed login', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Portal />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});

