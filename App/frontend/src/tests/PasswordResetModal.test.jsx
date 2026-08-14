// Ref: RF2-013, RF2-014, B2-007
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PasswordResetModal } from '../components/PasswordResetModal';
import { api } from '../services/api';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  api: {
    requestPasswordReset: vi.fn(),
    verifyPasswordReset: vi.fn(),
    confirmPasswordReset: vi.fn()
  }
}));

describe('PasswordResetModal - Nexora Social v2', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes full 3-step password reset workflow: request OTP, verify OTP, and set new password', async () => {
    api.requestPasswordReset.mockResolvedValueOnce({ message: 'Código OTP enviado correctamente' });
    api.verifyPasswordReset.mockResolvedValueOnce({ valid: true, reset_token: 'reset_token_xyz' });
    api.confirmPasswordReset.mockResolvedValueOnce({ message: 'Contraseña restablecida con éxito' });

    render(
      <MemoryRouter>
        <PasswordResetModal isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

    // Step 1: Request OTP
    expect(screen.getByText('Recuperación de Contraseña')).toBeInTheDocument();
    const contactInput = screen.getByLabelText(/Correo o Teléfono/i);
    fireEvent.change(contactInput, { target: { value: 'ana.torres@nexora.edu' } });

    const requestBtn = screen.getByRole('button', { name: /Enviar Código OTP/i });
    fireEvent.click(requestBtn);

    await waitFor(() => {
      expect(api.requestPasswordReset).toHaveBeenCalledWith('ana.torres@nexora.edu');
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
    });

    // Step 2: Verify OTP
    const otpInput = screen.getByPlaceholderText('123456');
    fireEvent.change(otpInput, { target: { value: '654321' } });

    const verifyBtn = screen.getByRole('button', { name: /Verificar Código/i });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(api.verifyPasswordReset).toHaveBeenCalledWith('ana.torres@nexora.edu', '654321');
      expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toBeInTheDocument();
    });

    // Step 3: Change Password
    const passwordInput = screen.getByPlaceholderText('Mínimo 6 caracteres');
    fireEvent.change(passwordInput, { target: { value: 'newSecurePass123' } });

    const confirmBtn = screen.getByRole('button', { name: /Guardar Nueva Contraseña/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.confirmPasswordReset).toHaveBeenCalledWith('ana.torres@nexora.edu', 'reset_token_xyz', 'newSecurePass123');
      expect(screen.getByText('¡Contraseña Actualizada!')).toBeInTheDocument();
    });
  });
});
