# Ref: RNF-007, B-018, RF2-013, RF2-014, B2-007
import pytest
from unittest.mock import MagicMock
from app.core.config import Settings
from app.core.security import decode_access_token, verify_password, create_access_token
from app.services.user_service import UserService
from app.services.cloudinary_service import CloudinaryService
from app.services.password_reset_provider import (
    DevelopmentPasswordResetSender,
    MetaWhatsAppSender,
    WhatsAppPasswordResetSender,
    get_password_reset_sender
)
from app.services.password_reset_service import PasswordResetService
from app.db.seeder import seed_data
from tests.test_posts import get_auth_headers

def test_production_security_guard_rejected_placeholder():
    with pytest.raises(ValueError, match="SECURITY GUARD ERROR"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="short_key_with_dev_placeholder_12345"
        )

def test_production_security_guard_rejected_short_key():
    with pytest.raises(ValueError, match="SECURITY GUARD ERROR"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="secure_key_without_placeholders_but_too_short"
        )

def test_production_security_guard_rejected_short_otp_pepper():
    with pytest.raises(ValueError, match="SECURITY GUARD ERROR"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8",
            OTP_HMAC_PEPPER="short_pepper"
        )

def test_production_security_guard_accepted():
    valid_key = "a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8"
    valid_pepper = "a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8"
    st = Settings(
        ENVIRONMENT="production",
        SECRET_KEY=valid_key,
        OTP_HMAC_PEPPER=valid_pepper,
        PASSWORD_RESET_PROVIDER="whatsapp",
        WHATSAPP_PROVIDER="meta",
        CLOUDINARY_CLOUD_NAME="prod_cloud",
        CLOUDINARY_API_KEY="1234567890",
        CLOUDINARY_API_SECRET="secret_api_key_prod_cloudinary"
    )
    assert st.ENVIRONMENT == "production"
    assert st.SECRET_KEY == valid_key
    assert st.PASSWORD_RESET_PROVIDER == "whatsapp"

def test_otp_hmac_sha256_hashing_and_never_plain_text(db_session):
    service = PasswordResetService(db_session)
    raw_otp = "123456"
    digest = service._hash_otp(raw_otp)

    # 1. Output must be a 64-character SHA256 hex digest
    assert len(digest) == 64
    assert digest != raw_otp

    # 2. Constant-time digest comparison verification
    assert service._verify_hash("123456", digest) is True
    assert service._verify_hash("654321", digest) is False

def test_console_sender_blocked_in_production(monkeypatch):
    dev_sender = DevelopmentPasswordResetSender()
    monkeypatch.setattr("app.core.config.settings.ENVIRONMENT", "production")

    with pytest.raises(RuntimeError, match="SECURITY ALERT"):
        dev_sender.send_otp("ana@nexora.edu", "123456")

    monkeypatch.setattr("app.core.config.settings.PASSWORD_RESET_PROVIDER", "dev")
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        get_password_reset_sender()
    assert exc_info.value.status_code == 500

