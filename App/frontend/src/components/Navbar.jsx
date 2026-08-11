// Ref: RF-018, B-011
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, BarChart2, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="brand-logo">
          <Sparkles size={24} style={{ color: 'var(--primary)' }} />
          <span>Nexora</span>
        </NavLink>

        {user && (
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Home size={18} />
              <span>Feed</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <User size={18} />
              <span>Perfil</span>
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart2 size={18} />
              <span>Dashboard</span>
            </NavLink>

            <div className="user-badge">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="avatar avatar-sm" />
              ) : (
                <div className="avatar avatar-sm">{getInitial(user.name)}</div>
              )}
              <button onClick={handleLogout} className="action-btn" title="Cerrar sesión">
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
