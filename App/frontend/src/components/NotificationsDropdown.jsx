// Ref: RF2-012, B2-006
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Heart, MessageSquare, UserPlus, Sparkles, X, Loader } from 'lucide-react';
import { api } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';
import { useSocialUI } from '../context/SocialUIContext';

export const NotificationsDropdown = ({ isOpen, onClose, onOpenChat }) => {
  const { latestNotification, setUnreadNotifsCount } = useWebSocket();
  const { openChatWithUser } = useSocialUI();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Deduplicate incoming WebSocket notifications (Task 23)
  useEffect(() => {
    if (latestNotification) {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === latestNotification.id)) return prev;
        return [latestNotification, ...prev];
      });
    }
  }, [latestNotification]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadNotifsCount(0);
    } catch (err) {
      console.error('Error al marcar notificaciones como leídas:', err);
    }
  };

  const handleItemClick = async (n) => {
    if (!n.is_read) {
      try {
        await api.markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
        );
        setUnreadNotifsCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marcando notificación:', err);
      }
    }

    onClose();

    if (n.notification_type === 'message' && n.actor?.id) {
      if (onOpenChat) {
        onOpenChat(n.actor.id);
      } else {
        openChatWithUser(n.actor);
      }
    } else if (n.actor?.id) {
      navigate(`/profile/${n.actor.id}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={16} className="text-primary" />;
      case 'like':
        return <Heart size={16} className="text-danger fill-danger" />;
      case 'comment':
        return <MessageSquare size={16} className="text-warning" />;
      default:
        return <Sparkles size={16} className="text-info" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-dropdown-menu fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="notif-header">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <h4 className="modal-title" style={{ fontSize: '0.95rem' }}>Notificaciones</h4>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-link text-xs" onClick={handleMarkAllRead}>
            <CheckCheck size={14} className="mr-1" /> Marcar leídas
          </button>
          <button className="btn-icon text-muted" onClick={onClose} aria-label="Cerrar notificaciones">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="notif-body">
        {loading ? (
          <div className="flex items-center justify-between py-4" style={{ justifyContent: 'center' }}>
            <Loader className="spin text-primary mr-2" size={18} />
            <span className="text-muted text-xs">Cargando...</span>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-muted py-4 text-xs">No tienes notificaciones recientes.</p>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                onClick={() => handleItemClick(n)}
                role="button"
                tabIndex={0}
              >
                <img
                  src={
                    n.actor?.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={n.actor?.name || 'Usuario'}
                  className="avatar avatar-sm"
                />
                <div className="notif-content flex-1">
                  <p className="notif-text">
                    <strong>{n.actor?.name}</strong>{' '}
                    {n.payload?.message || 'interactuó en tu cuenta.'}
                  </p>
                  <span className="notif-time">
                    {new Date(n.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="notif-icon-badge">{getNotificationIcon(n.notification_type)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
