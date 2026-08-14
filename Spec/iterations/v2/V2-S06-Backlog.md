# V2-S06 — Backlog de Nexora Social v2

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## Ítems del Backlog v2

| ID | Prioridad | Módulo | Descripción | Ref |
|---|---|---|---|---|
| B2-001 | Must | Spec & DB | Especificación Spec v2, ADRs y migraciones Alembic conservando datos v1. | S01-S05 v2 |
| B2-002 | Must | Perfiles & Follows | Búsqueda de usuarios, perfiles públicos, sistema de seguir/dejar de seguir y feed filtrable. | RF2-001–RF2-006 |
| B2-003 | Must | Cloudinary Uploads | Integración de SDK Cloudinary para avatares y publicaciones con validación mime/tamaño y limpieza. | RF2-007, RF2-008 |
| B2-004 | Must | Chats REST | Modelado de conversations, members, messages y endpoints REST de historial y lectura. | RF2-009 |
| B2-005 | Must | WebSocket Chat | Endpoint WS `/ws?token=`, eventos JSON, persistencia previa en MySQL e indicador typing. | RF2-010, RF2-011 |
| B2-006 | Must | Notificaciones | Modelo notifications, generación por eventos (follow/like/comentario/mensaje), WS push y UI bell/panel. | RF2-012 |
| B2-007 | Must | Password Reset | Provider abstraction (Development / WhatsApp), OTP hash de 6 dígitos, TTL 5m, rate limit y guard prod. | RF2-013, RF2-014 |
| B2-008 | Must | UI / Animaciones | Visual polish v2: Skeletons, likes animados, toasts, vista previa imagenes, modales y reduced-motion. | RNF2-005 |
| B2-009 | Must | Seguridad & Rate Limiting | Rate limiting en endpoints sensibles, protección IDOR/XSS, validación de contenidos y auditoría. | RNF2-001, RNF2-004 |
| B2-010 | Must | Testing & Cobertura | Pruebas unitarias/integración backend (cov $\ge$ 80% líneas, $\ge$ 70% ramas) y frontend. | Metric S12 |
| B2-011 | Should | Optimización WS | Heartbeat ping/pong y limpieza automática de conexiones muertas. | RNF2-003 |
| B2-012 | Should | Seeder Idempotente v2 | Actualización del seeder con datos demostrativos de seguidores, conversaciones y notificaciones. | Dev Support |
