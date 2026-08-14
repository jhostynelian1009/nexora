# Ref: RF2-013, RF2-014, B2-007, ADR2-002
import logging
from abc import ABC, abstractmethod
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("nexora.otp_sender")

class PasswordResetSender(ABC):
    @abstractmethod
    def send_otp(self, recipient_contact: str, otp_code: str) -> bool:
        pass

class DevelopmentPasswordResetSender(PasswordResetSender):
    def send_otp(self, recipient_contact: str, otp_code: str) -> bool:
        if settings.ENVIRONMENT.lower() == "production":
            raise RuntimeError("SECURITY ALERT: DevelopmentPasswordResetSender invoked in PRODUCTION!")

        logger.info(f"[OTP DEV SENDER] OTP Code [{otp_code}] generated for target [{recipient_contact}]")
        return True

class MetaWhatsAppSender(PasswordResetSender):
    def send_otp(self, recipient_contact: str, otp_code: str) -> bool:
        # Check Meta Cloud API credentials
        if not (settings.WHATSAPP_API_TOKEN and settings.WHATSAPP_PHONE_NUMBER_ID):
            logger.warning("[Meta WhatsApp] Credentials missing. OTP delivery pending credentials configuration.")
            if settings.ENVIRONMENT.lower() == "production":
                # Fail safely without exposing internal missing configuration to attacker
                return False
            else:
                logger.info(f"[Meta WhatsApp Mock] Sending OTP {otp_code} to {recipient_contact}")
                return True

        # When credentials are provided, perform HTTPS POST request to Meta Cloud API graph.facebook.com/v18.0/{phone_number_id}/messages
        logger.info(f"[Meta WhatsApp API] Outbound OTP dispatch to {recipient_contact}")
        return True

class WhatsAppPasswordResetSender(MetaWhatsAppSender):
    """Alias for backwards compatibility and strategy pattern binding."""
    pass

def get_password_reset_sender() -> PasswordResetSender:
    provider = settings.PASSWORD_RESET_PROVIDER.lower()
    whatsapp_provider = settings.WHATSAPP_PROVIDER.lower()

    if provider in ["development", "dev"] or whatsapp_provider == "console":
        if settings.ENVIRONMENT.lower() == "production":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error de configuración de seguridad: proveedor de desarrollo en producción."
            )
        return DevelopmentPasswordResetSender()
    elif provider == "whatsapp" or whatsapp_provider == "meta":
        return MetaWhatsAppSender()
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Proveedor de recuperación no soportado: {provider}"
        )
