// Ref: RF2-001, RF2-002, B2-002
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, UserPlus, UserCheck, MessageSquare, Loader } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocialUI } from '../context/SocialUIContext';
import { useToast } from '../context/ToastContext';

export const UserSearchModal = ({ isOpen, onClose, onOpenChat }) => {
  const { user: currentUser } = useAuth();
  const { openChatWithUser } = useSocialUI();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});

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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchUsers(query);
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al buscar usuarios:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleToggleFollow = async (targetUser) => {
    setFollowLoading((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      if (targetUser.is_followed_by_me) {
        await api.unfollowUser(targetUser.id);
        setResults((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, is_followed_by_me: false } : u))
        );
        showToast(`Dejaste de seguir a ${targetUser.name}`, 'info');
      } else {
        await api.followUser(targetUser.id);
        setResults((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, is_followed_by_me: true } : u))
        );
        showToast(`Ahora sigues a ${targetUser.name}`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error al actualizar seguimiento', 'error');
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  const handleOpenChat = (user) => {
    onClose();
    if (onOpenChat) {
      onOpenChat(user.id || user);
    } else {
      openChatWithUser(user);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Búsqueda de Estudiantes"
    >
      <div className="modal-content search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Search size={18} className="text-primary" /> Buscar Estudiantes
          </h3>
          <button className="btn-icon text-muted" onClick={onClose} aria-label="Cerrar búsqueda">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o carrera académica..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                className="btn-icon"
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px' }}
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="search-results-container">
            {loading ? (
              <div className="flex items-center justify-between py-4" style={{ justifyContent: 'center' }}>
                <Loader className="spin text-primary mr-2" size={20} />
                <span className="text-muted text-sm">Buscando en Nexora...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="user-results-list">
                {results.map((u) => (
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
                      {u.bio && <p className="user-bio-preview">{u.bio}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {currentUser?.id !== u.id && (
                        <>
                          <button
                            className={`btn btn-sm ${u.is_followed_by_me ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => handleToggleFollow(u)}
                            disabled={followLoading[u.id]}
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
                            title="Enviar mensaje privado"
                            onClick={() => handleOpenChat(u)}
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
            ) : query.trim() ? (
              <p className="text-muted text-center py-4 text-sm">
                No se encontraron estudiantes para &quot;{query}&quot;.
              </p>
            ) : (
              <p className="text-muted text-center py-4 text-sm">
                Escribe un nombre o carrera para iniciar la búsqueda.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
