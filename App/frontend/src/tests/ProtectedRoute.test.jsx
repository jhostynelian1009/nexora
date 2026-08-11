// Ref: RNF-007, B-011, B-019
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  api: {
    getMe: vi.fn().mockRejectedValue(new Error('Unauthenticated'))
  }
}));

describe('ProtectedRoute', () => {
  it('redirects to /login when user is unauthenticated', async () => {
    localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Página de Login</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Contenido Protegido</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Página de Login')).toBeInTheDocument();
      expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();
    });
  });
});
