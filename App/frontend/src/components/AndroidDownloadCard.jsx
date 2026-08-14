// Ref: AND-RF-007, AND-RF-008, AND-B-007
import React from 'react';
import { Smartphone, Download, ShieldCheck } from 'lucide-react';
import { isNativePlatform } from '../utils/platform';

export const AndroidDownloadCard = () => {
  // Hide completely when running inside native Capacitor environment
  if (isNativePlatform()) {
    return null;
  }

  const apkUrl = import.meta.env.VITE_ANDROID_APK_URL || 'https://github.com/jhostynelian1009/nexora/releases/latest/download/nexora-android.apk';
  const version = import.meta.env.VITE_ANDROID_VERSION || '1.0.0';
  const apkSize = import.meta.env.VITE_ANDROID_APK_SIZE || '';

  const handleDownloadClick = () => {
    // Log download interaction locally without telemetry
    console.info('[AndroidDownloadCard] Download button clicked', { version, apkUrl });
  };

  return (
    <div
      className="android-download-card glass-panel"
      data-testid="android-download-card"
      style={{
        marginTop: '20px',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: '10px' }}>
        <div style={{
          background: 'rgba(59, 130, 246, 0.15)',
          padding: '10px',
          borderRadius: '10px',
          color: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Smartphone size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2">
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary, #f8fafc)' }}>
              Nexora para Android
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '2px 6px',
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              fontWeight: '600'
            }}>
              v{version}
            </span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Instala Nexora en tu teléfono y accede más rápido a tu comunidad.
          </p>
        </div>
      </div>

      <a
        href={apkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDownloadClick}
        className="btn btn-secondary w-full flex items-center justify-center gap-2"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: '8px',
          textDecoration: 'none',
          padding: '10px',
          fontWeight: '600',
          fontSize: '0.9rem',
          borderRadius: '8px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)'
        }}
      >
        <Download size={18} />
        <span>Descargar APK {apkSize ? `(${apkSize})` : ''}</span>
      </a>

      <div className="flex items-center justify-center gap-1" style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
        <ShieldCheck size={14} style={{ color: '#10b981' }} />
        <span>Instalación segura directa en dispositivos Android 8.0+</span>
      </div>
    </div>
  );
};
