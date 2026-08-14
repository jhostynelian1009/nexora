// Ref: RF2-004, B2-002
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserCheck, UserPlus, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocialUI } from '../context/SocialUIContext';

export const UserListModal = ({ isOpen, title, users = [], onClose, onToggleFollow, onOpenChat }) => {
  const { user: currentUser } = useAuth();
  const { openChatWithUser } = useSocialUI();
  const navigate = useNavigate();

  // Body scroll lock & Escape key listener (Task 13)
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  const handleChatClick = (u) => {
    onClose();
    if (onOpenChat) {
      onOpenChat(u.id || u);
    } else {
      openChatWithUser(u);
    }
  };

  return (
    <div
      className="modal-backdrop fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Lista de usuarios'}
    >
      <div className="modal-content user-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn-icon text-muted" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {users.length === 0 ? (
            <p className="text-muted text-center py-4 text-sm">No hay usuarios para mostrar.</p>
          ) : (
            <div className="user-results-list">
              {users.map((u) => (
                <div key={u.id} className="user-result-card">
                  <img
                    src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={u.name}
                    className="user-avatar-md"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleUserClick(u.id)}
                  />
                  <div className="user-info-col" style={{ cursor: 'pointer' }} onClick={() => handleUserClick(u.id)}>
                    <span className="user-name">{u.name}</span>
                    <span className="user-career">{u.career}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUser?.id !== u.id && (
                      <>
                        <button
                          className={`btn btn-sm ${u.is_followed_by_me ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => onToggleFollow && onToggleFollow(u)}
                        >
                          {u.is_followed_by_me ? (
                            <>
                              <UserCheck size={14} /> <span>Siguiendo</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={14} /> <span>Seguir</span>
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-ghost btn-icon"
                          title="Enviar mensaje"
                          onClick={() => handleChatClick(u)}
                          aria-label={`Enviar mensaje a ${u.name}`}
                        >
                          <MessageSquare size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
