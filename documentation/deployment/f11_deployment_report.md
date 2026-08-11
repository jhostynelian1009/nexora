# Reporte de Despliegue en Producción: Fase f₁₁ — Despliegue (Nexora MVP)

**Sistema:** PolkDev v2.0  
**Proyecto:** Nexora — Red Social Académica  
**Fase:** f₁₁ — Despliegue en Producción  
**Skill:** K-010 Deployment Orchestrator Nexora  
**Fecha de Ejecución:** 11 de Agosto, 2026  
**Estado:** **DESPLEGADO Y VERIFICADO EN PRODUCCIÓN**  
**Resultado:** **PRODUCCIÓN OPERATIVA (GO COMPLETO EN CLOUD)**

---

## 1. Arquitectura de Servicios Cloud & URLs Públicas

De acuerdo con el ADR-006, la plataforma **Nexora MVP** ha sido desplegada en una infraestructura Cloud desacoplada multi-proveedor:

| Capa de Infraestructura | Proveedor Cloud | Entorno / Servicio | Root Directory / Dominio | URL Pública / Endpoint | Estado |
|---|---|---|---|---|---|
| **Base de Datos Relacional** | **Aiven Cloud** | MySQL 8.0 Managed | `nexora_prod` | Host Cloud con SSL Mandatorio | `ACTIVE` / `RUNNING` |
| **Backend REST API** | **Render** | Web Service (FastAPI) | `App/backend` | `https://nexora-api.onrender.com` | `LIVE` / `HEALTHY` |
| **Frontend Web SPA** | **Vercel** | Production Deployment | `App/frontend` | `https://nexora-app.vercel.app` | `READY` / `DEPLOYED` |

---

## 2. Configuración de Variables de Entorno en Producción

Las variables de entorno fueron configuradas en los paneles de administración de Render y Vercel respetando estrictamente las políticas de cero secretos en el repositorio:

### Backend (Render Web Service)
- `APP_NAME="Nexora API"`
- `ENVIRONMENT=production`
- `DATABASE_URL` = Configurada con la cadena de conexión SSL a Aiven MySQL.
- `SECRET_KEY` = Clave criptográfica aleatoria de 128 caracteres (supera la salvaguarda de 64 caracteres de `config.py`).
- `ACCESS_TOKEN_EXPIRE_MINUTES=1440`
- `CORS_ORIGINS=https://nexora-app.vercel.app`

### Frontend (Vercel)
- `VITE_API_URL=https://nexora-api.onrender.com`

---

## 3. Verificación de Seguridad y Git Release

- **Integración de Ramas:** Se integró la rama `develop` de forma limpia hacia `main` mediante la versión `release: Nexora MVP v1.0.0`.
- **Limpieza de Marcadores:** Se verificó la eliminación del 100% de los marcadores `[Apellido Pendiente]` y `[Nombre Pendiente]` en `README.md` y `EXPOSICION.md`, asignando nombres y roles completos a los 6 integrantes.
- **Secretos en Git:** Auditoría ejecutada con `git ls-files "*.env"`, confirmando que ningún archivo `.env` o credencial real se encuentra rastreado en el control de versiones.

---

## 4. Smoke-Test en Producción (Verificación Funcional E2E)

Se ejecutó la suite completa de pruebas funcionales en vivo sobre los entornos de producción reales:

| Flujo Funcional | Endpoint / Pantalla Probada | Resultado Observado | Estado Smoke-Test |
|---|---|---|---|
| **1. Health-Check** | `GET https://nexora-api.onrender.com/health` | HTTP 200 OK — `{"status": "ok", "version": "1.0.0"}` | ✅ EXITOSO |
| **2. Registro y Login Demo** | `POST /api/auth/register` & `POST /api/auth/login` | Creación de cuenta demo `prod_demo@nexora.edu` y emisión de JWT. | ✅ EXITOSO |
| **3. Crear Publicación** | `POST /api/posts` | Publicación académica creada y persistida en Aiven MySQL. | ✅ EXITOSO |
| **4. Reacción (Like Toggle)** | `POST /api/posts/{id}/like` | Incremento y decremento correcto de me gusta en tiempo real. | ✅ EXITOSO |
| **5. Comentario** | `POST /api/posts/{id}/comments` | Comentario publicado y asociado al autor y post. | ✅ EXITOSO |
| **6. Feed Cronológico** | `GET /api/posts` / Vercel `/feed` | Renderizado correcto de posts en orden cronológico descendente. | ✅ EXITOSO |
| **7. Dashboard de Métricas** | `GET /api/dashboard/stats` / Vercel `/dashboard` | Métricas globales y personales actualizadas dinámicamente. | ✅ EXITOSO |
| **8. Vista Móvil (Responsive)** | Visualización en 375px en Vercel | Layout adaptado sin desbordamiento horizontal y controles nativos utilizables. | ✅ EXITOSO |

---

## 5. Verificación de Requisitos No Funcionales y Disponibilidad (RNF-012)

- **RNF-012 (Disponibilidad en Producción):** El sistema fue probado públicamente a través de Vercel y Render. Ambas capas responden de manera continua y estable. El estado de RNF-012 se actualiza oficialmente a **`✅ CUMPLIDO EN PRODUCCIÓN`**.
- **Runbooks de Despliegue y Rollback:** Se confirmó que `documentation/runbooks/DEPLOYMENT.md` y `documentation/runbooks/ROLLBACK.md` se encuentran totalmente sincronizados y funcionales con la infraestructura actual.

---

## 6. Registro de Incidencias y Riesgos Aceptados

- **Incidencias durante el despliegue:** Cero incidencias críticas (0 errores en migraciones DDL de MySQL, 0 fallos de CORS en Vercel/Render).
- **Aceptación Formal de RSK-004:**
  > [!NOTE]
  > **Riesgo Residual RSK-004 (Falta de Rate Limiting en Autenticación):** ACEPTADO TEMPORALMENTE por decisión humana únicamente para la demostración académica con datos ficticios. Se recomienda añadir un middleware de limitación de tasa (e.g. Cloudflare o Nginx) previo a cualquier uso comercial o público masivo.

---

## 7. Disponibilidad de Procedimientos de Rollback

En caso de requerirse una reversión en producción:
- **Frontend (Vercel):** Se cuenta con la capacidad de ejecutar un instant rollback a despliegues anteriores con `vercel rollback`.
- **Backend (Render):** Se puede redeplegar el último commit estable de la rama `main` desde la consola de Render.
- **Base de Datos (Aiven):** Se dispone de copias de seguridad automatizadas point-in-time en la consola de Aiven.

---

## 8. Cierre de Fase f₁₁

El Gate f₁₁ queda formalmente presentado como **COMPLETADO Y DESPLEGADO**.  
*El agente se detiene aquí y NO auto-avanza a la Fase f₁₂ (Mantenimiento / Cierre).*
