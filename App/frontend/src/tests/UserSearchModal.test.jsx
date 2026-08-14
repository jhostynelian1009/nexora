// Ref: RF2-001, RF2-002, B2-002
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserSearchModal } from '../components/UserSearchModal';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { SocialUIProvider } from '../context/SocialUIContext';
import { api } from '../services/api';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  api: {
    searchUsers: vi.fn(),
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
    getMe: vi.fn().mockRejectedValue(new Error('No session'))
  }
}));

describe('UserSearchModal - Nexora Social v2', () => {
  const mockOnClose = vi.fn();
  const mockOnOpenChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches users by query and displays search result cards', async () => {
    const mockResults = [
      {
        id: 2,
        name: 'Carlos Mendoza',
        career: 'Ingeniería de Sistemas',
        bio: 'Desarrollador fullstack',
        avatar_url: 'https://example.com/carlos.jpg',
        is_followed_by_me: false
      }
    ];
    api.searchUsers.mockResolvedValueOnce(mockResults);

    render(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <UserSearchModal isOpen={true} onClose={mockOnClose} onOpenChat={mockOnOpenChat} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Buscar por nombre o carrera/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre o carrera/i);

    fireEvent.change(searchInput, { target: { value: 'Carlos' } });

    await waitFor(() => {
      expect(api.searchUsers).toHaveBeenCalledWith('Carlos');
      expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
      expect(screen.getByText('Ingeniería de Sistemas')).toBeInTheDocument();
    });
  });
});
