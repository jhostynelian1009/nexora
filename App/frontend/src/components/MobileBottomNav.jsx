import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, Bell, User } from 'lucide-react';
import { useSocialUI } from '../context/SocialUIContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openChat, openUserSearch, toggleNotifications } = useSocialUI();
  const { unreadNotifsCount } = useWebSocket();

  if (!user) return null;

  const isFeed = location.pathname === '/';
  const isProfile = location.pathname === '/profile';

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación inferior móvil">
      <button
        onClick={() => navigate('/')}
        className={`mobile-nav-item ${isFeed ? 'active' : ''}`}
        aria-label="Ir al Feed Principal"
      >
        <Home size={20} />
        <span>Inicio</span>
      </button>

      <button
        onClick={openUserSearch}
        className="mobile-nav-item"
        aria-label="Buscar Estudiantes"
      >
        <Search size={20} />
        <span>Buscar</span>
      </button>

      <button
        onClick={openChat}
        className="mobile-nav-item"
        aria-label="Abrir Mensajes Privados"
      >
        <MessageSquare size={20} />
        <span>Chat</span>
      </button>

      <button
        onClick={toggleNotifications}
        className="mobile-nav-item"
        aria-label="Abrir Notificaciones"
      >
        <Bell size={20} />
        {unreadNotifsCount > 0 && (
          <span className="mobile-nav-badge">
            {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
          </span>
        )}
        <span>Notifs</span>
      </button>

      <button
        onClick={() => navigate('/profile')}
        className={`mobile-nav-item ${isProfile ? 'active' : ''}`}
        aria-label="Ir a Mi Perfil"
      >
        <User size={20} />
        <span>Perfil</span>
      </button>
    </nav>
  );
};
