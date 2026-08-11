// Ref: RF-003, RNF-001, B-004, B-012
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogIn, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Verifica tus datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword = 'nexora123') => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="auth-container glass-panel">
      <div className="auth-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <Sparkles size={40} style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="auth-title">Iniciar sesión</h1>
        <p className="auth-subtitle">Conéctate a la comunidad académica Nexora</p>
      </div>

      <div className="demo-account-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', marginBottom: '4px' }}>
          <UserCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span>Cuentas demostrativas (password: nexora123)</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          <button type="button" className="demo-btn" onClick={() => handleDemoFill('ana.torres@nexora.edu')}>
            Ana (Software)
          </button>
          <button type="button" className="demo-btn" onClick={() => handleDemoFill('carlos.mendoza@nexora.edu')}>
            Carlos (Web)
          </button>
          <button type="button" className="demo-btn" onClick={() => handleDemoFill('elena.rojas@nexora.edu')}>
            Elena (Datos)
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Correo electrónico</label>
          <input
            type="email"
            className="input-field"
            placeholder="tu@correo.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group" style={{ marginBottom: '24px' }}>
          <label className="input-label">Contraseña</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
          <LogIn size={18} />
          <span>{isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}</span>
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        ¿No tienes una cuenta?{' '}
        <Link to="/register" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
};
