// Ref: RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, B-013
import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Heart, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Composer } from '../components/Composer';
import { PostCard } from '../components/PostCard';

export const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = async () => {
    try {
      setError('');
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el feed de noticias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleCreatePost = async (content, image_url) => {
    const newPost = await api.createPost(content, image_url);
    setPosts([newPost, ...posts]);
  };

  const handleToggleLike = async (postId) => {
    try {
      const res = await api.toggleLike(postId);
      setPosts(
        posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              liked_by_me: res.liked,
              likes_count: res.likes_count
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleAddComment = async (postId, content) => {
    const newComment = await api.addComment(postId, content);
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const updatedComments = p.comments ? [...p.comments, newComment] : [newComment];
          return {
            ...p,
            comments: updatedComments
          };
        }
        return p;
      })
    );
  };

  const handleDeletePost = async (postId) => {
    await api.deletePost(postId);
    setPosts(posts.filter((p) => p.id !== postId));
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  return (
    <div className="feed-layout">
      <div>
        <Composer onPostCreated={handleCreatePost} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Publicaciones Recientes</h2>
          <button onClick={fetchFeed} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
            <RefreshCw size={14} />
            <span>Actualizar</span>
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando el feed de Nexora...
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay publicaciones aún. ¡Sé el primero en compartir algo!
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
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="avatar avatar-lg" style={{ margin: '0 auto 12px' }} />
            ) : (
              <div className="avatar avatar-lg" style={{ margin: '0 auto 12px' }}>{getInitial(user?.name)}</div>
            )}
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{user?.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{user?.career}</p>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
            "{user?.bio}"
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '12px' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <span>Sobre Nexora</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Plataforma social universitaria desacoplada (React + FastAPI + MySQL) diseñada para conectar la comunidad académica.
          </p>
        </div>
      </div>
    </div>
  );
};
