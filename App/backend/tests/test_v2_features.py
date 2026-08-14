# Ref: RF2-001..RF2-014, B2-001..B2-011, RNF2-001..RNF2-006
import io
import time
import pytest
from datetime import datetime, timezone, timedelta
from PIL import Image
from app.models.user import User
from app.models.post import Post
from app.models.password_reset import PasswordResetCode
from tests.test_posts import get_auth_headers

def create_dummy_image_bytes(format="PNG") -> bytes:
    img = Image.new("RGB", (100, 100), color="red")
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

def test_user_search_and_public_profiles(client, db_session):
    headers_user1 = get_auth_headers(client, "v2_search_u1@example.com")
    headers_user2 = get_auth_headers(client, "v2_search_u2@example.com")

    # Update user2 name for searchability
    client.put("/api/users/me", json={"name": "Carlos SearchTarget"}, headers=headers_user2)

    # Search for user2
    res = client.get("/api/users/search?q=SearchTarget", headers=headers_user1)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Carlos SearchTarget"

    # Get user2 id
    user2 = db_session.query(User).filter(User.email == "v2_search_u2@example.com").first()
    assert user2 is not None

    # Get public profile
    res_prof = client.get(f"/api/users/{user2.id}", headers=headers_user1)
    assert res_prof.status_code == 200
    prof_data = res_prof.json()
    assert prof_data["id"] == user2.id
    assert prof_data["is_followed_by_me"] is False
    assert prof_data["is_me"] is False

    # Privacy verification (Task 25): email, phone, avatar_public_id MUST NOT be exposed
    assert "email" not in prof_data
    assert "phone" not in prof_data
    assert "avatar_public_id" not in prof_data

    # Get user posts
    res_user_posts = client.get(f"/api/users/{user2.id}/posts", headers=headers_user1)
    assert res_user_posts.status_code == 200

def test_user_phone_e164_normalization(client):
    headers = get_auth_headers(client, "v2_phone@example.com")

    # Update valid E.164 phone
    res_valid = client.put("/api/users/me", json={"phone": "+593987654321"}, headers=headers)
    assert res_valid.status_code == 200
    assert res_valid.json()["phone"] == "+593987654321"

    # Update local Ecuador phone without +, should auto-prepend +593
    res_local = client.put("/api/users/me", json={"phone": "0987654321"}, headers=headers)
    assert res_local.status_code == 200
    assert res_local.json()["phone"] == "+593987654321"

    # Invalid short phone
    res_invalid = client.put("/api/users/me", json={"phone": "123"}, headers=headers)
    assert res_invalid.status_code == 422 or res_invalid.status_code == 400

def test_atomic_post_creation_with_image(client):
    headers = get_auth_headers(client, "v2_post_img@example.com")
    img_bytes = create_dummy_image_bytes("PNG")

    res = client.post(
        "/api/posts/with-image",
        data={"content": "Publicación atómica con imagen adjunta"},
        files={"file": ("post_atomic.png", img_bytes, "image/png")},
        headers=headers
    )
    assert res.status_code == 201
    data = res.json()
    assert data["content"] == "Publicación atómica con imagen adjunta"
    assert data["image_url"] is not None

def test_follow_unfollow_flow_and_idempotency(client, db_session):
    headers_u1 = get_auth_headers(client, "v2_follow_u1@example.com")
    headers_u2 = get_auth_headers(client, "v2_follow_u2@example.com")

    u2 = db_session.query(User).filter(User.email == "v2_follow_u2@example.com").first()
    u1 = db_session.query(User).filter(User.email == "v2_follow_u1@example.com").first()

    # 1. Self follow error
    res_self = client.post(f"/api/users/{u1.id}/follow", headers=headers_u1)
    assert res_self.status_code == 400

    # 2. Follow u2
    res_follow = client.post(f"/api/users/{u2.id}/follow", headers=headers_u1)
    assert res_follow.status_code == 200
    assert res_follow.json()["following"] is True

    # 3. Idempotent follow (following again returns 200 without duplicate key error)
    res_follow_repeat = client.post(f"/api/users/{u2.id}/follow", headers=headers_u1)
    assert res_follow_repeat.status_code == 200

    # Check followers & following list
    res_followers = client.get(f"/api/users/{u2.id}/followers", headers=headers_u1)
    assert res_followers.status_code == 200
    assert any(f["id"] == u1.id for f in res_followers.json())

    res_following = client.get(f"/api/users/{u1.id}/following", headers=headers_u1)
    assert res_following.status_code == 200
    assert any(f["id"] == u2.id for f in res_following.json())

    # 4. Unfollow u2
    res_unfollow = client.delete(f"/api/users/{u2.id}/follow", headers=headers_u1)
    assert res_unfollow.status_code == 200
    assert res_unfollow.json()["following"] is False

    # 5. Idempotent unfollow (unfollowing again returns 200)
    res_unfollow_repeat = client.delete(f"/api/users/{u2.id}/follow", headers=headers_u1)
    assert res_unfollow_repeat.status_code == 200

