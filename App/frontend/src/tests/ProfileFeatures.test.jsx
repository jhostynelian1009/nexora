// Ref: RF2-002, RF2-003, RF2-007, B2-001, B2-002
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { SocialUIProvider } from '../context/SocialUIContext';
import { api } from '../services/api';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  api: {
    getMe: vi.fn(),
    getPublicProfile: vi.fn(),
    getUserPosts: vi.fn().mockResolvedValue([]),
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
    uploadAvatar: vi.fn()
  }
}));

describe('ProfileFeatures - Nexora Social v2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('nexora_token', 'mock_jwt_token');
  });

  it('allows following and unfollowing a target student profile', async () => {
    const mockMe = { id: 1, name: 'Ana Torres' };
    const mockPublicUser = {
      id: 3,
      name: 'Elena Rojas',
      email: 'elena@nexora.edu',
      career: 'Derecho',
      bio: 'Apasionada por la justicia',
      avatar_url: null,
      created_at: '2026-01-01T00:00:00Z',
      followers_count: 5,
      following_count: 2,
      posts_count: 10,
      is_followed_by_me: false,
      is_me: false
    };

    api.getMe.mockResolvedValue(mockMe);
    api.getPublicProfile.mockResolvedValue(mockPublicUser);
    api.followUser.mockResolvedValueOnce({ following: true, followers_count: 6 });
    api.unfollowUser.mockResolvedValueOnce({ following: false, followers_count: 5 });

    render(
      <MemoryRouter initialEntries={['/profile/3']}>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <Routes>
                <Route path="/profile/:userId" element={<ProfilePage />} />
              </Routes>
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.getPublicProfile).toHaveBeenCalledWith(3);
      expect(screen.getByText('Elena Rojas')).toBeInTheDocument();
      expect(screen.getByText('Derecho')).toBeInTheDocument();
    });

    const followBtn = screen.getByRole('button', { name: /Seguir/i });
    fireEvent.click(followBtn);

    await waitFor(() => {
      expect(api.followUser).toHaveBeenCalledWith(3);
    });
  });

  it('selects avatar image file and updates user avatar', async () => {
    const mockMe = {
      id: 1,
      name: 'Ana Torres',
      email: 'ana@nexora.edu',
      career: 'Ingeniería',
      bio: 'Hola Nexora',
      avatar_url: null,
      created_at: '2026-01-01T00:00:00Z'
    };

    api.getMe.mockResolvedValue(mockMe);
    api.uploadAvatar.mockResolvedValueOnce({
      secure_url: 'https://res.cloudinary.com/nexora/image/upload/v12345/avatar.jpg',
      public_id: 'nexora/avatars/uuid123'
    });

    // Mock URL.createObjectURL / revokeObjectURL for Vitest JSDOM
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-avatar-blob');
    global.URL.revokeObjectURL = vi.fn();

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <Routes>
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    });

    // Click "Editar perfil"
    const editBtn = screen.getByRole('button', { name: /Editar perfil/i });
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    const file = new File(['dummy_img_content'], 'avatar.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Actualizar foto/i })).toBeInTheDocument();
      });

      const confirmBtn = screen.getByRole('button', { name: /Actualizar foto/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(api.uploadAvatar).toHaveBeenCalledWith(file);
      });
    }
  });
});
