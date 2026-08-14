// Ref: RF-018, B-011, B2-002, B2-005, B2-006
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, BarChart2, LogOut, Sparkles, Search, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useSocialUI } from '../context/SocialUIContext';
import { UserSearchModal } from './UserSearchModal';
import { ChatDrawer } from './ChatDrawer';
import { NotificationsDropdown } from './NotificationsDropdown';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadNotifsCount } = useWebSocket();
  const navigate = useNavigate();
  const {
    isChatOpen,
    activeChatUser,
    isSearchOpen,
    isNotificationsOpen,
    openChat,
    openUserSearch,
    closeUserSearch,
    closeChat,
    toggleNotifications,
    closeNotifications
  } = useSocialUI();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <NavLink to="/" className="brand-logo">
            <Sparkles size={24} style={{ color: 'var(--primary)' }} />
            <span>Nexora</span>
          </NavLink>

          {user && (
            <div className="nav-links">
              <button
                className="nav-link search-nav-btn"
                onClick={openUserSearch}
                title="Buscar compañeros"
              >
                <Search size={18} />
                <span>Buscar</span>
              </button>

              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Home size={18} />
                <span>Feed</span>
              </NavLink>

              <button
                className="nav-link chat-nav-btn relative"
                onClick={openChat}
                title="Mensajes Privados"
              >
                <MessageSquare size={18} />
                <span>Chat</span>
              </button>

              <div className="relative">
                <button
                  className="nav-link notif-nav-btn relative"
                  onClick={toggleNotifications}
                  title="Notificaciones"
                >
                  <Bell size={18} />
                  <span>Notificaciones</span>
                  {unreadNotifsCount > 0 && (
                    <span className="notif-badge">
                      {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
                    </span>
                  )}
                </button>

                <NotificationsDropdown
                  isOpen={isNotificationsOpen}
                  onClose={closeNotifications}
                />
              </div>

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

      {/* Global Modals & Drawers */}
      <UserSearchModal
        isOpen={isSearchOpen}
        onClose={closeUserSearch}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={closeChat}
        targetUserId={activeChatUser?.id || activeChatUser}
      />
    </>
  );
};
