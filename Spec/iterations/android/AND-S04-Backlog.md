# AND-S04 — Backlog de Trabajo Nexora Android

## 1. Ítems de la Iteración Actual (f6 Android)

| ID | Prioridad | Descripción | Estado |
|---|---|---|---|
| AND-B-001 | Alta | Instalación e inicialización de Capacitor y plugins nativos en `App/frontend` | Completado |
| AND-B-002 | Alta | Configuración de `capacitor.config.ts` y scripts de `package.json` | Completado |
| AND-B-003 | Alta | Abstracción de plataforma y almacenamiento de sesión (`platform.js`, `storage.js`) | Completado |
| AND-B-004 | Alta | Soporte para captura de cámara y galería nativa con `@capacitor/camera` | Completado |
| AND-B-005 | Alta | Integración del manejador del botón Atrás nativo y ciclo de vida (Resume/Pause) | Completado |
| AND-B-006 | Alta | Detección de red y estado offline/online (`@capacitor/network`) | Completado |
| AND-B-007 | Alta | Desarrollo de `AndroidDownloadCard.jsx` e integración en `LoginPage.jsx` con tests unitarios | Completado |
| AND-B-008 | Alta | Ajustes de CSS responsive, teclado nativo y zonas seguras (`safe-area-inset`) | Completado |
| AND-B-009 | Alta | Sincronización y compilación Gradle (`app-debug.apk`) | Completado |
| AND-B-010 | Alta | Generación de reportes y documentación técnica en `documentation/iterations/android/` | Completado |

## 2. Ítems Pendientes para Futuras Iteraciones (Firebase / Release)

| ID | Prioridad | Descripción | Estado |
|---|---|---|---|
| AND-B-011 | Media | Configuración de proyecto Firebase Cloud Messaging (FCM) y obtención de `google-services.json` | Pendiente |
| AND-B-012 | Media | Registro de tokens FCM en FastAPI y envío de Push Notifications con app en background | Pendiente |
| AND-B-013 | Baja | Firma release con Keystore privado y publicación formal en GitHub Releases (`nexora-android.apk`) | Pendiente de Aprobación |
| AND-B-014 | Baja | Integración de Secure Storage nativo mediante Android Keystore | Pendiente |
