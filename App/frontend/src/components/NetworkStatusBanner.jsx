// Ref: AND-RF-005, AND-B-006
import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { setupNetworkListener, checkNetworkStatus } from '../utils/network';

export const NetworkStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    checkNetworkStatus().then(status => setIsOnline(status));
    const cleanup = setupNetworkListener((onlineStatus) => {
      setIsOnline(onlineStatus);
    });
    return () => cleanup();
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="network-status-banner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#ef4444',
        color: '#ffffff',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)'
      }}
    >
      <WifiOff size={18} />
      <span>Sin conexión a Internet. Nexora reintentará al recuperar red.</span>
    </div>
  );
};
