# PUSH ANDROID EN SEGUNDO PLANO: PENDIENTE DE FIREBASE CLOUD MESSAGING Y CREDENCIALES REALES

## Declaración Obligatoria
> PUSH ANDROID EN SEGUNDO PLANO: PENDIENTE DE FIREBASE CLOUD MESSAGING Y CREDENCIALES REALES.

## Estado Actual de Notificaciones

### Incluido en esta fase (f6 Android)
- Notificaciones internas persistidas en MySQL.
- Actualización en tiempo real mediante WebSocket cuando la aplicación está abierta.
- Badge interno en la interfaz del usuario.
- Actualización automática al volver al primer plano (App State Active).

### Pendiente de Firebase Cloud Messaging (FCM)
- Notificaciones Push con la aplicación cerrada o en segundo plano.
- Integración del archivo de credenciales nativo `google-services.json`.
- Instalación de `@capacitor/push-notifications`.

## Backlog para la Fase Firebase

1. **Paso 1**: Crear proyecto en la consola de Firebase.
2. **Paso 2**: Registrar el paquete Android `com.nexora.social`.
3. **Paso 3**: Descargar e incluir `google-services.json` en `App/frontend/android/app/`.
4. **Paso 4**: Registrar tokens FCM en el backend FastAPI (`POST /api/notifications/fcm-token`).
5. **Paso 5**: Implementar el envío de notificaciones push FCM desde el backend FastAPI.
6. **Paso 6**: Solicitar permisos de notificación nativos en Android 13+ (POST_NOTIFICATIONS).
7. **Paso 7**: Renovar e invalidar tokens FCM según sesión.
