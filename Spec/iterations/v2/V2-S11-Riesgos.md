# V2-S11 — Riesgos de Nexora Social v2

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## Matriz de Riesgos v2

| ID Riesgo | Descripción | Severidad | Mitigación |
|---|---|---|---|
| **RSK2-001** | Faltan credenciales reales de Cloudinary en entorno local. | Media | Cargar fallback seguro o mock controlado para suite de pruebas unitarias. |
| **RSK2-002** | Faltan credenciales de WhatsApp en producción. | Media | Usar `DevelopmentPasswordResetSender` en dev/test y rechazar en prod con mensaje explícito. |
| **RSK2-003** | Desconexiones de WebSocket por inactividad o fallos de red. | Media | Reconexión automática con backoff exponencial en el cliente React y heartbeat ping/pong. |
| **RSK2-004** | Corrupción o pérdida de datos durante la migración de la DB de v1. | Alta | Migraciones Alembic no destructivas probadas en copia local antes de aplicar en producción. |
