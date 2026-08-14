# AND-S05 — ADR-010: Adopción de Capacitor para Runtime Nativo Android

## Estado
Aprobado

## Contexto
Nexora Social v2 cuenta con una aplicación web React + Vite madura, totalmente responsive y con soporte de chat WebSocket, notificaciones y carga de medios. Se requiere ofrecer una experiencia nativa instalable en Android preservando la base de código actual y evitando la duplicación de esfuerzo que implicaría una reescritura en Kotlin o React Native.

## Opciones Consideradas
1. **Reescritura completa en Kotlin / Jetpack Compose**: Proporciona el máximo rendimiento nativo, pero invalida la reutilización de componentes UI y lógica existente de React.
2. **React Native**: Requiere rehacer toda la capa visual (componentes JSX web como `div`, `span`, CSS puro no son directamente compatibles).
3. **PWA en WebView / TWA (Trusted Web Activity)**: Depende de alojamiento web público remoto y no permite el empaquetado 100% offline del paquete frontend en el APK.
4. **Ionic Capacitor**: Permite empaquetar directamente el build estático de React + Vite (`dist/`) dentro de un contenedor WebView liviano y proporciona un puente (Bridge) JS/Nativo mediante plugins oficiales manteniéndose 100% compatible con el desarrollo web actual.

## Decisión
Adoptar **Capacitor 7** como runtime nativo para Android en `App/frontend`.

## Consecuencias

### Positivas
- 100% de reutilización del frontend React + Vite actual.
- Una única base de código para Web y Android.
- Acceso a APIs nativas (Cámara, Red, Preferencias, Botón Atrás, Teclado) vía plugins de Capacitor.
- Empaquetado local de assets sin dependencia de `server.url` remoto.
- Facilidad para generar APKs de depuración mediante Gradle de manera local.

### Negativas / Desafíos
- Las notificaciones Push en segundo plano requieren la integración de Firebase Cloud Messaging y credenciales nativas (`google-services.json`), lo cual se pospone hasta contar con la infraestructura configurada.
- Es necesario abstraer los accesos a almacenamiento web (`localStorage` vs `Preferences`) y manejar adaptaciones visuales específicas de WebView (zonas seguras, comportamento de teclado).
