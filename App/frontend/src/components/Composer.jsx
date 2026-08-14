// Ref: RF-007, RF-008, B-007, B-013, RF2-008, B2-003
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, UploadCloud, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const Composer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  // Clean up Object URL on unmount or file change (Task 30)
  useEffect(() => {
    return () => {
      if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError('Formato no soportado. Solo se permiten imágenes JPEG, PNG o WebP.');
      showToast('Formato no soportado. Solo JPEG, PNG o WebP.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo excede el tamaño máximo permitido de 5MB.');
      showToast('La imagen no debe superar los 5MB.', 'error');
      return;
    }

    if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setLocalPreviewUrl(objectUrl);
    setImageUrl('');
    setImagePublicId('');
    setError('');
  };

  const handleRemoveImage = () => {
    if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    setImageUrl('');
    setImagePublicId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Por favor escribe algo antes de publicar.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      if (selectedFile) {
        // Atomic Post + Image Endpoint (Task 28)
        const newPost = await api.createPostWithImage(content.trim(), selectedFile);
        if (onPostCreated) {
          onPostCreated(newPost);
        }
      } else {
        await onPostCreated(content.trim(), imageUrl.trim() || null, imagePublicId || null);
      }

      setContent('');
      handleRemoveImage();
      setShowImageInput(false);
      showToast('¡Publicación creada exitosamente!', 'success');
    } catch (err) {
      setError(err.message || 'No se pudo publicar. Inténtalo de nuevo.');
      showToast(err.message || 'Error al crear la publicación', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      {error && <div className="alert alert-error mb-4" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-4 mb-4">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="avatar avatar-sm" />
          ) : (
            <div className="avatar avatar-sm">{getInitial(user?.name)}</div>
          )}
          <textarea
            className="form-control flex-1"
            rows={3}
            placeholder={`¿Qué tienes en mente para compartir, ${user?.name?.split(' ')[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ minHeight: '80px' }}
          />
        </div>

        {showImageInput && (
          <div className="form-group mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label" style={{ marginBottom: 0 }}>Adjuntar Imagen</label>
              <button
                type="button"
                onClick={() => {
                  setShowImageInput(false);
                  handleRemoveImage();
                }}
                className="btn-icon text-muted"
                aria-label="Cerrar adjunto de imagen"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <UploadCloud size={14} />
                <span>Seleccionar archivo local</span>
              </button>
            </div>

            {!selectedFile && (
              <input
                type="url"
                className="form-control"
                placeholder="O pega una URL HTTPS directa: https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            )}

            {/* Image Preview & Remove Button (Task 29, 30) */}
            {(localPreviewUrl || imageUrl) && (
              <div className="relative mt-2" style={{ maxHeight: '220px', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <img
                  src={localPreviewUrl || imageUrl}
                  alt="Vista previa de la publicación"
                  style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-icon absolute top-2 right-2"
                  onClick={handleRemoveImage}
                  title="Quitar imagen"
                  aria-label="Quitar imagen"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowImageInput(!showImageInput)}
          >
            <ImageIcon size={18} className="text-info" />
            <span>{showImageInput ? 'Ocultar opción imagen' : 'Añadir imagen'}</span>
          </button>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? <Loader className="spin" size={16} /> : <Send size={16} />}
            <span>{isSubmitting ? 'Publicando...' : 'Publicar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
