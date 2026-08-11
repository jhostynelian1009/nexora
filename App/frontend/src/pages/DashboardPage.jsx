// Ref: RF-015, RF-016, B-015
import React, { useState, useEffect } from 'react';
import { Users, FileText, Heart, MessageSquare, Award, UserCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setError('');
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las métricas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Dashboard de Métricas</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Resumen global de interacción y actividad personal en Nexora
          </p>
        </div>

        <button onClick={fetchStats} className="btn-secondary" style={{ padding: '8px 14px' }}>
          <RefreshCw size={16} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando métricas del sistema...
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: 'var(--accent-cyan)' }}>
            Métricas Globales de la Plataforma
          </h2>
          <div className="stats-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-number">{stats?.users || 0}</div>
                <div className="stat-label">Usuarios Registrados</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
                <FileText size={24} />
              </div>
              <div>
                <div className="stat-number">{stats?.posts || 0}</div>
                <div className="stat-label">Publicaciones Creadas</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#F472B6' }}>
                <Heart size={24} />
              </div>
              <div>
                <div className="stat-number">{stats?.likes || 0}</div>
                <div className="stat-label">Interacciones Me Gusta</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <div className="stat-number">{stats?.comments || 0}</div>
                <div className="stat-label">Comentarios Registrados</div>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: 'var(--accent-purple)' }}>
            Mi Actividad ({user?.name?.split(' ')[0]})
          </h2>
          <div className="stats-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <div className="stat-number">{stats?.my_posts || 0}</div>
                <div className="stat-label">Mis Publicaciones</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
                <Award size={24} />
              </div>
              <div>
                <div className="stat-number">{stats?.my_likes_received || 0}</div>
                <div className="stat-label">Me Gusta Recibidos</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
