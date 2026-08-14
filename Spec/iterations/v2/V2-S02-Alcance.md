# V2-S02 — Alcance de Nexora Social v2

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## En alcance (In-Scope v2)

1. **Perfiles Públicos y Seguidores:**
   - Búsqueda pública de usuarios por nombre o carrera/interés (`GET /api/users/search?q=`).
   - Perfil público accesible por ID (`GET /api/users/{user_id}`), mostrando biografía, carrera, avatares, contadores de seguidores/seguidos y sus publicaciones.
   - Acciones de seguir y dejar de seguir (`POST /api/users/{user_id}/follow`, `DELETE /api/users/{user_id}/follow`), impidiendo autoseguimiento y duplicados.
   - Listados de seguidores (`/followers`) y seguidos (`/following`).
   - Feed con selector entre "Todas las publicaciones" y "Publicaciones de usuarios seguidos" (`GET /api/posts?scope=all|following`).

2. **Subida Real de Imágenes (Cloudinary):**
   - Endpoints dedicados `POST /api/uploads/avatar` y `POST /api/uploads/post-image`.
   - Subida autenticada desde FastAPI hacia Cloudinary en carpetas `nexora/avatars` y `nexora/posts`.
   - Validaciones de tipo mime real (JPEG, PNG, WEBP), tamaño (máx 5MB) e inspección de contenido.
   - Eliminación de avatar/imagen anterior en Cloudinary tras confirmar la actualización en MySQL.
   - Vista previa local en React antes de subir con spinner e indicador de progreso.
   - Compatibilidad de lectura con URLs de imagen heredadas de v1.

3. **Chat Privado en Tiempo Real (WebSockets):**
   - Conversaciones 1 a 1 entre usuarios con persistencia en MySQL (`conversations`, `conversation_members`, `messages`).
   - Endpoints REST para historial paginado, listado de chats recientes y marcado de lectura.
   - Conexión WebSocket `WS /ws?token=<JWT>` para envío/recepción de mensajes y eventos de lectura.
   - Indicador efímero "Escribiendo..." con debounce en React.
   - Reconexión en cliente con backoff exponencial y prevención de duplicados.

4. **Notificaciones en Tiempo Real:**
   - Tabla `notifications` para eventos: follow, like, comentario y mensaje.
   - Notificaciones entregadas por WS si el receptor está en línea y persistidas en DB si está desconectado.
   - Campana con contador de no leídas, drawer/panel, marcado de lectura individual/masivo y enlaces de redirección.

5. **Recuperación de Contraseña:**
   - Arquitectura por proveedores (`DevelopmentPasswordResetSender` para desarrollo/tests y `WhatsAppPasswordResetSender` para producción).
   - Generación de OTP criptográfico de 6 dígitos con hash almacenado en `password_reset_codes`, expiración de 5 min y máximo 5 intentos.
   - Respuesta HTTP genérica para prevenir enumeración de usuarios.
   - Invalidador de sesiones y rate limiting en endpoints de solicitud y verificación.

6. **Migraciones y Seguridad:**
   - Migración con Alembic para actualizar el esquema MySQL de v1 a v2 de forma transparente y sin pérdida de datos.
   - Rate limiting en endpoints sensibles (`slowapi`).
   - Animaciones y pulido responsive con soporte `prefers-reduced-motion`.

## Fuera de alcance (Out-of-Scope v2)

1. Chats grupales o videollamadas.
2. Subida de videos o archivos no de imagen.
3. Uso de SQLite, PostgreSQL, Firebase o almacenamiento local de imágenes en producción.
4. Despliegue automático a producción (Fases f10-f12 permanecen bloqueadas).
