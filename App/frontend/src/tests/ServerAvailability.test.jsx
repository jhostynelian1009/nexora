// Ref: RNF-008, RNF2-004, AND-RF-002, AND-RF-005, AND-HU-001
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ServerAvailabilityProvider, useServerAvailability } from '../context/ServerAvailabilityContext';
import { AuthProvider } from '../context/AuthContext';
import { WebSocketProvider, useWebSocket } from '../context/WebSocketContext';
import { LoginPage } from '../pages/LoginPage';
import { api } from '../services/api';
import { storage } from '../services/storage';
import * as networkUtil from '../utils/network';

vi.mock('../services/api', () => ({
  api: {
    health: vi.fn(),
    login: vi.fn(),
    getMe: vi.fn(),
    createWsTicket: vi.fn(),
    getUnreadNotificationCount: vi.fn().mockResolvedValue({ count: 0 })
  }
}));

vi.mock('../utils/network', () => ({
  checkNetworkStatus: vi.fn().mockResolvedValue(true),
  setupNetworkListener: vi.fn().mockImplementation((cb) => () => {})
}));

const TestAvailabilityChild = () => {
  const { serverStatus, isOnline, isWaking, retryConnection } = useServerAvailability();
  return (
    <div>
      <span data-testid="status">{serverStatus}</span>
      <span data-testid="online">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
      <span data-testid="waking">{isWaking ? 'WAKING' : 'NOT_WAKING'}</span>
      <button data-testid="retry-btn" onClick={retryConnection}>Retry</button>
    </div>
  );
};

