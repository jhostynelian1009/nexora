# Reporte de Pruebas Nexora Android

Ref: AND-RF-002, AND-RF-005, RNF-008, RNF2-004

## 1. Resumen de Ejecución de Comandos

- **Linter Frontend**: `npm run lint` -> PASÓ (0 errores en ESLint).
- **Pruebas Unitarias Vitest**: `npm test -- --run` -> PASÓ (13 suites, 30 pruebas exitosas).
- **Build Web**: `npm run build` -> PASÓ (Build de producción limpio en `dist/`).
- **Build Android**: `npm run build:android` -> PASÓ (Build de producción mode android).
- **Sincronización Capacitor**: `npx cap sync android` -> PASÓ (7 plugins nativos sincronizados).
- **Compilación Gradle**: `.\gradlew.bat assembleDebug` -> PASÓ (`BUILD SUCCESSFUL in 9s`).
- **APK Generado**: `App/frontend/android/app/build/outputs/apk/debug/app-debug.apk` (Verificado).

## 2. Cobertura de Pruebas de Disponibilidad y Render Cold-Start (`ServerAvailability.test.jsx`)

| Escenario de Prueba | Resultado | Descripción |
|---|---|---|
| 1. Estado inicial de conexión | PASÓ | Realiza consulta de salud `/health` al iniciar. |
| 2. Backend en despertar (`waking`) | PASÓ | Transiciona a `waking` tras 3s de espera e informa al usuario. |
| 3. Respuesta exitosa `/health` | PASÓ | Transiciona a `online` al recibir 200 OK. |
| 4. Timeout de 90 segundos | PASÓ | Configurado timeout extendido de 90s para `/health`. |
| 5. Reintento manual | PASÓ | Botón *Reintentar conexión* reejecuta la comprobación. |
| 6. Dispositivo sin Internet | PASÓ | Detecta desconexión y pasa a estado `offline`. |
| 7. Login deshabilitado en despertar | PASÓ | Botón de *Iniciar sesión* deshabilitado durante `checking`/`waking`. |
| 8. Login habilitado en online | PASÓ | Botón habilitado una vez que el servidor queda disponible. |
| 9. Credenciales inválidas | PASÓ | Muestra mensaje de credenciales erróneas ante 401/400 de login. |
| 10. Preservación de JWT en timeout | PASÓ | Mantiene el token en storage ante timeouts o errores de red. |
| 11. Conexión WebSocket | PASÓ | Inicia WS únicamente cuando el backend alcanza estado `online`. |
| 12. Ausencia de conexiones duplicadas | PASÓ | Evita solicitudes duplicate por React StrictMode o re-renders. |

## 3. Matriz de Cobertura de Funcionalidades Nativas y Web

| Funcionalidad | Plataforma Web | Plataforma Android (Capacitor) | Estado |
|---|---|---|---|
| Detección de Plataforma | Web Native | Capacitor Android Bridge | PASÓ |
| Tarjeta Descargar APK | Visible en Web | Oculta en Capacitor | PASÓ |
| Abstracción de Sesión | LocalStorage | Preferences + MemoryCache | PASÓ |
| Captura de Fotos / Galería | Input File HTML | Camera / Gallery Nativa | PASÓ |
| Botón Atrás Nativo | N/A | Listener de prioridades | PASÓ |
| Estado de Red | Navigator online | Capacitor Network Banner | PASÓ |
| Ciclo de Vida App | N/A | Listener Resume/Pause | PASÓ |
| WebSockets Chat dynamic URL | Dynamic host | Dynamic HTTPS/WSS env | PASÓ |
| Disponibilidad Render | Polling con retry | Polling /health (90s timeout) | PASÓ |
