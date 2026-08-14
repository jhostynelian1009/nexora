# Nexora Social v2 — Instrucciones para agentes

## Contrato rector

Leer `PromptMaster.md` antes de actuar. Aplicar PolkDev v2.0 y no saltar fases.

La fase actualmente activa es **f₆ — Generación de Código (Corrección Visual y Funcional V2)**, bajo los roles **K-005 Code Generator Nexora** y **K-006 Test Engineer Nexora**. El despliegue (f₁₁) permanece bloqueado hasta autorización explícita humana.

## Lectura obligatoria antes de modificar App

1. `Spec/iterations/v2/V2-S01-Objetivos.md`
2. `Spec/iterations/v2/V2-S02-Alcance.md`
3. `Spec/iterations/v2/V2-S03-Arquitectura.md`
4. `Spec/iterations/v2/V2-S05-Requisitos.md`
5. `Spec/iterations/v2/V2-S06-Backlog.md`
6. `Spec/iterations/v2/V2-S07-Historias.md`
7. `Spec/iterations/v2/V2-S09-ADR.md`
8. `Spec/iterations/v2/V2-S11-Riesgos.md`
9. `Spec/iterations/v2/V2-S12-Metricas.md`
10. `documentation/iterations/v2/f6_v2_gate_report.md`

## Reglas de implementación para Nexora Social v2

- Trabajar exclusivamente en la rama `feature/nexora-social-v2`.
- Mantener React + Vite en `App/frontend` y FastAPI + WebSockets en `App/backend`.
- Usar MySQL 8; no sustituir por SQLite, PostgreSQL, Firebase ni almacenamiento local.
- Permitir y dar soporte completo a las características aprobadas de Nexora Social v2: perfiles públicos, seguidores, chat en tiempo real, notificaciones, subida de imágenes Cloudinary, recuperación de contraseña por OTP/WhatsApp.
- Escribir pruebas unitarias e integrales para cada vertical; ejecutar la suite tras cada modificación.
- Añadir trazabilidad `Ref: RF2-XXX, HU2-XXX, B2-XXX` en módulos relevantes.
- No guardar secretos. Mantener `.env.example` sincronizados sin credenciales reales.
- No cambiar endpoints, tablas o tecnología sin ADR previo.
- Preservar cambios existentes y retrocompatibilidad con v1.

## Comandos de salida esperados

- Backend: `pytest --cov=app --cov-branch --cov-report=term-missing --cov-fail-under=80`, `bandit -r app`.
- Frontend: `npm run lint`, `npm test -- --run` y `npm run build`.
- Alembic: `alembic current`, `alembic heads` y `alembic check` sobre bases finalizadas en `_test`.

## Definición de terminado para la corrección f₆

Código responsive, accesible, sin clases CSS faltantes, cero runtime errors en stderr, suite de pruebas verde con cobertura real ≥ 80% líneas y ≥ 70% ramas, build estático limpio y documentación generada en `documentation/iterations/v2/f6_v2_ui_functional_correction_report.md`. Al completar, detenerse y presentar el informe del Gate f₆ sin autoavanzar a f₇ ni desplegar.
