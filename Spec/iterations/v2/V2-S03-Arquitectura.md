# V2-S03 — Arquitectura de Nexora Social v2

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## Diagrama de componentes e interacciones v2

```
+-------------------------------------------------------------------+
|                        Cliente React (Vite)                       |
|  - UI/UX v2 (CSS Vanilla, Tailwind-free, Framer-like CSS anims)   |
|  - Modulos: Feed, Perfiles, Followers, Cloudinary Preview, Chat   |
|  - WebSocket Manager (reconexión con backoff, debounce typing)    |
+---------------------------------+---------------------------------+
                                  |
            HTTP/REST (JSON)      |     WS (WSS en Prod)
            JWT Bearer Header     |     Query param ?token=JWT
                                  v
+---------------------------------+---------------------------------+
|                       FastAPI Backend v2                          |
|  - Auth Middleware & Rate Limiter (SlowAPI / IP Bucket)           |
|  - REST Controllers (Users, Posts, Uploads, Chats, Reset, Notifs) |
|  - WebSocket ConnectionManager (In-memory Pub/Sub abstraction)   |
|  - Cloudinary Storage Service (nexora/avatars, nexora/posts)      |
|  - PasswordResetSender Provider System                            |
+---------------------------------+---------------------------------+
                                  |
            SQLAlchemy 2.0 ORM    |
            Alembic Migrations    v
+---------------------------------+---------------------------------+
|                         MySQL Database                            |
|  - users (id, name, email, career, bio, avatar_url, public_id...) |
|  - posts (id, content, image_url, image_public_id, author_id...)  |
|  - likes (id, user_id, post_id, created_at)                       |
|  - comments (id, content, author_id, post_id, created_at)         |
|  - follows (id, follower_id, followed_id, created_at)             |
|  - conversations & conversation_members & messages                |
|  - notifications (id, recipient_id, actor_id, type, payload...)   |
|  - password_reset_codes (id, user_id, code_hash, expires_at...)   |
+-------------------------------------------------------------------+
```

## Principios y Patrones v2

1. **Abstracción de Tiempo Real (ConnectionManager):** Encapsula el manejo de websockets activos por `user_id`. Define una interfaz preparada para reemplazo por Redis Pub/Sub cuando se escala horizontalmente.
2. **Proveedor de Recuperación de Contraseña (Strategy Pattern):** `PasswordResetSender` con implementaciones `DevelopmentPasswordResetSender` (solo entorno dev/testing) y `WhatsAppPasswordResetSender` (API externa).
3. **Manejo Multimedia Transaccional (Cloudinary Integration):** La eliminación del recurso anterior en Cloudinary sólo ocurre tras persistir exitosamente en MySQL.
4. **Control de Acceso BOLA/IDOR:** Toda consulta o mutación de chats, notificaciones o eliminaciones de imágenes exige validación explícita de propiedad en el backend.
