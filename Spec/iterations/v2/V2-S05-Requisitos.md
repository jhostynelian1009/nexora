# V2-S05 — Requisitos de Nexora Social v2

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## Requisitos Funcionales (RF2)

- **RF2-001:** El sistema debe permitir buscar usuarios por nombre o carrera/interés mediante `GET /api/users/search?q=`.
- **RF2-002:** El sistema debe permitir consultar el perfil público de cualquier usuario mediante `GET /api/users/{user_id}`, retornando foto, nombre, carrera, biografía, total de publicaciones, seguidores y seguidos.
- **RF2-003:** El sistema debe permitir consultar las publicaciones públicas de un usuario específico (`GET /api/users/{user_id}/posts`).
- **RF2-004:** El sistema debe permitir seguir y dejar de seguir usuarios (`POST /api/users/{user_id}/follow`, `DELETE /api/users/{user_id}/follow`), impidiendo autoseguimiento y relaciones duplicadas.
- **RF2-005:** El sistema debe permitir consultar las listas de seguidores (`/followers`) y seguidos (`/following`).
- **RF2-006:** El sistema debe permitir filtrar el feed principal entre todas las publicaciones y solo publicaciones de usuarios seguidos (`GET /api/posts?scope=all|following`).
- **RF2-007:** El sistema debe integrar la subida autenticada de avatares (`POST /api/uploads/avatar`) y multimedia de posts (`POST /api/uploads/post-image`) a Cloudinary en las carpetas `nexora/avatars` y `nexora/posts`.
- **RF2-008:** El sistema debe validar que los archivos subidos sean imágenes reales (JPEG, PNG, WEBP) de máx 5MB y eliminar de Cloudinary las imágenes anteriores al actualizar avatar o eliminar publicaciones.
- **RF2-009:** El sistema debe permitir iniciar o reutilizar conversaciones 1 a 1 y listar conversaciones recientes con último mensaje y no leídos (`POST /api/conversations/{other_user_id}`, `GET /api/conversations`).
- **RF2-010:** El sistema debe permitir chatear en tiempo real vía WebSockets (`WS /ws?token=<JWT>`), guardando los mensajes en MySQL antes de transmitirlos.
- **RF2-011:** El sistema debe gestionar el evento efímero "Escribiendo..." con debounce en el cliente y auto-expiración.
- **RF2-012:** El sistema debe generar notificaciones persistidas en DB y transmitirlas en tiempo real vía WS para eventos de seguimiento, likes, comentarios y mensajes privados.
- **RF2-013:** El sistema debe permitir la recuperación de contraseña mediante OTP criptográfico de 6 dígitos con proveedor `Development` (entornos dev/test) y `WhatsApp` (preparado).
- **RF2-014:** El sistema debe invalidar códigos OTP tras 5 minutos o 5 intentos fallidos y responder de forma genérica para evitar la enumeración de usuarios.

## Requisitos No Funcionales (RNF2)

- **RNF2-001:** El backend debe aplicar Rate Limiting en endpoints sensibles (autenticación, subida de archivos, recuperación de contraseña, envío de mensajes).
- **RNF2-002:** CERO almacenamiento binario de imágenes en MySQL o disco efímero de Render.
- **RNF2-003:** El cliente WS debe implementar reconexión automática con backoff exponencial y deduplicación de mensajes.
- **RNF2-004:** El sistema debe desinfectar y renderizar los mensajes estrictamente como texto plano para evitar XSS.
- **RNF2-005:** Las animaciones visuales deben respetar `prefers-reduced-motion` y no bloquear la interacción del usuario.
- **RNF2-006:** El guard de producción debe rechazar configuraciones inseguras de proveedor de password reset o secretos débiles.
