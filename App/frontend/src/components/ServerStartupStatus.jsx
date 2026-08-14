// Ref: RNF-008, RNF2-004, AND-RF-002, AND-RF-005
import React from 'react';
import { Loader2, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useServerAvailabilitySafe } from '../context/ServerAvailabilityContext';

export const ServerStartupStatus = () => {
  const serverAvail = useServerAvailabilitySafe();
  if (!serverAvail) return null;

  const { serverStatus, errorMessage, retryConnection, isChecking } = serverAvail;


  if (serverStatus === 'online' || serverStatus === 'idle') {
    return null;
  }

  return (
    <div className="server-status-banner" role="alert" style={{ marginBottom: '16px' }}>
      {serverStatus === 'waking' && (
        <div className="alert alert-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Loader2 className="animate-spin text-primary" size={20} />
            <span>Iniciando Servidor Nexora...</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Estamos iniciando el servidor gratuito de Nexora. Esto puede tardar hasta un minuto.
          </p>
          <div style={{ marginTop: '4px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={retryConnection}
              disabled={isChecking}
              style={{ padding: '4px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
              <span>{isChecking ? 'Verificando...' : 'Reintentar conexión'}</span>
            </button>
          </div>
        </div>
      )}

      {serverStatus === 'checking' && (
        <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Loader2 className="animate-spin text-primary" size={18} />
          <span style={{ fontSize: '0.875rem' }}>Verificando disponibilidad del servidor Nexora...</span>
        </div>
      )}

      {serverStatus === 'offline' && (
        <div className="alert alert-warning" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <WifiOff size={20} className="text-warning" />
            <span>Sin Conexión a Internet</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Tu dispositivo no tiene conexión a Internet. Por favor verifica tu red.
          </p>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={retryConnection}
              style={{ padding: '4px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={14} />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      )}

      {serverStatus === 'error' && (
        <div className="alert alert-error" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <AlertTriangle size={20} />
            <span>Fallo de conexión con el servidor</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            {errorMessage || 'No se pudo conectar con el servidor Nexora.'}
          </p>
          <div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={retryConnection}
              style={{ padding: '4px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={14} />
              <span>Reintentar conexión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
