// Ref: RF-001, RF-002, RNF-001, B-003, B-012
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus, User, Mail, GraduationCap, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [career, setCareer] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !career.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await register(name.trim(), email.trim(), password, career.trim());
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container glass-panel">
      <div className="auth-header">
        <div className="flex items-center justify-between" style={{ justifyContent: 'center', marginBottom: '12px' }}>
          <Sparkles size={40} style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Únete a la plataforma social de estudiantes Nexora</p>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reg-name" className="form-label">Nombre completo</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon-left" />
            <input
              id="reg-name"
              type="text"
              className="form-control"
              placeholder="Ej. Ana Torres"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">Correo electrónico</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon-left" />
            <input
              id="reg-email"
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

        <div className="form-group">
          <label htmlFor="reg-career" className="form-label">Carrera o área de interés</label>
          <div className="input-with-icon">
            <GraduationCap size={18} className="input-icon-left" />
            <input
              id="reg-career"
              type="text"
              className="form-control"
              placeholder="Ej. Ingeniería de Software"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label htmlFor="reg-password" className="form-label">Contraseña (mínimo 6 caracteres)</label>
          <div className="input-with-icon has-right-icon">
            <Lock size={18} className="input-icon-left" />
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
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

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          <UserPlus size={18} />
          <span>{isSubmitting ? 'Creando cuenta...' : 'Registrarse'}</span>
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
          Inicia sesión aquí
        </Link>
      </div>
    </div>
  );
};
