// Ref: RF2-013, RF2-014, B2-007
import React, { useState, useEffect } from 'react';
import { KeyRound, X, ArrowRight, CheckCircle, ShieldCheck, Loader, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

export const PasswordResetModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Body scroll lock & Escape key listener (Task 13)
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const resetState = () => {
    setStep(1);
    setEmailOrPhone('');
    setOtpCode('');
    setResetToken('');
    setNewPassword('');
    setShowPassword(false);
    setError(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.requestPasswordReset(emailOrPhone);
      setSuccessMsg(res.message || 'Código de verificación enviado correctamente.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el código OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyPasswordReset(emailOrPhone, otpCode);
      if (res && res.reset_token) {
        setResetToken(res.reset_token);
      }
      setStep(3);
    } catch (err) {
      setError(err.message || 'Código OTP inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return;

    setLoading(true);
    setError(null);
    try {
      // Use temporary reset_token if present, or fallback to otpCode (Task 36)
      const res = await api.confirmPasswordReset(emailOrPhone, resetToken || otpCode, newPassword);
      setSuccessMsg(res.message || '¡Contraseña actualizada con éxito!');
      setStep(4);
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Recuperación de Contraseña"
    >
      <div className="modal-content password-reset-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-primary" />
            <h3 className="modal-title">Recuperación de Contraseña</h3>
          </div>
          <button className="btn-icon text-muted" onClick={handleClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error" role="alert">{error}</div>}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="reset-step-form">
              <p className="field-help mb-4">
                Ingresa tu correo institucional o número telefónico registrado para recibir el código de verificación OTP de 6 dígitos.
              </p>
              <div className="form-group">
                <label htmlFor="reset-identifier" className="form-label">Correo o Teléfono</label>
                <input
                  id="reset-identifier"
                  type="text"
                  className="form-control"
                  placeholder="ej. ana.torres@nexora.edu o +593987654321"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <Loader className="spin" size={16} /> : <ArrowRight size={16} />}
                <span>Enviar Código OTP</span>
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="reset-step-form">
              <div className="alert alert-info mb-4">
                {successMsg || 'Código enviado. Revisa tu correo o mensajes.'}
              </div>
              <div className="form-group">
                <label htmlFor="reset-otp" className="form-label">Código OTP (6 dígitos)</label>
                <input
                  id="reset-otp"
                  type="text"
                  className="form-control text-center"
                  style={{ letterSpacing: '0.3em', fontSize: '1.2rem', fontWeight: 'bold' }}
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading || otpCode.length !== 6}>
                {loading ? <Loader className="spin" size={16} /> : <ShieldCheck size={16} />}
                <span>Verificar Código</span>
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleConfirmReset} className="reset-step-form">
              <p className="field-help mb-4">Código verificado. Ingresa tu nueva contraseña para Nexora.</p>
              <div className="form-group">
                <label htmlFor="reset-new-password" className="form-label">Nueva Contraseña</label>
                <div className="input-with-icon has-right-icon">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <Loader className="spin" size={16} /> : <CheckCircle size={16} />}
                <span>Guardar Nueva Contraseña</span>
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-success mx-auto mb-2" />
              <h4 className="font-bold text-lg mb-2">¡Contraseña Actualizada!</h4>
              <p className="text-muted text-sm mb-4">Ya puedes iniciar sesión con tus nuevas credenciales.</p>
              <button className="btn btn-primary" onClick={handleClose}>
                Volver al Inicio de Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
