// Ref: RF-001, RF-002, RNF-001, B-003, B-012
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <Sparkles size={40} style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Únete a la plataforma social de estudiantes Nexora</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Nombre completo</label>
          <input
            type="text"
            className="input-field"
            placeholder="Ej. Ana Torres"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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

        <div className="input-group">
          <label className="input-label">Carrera o área de interés</label>
          <input
            type="text"
            className="input-field"
            placeholder="Ej. Ingeniería de Software"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            required
          />
        </div>

        <div className="input-group" style={{ marginBottom: '24px' }}>
          <label className="input-label">Contraseña (mínimo 6 caracteres)</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
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
