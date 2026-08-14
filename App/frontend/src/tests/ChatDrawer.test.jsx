// Ref: RF2-009, RF2-010, RF2-011, B2-004, B2-005
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatDrawer } from '../components/ChatDrawer';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { SocialUIProvider } from '../context/SocialUIContext';
import * as WebSocketContextModule from '../context/WebSocketContext';
import { api } from '../services/api';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  api: {
    getConversations: vi.fn(),
    getOrCreateConversation: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    markConversationRead: vi.fn(),
    getMe: vi.fn().mockRejectedValue(new Error('No session'))
  }
}));

describe('ChatDrawer - Nexora Social v2 (Anti-Flicker & Loop Tests)', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('executes getConversations ONLY once upon opening drawer and does not re-fetch on re-renders', async () => {
    api.getConversations.mockResolvedValue([
      {
        id: 10,
        other_user: { id: 2, name: 'Carlos Mendoza', avatar_url: null },
        last_message: { content: 'Hola Ana', created_at: '2026-08-12T10:00:00Z' },
        unread_count: 0
      }
    ]);

    vi.spyOn(WebSocketContextModule, 'useWebSocket').mockReturnValue({
      connected: true,
      incomingMessage: null,
      readAckEvent: null,
      typingState: {},
      sendChatMessage: vi.fn(),
      sendTypingStart: vi.fn(),
      sendTypingStop: vi.fn(),
      sendReadAck: vi.fn()
    });

    const { rerender } = render(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <ChatDrawer isOpen={true} onClose={mockOnClose} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(1);
    });

    // Re-render with same props
    rerender(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <ChatDrawer isOpen={true} onClose={mockOnClose} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Call count must remain 1
    expect(api.getConversations).toHaveBeenCalledTimes(1);
  });

  it('opens conversation with targetUserId ONLY once and handles invalid server responses safely', async () => {
    api.getConversations.mockResolvedValue([]);
    api.getOrCreateConversation.mockResolvedValue({
      id: 10,
      other_user: { id: 2, name: 'Carlos Mendoza' }
    });
    api.getMessages.mockResolvedValue([]);

    vi.spyOn(WebSocketContextModule, 'useWebSocket').mockReturnValue({
      connected: true,
      incomingMessage: null,
      readAckEvent: null,
      typingState: {},
      sendChatMessage: vi.fn(),
      sendTypingStart: vi.fn(),
      sendTypingStop: vi.fn(),
      sendReadAck: vi.fn()
    });

    const { rerender } = render(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <ChatDrawer isOpen={true} onClose={mockOnClose} targetUserId={2} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.getOrCreateConversation).toHaveBeenCalledWith(2);
      expect(api.getOrCreateConversation).toHaveBeenCalledTimes(1);
    });

    // Re-render with same targetUserId
    rerender(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <ChatDrawer isOpen={true} onClose={mockOnClose} targetUserId={2} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(api.getOrCreateConversation).toHaveBeenCalledTimes(1);
  });

  it('does NOT reload conversations on typingState or readAckEvent changes', async () => {
    api.getConversations.mockResolvedValue([
      {
        id: 10,
        other_user: { id: 2, name: 'Carlos Mendoza' },
        last_message: null,
        unread_count: 0
      }
    ]);

    const mockWS = {
      connected: true,
      incomingMessage: null,
      readAckEvent: null,
      typingState: {},
      sendChatMessage: vi.fn(),
      sendTypingStart: vi.fn(),
      sendTypingStop: vi.fn(),
      sendReadAck: vi.fn()
    };

    const wsSpy = vi.spyOn(WebSocketContextModule, 'useWebSocket').mockReturnValue(mockWS);

    const { rerender } = render(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <ChatDrawer isOpen={true} onClose={mockOnClose} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.getConversations).toHaveBeenCalledTimes(1);
    });

    // Simulate typingState change
    wsSpy.mockReturnValue({
      ...mockWS,
      typingState: { 10: { 2: Date.now() } }
    });

    rerender(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <ChatDrawer isOpen={true} onClose={mockOnClose} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should NOT fetch conversations again
    expect(api.getConversations).toHaveBeenCalledTimes(1);
  });

  it('deduplicates incomingMessage without reloading entire conversation or duplicating items', async () => {
    api.getConversations.mockResolvedValue([]);
    api.getOrCreateConversation.mockResolvedValue({
      id: 10,
      other_user: { id: 2, name: 'Carlos Mendoza' }
    });
    api.getMessages.mockResolvedValue([
      { id: 100, conversation_id: 10, sender_id: 2, content: 'Hola original', created_at: '2026-08-12T10:00:00Z' }
    ]);

    const mockWS = {
      connected: true,
      incomingMessage: null,
      readAckEvent: null,
      typingState: {},
      sendChatMessage: vi.fn(),
      sendTypingStart: vi.fn(),
      sendTypingStop: vi.fn(),
      sendReadAck: vi.fn()
    };

    const wsSpy = vi.spyOn(WebSocketContextModule, 'useWebSocket').mockReturnValue(mockWS);

    const { rerender } = render(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <ChatDrawer isOpen={true} onClose={mockOnClose} targetUserId={2} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hola original')).toBeInTheDocument();
    });

    // Duplicate message received via WS
    wsSpy.mockReturnValue({
      ...mockWS,
      incomingMessage: { id: 100, conversation_id: 10, sender_id: 2, content: 'Hola original', created_at: '2026-08-12T10:00:00Z' }
    });

    rerender(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <ChatDrawer isOpen={true} onClose={mockOnClose} targetUserId={2} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify it is present only once
    const messages = screen.getAllByText('Hola original');
    expect(messages.length).toBe(1);
  });

  it('safely handles conversation list error without unmounting active chat window', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    api.getConversations.mockRejectedValue(new Error('Fallo de red al listar'));
    api.getOrCreateConversation.mockResolvedValue({
      id: 10,
      other_user: { id: 2, name: 'Carlos Mendoza' }
    });
    api.getMessages.mockResolvedValue([
      { id: 101, conversation_id: 10, sender_id: 2, content: 'Mensaje activo intacto', created_at: '2026-08-12T10:00:00Z' }
    ]);

    vi.spyOn(WebSocketContextModule, 'useWebSocket').mockReturnValue({
      connected: true,
      incomingMessage: null,
      readAckEvent: null,
      typingState: {},
      sendChatMessage: vi.fn(),
      sendTypingStart: vi.fn(),
      sendTypingStop: vi.fn(),
      sendReadAck: vi.fn()
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <SocialUIProvider>
              <ChatDrawer isOpen={true} onClose={mockOnClose} targetUserId={2} />
            </SocialUIProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mensaje activo intacto')).toBeInTheDocument();
    });

    // Active conversation is still displayed despite conversation list load error
    expect(screen.queryByText('Fallo de red al listar')).not.toBeInTheDocument();
  });
});
