# Ref: RF-001, RF-002, RF-003, RF-004, B-003, B-004, B-005, B-018
def test_register_user_success(client):
    payload = {
        "name": "Maria Lopez",
        "email": "maria@example.com",
        "password": "password123",
        "career": "Ingeniería Informática"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "maria@example.com"
    assert data["user"]["name"] == "Maria Lopez"

def test_register_duplicate_email(client):
    payload = {
        "name": "Maria Lopez",
        "email": "maria@example.com",
        "password": "password123",
        "career": "Ingeniería Informática"
    }
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert response.json()["detail"] == "El correo ya se encuentra registrado."

def test_login_success(client):
    register_payload = {
        "name": "Juan Perez",
        "email": "juan@example.com",
        "password": "securepassword",
        "career": "Sistemas"
    }
    client.post("/api/auth/register", json=register_payload)

    login_payload = {
        "email": "juan@example.com",
        "password": "securepassword"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "juan@example.com"

def test_login_invalid_password(client):
    register_payload = {
        "name": "Juan Perez",
        "email": "juan@example.com",
        "password": "securepassword",
        "career": "Sistemas"
    }
    client.post("/api/auth/register", json=register_payload)

    response = client.post("/api/auth/login", json={"email": "juan@example.com", "password": "wrong"})
    assert response.status_code == 401

def test_get_me_success(client):
    reg = client.post("/api/auth/register", json={
        "name": "Sofia V",
        "email": "sofia@example.com",
        "password": "password123",
        "career": "Diseño"
    }).json()
    token = reg["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "sofia@example.com"

def test_get_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
