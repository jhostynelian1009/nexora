// Ref: RF-006, B-006, B-014
import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, Calendar, BookOpen, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PostCard } from '../components/PostCard';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [career, setCareer] = useState(user?.career || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCareer(user.career || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const fetchMyPosts = async () => {
    try {
      const allPosts = await api.getPosts();
      const userPosts = allPosts.filter((p) => p.author && p.author.id === user?.id);
      setMyPosts(userPosts);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        career: career.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim() || null
      });
      updateUser(updated);
      setSuccess('Perfil actualizado correctamente.');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitial = (n) => (n ? n.charAt(0).toUpperCase() : 'U');

  const handleToggleLike = async (postId) => {
    const res = await api.toggleLike(postId);
    setMyPosts(
      myPosts.map((p) => (p.id === postId ? { ...p, liked_by_me: res.liked, likes_count: res.likes_count } : p))
    );
  };

  const handleAddComment = async (postId, content) => {
    const newComment = await api.addComment(postId, content);
    setMyPosts(
      myPosts.map((p) =>
        p.id === postId ? { ...p, comments: p.comments ? [...p.comments, newComment] : [newComment] } : p
      )
    );
  };

  const handleDeletePost = async (postId) => {
    await api.deletePost(postId);
    setMyPosts(myPosts.filter((p) => p.id !== postId));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        {!isEditing ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="avatar avatar-lg" />
                ) : (
                  <div className="avatar avatar-lg">{getInitial(user?.name)}</div>
                )}
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{user?.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                    <BookOpen size={16} />
                    <span>{user?.career}</span>
                  </div>
                </div>
              </div>

              <button onClick={() => setIsEditing(true)} className="btn-secondary">
                <Edit3 size={16} />
                <span>Editar perfil</span>
              </button>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>Biografía</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: '1.6' }}>{user?.bio}</p>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} />
                <span>Miembro de Nexora</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Editar Perfil</h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
                style={{ padding: '6px 12px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="input-group">
              <label className="input-label">Nombre</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Carrera o Especialidad</label>
              <input
                type="text"
                className="input-field"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Biografía</label>
              <textarea
                className="input-field"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label">URL de Avatar (HTTPS)</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://ejemplo.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                <Save size={16} />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px' }}>Mis Publicaciones</h2>
      {loadingPosts ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando mis publicaciones...
        </div>
      ) : myPosts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No has publicado ningún contenido aún.
        </div>
      ) : (
        myPosts.map((post) => (
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
  );
};
