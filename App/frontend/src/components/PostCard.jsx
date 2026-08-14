// Ref: RF-009, RF-010, RF-011, RF-012, B-008, B-009, B-013
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Trash2, Maximize2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CommentList } from './CommentList';

export const PostCard = ({ post, onToggleLike, onAddComment, onDeletePost }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const isOwner = user && post.author && user.id === post.author.id;

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      setIsDeleting(true);
      try {
        await onDeletePost(post.id);
      } catch (err) {
        alert(err.message || 'No se pudo eliminar la publicación.');
        setIsDeleting(false);
      }
    }
  };

  const handleAuthorClick = () => {
    if (post.author?.id) {
      navigate(`/profile/${post.author.id}`);
    }
  };

  return (
    <div className="glass-panel post-card">
      <div className="post-header">
        <div className="post-author-info">
          {post.author?.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={post.author.name}
              className="avatar"
              style={{ cursor: 'pointer' }}
              onClick={handleAuthorClick}
            />
          ) : (
            <div className="avatar" style={{ cursor: 'pointer' }} onClick={handleAuthorClick}>
              {getInitial(post.author?.name)}
            </div>
          )}
          <div>
            <div className="author-name" style={{ cursor: 'pointer' }} onClick={handleAuthorClick}>
              {post.author?.name}
            </div>
            <div className="author-career">{post.author?.career}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="post-time">{formatDate(post.created_at)}</span>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn btn-sm btn-danger btn-icon"
              title="Eliminar publicación"
              aria-label="Eliminar publicación"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="post-content">{post.content}</div>

      {post.image_url && (
        <div className="relative group mb-4">
          <img
            src={post.image_url}
            alt={`Publicación de ${post.author?.name || 'estudiante'}`}
            className="post-image"
            style={{ cursor: 'pointer' }}
            onClick={() => setIsImageModalOpen(true)}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Image Lightbox Modal */}
      {isImageModalOpen && (
        <div
          className="modal-backdrop fade-in"
          onClick={() => setIsImageModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-icon btn-danger absolute top-2 right-2"
              onClick={() => setIsImageModalOpen(false)}
              aria-label="Cerrar imagen"
            >
              <X size={20} />
            </button>
            <img
              src={post.image_url}
              alt={`Publicación ampliada de ${post.author?.name}`}
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px' }}
            />
          </div>
        </div>
      )}

      <div className="post-actions">
        <button
          onClick={() => onToggleLike(post.id)}
          className={`action-btn ${post.liked_by_me ? 'liked' : ''}`}
        >
          <Heart size={18} fill={post.liked_by_me ? 'var(--accent-pink)' : 'none'} />
          <span>{post.likes_count} {post.likes_count === 1 ? 'Me gusta' : 'Me gusta'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="action-btn"
        >
          <MessageSquare size={18} />
          <span>{post.comments ? post.comments.length : 0} Comentarios</span>
        </button>
      </div>

      {showComments && (
        <CommentList
          comments={post.comments || []}
          onAddComment={(content) => onAddComment(post.id, content)}
        />
      )}
    </div>
  );
};
