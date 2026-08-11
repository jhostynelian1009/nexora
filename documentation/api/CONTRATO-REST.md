# Contrato REST de Nexora

> Fuente normativa: S04, S05 y S07 | Arquitectura: S03 | Fase: f₃

## Convenciones

- Base local: `http://localhost:8000`.
- Contenido: `application/json`.
- Autorización: `Authorization: Bearer <token>` salvo rutas públicas.
- Fechas: ISO 8601 UTC.
- Error estándar: `{ "detail": "Mensaje comprensible" }`.
- El backend obtiene el usuario desde el JWT, nunca desde un `user_id` enviado por el cliente.

## Endpoints

| Método | Ruta | Auth | Respuesta | Ref |
|---|---|---:|---|---|
| GET | `/health` | No | Estado API/DB | RF-020 |
| POST | `/api/auth/register` | No | 201, token y usuario | RF-001–RF-003 |
| POST | `/api/auth/login` | No | 200, token y usuario | RF-003 |
| GET | `/api/auth/me` | Sí | Usuario actual | RF-004 |
| GET | `/api/users/me` | Sí | Perfil actual | RF-006 |
| PUT | `/api/users/me` | Sí | Perfil actualizado | RF-006 |
| GET | `/api/posts` | Sí | Feed cronológico | RF-009, RF-010 |
| POST | `/api/posts` | Sí | 201, publicación | RF-007, RF-008 |
| DELETE | `/api/posts/{post_id}` | Sí/autor | 204 | Soporte del perfil |
| POST | `/api/posts/{post_id}/like` | Sí | Estado y contador | RF-011, RF-012 |
| POST | `/api/posts/{post_id}/comments` | Sí | 201, comentario | RF-013 |
| GET | `/api/dashboard/stats` | Sí | Métricas | RF-015, RF-016 |

## Esquemas esenciales

### Registro

```json
{
  "name": "Ana Torres",
  "email": "ana@example.com",
  "password": "secreto-seguro",
  "career": "Desarrollo de Software"
}
```

### Token

```json
{
  "access_token": "jwt",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Ana Torres",
    "email": "ana@example.com",
    "career": "Desarrollo de Software",
    "bio": "Aprendiendo y conectando.",
    "avatar_url": null,
    "created_at": "2026-08-11T12:00:00Z"
  }
}
```

### Crear publicación

```json
{
  "content": "Hoy presentamos nuestro proyecto de redes.",
  "image_url": "https://images.example.com/demo.jpg"
}
```

### Publicación del feed

```json
{
  "id": 10,
  "content": "Hoy presentamos nuestro proyecto de redes.",
  "image_url": null,
  "created_at": "2026-08-11T12:00:00Z",
  "author": { "id": 1, "name": "Ana Torres", "career": "Software", "avatar_url": null },
  "likes_count": 3,
  "liked_by_me": true,
  "comments": []
}
```

### Like

```json
{ "liked": true, "likes_count": 4 }
```

### Dashboard

```json
{
  "users": 6,
  "posts": 12,
  "likes": 24,
  "comments": 9,
  "my_posts": 2,
  "my_likes_received": 7
}
```

## Códigos esperados

- `200`: consulta o actualización correcta.
- `201`: recurso creado.
- `204`: eliminación correcta.
- `400`: regla de negocio incumplida.
- `401`: sesión ausente o inválida.
- `403`: usuario autenticado sin permiso.
- `404`: recurso inexistente.
- `409`: correo duplicado o conflicto de unicidad.
- `422`: esquema de entrada inválido.

