// Ref: RNF-008, RNF2-004, AND-RF-002, AND-RF-005
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { checkNetworkStatus, setupNetworkListener } from '../utils/network';

const ServerAvailabilityContext = createContext(null);

export const ServerAvailabilityProvider = ({ children }) => {
  const [serverStatus, setServerStatus] = useState('idle'); // 'idle' | 'checking' | 'waking' | 'online' | 'offline' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  const isCheckingRef = useRef(false);
  const wakingTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const autoRetryTimerRef = useRef(null);

  const clearTimers = () => {
    if (wakingTimeoutRef.current) {
      clearTimeout(wakingTimeoutRef.current);
      wakingTimeoutRef.current = null;
    }
    if (autoRetryTimerRef.current) {
      clearTimeout(autoRetryTimerRef.current);
      autoRetryTimerRef.current = null;
    }
  };

  const checkServerAvailability = useCallback(async (isManual = false) => {
    clearTimers();

    const isConnected = await checkNetworkStatus();
    if (!isConnected) {
      if (mountedRef.current) {
        setServerStatus('offline');
        setErrorMessage('Dispositivo sin conexión a Internet.');
      }
      isCheckingRef.current = false;
      return false;
    }

    if (isCheckingRef.current && !isManual) {
      return false;
    }

    if (isManual) {
      retryCountRef.current = 0;
    }

    isCheckingRef.current = true;
    if (mountedRef.current) {
      setServerStatus('checking');
      setErrorMessage(null);
    }

    // Set transition to 'waking' if request takes longer than 3 seconds
    wakingTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && isCheckingRef.current) {
        setServerStatus('waking');
      }
    }, 3000);

    try {
      const res = await api.health();
      clearTimers();
      isCheckingRef.current = false;

      if (res && res.status === 'ok') {
        if (mountedRef.current) {
          setServerStatus('online');
          setErrorMessage(null);
        }
        retryCountRef.current = 0;
        return true;
      } else {
        throw new Error('Servidor no disponible');
      }
    } catch (err) {
      clearTimers();
      isCheckingRef.current = false;

      const currentConnected = await checkNetworkStatus();
      if (!currentConnected) {
        if (mountedRef.current) {
          setServerStatus('offline');
          setErrorMessage('Dispositivo sin conexión a Internet.');
        }
        return false;
      }

      if (mountedRef.current) {
        setServerStatus('error');
        setErrorMessage(err.message || 'No se pudo conectar con el servidor Nexora.');
      }

      // Limited automatic retries (up to 2 attempts with 5s delay)
      if (!isManual && retryCountRef.current < 2) {
        retryCountRef.current += 1;
        autoRetryTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            checkServerAvailability(false);
          }
        }, 5000);
      }

      return false;
    }
  }, []);

  const retryConnection = useCallback(() => {
    return checkServerAvailability(true);
  }, [checkServerAvailability]);

  useEffect(() => {
    mountedRef.current = true;
    checkServerAvailability(false);

    const cleanupNetwork = setupNetworkListener(async (connected) => {
      if (!connected) {
        if (mountedRef.current) {
          setServerStatus('offline');
          setErrorMessage('Dispositivo sin conexión a Internet.');
        }
      } else {
        if (mountedRef.current) {
          checkServerAvailability(true);
        }
      }
    });

    return () => {
      mountedRef.current = false;
      clearTimers();
      cleanupNetwork();
    };
  }, [checkServerAvailability]);

  const contextValue = {
    serverStatus,
    errorMessage,
    isOnline: serverStatus === 'online',
    isWaking: serverStatus === 'waking',
    isChecking: serverStatus === 'checking' || serverStatus === 'waking',
    isOffline: serverStatus === 'offline',
    isError: serverStatus === 'error',
    checkServerAvailability,
    retryConnection
  };

  return (
    <ServerAvailabilityContext.Provider value={contextValue}>
      {children}
    </ServerAvailabilityContext.Provider>
  );
};

export const useServerAvailability = () => {
  const ctx = useContext(ServerAvailabilityContext);
  if (!ctx) {
    throw new Error('useServerAvailability debe ser usado dentro de un ServerAvailabilityProvider');
  }
  return ctx;
};

export const useServerAvailabilitySafe = () => {
  return useContext(ServerAvailabilityContext);
};
