import sys
import httpx

# Ensure UTF-8 output stream
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def main():
    print("--- 1. Testing /health ---")
    r = httpx.get(f"{BASE_URL}/health")
    print(f"Health response: {r.status_code}", r.json())
    assert r.status_code == 200

    print("\n--- 2. Registering new integration user ---")
    user_payload = {
        "name": "Integration Tester",
        "email": "e2e_test@nexora.dev",
        "password": "password123",
        "career": "Ingeniería de Pruebas"
    }
    r = httpx.post(f"{BASE_URL}/api/auth/register", json=user_payload)
    if r.status_code == 409:
        print("User exists, logging in instead...")
        r = httpx.post(f"{BASE_URL}/api/auth/login", json={"email": user_payload["email"], "password": user_payload["password"]})
    
    assert r.status_code in [200, 201]
    auth_data = r.json()
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in successfully! User ID:", auth_data["user"]["id"])

    print("\n--- 3. Creating a new post ---")
    post_payload = {
        "content": "Publicacion de prueba end-to-end automatizada en Nexora",
        "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"
    }
    r = httpx.post(f"{BASE_URL}/api/posts", json=post_payload, headers=headers)
    assert r.status_code == 201
    post = r.json()
    post_id = post["id"]
    print(f"Post created! ID: {post_id}, Content: '{post['content']}'")

    print("\n--- 4. Toggling Like on post ---")
    r = httpx.post(f"{BASE_URL}/api/posts/{post_id}/like", headers=headers)
    assert r.status_code == 200
    like_res = r.json()
    print("Like response:", like_res)

    print("\n--- 5. Adding Comment on post ---")
    comment_payload = {"content": "Comentario de integracion automatizado funcionando."}
    r = httpx.post(f"{BASE_URL}/api/posts/{post_id}/comments", json=comment_payload, headers=headers)
    assert r.status_code == 201
    comment = r.json()
    print("Comment added! ID:", comment["id"], "Text:", comment["content"])

    print("\n--- 6. Checking Feed ---")
    r = httpx.get(f"{BASE_URL}/api/posts", headers=headers)
    assert r.status_code == 200
    feed = r.json()
    print(f"Feed fetched! Total posts in feed: {len(feed)}")
    first_post = feed[0]
    print(f"First post in feed ID {first_post['id']} by {first_post['author']['name']} - Likes: {first_post['likes_count']}, Liked by me: {first_post['liked_by_me']}")

    print("\n--- 7. Checking Dashboard Stats ---")
    r = httpx.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
    assert r.status_code == 200
    stats = r.json()
    print("Dashboard stats:", stats)

    print("\nSUCCESS: All critical integrated flows verified cleanly!")

if __name__ == "__main__":
    main()
