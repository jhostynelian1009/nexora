// Ref: RF2-010, RF2-011, B2-005, ADR2-003
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { WebSocketProvider, useWebSocket } from '../context/WebSocketContext';
import * as AuthContextModule from '../context/AuthContext';
import { api } from '../services/api';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  api: {
    createWsTicket: vi.fn(),
    getUnreadNotificationCount: vi.fn().mockResolvedValue({ count: 0 })
  }
}));

const TestChild = () => {
  const ws = useWebSocket();
  return <div data-testid="ws-status">{ws.connected ? 'CONECTADO' : 'DESCONECTADO'}</div>;
};

describe('WebSocketContext - Ticket Auth & Reconnection Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches a single-use ticket and avoids duplicate connection attempts', async () => {
    api.createWsTicket.mockResolvedValue({ ticket: 'test_ticket_uuid_123' });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      token: 'jwt_mock_token',
      user: { id: 1, name: 'Ana Torres' }
    });

    // Mock global WebSocket
    const mockWsInstances = [];
    global.WebSocket = vi.fn().mockImplementation((url) => {
      const wsInstance = {
        url,
        readyState: 0, // CONNECTING
        send: vi.fn(),
        close: vi.fn()
      };
      mockWsInstances.push(wsInstance);
      return wsInstance;
    });

    render(
      <WebSocketProvider>
        <TestChild />
      </WebSocketProvider>
    );

    await waitFor(() => {
      expect(api.createWsTicket).toHaveBeenCalledTimes(1);
      expect(global.WebSocket).toHaveBeenCalledWith(expect.stringContaining('/ws?ticket=test_ticket_uuid_123'));
    });

    // Verify only 1 socket instance was opened (no duplicates)
    expect(mockWsInstances.length).toBe(1);
  });
});
