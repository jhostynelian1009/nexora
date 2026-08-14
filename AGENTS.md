# Nexora Android — Instrucciones para agentes

## Contrato rector

Leer `PromptMaster.md` antes de actuar. Aplicar PolkDev v2.0 y no saltar fases.

La iteración activa es **Nexora Android**, en **fase f₆ — Generación e integración Android**, bajo los roles **K-005 Code Generator Nexora**, **K-006 Test Engineer Nexora** y **Android Integration Engineer**. El despliegue (f₁₁), merge a otras ramas y publicación en Google Play permanecen bloqueados hasta autorización explícita humana.

## Lectura obligatoria antes de modificar App

1. `PromptMaster.md`
2. `AGENTS.md`
3. `Spec/iterations/v2/`
4. `Spec/iterations/android/`
5. `documentation/iterations/v2/f6_v2_gate_report.md`
6. `documentation/iterations/v2/f6_v2_ui_functional_correction_report.md`
7. `documentation/iterations/v2/f7_v2_test_report.md`
8. `App/frontend/package.json`
9. `App/frontend/vite.config.js`
10. `App/frontend/src/services/api.js`
11. `App/frontend/src/utils/websocket.js`

## Reglas de implementación para Nexora Android

- Trabajar exclusivamente en la rama `feature/nexora-android`.
- Frontend compartido: React + Vite (`App/frontend`).
- Runtime Android: Capacitor empaquetando el build `dist` de React localmente.
- Backend conservado: FastAPI + MySQL + WebSockets.
- La versión web debe seguir funcionando intacta.
- Firebase Push permanece fuera del alcance hasta recibir configuración real.
- Escribir pruebas unitarias e integrales para cada vertical; ejecutar la suite tras cada modificación.
- Añadir trazabilidad `Ref: AND-RF-XXX, AND-HU-XXX, AND-B-XXX` en módulos relevantes.
- No guardar secretos. Mantener `.env.example` y `.env.android.example` sincronizados sin credenciales reales.
- No cambiar endpoints, tablas o tecnología sin ADR previo.
- Preservar cambios existentes y retrocompatibilidad.

## Comandos de salida esperados

- Backend: `pytest --cov=app --cov-branch --cov-report=term-missing --cov-fail-under=80`, `bandit -r app`.
- Frontend Web: `npm run lint`, `npm test -- --run` y `npm run build`.
- Frontend Android: `npm run build:android`, `npx cap sync android`, `npx cap doctor`.
- Gradle Android: `.\gradlew.bat assembleDebug` en `App/frontend/android/`.

## Definición de terminado para la fase f₆ Android

Código responsive, accesible, Capacitor integrado con `App/frontend/android/` generado, botón de descarga de APK en login web (desde GitHub Release), suite de pruebas verde, build estático limpio y APK `app-debug.apk` compilado exitosamente. Al completar, detenerse y presentar el informe del Gate f₆ Android sin autoavanzar ni desplegar.