def test_feed_scopes(client, db_session):
    headers_u1 = get_auth_headers(client, "v2_feed_u1@example.com")
    headers_u2 = get_auth_headers(client, "v2_feed_u2@example.com")

    u2 = db_session.query(User).filter(User.email == "v2_feed_u2@example.com").first()

    # u2 creates post
    client.post("/api/posts", json={"content": "Post por U2 para test de feed scope"}, headers=headers_u2)

    # u1 checks feed scope=following (not following yet)
    res_before = client.get("/api/posts?scope=following", headers=headers_u1)
    assert res_before.status_code == 200
    posts_before = res_before.json()
    assert not any(p["author"]["id"] == u2.id for p in posts_before)

    # u1 follows u2
    client.post(f"/api/users/{u2.id}/follow", headers=headers_u1)

    # u1 checks feed scope=following (now following u2)
    res_after = client.get("/api/posts?scope=following", headers=headers_u1)
    assert res_after.status_code == 200
    posts_after = res_after.json()
    assert any(p["author"]["id"] == u2.id for p in posts_after)

def test_cloudinary_uploads_and_edge_cases(client):
    headers = get_auth_headers(client, "v2_upload@example.com")

    img_bytes = create_dummy_image_bytes("PNG")

    # Upload avatar valid
    res_avatar = client.post(
        "/api/uploads/avatar",
        files={"file": ("avatar.png", img_bytes, "image/png")},
        headers=headers
    )
    assert res_avatar.status_code == 200
    assert "secure_url" in res_avatar.json()

    # Upload post image valid
    res_post_img = client.post(
        "/api/uploads/post-image",
        files={"file": ("post.png", img_bytes, "image/png")},
        headers=headers
    )
    assert res_post_img.status_code == 200
    assert "secure_url" in res_post_img.json()

    # Upload invalid file MIME type
    res_invalid_mime = client.post(
        "/api/uploads/avatar",
        files={"file": ("document.txt", b"not an image", "text/plain")},
        headers=headers
    )
    assert res_invalid_mime.status_code == 400

    # Upload corrupted image (fake headers pretending to be PNG)
    res_corrupted = client.post(
        "/api/uploads/avatar",
        files={"file": ("fake.png", b"\x89PNG\r\n\x1a\ncorrupted_data", "image/png")},
        headers=headers
    )
    assert res_corrupted.status_code == 400

    # Upload oversized image (>5MB)
    huge_bytes = b"0" * (6 * 1024 * 1024)
    res_oversized = client.post(
        "/api/uploads/avatar",
        files={"file": ("huge.png", huge_bytes, "image/png")},
        headers=headers
    )
    assert res_oversized.status_code == 400

def test_conversations_authorization_and_messages(client, db_session):
    headers_u1 = get_auth_headers(client, "v2_chat_u1@example.com")
    headers_u2 = get_auth_headers(client, "v2_chat_u2@example.com")
    headers_u3 = get_auth_headers(client, "v2_chat_u3@example.com")

    u2 = db_session.query(User).filter(User.email == "v2_chat_u2@example.com").first()

    # Start conversation between U1 and U2
    res_conv = client.post(f"/api/conversations/{u2.id}", headers=headers_u1)
    assert res_conv.status_code == 200
    conv_id = res_conv.json()["id"]

    # Send message from U1
    res_msg = client.post(
        f"/api/conversations/{conv_id}/messages",
        json={"content": "¡Hola U2! Este es un mensaje de prueba v2."},
        headers=headers_u1
    )
    assert res_msg.status_code == 201

    # Unauthorized access: U3 tries to read messages of conversation (U1-U2) -> 403 Forbidden
    res_unauth_read = client.get(f"/api/conversations/{conv_id}/messages", headers=headers_u3)
    assert res_unauth_read.status_code == 403

    # Unauthorized send: U3 tries to send message in conversation (U1-U2) -> 403 Forbidden
    res_unauth_send = client.post(
        f"/api/conversations/{conv_id}/messages",
        json={"content": "Mensaje no autorizado"},
        headers=headers_u3
    )
    assert res_unauth_send.status_code == 403

    # List conversations for U2
    res_list = client.get("/api/conversations", headers=headers_u2)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1

    # Mark as read for U2
    res_read = client.post(f"/api/conversations/{conv_id}/read", headers=headers_u2)
    assert res_read.status_code == 200
    assert res_read.json()["marked_read"] == 1

