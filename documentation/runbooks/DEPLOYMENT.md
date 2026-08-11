# Runbook de Despliegue (Deployment Runbook) — Nexora

**Sistema:** PolkDev v2.0  
**Proyecto:** Nexora — Red Social Académica  
**Documento:** `documentation/runbooks/DEPLOYMENT.md`  
**Estrategia de Despliegue Principal (ADR-006):** Cloud Multi-Servidor (Aiven → Render → Vercel)  
**Versión:** 2.0.0

---

## 1. Visión General de la Arquitectura de Despliegue (ADR-006)

Nexora utiliza un esquema PaaS/Serverless desacoplado multi-proveedor para garantizar alta disponibilidad, aislamiento de servicios y administración zero-ops:

```
[ Frontend: Vercel ]  ──(HTTP REST / VITE_API_URL)──►  [ Backend: Render ]  ──(MySQL Connection / DATABASE_URL)──►  [ Base de Datos: Aiven ]
```

---

## 2. Orden Secuencial de Despliegue Obligatorio

Para asegurar la correcta inyección de variables de entorno y conectividad entre capas, el despliegue DEBE realizarse en el siguiente orden secuencial:

```
1. Base de Datos (Aiven MySQL) ──► 2. Backend API (Render FastAPI) ──► 3. Frontend SPA (Vercel React)
```

---

## 3. Guía Paso a Paso de Configuración por Servicio

### Paso 1: Aprovisionar Base de Datos MySQL en Aiven

1. Crear un servicio MySQL 8.0 en la plataforma **Aiven** (o Aiven for MySQL).
2. Crear la base de datos de producción llamada `nexora`.
3. Obtener la cadena de conexión SSL producida por Aiven.
4. **Formato de `DATABASE_URL`:**
   ```text
   mysql+pymysql://avnadmin:<DB_PASSWORD>@<AIVEN_HOST>:<AIVEN_PORT>/nexora?ssl_ca=/etc/ssl/certs/ca-certificates.crt
   ```

---

### Paso 2: Desplegar Backend FastAPI en Render

1. En la consola de **Render**, crear un nuevo **Web Service** conectado al repositorio de GitHub.
2. Configurar los parámetros del servicio:
   - **Name:** `nexora-backend-api`
   - **Root Directory:** `App/backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Variables de Entorno en Render:**

| Variable | Valor de Ejemplo / Descripción |
|---|---|
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | `mysql+pymysql://avnadmin:***@aiven-host:port/nexora` |
| `TEST_DATABASE_URL` | `mysql+pymysql://avnadmin:***@aiven-host:port/nexora_test` |
| `SECRET_KEY` | `a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8` ($\ge 64$ caracteres) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `CORS_ORIGINS` | `https://nexora-frontend.vercel.app` (Dominio asignado por Vercel) |

> [!IMPORTANT]
> El Production Config Guard en `app/core/config.py` validará automáticamente al iniciar el Web Service en Render que `ENVIRONMENT=production` y que `SECRET_KEY` posea al menos 64 caracteres sin placeholders.

---

### Paso 3: Desplegar Frontend React/Vite en Vercel

1. En la consola de **Vercel**, importar el proyecto desde GitHub.
2. Configurar los parámetros del proyecto:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `App/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Variables de Entorno en Vercel:**

| Variable | Valor | Descripción |
|---|---|---|
| `VITE_API_URL` | `https://nexora-backend-api.onrender.com` | URL pública desplegada del servicio Render |

4. Desplegar el proyecto en Vercel. Una vez asignado el dominio público (e.g. `https://nexora-frontend.vercel.app`), actualizar la variable `CORS_ORIGINS` en el backend de Render con dicho dominio exacto.

---

## 4. Verificación de Salud Post-Despliegue (Smoke Test)

Una vez completado el flujo Aiven → Render → Vercel, ejecutar las siguientes verificaciones:

1. **Verificar Backend & Conexión a Base de Datos en Aiven:**
   ```bash
   curl -f https://nexora-backend-api.onrender.com/health
   ```
   **Respuesta esperada (HTTP 200 OK):**
   ```json
   {
     "status": "ok",
     "app": "Nexora API",
     "environment": "production",
     "database": "connected"
   }
   ```

2. **Verificar Frontend SPA & Flujo Completo:**
   - Abrir el navegador en `https://nexora-frontend.vercel.app`.
   - Probar flujo completo: Registro ➔ Publicar Post ➔ Dar Me Gusta ➔ Comentar ➔ Consultar Dashboard.

---

## 5. Alternativa Secundaría (Despliegue VPS Tradicional)

Como alternativa secundaria de respaldo (Self-Hosted VPS con Nginx / Uvicorn / Systemd), consulte la guía legacy en el repositorio para configuraciones locales o de infraestructura propia.
