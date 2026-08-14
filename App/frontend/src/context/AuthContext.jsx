// Ref: RF-003, RF-004, RF-005, B-004, B-005, B-011, AND-RF-002, AND-RF-005
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { useServerAvailabilitySafe } from './ServerAvailabilityContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const serverAvail = useServerAvailabilitySafe();
  const isOnline = serverAvail ? serverAvail.isOnline : true;

  const [user, setUser] = useState(() => {
    const saved = storage.getItemSync('nexora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => storage.getItemSync('nexora_token'));
  const [loading, setLoading] = useState(true);
  const isValidatingRef = useRef(false);

  // Initialize storage cache and set loading false quickly
  useEffect(() => {
    const initAuth = async () => {
      await storage.initCache();
      const currentToken = await storage.getItem('nexora_token');
      const currentUser = await storage.getItem('nexora_user');
      if (currentToken) {
        setToken(currentToken);
      }
      if (currentUser) {
        try {
          setUser(JSON.parse(currentUser));
        } catch {
          // Keep current user state
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Validate session when server becomes online and token exists
  useEffect(() => {
    const validateSession = async () => {
      if (!token || !isOnline || isValidatingRef.current) return;

      isValidatingRef.current = true;
      try {
        const userData = await api.getMe();
        setUser(userData);
        await storage.setItem('nexora_user', JSON.stringify(userData));
      } catch (err) {
        console.warn('[AuthContext] Session validation attempt:', err?.message);
        if (err && err.status === 401) {
          // Clear session ONLY on real 401 Unauthorized response
          setUser(null);
          setToken(null);
          await storage.removeItem('nexora_token');
          await storage.removeItem('nexora_user');
        }
        // Do NOT clear token/session on network error, timeout, or server unavailable
      } finally {
        isValidatingRef.current = false;
      }
    };

    validateSession();
  }, [token, isOnline]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    await storage.setItem('nexora_token', data.access_token);
    await storage.setItem('nexora_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (name, email, password, career) => {
    const data = await api.register(name, email, password, career);
    setToken(data.access_token);
    setUser(data.user);
    await storage.setItem('nexora_token', data.access_token);
    await storage.setItem('nexora_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.removeItem('nexora_token');
    await storage.removeItem('nexora_user');
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await storage.setItem('nexora_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
