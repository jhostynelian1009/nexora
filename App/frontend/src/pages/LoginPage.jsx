// Ref: RF-003, RNF-001, B-004, B-012, RF2-013, RF2-014, B2-007
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogIn, UserCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PasswordResetModal } from '../components/PasswordResetModal';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

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
    setError('');
  };

  return (
    <>
      <div className="auth-container glass-panel">
        <div className="auth-header">
          <div className="flex items-center justify-between" style={{ justifyContent: 'center', marginBottom: '12px' }}>
            <Sparkles size={40} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="auth-title">Iniciar sesión</h1>
          <p className="auth-subtitle">Conéctate a la comunidad académica Nexora Social v2</p>
        </div>

        <div className="demo-account-box">
          <div className="flex items-center gap-2" style={{ fontWeight: '600', marginBottom: '4px' }}>
            <UserCheck size={16} className="text-info" />
            <span>Cuentas demostrativas (contraseña: nexora123)</span>
          </div>
          <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
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

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Correo electrónico
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon-left" />
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="tu@correo.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="login-password" className="form-label" style={{ marginBottom: 0 }}>
                Contraseña
              </label>
              <button
                type="button"
                className="btn-link text-xs text-primary"
                onClick={() => setIsResetOpen(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="input-with-icon has-right-icon">
              <Lock size={18} className="input-icon-left" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '12px' }}
            disabled={isSubmitting}
          >
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

      <PasswordResetModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />
    </>
  );
};