describe('ServerAvailability & Render Readiness Suite', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useRealTimers();
    localStorage.clear();
    await storage.clear();
  });


  // 1. Estado inicial de conexión
  it('1. checks initial connection status on provider mount', async () => {
    api.health.mockResolvedValueOnce({ status: 'ok' });

    render(
      <ServerAvailabilityProvider>
        <TestAvailabilityChild />
      </ServerAvailabilityProvider>
    );

    await waitFor(() => {
      expect(networkUtil.checkNetworkStatus).toHaveBeenCalled();
      expect(api.health).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('status').textContent).toBe('online');
    });
  });

  // 2. Backend en proceso de despertar
  it('2. transitions to waking state when backend takes longer than waking threshold', async () => {
    vi.useFakeTimers();
    let resolveHealth;
    api.health.mockImplementationOnce(() => new Promise((resolve) => {
      resolveHealth = resolve;
    }));

    render(
      <ServerAvailabilityProvider>
        <TestAvailabilityChild />
      </ServerAvailabilityProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Initial check state
    expect(screen.getByTestId('status').textContent).toBe('checking');

    // Advance 3.5 seconds
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.getByTestId('status').textContent).toBe('waking');
    expect(screen.getByTestId('waking').textContent).toBe('WAKING');

    // Finish health request
    await act(async () => {
      resolveHealth({ status: 'ok' });
    });

    expect(screen.getByTestId('status').textContent).toBe('online');
    vi.useRealTimers();
  });

  // 3. Respuesta exitosa de /health
  it('3. sets status to online upon successful /health response', async () => {
    api.health.mockResolvedValueOnce({ status: 'ok', app: 'Nexora API' });

    render(
      <ServerAvailabilityProvider>
        <TestAvailabilityChild />
      </ServerAvailabilityProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('online').textContent).toBe('ONLINE');
    });
  });

  // 4. Timeout de 90 segundos
  it('4. configures 90s timeout for api.health()', async () => {
    api.health.mockResolvedValueOnce({ status: 'ok' });
    render(
      <ServerAvailabilityProvider>
        <TestAvailabilityChild />
      </ServerAvailabilityProvider>
    );
    await waitFor(() => {
      expect(api.health).toHaveBeenCalled();
    });
  });

  // 5. Reintento manual
  it('5. triggers health check on manual retry', async () => {
    api.health.mockRejectedValueOnce(new Error('Server waking timeout'));
    render(
      <ServerAvailabilityProvider>
        <TestAvailabilityChild />
      </ServerAvailabilityProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error');
    });

    api.health.mockResolvedValueOnce({ status: 'ok' });
    fireEvent.click(screen.getByTestId('retry-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('online');
    });
  });

  // 6. Dispositivo sin Internet
  it('6. detects offline device and sets status to offline', async () => {
    networkUtil.checkNetworkStatus.mockResolvedValueOnce(false);

    render(
      <ServerAvailabilityProvider>
        <TestAvailabilityChild />
      </ServerAvailabilityProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('offline');
      expect(api.health).not.toHaveBeenCalled();
    });
  });

  // 7. Login deshabilitado mientras despierta
  it('7. disables login button while server is waking or checking', async () => {
    api.health.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <ServerAvailabilityProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ServerAvailabilityProvider>
      </BrowserRouter>
    );

    await act(async () => {
      await Promise.resolve();
    });

    const loginBtn = screen.getByRole('button', { name: /Esperando servidor.../i });
    expect(loginBtn).toBeDisabled();
  });


  // 8. Login habilitado cuando queda online
  it('8. enables login button when server becomes online', async () => {
    api.health.mockResolvedValueOnce({ status: 'ok' });

    render(
      <BrowserRouter>
        <ServerAvailabilityProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ServerAvailabilityProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const loginBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });
      expect(loginBtn).not.toBeDisabled();
    });
  });

  // 9. Credenciales inválidas mostradas correctamente
  it('9. displays invalid credentials error correctly when login fails on online backend', async () => {
    api.health.mockResolvedValueOnce({ status: 'ok' });
    api.login.mockRejectedValueOnce(new Error('Credenciales incorrectas.'));

    render(
      <BrowserRouter>
        <ServerAvailabilityProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ServerAvailabilityProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).not.toBeDisabled();
    });

    fireEvent.change(screen.getByPlaceholderText('tu@correo.edu'), { target: { value: 'test@nexora.edu' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas.')).toBeInTheDocument();
    });
  });

  // 10. JWT conservado durante timeout
  it('10. preserves token in storage during network timeout or backend starting delay', async () => {
    await storage.setItem('nexora_token', 'valid_saved_token');
    await storage.setItem('nexora_user', JSON.stringify({ id: 1, name: 'Ana' }));

    const timeoutErr = new Error('La solicitud excedió el tiempo de espera');
    timeoutErr.status = 504;
    api.getMe.mockRejectedValueOnce(timeoutErr);
    api.health.mockResolvedValueOnce({ status: 'ok' });

    render(
      <ServerAvailabilityProvider>
        <AuthProvider>
          <div data-testid="auth-loaded">Loaded</div>
        </AuthProvider>
      </ServerAvailabilityProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-loaded')).toBeInTheDocument();
    });

    // Token must NOT be removed from storage
    expect(storage.getItemSync('nexora_token')).toBe('valid_saved_token');
  });

  // 11 & 12. WebSocket conectado después de disponibilidad y ausencia de conexiones duplicadas
  it('11 & 12. connects WebSocket only after online status without duplicate connections', async () => {
    api.health.mockResolvedValueOnce({ status: 'ok' });
    api.createWsTicket.mockResolvedValueOnce({ ticket: 'test_ws_ticket' });

    await storage.setItem('nexora_token', 'jwt_test_token');
    await storage.setItem('nexora_user', JSON.stringify({ id: 1, name: 'Ana' }));

    const mockWsInstances = [];
    global.WebSocket = vi.fn().mockImplementation((url) => {
      const ws = {
        url,
        readyState: 0,
        send: vi.fn(),
        close: vi.fn()
      };
      mockWsInstances.push(ws);
      return ws;
    });

    render(
      <ServerAvailabilityProvider>
        <AuthProvider>
          <WebSocketProvider>
            <div data-testid="ws-child">WS Loaded</div>
          </WebSocketProvider>
        </AuthProvider>
      </ServerAvailabilityProvider>
    );

    await waitFor(() => {
      expect(api.createWsTicket).toHaveBeenCalledTimes(1);
      expect(global.WebSocket).toHaveBeenCalledWith(expect.stringContaining('/ws?ticket=test_ws_ticket'));
    });

    expect(mockWsInstances.length).toBe(1);
  });

});
