# Changelog — Nexora Platform

Todas las modificaciones notables de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-11

### Añadido
- **Fase f₆ (Generación de Código):**
  - Implementación completa del backend desacoplado con FastAPI, SQLAlchemy 2.0 y MySQL 8.
  - Implementación de la SPA frontend en React + Vite con arquitectura de diseño Vanilla CSS.
  - Endpoints de autenticación JWT (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
  - Endpoints de publicaciones, me gusta y comentarios (`/api/posts`, `/api/posts/{id}/like`, `/api/posts/{id}/comments`).
  - Endpoint de perfil del usuario (`/api/users/me`) con edición parcial de perfil.
  - Endpoint de dashboard de estadísticas agregadas (`/api/dashboard/stats`).
  - Seeder de base de datos idempotente (`app/db/seeder.py`).

- **Fase f₇ (Pruebas):**
  - Suite de pruebas de backend con Pytest alcanzando 90% de cobertura de líneas y 85.7% de ramas.
  - Suite de pruebas de frontend con Vitest para `LoginPage`, `ProtectedRoute`, `PostCard` y `Composer`.
  - Mecanismo de aislamiento de base de datos de prueba (`nexora_test`) con `verify_safety_guard()`.
  - Script de validación end-to-end automatizado (`verify_e2e_flow.py`).

- **Fase f₈ (Seguridad):**
  - Production Config Guard en `app/core/config.py` para bloquear el arranque en `ENVIRONMENT=production` si `SECRET_KEY` usa placeholders o posee menos de 64 caracteres.
  - Validadores estrictos de esquema Pydantic para URLs de imágenes (`http://` / `https://`).
  - Política de seguridad formal (`security/policies/security-policy.md`).
  - Auditorías de dependencias limpias con `pip-audit`, `bandit` y `npm audit`.

- **Fase f₉ (Documentación):**
  - Exportación automática de `documentation/api/openapi.json` desde la aplicación activa.
  - Runbooks de despliegue (`DEPLOYMENT.md`) y reversión (`ROLLBACK.md`).
  - Capturas reales de la aplicación en `documentation/screenshots/`.
  - Guía de exposición y demostración (`EXPOSICION.md`).
  - `README.md`, `CHANGELOG.md` y `CONTRIBUTING.md`.
