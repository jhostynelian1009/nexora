# AND-S02 — Arquitectura Nexora Android

## 1. Visión General de la Arquitectura

Nexora Android adopta una arquitectura híbrida de base de código única. El frontend React + Vite existente en `App/frontend` se empaqueta localmente mediante Capacitor para ejecutarse dentro de un Android WebView nativo.

```text
+-------------------------------------------------------------+
|                     Android Application                     |
|  +-------------------------------------------------------+  |
|  |                 Capacitor WebView                     |  |
|  |  +-------------------------------------------------+  |  |
|  |  |           React + Vite Frontend (dist)          |  |  |
|  |  |  - Auth / Navigation / React Contexts           |  |  |
|  |  |  - Capacitor Plugins (Camera, Preferences, etc) |  |  |
|  |  +-------------------------------------------------+  |  |
|  +-------------------------------------------------------+  |
+----------------------------------|--------------------------+
                                   |
                +------------------+------------------+
                |                                     |
       HTTPS REST API                         WSS WebSocket
                |                                     |
                v                                     v
+-------------------------------------------------------------+
|                    FastAPI Backend                          |
|  - Auth / Posts / Social / Notifications / Chat / Uploads   |
+-------------------------------------------------------------+
                                   |
                                   v
+-------------------------------------------------------------+
|                      MySQL Database                         |
+-------------------------------------------------------------+
```

## 2. Decisiones Clave de Arquitectura

1. **Código Base Unificado**: Mismo frontend React + Vite atendiendo Web y Android WebView.
2. **Distribución del Build Web**: Capacitor empaqueta los archivos compilados estáticos del directorio `dist/`. No se configura `server.url` remoto para no convertir la app en un navegador externo.
3. **Comunicación Backend Explicita**: Se utilizan variables de entorno (`VITE_API_URL` y `VITE_WS_URL`) inyectadas durante el build (`.env.android`). Se prohíbe el uso de `window.location.host` en Android porque apuntaría a `localhost` interno del dispositivo.
4. **CORS Seguro**: El backend FastAPI acepta el origen `http://localhost` configurado en `CORS_ORIGINS`.
5. **Abstracción de Almacenamiento**: Módulo `storage.js` detecta la plataforma e interactúa con `localStorage` en Web o `@capacitor/preferences` en Android.
6. **Subida de Imágenes**: La captura de fotografías nativas vía `@capacitor/camera` o la selección de galería se transforma a un objeto `Blob`/`File` y se procesa mediante los endpoints multipart existentes en FastAPI hacia Cloudinary.
7. **Descarga Web del APK**: La página de login web expone un acceso directo de descarga apuntando a GitHub Releases (`https://github.com/jhostynelian1009/nexora/releases/latest/download/nexora-android.apk`), oculto automáticamente cuando la app corre dentro de Capacitor.
