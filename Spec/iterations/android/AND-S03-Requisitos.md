# AND-S03 — Requisitos Nexora Android

## 1. Requisitos Funcionales (RF)

| ID | Título | Descripción |
|---|---|---|
| AND-RF-001 | Empaquetado Nativo Capacitor | El frontend React + Vite debe ejecutarse dentro de Capacitor Android WebView empaquetando `dist/` local. |
| AND-RF-002 | Persistencia de Sesión Híbrida | El token JWT debe persistirse usando `@capacitor/preferences` en Android y `localStorage` en Web. |
| AND-RF-003 | Captura de Fotos y Galería | Permitir tomar fotos o seleccionar imágenes mediante `@capacitor/camera` y subirlas a través de FastAPI. |
| AND-RF-004 | Gestión del Botón Atrás | El botón nativo Atrás debe cerrar overlays (modales, lightbox, notificaciones) antes de salir o minimizar. |
| AND-RF-005 | Notificación de Red | Detectar desconexión de red mediante `@capacitor/network` y mostrar un banner no bloqueante con reintento seguro. |
| AND-RF-006 | Ciclo de Vida de la Aplicación | Revalidar sesión y reconectar WebSocket al volver al primer plano (App state Active). |
| AND-RF-007 | Botón de Descarga APK Web | Presentar en `LoginPage.jsx` (Web) un componente visual para descargar `nexora-android.apk` desde GitHub Releases. |
| AND-RF-008 | Detección de Plataforma | Ocultar el botón de descarga del APK cuando la aplicación se ejecute en Capacitor Android. |

## 2. Requisitos No Funcionales (RNF)

| ID | Título | Criterio de Aceptación |
|---|---|---|
| AND-RNF-001 | Tiempos de Respuesta Nativa | La app debe responder a gestos táctiles con un target táctil mínimo de 44px y layout responsive (360px - 480px). |
| AND-RNF-002 | Manejo de Zona Segura | Respetar las zonas seguras del sistema (`safe-area-inset-top` y `safe-area-inset-bottom`). |
| AND-RNF-003 | Seguridad sin Secretos | Ninguna credencial, token o keystore debe almacenarse en el repositorio Git. |
| AND-RNF-004 | Retrocompatibilidad Web | El build Web (`npm run build`) y las pruebas unitarias/integración de Vite deben continuar pasando al 100%. |
| AND-RNF-005 | Compilación Gradle Limpia | `.\gradlew.bat assembleDebug` debe generar el binario `app-debug.apk` sin errores de compilación. |
