# Configuración Backend Render Staging y Manejo de Despertar Gratuito

Ref: AND-RF-002, AND-RF-005, RNF-008, RNF2-004

## 1. Contexto de Despliegue en Render Gratuito

El plan gratuito de Render suspende los servicios backend web tras 15 minutos de inactividad sin recibir tráfico. Al recibir una nueva solicitud HTTP o WebSocket, el proceso de inicio (cold-start) puede tardar entre 45 y 90 segundos.

Para evitar errores prematuros de conexión (`Fallo de conexión con el servidor Nexora`), la aplicación frontend (Web y Android Capacitor) implementa un sistema centralizado de disponibilidad del servidor (`ServerAvailabilityContext`) y estado visual de despertar (`ServerStartupStatus`).

## 2. Variables de Entorno Backend (Render Environment)

El servicio en Render Staging requiere las siguientes variables de entorno (los valores secretos deben ingresarse exclusivamente en la consola de Render):

```env
ENVIRONMENT=staging
PORT=8000
DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>
SECRET_KEY=<generado_al_menos_64_caracteres>
OTP_HMAC_PEPPER=<generado_al_menos_32_caracteres>
CORS_ORIGINS=https://nexora-app.vercel.app,http://localhost:5173,http://localhost
PASSWORD_RESET_PROVIDER=development
WHATSAPP_PROVIDER=console
CLOUDINARY_CLOUD_NAME=<nombre_cloud>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
```

> **Importante**: No usar `*` en `CORS_ORIGINS`. Para Capacitor Android se autoriza `http://localhost` y para la web el dominio HTTPS de Vercel.

## 3. Variables de Entorno Frontend (`.env.android`)

Las plantillas `.env.example` y `.env.android.example` han sido configuradas con el backend staging previsto:

```env
VITE_API_URL=https://nexora-api-v2-staging.onrender.com
VITE_WS_URL=wss://nexora-api-v2-staging.onrender.com
VITE_ANDROID_APK_URL=https://github.com/jhostynelian1009/nexora/releases/latest/download/nexora-android.apk
VITE_ANDROID_VERSION=1.0.0
```

> **Nota de Recompilación**: Cada vez que se cambie la variable `VITE_API_URL` o `VITE_WS_URL`, se debe recompilar el APK nativo (`npm run build:android`, `npx cap sync android`, `.\gradlew.bat assembleDebug`).

## 4. Comando de Inicio Backend en Render

El comando de arranque (Start Command) configurado para Render es:

```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

- Aplica automáticamente las migraciones pendientes de Alembic sobre la base de datos antes de iniciar Uvicorn.
- Escucha en `0.0.0.0` y en el puerto dinámico `$PORT` asignado por la plataforma Render.

## 5. Diseño del Servicio de Disponibilidad y Despertar (`/health`)

1. **Consulta Inicial (`GET /health`)**:
   - Al iniciar la aplicación, se invoca `api.health()` con un timeout extendido de **90 segundos**.
2. **Detección de Cold-Start (`waking`)**:
   - Si la consulta de salud supera los 3 segundos en responder, el estado pasa a `waking`.
   - Se despliega el aviso visual: *"Estamos iniciando el servidor gratuito de Nexora. Esto puede tardar hasta un minuto."*
3. **Control del Botón de Login**:
   - El botón de *Iniciar sesión* permanece deshabilitado en estados `checking`, `waking`, `offline` o `error`.
   - Se habilita automáticamente únicamente cuando `/health` responde con HTTP 200 (`online`).
4. **Preservación del Token JWT**:
   - Los timeouts o errores de conectividad **NO eliminan el token ni la sesión** guardada en `storage`.
   - La eliminación de credenciales ocurre exclusivamente ante un código HTTP `401 Unauthorized` real de una ruta protegida.
5. **Conexión WebSocket Inteligente**:
   - WebSocket (`WebSocketContext`) no intenta abrir conexiones mientras el backend está en proceso de despertar.
   - Conecta únicamente cuando el servidor alcanza el estado `online`.
   - Se reconecta automáticamente al regresar la aplicación al primer plano (`visibilitychange` / `onResume`).