def test_websocket_ticket_auth(client):
    headers_u1 = get_auth_headers(client, "v2_wsticket_u1@example.com")

    # Request single-use ticket
    res_ticket = client.post("/api/ws/ticket", headers=headers_u1)
    assert res_ticket.status_code == 200
    ticket = res_ticket.json()["ticket"]
    assert ticket is not None

    # Verify ticket consumption
    from app.core.websockets import ticket_manager
    consumed_user_id = ticket_manager.consume_ticket(ticket)
    assert consumed_user_id is not None

    # Second consumption attempt returns None (single-use ticket)
    reuse_user_id = ticket_manager.consume_ticket(ticket)
    assert reuse_user_id is None

def test_notifications_flow(client, db_session):
    headers_u1 = get_auth_headers(client, "v2_notif_u1@example.com")
    headers_u2 = get_auth_headers(client, "v2_notif_u2@example.com")

    u2 = db_session.query(User).filter(User.email == "v2_notif_u2@example.com").first()

    # u1 follows u2 (triggers notification)
    client.post(f"/api/users/{u2.id}/follow", headers=headers_u1)

    # u2 checks unread count
    res_count = client.get("/api/notifications/unread-count", headers=headers_u2)
    assert res_count.status_code == 200
    assert res_count.json()["unread_count"] >= 1

    # u2 checks notifications
    res_notifs = client.get("/api/notifications", headers=headers_u2)
    assert res_notifs.status_code == 200
    notifs = res_notifs.json()
    assert len(notifs) >= 1
    notif_id = notifs[0]["id"]

    # u2 marks single notification read
    res_single = client.post(f"/api/notifications/{notif_id}/read", headers=headers_u2)
    assert res_single.status_code == 200

    # u2 marks all read
    res_read = client.post("/api/notifications/read-all", headers=headers_u2)
    assert res_read.status_code == 200

def test_password_reset_flow_security_and_anti_enumeration(client, db_session, monkeypatch):
    headers = get_auth_headers(client, "v2_reset_sec@example.com")

    captured_otp = {}
    from app.services.password_reset_provider import DevelopmentPasswordResetSender

    def mock_send_otp(self, contact, otp):
        captured_otp["contact"] = contact
        captured_otp["otp"] = otp
        return True

    monkeypatch.setattr(DevelopmentPasswordResetSender, "send_otp", mock_send_otp)

    # 1. Anti-enumeration: Request reset for non-existent user returns 200 with generic message
    res_non_exist = client.post(
        "/api/auth/password-reset/request",
        json={"email_or_phone": "non_existent_9999@example.com"}
    )
    assert res_non_exist.status_code == 200
    assert "código de recuperación" in res_non_exist.json()["message"]

    # 2. Request reset for real user
    res_req = client.post(
        "/api/auth/password-reset/request",
        json={"email_or_phone": "v2_reset_sec@example.com"}
    )
    assert res_req.status_code == 200
    otp = captured_otp["otp"]

    # 3. Wrong OTP attempt increments attempts count
    res_wrong = client.post(
        "/api/auth/password-reset/verify",
        json={"email_or_phone": "v2_reset_sec@example.com", "otp_code": "000000"}
    )
    assert res_wrong.status_code == 400

    # 4. Verify correct OTP
    res_ver = client.post(
        "/api/auth/password-reset/verify",
        json={"email_or_phone": "v2_reset_sec@example.com", "otp_code": otp}
    )
    assert res_ver.status_code == 200
    assert res_ver.json()["valid"] is True

    # 5. Confirm new password
    res_conf = client.post(
        "/api/auth/password-reset/confirm",
        json={
            "email_or_phone": "v2_reset_sec@example.com",
            "otp_code": otp,
            "new_password": "newpassword123_sec"
        }
    )
    assert res_conf.status_code == 200

    # 6. Reused OTP should be rejected (consumed)
    res_reused = client.post(
        "/api/auth/password-reset/verify",
        json={"email_or_phone": "v2_reset_sec@example.com", "otp_code": otp}
    )
    assert res_reused.status_code == 400

    # 7. Test OTP Expiration (> 5 mins)
    res_req2 = client.post(
        "/api/auth/password-reset/request",
        json={"email_or_phone": "v2_reset_sec@example.com"}
    )
    assert res_req2.status_code == 200
    otp2 = captured_otp["otp"]

    # Manually expire the code in DB
    u_reset = db_session.query(User).filter(User.email == "v2_reset_sec@example.com").first()
    code_obj = db_session.query(PasswordResetCode).filter(PasswordResetCode.user_id == u_reset.id, PasswordResetCode.used_at == None).first()
    if code_obj:
        code_obj.expires_at = datetime.now(timezone.utc) - timedelta(minutes=10)
        db_session.commit()

    res_expired = client.post(
        "/api/auth/password-reset/verify",
        json={"email_or_phone": "v2_reset_sec@example.com", "otp_code": otp2}
    )
    assert res_expired.status_code == 400

    # Test login with new password
    res_login = client.post(
        "/api/auth/login",
        json={"email": "v2_reset_sec@example.com", "password": "newpassword123_sec"}
    )
    assert res_login.status_code == 200
