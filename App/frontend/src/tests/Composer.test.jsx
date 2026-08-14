// Ref: RNF-007, B-013, B-019, B2-003
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Composer } from '../components/Composer';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { vi } from 'vitest';

describe('Composer', () => {
  it('validates empty content and submits valid post content', async () => {
    const handlePostCreated = vi.fn().mockResolvedValue();

    render(
      <AuthProvider>
        <ToastProvider>
          <Composer onPostCreated={handlePostCreated} />
        </ToastProvider>
      </AuthProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /Publicar/i });
    expect(submitBtn).toBeDisabled();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Nuevo contenido de publicación' } });

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handlePostCreated).toHaveBeenCalledWith('Nuevo contenido de publicación', null, null);
    });
  });
});