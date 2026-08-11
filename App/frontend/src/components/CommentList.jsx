// Ref: RF-013, RF-014, B-010, B-013
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CommentList = ({ comments, onAddComment }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onAddComment(text.trim());
      setText('');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el comentario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="comments-section">
      {error && <div className="alert-error" style={{ fontSize: '0.82rem', padding: '8px 12px' }}>{error}</div>}

      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            {comment.author?.avatar_url ? (
              <img src={comment.author.avatar_url} alt={comment.author.name} className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm">{getInitial(comment.author?.name)}</div>
            )}
            <div className="comment-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="comment-author">{comment.author?.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="comment-text">{comment.content}</p>
            </div>
          </div>
        ))
      ) : (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Sin comentarios aún. ¡Sé el primero en opinar!
        </p>
      )}

      <form onSubmit={handleSubmit} className="comment-form">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt={user.name} className="avatar avatar-sm" />
        ) : (
          <div className="avatar avatar-sm">{getInitial(user?.name)}</div>
        )}
        <input
          type="text"
          className="comment-input"
          placeholder="Escribe un comentario..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={isSubmitting || !text.trim()} style={{ padding: '8px 14px' }}>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
