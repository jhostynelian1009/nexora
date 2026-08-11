# Ref: RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, B-007, B-008, B-009, B-010, B-018
def get_auth_headers(client, email="user@example.com"):
    reg = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "password123",
        "career": "Software"
    }).json()
    return {"Authorization": f"Bearer {reg['access_token']}"}

def test_create_post_and_feed(client):
    headers = get_auth_headers(client, "user1@example.com")
    post_resp = client.post("/api/posts", json={
        "content": "Primer post de prueba",
        "image_url": "https://images.example.com/test.jpg"
    }, headers=headers)
    assert post_resp.status_code == 201
    post_data = post_resp.json()
    assert post_data["content"] == "Primer post de prueba"
    assert post_data["image_url"] == "https://images.example.com/test.jpg"
    assert post_data["likes_count"] == 0
    assert post_data["liked_by_me"] is False

    feed_resp = client.get("/api/posts", headers=headers)
    assert feed_resp.status_code == 200
    feed = feed_resp.json()
    assert len(feed) >= 1
    assert feed[0]["id"] == post_data["id"]

def test_create_post_empty_content(client):
    headers = get_auth_headers(client, "user2@example.com")
    resp = client.post("/api/posts", json={"content": "   "}, headers=headers)
    assert resp.status_code == 422

def test_toggle_like(client):
    headers = get_auth_headers(client, "user3@example.com")
    post_resp = client.post("/api/posts", json={"content": "Post para like"}, headers=headers).json()
    post_id = post_resp["id"]

    # First toggle: should like
    like1 = client.post(f"/api/posts/{post_id}/like", headers=headers)
    assert like1.status_code == 200
    assert like1.json()["liked"] is True
    assert like1.json()["likes_count"] == 1

    # Second toggle: should unlike
    like2 = client.post(f"/api/posts/{post_id}/like", headers=headers)
    assert like2.status_code == 200
    assert like2.json()["liked"] is False
    assert like2.json()["likes_count"] == 0

def test_add_comment(client):
    headers = get_auth_headers(client, "user4@example.com")
    post_resp = client.post("/api/posts", json={"content": "Post para comentar"}, headers=headers).json()
    post_id = post_resp["id"]

    comment_resp = client.post(f"/api/posts/{post_id}/comments", json={"content": "Gran post!"}, headers=headers)
    assert comment_resp.status_code == 201
    cdata = comment_resp.json()
    assert cdata["content"] == "Gran post!"
    assert cdata["author"]["name"] == "Test User"

def test_delete_post_owner(client):
    headers = get_auth_headers(client, "user5@example.com")
    post_resp = client.post("/api/posts", json={"content": "Post a borrar"}, headers=headers).json()
    post_id = post_resp["id"]

    del_resp = client.delete(f"/api/posts/{post_id}", headers=headers)
    assert del_resp.status_code == 204

def test_delete_post_not_owner(client):
    headers1 = get_auth_headers(client, "owner@example.com")
    headers2 = get_auth_headers(client, "other@example.com")

    post_resp = client.post("/api/posts", json={"content": "Post privado"}, headers=headers1).json()
    post_id = post_resp["id"]

    del_resp = client.delete(f"/api/posts/{post_id}", headers=headers2)
    assert del_resp.status_code == 403
