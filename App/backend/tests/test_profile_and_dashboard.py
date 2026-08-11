# Ref: RF-006, RF-015, RF-016, B-006, B-015, B-018
from tests.test_posts import get_auth_headers

def test_update_profile(client):
    headers = get_auth_headers(client, "profile_user@example.com")
    update_payload = {
        "name": "Nombre Actualizado",
        "bio": "Nueva biografía académica.",
        "career": "Ciberseguridad"
    }
    resp = client.put("/api/users/me", json=update_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Nombre Actualizado"
    assert data["bio"] == "Nueva biografía académica."
    assert data["career"] == "Ciberseguridad"

def test_dashboard_stats(client):
    headers = get_auth_headers(client, "dash_user@example.com")
    client.post("/api/posts", json={"content": "Mi post para stats"}, headers=headers)

    resp = client.get("/api/dashboard/stats", headers=headers)
    assert resp.status_code == 200
    stats = resp.json()
    assert stats["users"] >= 1
    assert stats["posts"] >= 1
    assert stats["my_posts"] == 1
