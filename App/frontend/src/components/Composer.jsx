// Ref: RF-007, RF-008, B-007, B-013
import React, { useState } from 'react';
import { Send, Image, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Composer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Por favor escribe algo antes de publicar.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await onPostCreated(content.trim(), imageUrl.trim() || null);
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
    } catch (err) {
      setError(err.message || 'No se pudo publicar. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="avatar avatar-sm" />
          ) : (
            <div className="avatar avatar-sm">{getInitial(user?.name)}</div>
          )}
          <textarea
            className="input-field"
            rows={3}
            placeholder={`¿Qué tienes en mente para compartir, ${user?.name?.split(' ')[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        {showImageInput && (
          <div className="input-group" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="input-label">URL de imagen opcional (HTTPS)</label>
              <button
                type="button"
                onClick={() => {
                  setShowImageInput(false);
                  setImageUrl('');
                }}
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="url"
              className="input-field"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowImageInput(!showImageInput)}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            <Image size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>{showImageInput ? 'Ocultar imagen' : 'Añadir imagen'}</span>
          </button>

          <button type="submit" className="btn-primary" disabled={isSubmitting || !content.trim()}>
            <Send size={16} />
            <span>{isSubmitting ? 'Publicando...' : 'Publicar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
