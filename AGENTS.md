# Nexora — Instrucciones para agentes

## Contrato rector

Leer `PromptMaster.md` antes de actuar. Aplicar PolkDev v2.0 y no saltar fases.

La fase habilitada para el próximo agente es **f₆ — Generación de código**, usando **K-005 Code Generator Nexora**. Las fases f₁–f₅ están completas. No desplegar: f₁₁ permanece bloqueada hasta go humano en f₁₀.

## Lectura obligatoria antes de modificar App

1. `Spec/S03-Arquitectura.md`
2. `Spec/S05-Requisitos.md`
3. `Spec/S06-Backlog.md`
4. `Spec/S07-Historias-de-Usuario.md`
5. `Spec/S09-Decisiones-Tecnicas.md`
6. `Spec/S12-Metricas-de-Calidad.md`
7. `documentation/api/CONTRATO-REST.md`
8. `documentation/architecture/MODELO-DATOS.md`
9. `Skill/K-005-Code-Generator.md`
10. `Skill/K-006-Test-Engineer.md`

## Reglas de implementación

- Trabajar únicamente dentro de `App/`, `tests/`, `security/` y `documentation/`.
- Mantener React en `App/frontend` y FastAPI en `App/backend`.
- Usar MySQL; no sustituir por SQLite, PostgreSQL, Firebase ni almacenamiento local.
- Implementar el backlog Must en orden B-001–B-014 y B-017 antes de ítems Should.
- Escribir test antes o junto a cada vertical; ejecutar la suite tras cada bloque.
- Añadir trazabilidad `Ref: RF-XXX, HU-XXX, B-XXX` en módulos relevantes.
- No ampliar alcance con chat, seguidores, videos, notificaciones o subida de archivos.
- No guardar secretos. Mantener `.env.example` sincronizados.
- No cambiar endpoints, tablas o tecnología sin ADR previo.
- Preservar cambios existentes que no pertenezcan a la tarea.

## Comandos de salida esperados

- Backend: formatter/linter, `pytest` y arranque FastAPI.
- Frontend: lint, tests y `npm run build`.
- Integración: health-check y flujo registro → publicar → like → comentario.

## Definición de terminado para f₆

Código compilable, pruebas unitarias verdes, configuración reproducible, cero secretos y trazabilidad hacia Spec. Al completar, detenerse y presentar el gate de f₆; no autoavanzar a despliegue.

