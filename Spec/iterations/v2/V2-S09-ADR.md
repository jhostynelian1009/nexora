# V2-S09 — Decisiones Arquitectónicas (ADR v2)

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## ADR2-001 — Estrategia de Carga de Archivos e Imágenes (Endpoints Dedicados vs Multipart en Entidades)

- **Estatus:** ACEPTADO
- **Contexto:** Se requiere permitir la carga de imágenes reales de avatares y publicaciones hacia Cloudinary desde FastAPI, retornando `secure_url` y `public_id`. Se evalúa si integrar `multipart/form-data` directamente en la actualización de perfil y creación de post, o utilizar endpoints dedicados de carga `/api/uploads/*`.
- **Decisión:** Implementar endpoints dedicados de carga `/api/uploads/avatar` y `/api/uploads/post-image`.
- **Justificación:**
  1. Separa limpiamente la responsabilidad de manejo de archivos multipart de la lógica de negocio JSON de entidades.
  2. Facilita la vista previa en frontend, donde la imagen es subida previamente y se obtiene la `secure_url` que se envía en el payload JSON estándar al crear/actualizar la entidad.
  3. Permite aplicar middlewares de rate limiting e inspección de contenido (MIME/Pillow) específicamente sobre las peticiones de subida.
  4. Mantiene total retrocompatibilidad con clientes o publicaciones que envíen URLs directas.

## ADR2-002 — Abstracción de Proveedores para Recuperación de Contraseña

- **Estatus:** ACEPTADO
- **Contexto:** El usuario no dispone de credenciales activas de WhatsApp Business / Meta WABA o Twilio en su entorno local de desarrollo.
- **Decisión:** Diseñar una interfaz abstracta `PasswordResetSender` con dos implementaciones concretas:
  - `DevelopmentPasswordResetSender`: Activo únicamente con `ENVIRONMENT=development` o `testing`. Registra el OTP en logs de consola y jamás en respuestas HTTP. Levanta error de arranque si intenta ejecutarse en `production`.
  - `WhatsAppPasswordResetSender`: Estructurado con la interfaz oficial. Si faltan credenciales (`WHATSAPP_ACCOUNT_SID`, etc.), responde con un error controlado de servicio no disponible, sin simular envíos ficticios.
- **Justificación:** Cumple estrictamente las reglas de seguridad sin hardcodear tokens ni falsas promesas en producción.

## ADR2-003 — ConnectionManager WebSocket en Memoria y Contrato de Pub/Sub

- **Estatus:** ACEPTADO
- **Contexto:** La app se desplegará inicialmente en una sola instancia en Render para ~20 usuarios.
- **Decisión:** Mantener las conexiones activas en un `ConnectionManager` en memoria en la instancia de FastAPI, pero aislando el dispatch de eventos a través de una interfaz de bus de eventos interna.
- **Justificación:** Satisface las necesidades de la iteración actual sin sobreingeniería (como Redis obligatorio) mientras documenta la interfaz de extensión para escalamiento horizontal.

## ADR2-004 — Uso de Alembic para Migraciones Incrementales de MySQL

- **Estatus:** ACEPTADO
- **Contexto:** Se requiere agregar 5 nuevas tablas (`follows`, `conversations`, `conversation_members`, `messages`, `notifications`, `password_reset_codes`) y extender `users` y `posts` sin destruir los datos de v1.
- **Decisión:** Configurar Alembic en `App/backend` y generar una migración versionada explícita.
- **Justificación:** Garantiza la integridad de datos existentes en MySQL (`nexora`), prohíbe el uso de `drop_all()` y permite upgrades/downgrades reproducibles.