def test_meta_whatsapp_sender_fails_safely_without_credentials(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.WHATSAPP_API_TOKEN", "")
    monkeypatch.setattr("app.core.config.settings.WHATSAPP_PHONE_NUMBER_ID", "")
    monkeypatch.setattr("app.core.config.settings.ENVIRONMENT", "production")

    meta_sender = MetaWhatsAppSender()
    # In production without credentials, returns False safely
    assert meta_sender.send_otp("+51999888777", "123456") is False

def test_invalid_jwt_token_decoding():
    assert decode_access_token("invalid.token.string") is None

def test_verify_password_invalid_hash():
    assert verify_password("secret", "invalid_hash_format") is False

def test_get_current_user_invalid_token(client):
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == 401

def test_get_current_user_non_integer_sub(client):
    bad_token = create_access_token(subject="not_an_int")
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {bad_token}"})
    assert response.status_code == 401

def test_get_current_user_deleted_user(client, db_session):
    headers = get_auth_headers(client, "deleted@example.com")
    from app.models.user import User
    user = db_session.query(User).filter(User.email == "deleted@example.com").first()
    db_session.delete(user)
    db_session.commit()

    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401

def test_user_service_get_profile(client, db_session):
    headers = get_auth_headers(client, "profile_get@example.com")
    from app.models.user import User
    user = db_session.query(User).filter(User.email == "profile_get@example.com").first()

    service = UserService(db_session)
    prof = service.get_profile(user)
    assert prof.email == "profile_get@example.com"

def test_user_profile_partial_updates(client):
    headers = get_auth_headers(client, "partial_update@example.com")

    resp = client.put("/api/users/me", json={"name": "Solo Nombre", "avatar_url": "https://example.com/img.jpg"}, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Solo Nombre"
    assert data["avatar_url"] == "https://example.com/img.jpg"

    resp2 = client.put("/api/users/me", json={"career": "Matemáticas", "bio": "Bio corta"}, headers=headers)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["career"] == "Matemáticas"
    assert data2["bio"] == "Bio corta"

def test_delete_non_existent_post(client):
    headers = get_auth_headers(client, "delete_non_exist@example.com")
    resp = client.delete("/api/posts/99999", headers=headers)
    assert resp.status_code == 404

def test_toggle_like_non_existent_post(client):
    headers = get_auth_headers(client, "like_non_exist@example.com")
    resp = client.post("/api/posts/99999/like", headers=headers)
    assert resp.status_code == 404

def test_add_comment_non_existent_post(client):
    headers = get_auth_headers(client, "comment_non_exist@example.com")
    resp = client.post("/api/posts/99999/comments", json={"content": "hola"}, headers=headers)
    assert resp.status_code == 404

def test_schema_validators_empty_fields(client):
    headers = get_auth_headers(client, "validation@example.com")

    resp = client.post("/api/auth/register", json={"name": "   ", "email": "valid@example.com", "password": "password123", "career": "Software"})
    assert resp.status_code == 422

    post_resp = client.post("/api/posts", json={"content": "Post base"}, headers=headers).json()
    resp_cm = client.post(f"/api/posts/{post_resp['id']}/comments", json={"content": "    "}, headers=headers)
    assert resp_cm.status_code == 422

def test_invalid_url_schemes_rejected(client):
    headers = get_auth_headers(client, "url_test@example.com")

    # Invalid image_url in post
    resp_post = client.post("/api/posts", json={"content": "Bad image url", "image_url": "javascript:alert(1)"}, headers=headers)
    assert resp_post.status_code == 422

    # Invalid avatar_url in profile
    resp_avatar = client.put("/api/users/me", json={"avatar_url": "ftp://malicious.site/avatar.png"}, headers=headers)
    assert resp_avatar.status_code == 422

def test_seeder_execution(db_session):
    seed_data(db_session)

def test_cloudinary_service_configured_and_delete(monkeypatch):
    assert CloudinaryService.delete_image(None) is True
    assert CloudinaryService.delete_image("mock_123") is True

    monkeypatch.setattr("app.core.config.settings.CLOUDINARY_CLOUD_NAME", "mycloud")
    monkeypatch.setattr("app.core.config.settings.CLOUDINARY_API_KEY", "key123")
    monkeypatch.setattr("app.core.config.settings.CLOUDINARY_API_SECRET", "secret123")

    assert CloudinaryService._is_configured() is True

def test_password_reset_providers_mocked(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.ENVIRONMENT", "development")
    dev_sender = DevelopmentPasswordResetSender()
    assert dev_sender.send_otp("test@example.com", "123456") is True

    sender = get_password_reset_sender()
    assert sender is not None

    meta_sender = MetaWhatsAppSender()
    assert meta_sender.send_otp("+1234567890", "123456") is True

    compat_sender = WhatsAppPasswordResetSender()
    assert compat_sender.send_otp("+1234567890", "123456") is True

def test_user_service_non_existent_targets(db_session, client):
    headers = get_auth_headers(client, "user_serv_test2@example.com")
    from app.models.user import User
    user = db_session.query(User).filter(User.email == "user_serv_test2@example.com").first()

    service = UserService(db_session)

    with pytest.raises(Exception):
        service.get_public_profile(999999, user)

    with pytest.raises(Exception):
        service.get_followers(999999, user)

    with pytest.raises(Exception):
        service.get_following(999999, user)
