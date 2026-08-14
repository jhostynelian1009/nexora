// Ref: RF2-012, B2-006
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotificationsDropdown } from '../components/NotificationsDropdown';
import { ToastProvider } from '../context/ToastContext';
import { SocialUIProvider } from '../context/SocialUIContext';
import * as WebSocketContextModule from '../context/WebSocketContext';
import { api } from '../services/api';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  api: {
    getNotifications: vi.fn(),
    markAllNotificationsRead: vi.fn(),
    markNotificationRead: vi.fn()
  }
}));

describe('NotificationsDropdown - Nexora Social v2', () => {
  const mockOnClose = vi.fn();
  const mockOnOpenChat = vi.fn();
  const mockSetUnreadNotifsCount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notifications list and marks all notifications as read', async () => {
    const mockNotifications = [
      {
        id: 1,
        notification_type: 'follow',
        actor: { id: 2, name: 'Carlos Mendoza', avatar_url: null },
        payload: { message: 'ha comenzado a seguirte.' },
        is_read: false,
        created_at: '2026-08-12T11:00:00Z'
      }
    ];

    api.getNotifications.mockResolvedValueOnce(mockNotifications);
    api.markAllNotificationsRead.mockResolvedValueOnce({ success: true });

    vi.spyOn(WebSocketContextModule, 'useWebSocket').mockReturnValue({
      latestNotification: null,
      setUnreadNotifsCount: mockSetUnreadNotifsCount
    });

    render(
      <MemoryRouter>
        <ToastProvider>
          <SocialUIProvider>
            <NotificationsDropdown isOpen={true} onClose={mockOnClose} onOpenChat={mockOnOpenChat} />
          </SocialUIProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Notificaciones')).toBeInTheDocument();
      expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
      expect(screen.getByText('ha comenzado a seguirte.')).toBeInTheDocument();
    });

    const markAllBtn = screen.getByRole('button', { name: /Marcar leídas/i });
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(api.markAllNotificationsRead).toHaveBeenCalled();
      expect(mockSetUnreadNotifsCount).toHaveBeenCalledWith(0);
    });
  });
});
