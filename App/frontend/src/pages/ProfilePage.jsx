// Ref: RF-006, B-006, B-014, RF2-001, RF2-004, RF2-007, B2-001..B2-003
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Edit3, Save, X, Calendar, BookOpen, Mail, Phone, UploadCloud, Loader, UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocialUI } from '../context/SocialUIContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { PostCard } from '../components/PostCard';
import { UserListModal } from '../components/UserListModal';

export const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const { openChatWithUser } = useSocialUI();
  const { showToast } = useToast();

  const isSelf = !userId || Number(userId) === currentUser?.id;
  const targetId = isSelf ? currentUser?.id : Number(userId);

  const [profile, setProfile] = useState(isSelf ? currentUser : null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [career, setCareer] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Avatar upload staging (Task 27)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);

  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(!isSelf);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals for followers / following
  const [listModalType, setListModalType] = useState(null); // 'followers' | 'following' | null
  const [listUsers, setListUsers] = useState([]);

  const avatarInputRef = useRef(null);

  const fetchProfileData = async () => {
    if (!targetId) return;
    setLoadingProfile(true);
    setError('');
    try {
      if (isSelf) {
        const myData = await api.getMe();
        setProfile(myData);
        updateUser(myData);
      } else {
        const publicData = await api.getPublicProfile(targetId);
        setProfile(publicData);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar perfil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!targetId) return;
    setLoadingPosts(true);
    try {
      const userPosts = await api.getUserPosts(targetId);
      setPosts(Array.isArray(userPosts) ? userPosts : []);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchUserPosts();
  }, [targetId, isSelf]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCareer(profile.career || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Clean up Object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatarUrl);
      }
    };
  }, [previewAvatarUrl]);

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      showToast('Solo se permiten imágenes JPEG, PNG o WebP.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen no debe superar los 5MB.', 'error');
      return;
    }

    if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatarUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedAvatarFile(file);
    setPreviewAvatarUrl(objectUrl);
  };

  const handleConfirmAvatarUpload = async () => {
    if (!selectedAvatarFile) return;

    setIsUploadingAvatar(true);
    try {
      const res = await api.uploadAvatar(selectedAvatarFile);
      setAvatarUrl(res.secure_url);
      setProfile((prev) => ({ ...prev, avatar_url: res.secure_url }));
      if (isSelf) {
        updateUser({ ...currentUser, avatar_url: res.secure_url });
      }
      showToast('Avatar actualizado en Cloudinary.', 'success');
      setSelectedAvatarFile(null);
      setPreviewAvatarUrl(null);
    } catch (err) {
      showToast(err.message || 'Error al subir la foto de perfil.', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCancelAvatarSelection = () => {
    if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatarUrl);
    }
    setSelectedAvatarFile(null);
    setPreviewAvatarUrl(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        career: career.trim(),
        bio: bio.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarUrl.trim() || null
      });
      setProfile(updated);
      updateUser(updated);
      showToast('Perfil actualizado correctamente.', 'success');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el perfil.');
      showToast(err.message || 'No se pudo actualizar el perfil.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.is_followed_by_me) {
        await api.unfollowUser(profile.id);
        setProfile((prev) => ({
          ...prev,
          is_followed_by_me: false,
          followers_count: Math.max(0, (prev.followers_count || 1) - 1)
        }));
        showToast(`Dejaste de seguir a ${profile.name}`, 'info');
      } else {
        await api.followUser(profile.id);
        setProfile((prev) => ({
          ...prev,
          is_followed_by_me: true,
          followers_count: (prev.followers_count || 0) + 1
        }));
        showToast(`Ahora sigues a ${profile.name}`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error al actualizar seguimiento.', 'error');
    }
  };

  const openFollowersModal = async () => {
    try {
      const data = await api.getUserFollowers(targetId);
      setListUsers(Array.isArray(data) ? data : []);
      setListModalType('followers');
    } catch (err) {
      console.error('Error al cargar seguidores:', err);
    }
  };

  const openFollowingModal = async () => {
    try {
      const data = await api.getUserFollowing(targetId);
      setListUsers(Array.isArray(data) ? data : []);
      setListModalType('following');
    } catch (err) {
      console.error('Error al cargar siguiendo:', err);
    }
  };

  const getInitial = (n) => (n ? n.charAt(0).toUpperCase() : 'U');

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

  if (loadingProfile) {
    return (
      <div className="glass-panel text-center py-5">
        <Loader className="spin text-primary mx-auto mb-2" size={32} />
        <p className="text-muted text-sm">Cargando perfil de estudiante...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
        {error && <div className="alert alert-error mb-4" role="alert">{error}</div>}

        {!isEditing ? (
          <div>
            <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div className="flex items-center gap-4">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="avatar avatar-lg" />
                ) : (
                  <div className="avatar avatar-lg">{getInitial(profile?.name)}</div>
                )}
                <div>
                  <h1 className="auth-title" style={{ fontSize: '1.6rem', textAlign: 'left', margin: 0 }}>
                    {profile?.name}
                  </h1>
                  <div className="flex items-center gap-2 text-info mt-1 text-sm font-bold">
                    <BookOpen size={16} />
                    <span>{profile?.career}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isSelf ? (
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                    <Edit3 size={16} />
                    <span>Editar perfil</span>
                  </button>
                ) : (
                  <>
                    <button
                      className={`btn ${profile?.is_followed_by_me ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={handleToggleFollow}
                    >
                      {profile?.is_followed_by_me ? (
                        <>
                          <UserCheck size={16} /> <span>Siguiendo</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} /> <span>Seguir</span>
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary btn-icon"
                      title="Enviar mensaje privado"
                      onClick={() => openChatWithUser(profile)}
                      aria-label={`Enviar mensaje a ${profile?.name}`}
                    >
                      <MessageSquare size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Counters Row */}
            <div className="flex gap-6 my-4 py-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="text-center">
                <span className="font-bold text-lg" style={{ display: 'block' }}>{profile?.posts_count ?? posts.length}</span>
                <span className="text-muted text-xs">Publicaciones</span>
              </div>
              <button className="text-center btn-link" style={{ textDecoration: 'none' }} onClick={openFollowersModal}>
                <span className="font-bold text-lg text-main" style={{ display: 'block' }}>{profile?.followers_count ?? 0}</span>
                <span className="text-muted text-xs">Seguidores</span>
              </button>
              <button className="text-center btn-link" style={{ textDecoration: 'none' }} onClick={openFollowingModal}>
                <span className="font-bold text-lg text-main" style={{ display: 'block' }}>{profile?.following_count ?? 0}</span>
                <span className="text-muted text-xs">Siguiendo</span>
              </button>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h3 className="form-label mb-1">Biografía</h3>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {profile?.bio || 'Sin biografía especificada.'}
              </p>
            </div>

            <div className="flex gap-4 mt-4 text-xs text-muted" style={{ flexWrap: 'wrap' }}>
              {isSelf && profile?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{profile.email}</span>
                </div>
              )}
              {isSelf && profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Miembro de Nexora</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Editar Perfil</h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-icon text-muted"
                aria-label="Cancelar edición"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cloudinary Avatar Upload Row (Task 27) */}
            <div className="flex items-center gap-4 mb-4 p-3 glass-panel" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
              <img
                src={previewAvatarUrl || avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Avatar previo"
                className="avatar avatar-md"
              />

              <input
                type="file"
                ref={avatarInputRef}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarFileSelect}
              />

              <div className="flex-1">
                {selectedAvatarFile ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={handleConfirmAvatarUpload}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? <Loader className="spin" size={14} /> : <UploadCloud size={14} />}
                      <span>{isUploadingAvatar ? 'Subiendo...' : 'Actualizar foto'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={handleCancelAvatarSelection}
                      disabled={isUploadingAvatar}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <UploadCloud size={14} />
                    <span>Seleccionar nueva foto</span>
                  </button>
                )}
                <span className="field-help" style={{ display: 'block', marginTop: '4px' }}>
                  JPEG, PNG o WebP. Máx. 5MB.
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="edit-name" className="form-label">Nombre</label>
              <input
                id="edit-name"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-career" className="form-label">Carrera o Especialidad</label>
              <input
                id="edit-career"
                type="text"
                className="form-control"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                required
              />
            </div>

            {/* Phone Number Field (Task 26) */}
            <div className="form-group">
              <label htmlFor="edit-phone" className="form-label">
                Número de teléfono (WhatsApp para recuperación)
              </label>
              <input
                id="edit-phone"
                type="tel"
                className="form-control"
                placeholder="+593987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <span className="field-help">Formato E.164 (ej. +593987654321). No es público.</span>
            </div>

            <div className="form-group">
              <label htmlFor="edit-bio" className="form-label">Biografía</label>
              <textarea
                id="edit-bio"
                className="form-control"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center mt-4" style={{ justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <Save size={16} />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <h2 className="modal-title mb-4" style={{ fontSize: '1.2rem' }}>
        {isSelf ? 'Mis Publicaciones' : `Publicaciones de ${profile?.name}`}
      </h2>

      {loadingPosts ? (
        <div className="glass-panel text-center py-5 text-muted text-sm">
          Cargando publicaciones...
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel text-center py-5 text-muted text-sm">
          No hay publicaciones aún.
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

      {/* Followers / Following List Modal */}
      <UserListModal
        isOpen={Boolean(listModalType)}
        title={listModalType === 'followers' ? 'Seguidores' : 'Siguiendo'}
        users={listUsers}
        onClose={() => setListModalType(null)}
        onToggleFollow={async (u) => {
          try {
            if (u.is_followed_by_me) {
              await api.unfollowUser(u.id);
              setListUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_followed_by_me: false } : x)));
            } else {
              await api.followUser(u.id);
              setListUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_followed_by_me: true } : x)));
            }
          } catch (err) {
            showToast('Error al actualizar seguimiento', 'error');
          }
        }}
      />
    </div>
  );
};
