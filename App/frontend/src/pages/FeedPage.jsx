// Ref: RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, B-013, RF2-006, B2-002
import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, Users, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Composer } from '../components/Composer';
import { PostCard } from '../components/PostCard';

export const FeedPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [scope, setScope] = useState('all'); // 'all' or 'following'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = useCallback(async (currentScope = scope) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPosts(currentScope);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el feed de noticias.');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchFeed(scope);
  }, [scope, fetchFeed]);

  const handleCreatePost = async (contentOrPost, image_url, image_public_id = null) => {
    if (typeof contentOrPost === 'object' && contentOrPost !== null) {
      // Direct post object returned from createPostWithImage
      setPosts((prev) => [contentOrPost, ...prev]);
      return;
    }

    const newPost = await api.createPost(contentOrPost, image_url, image_public_id);
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleToggleLike = async (postId) => {
    try {
      const res = await api.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, liked_by_me: res.liked, likes_count: res.likes_count } : p))
      );
    } catch (err) {
      showToast('Error al dar me gusta', 'error');
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const newComment = await api.addComment(postId, content);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: p.comments ? [...p.comments, newComment] : [newComment] } : p
        )
      );
    } catch (err) {
      showToast('Error al publicar comentario', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('Publicación eliminada', 'info');
    } catch (err) {
      showToast('Error al eliminar publicación', 'error');
    }
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  return (
    <div className="feed-layout">
      <div>
        <Composer onPostCreated={handleCreatePost} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${scope === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setScope('all')}
            >
              <Globe size={14} />
              <span>Todas</span>
            </button>
            <button
              className={`btn btn-sm ${scope === 'following' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setScope('following')}
            >
              <Users size={14} />
              <span>Siguiendo</span>
            </button>
          </div>

          <button onClick={() => fetchFeed(scope)} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} />
            <span>Actualizar</span>
          </button>
        </div>

        {error && <div className="alert alert-error mb-4" role="alert">{error}</div>}

        {loading ? (
          <div className="glass-panel text-center py-5 text-muted text-sm">
            Cargando publicaciones de Nexora...
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-panel text-center py-5 text-muted text-sm">
            {scope === 'following'
              ? 'No hay publicaciones de personas que sigues. ¡Busca compañeros y empieza a seguirlos!'
              : 'No hay publicaciones aún. ¡Sé el primero en compartir algo!'}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onDeletePost={handleDeletePost}
            />
          ))
        )}
      </div>

      <div className="sidebar-widget">
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
          <div className="text-center mb-4">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="avatar avatar-lg" style={{ margin: '0 auto 12px' }} />
            ) : (
              <div className="avatar avatar-lg" style={{ margin: '0 auto 12px' }}>{getInitial(user?.name)}</div>
            )}
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{user?.name}</h3>
            <p className="text-info text-xs font-bold">{user?.career}</p>
          </div>
          <p className="text-muted text-xs text-center" style={{ fontStyle: 'italic' }}>
            &quot;{user?.bio || 'Sin biografía'}&quot;
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center gap-2 font-bold mb-2">
            <Sparkles size={18} className="text-primary" />
            <span>Sobre Nexora Social v2</span>
          </div>
          <p className="text-secondary text-xs" style={{ lineHeight: '1.5' }}>
            Plataforma social académica con perfiles públicos, sistema de seguidores, mensajería en vivo por WebSockets, notificaciones en tiempo real y almacenamiento real en Cloudinary.
          </p>
        </div>
      </div>
    </div>
  );
};
