# AND-S01 — Alcance de la Iteración Nexora Android

## 1. Contexto y Objetivos

El objetivo principal de esta iteración es expandir la experiencia de **Nexora Social v2** hacia dispositivos Android utilizando **Capacitor** para empaquetar el frontend compartido de React + Vite en un contenedor WebView nativo, manteniendo el backend existente basado en FastAPI + MySQL + WebSockets.

Adicionalmente, se añade el requisito de ofrecer un enlace/botón de descarga directa del APK de Android desde la pantalla de inicio de sesión de la versión Web (`LoginPage.jsx`), apuntando al asset binario oficial hosted en GitHub Releases (`https://github.com/jhostynelian1009/nexora/releases/latest/download/nexora-android.apk`).

## 2. Definición del Alcance (IN / OUT)

### IN (Dentro del alcance)
- Integración de `@capacitor/core`, `@capacitor/android`, y plugins asociados (`app`, `status-bar`, `splash-screen`, `keyboard`, `network`, `preferences`, `camera`).
- Inicialización y generación del directorio `App/frontend/android/` como parte del código fuente bajo control de versiones.
- Configuración de `capacitor.config.ts` empaquetando el artefacto web empaquetado `dist/`.
- Abstracción de almacenamiento para token JWT (Web -> `localStorage`, Android -> `Preferences`).
- Manejo del botón nativo Atrás (cerrar overlays/modales antes de salir o minimizar).
- Adaptación para teclado y zona segura (`safe-area-inset`).
- Manejo de estado de red (`Network`) con alertas no bloqueantes y reintento seguro.
- Reconexión y gestión del ciclo de vida (Foreground/Background) para WebSocket de chat y notificaciones.
- Integración de Cámara y Galería nativas mediante `@capacitor/camera` con fallback HTML en Web.
- Formateo y soporte para descarga de APK en la interfaz de Login Web (`AndroidDownloadCard.jsx`).
- Scripts NPM en `package.json` (`build:android`, `android:sync`, `android:open`, `android:run`).
- Compilación del APK debug (`app-debug.apk`) con Gradle.
- Documentación completa en `Spec/iterations/android/` y `documentation/iterations/android/`.

### OUT (Fuera del alcance)
- Notificaciones Push en segundo plano con app cerrada vía Firebase Cloud Messaging (FCM). *(Queda marcado explícitamente como PENDIENTE DE FIREBASE CLOUD MESSAGING Y CREDENCIALES REALES)*.
- Reescritura del frontend en Kotlin, Java, Flutter o React Native.
- Modificaciones sobre la base de datos MySQL o alteración de esquemas de tablas existentes.
- Publicación o automatización de subida a Google Play Store / Vercel / Render / Aiven.
- Integración de Secure Storage basado en Android Keystore (documentado como mejora futura).
