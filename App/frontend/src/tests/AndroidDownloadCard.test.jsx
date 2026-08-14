// Ref: AND-RF-007, AND-RF-008, AND-B-007
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AndroidDownloadCard } from '../components/AndroidDownloadCard';
import * as platformModule from '../utils/platform';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AndroidDownloadCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders download card on web platform with secure HTTPS link', () => {
    vi.spyOn(platformModule, 'isNativePlatform').mockReturnValue(false);

    render(<AndroidDownloadCard />);

    expect(screen.getByTestId('android-download-card')).toBeInTheDocument();
    expect(screen.getByText('Nexora para Android')).toBeInTheDocument();
    expect(screen.getByText(/Descargar APK/i)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Descargar APK/i });
    expect(link).toHaveAttribute('href', expect.stringMatching(/^https:\/\//));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('hides card completely when running in Capacitor native platform', () => {
    vi.spyOn(platformModule, 'isNativePlatform').mockReturnValue(true);

    const { container } = render(<AndroidDownloadCard />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('android-download-card')).not.toBeInTheDocument();
  });
});
