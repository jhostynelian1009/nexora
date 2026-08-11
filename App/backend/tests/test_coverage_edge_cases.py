# Ref: RNF-007, B-018
import pytest
from app.core.security import decode_access_token, verify_password, create_access_token
from app.services.user_service import UserService
from tests.test_posts import get_auth_headers
from tests.conftest import verify_safety_guard

def test_safety_guard_prevents_non_test_db_drop(monkeypatch):
    from tests import conftest
    class MockUrl:
        database = "nexora_production"
    class MockEngine:
        url = MockUrl()
    
    monkeypatch.setattr(conftest, "engine", MockEngine())
    with pytest.raises(RuntimeError, match="SAFETY GUARD TRIGGERED"):
        conftest.verify_safety_guard()

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
