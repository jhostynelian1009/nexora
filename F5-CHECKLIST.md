# F5 — Checklist de configuración del agente

> Skill: K-004 Agent Configurator | Estado: Configuración preparada; conexión MySQL debe comprobarse en el equipo objetivo

## Entradas

- [x] PromptMaster disponible.
- [x] S01–S12 disponibles.
- [x] S03 y ADR cerrados.
- [x] K-005–K-010 especializadas.
- [x] Backlog mapeado a skills.

## Configuración

- [x] `AGENTS.md` creado.
- [x] Prompt del agente de f₆ creado.
- [x] Esquemas de entorno sin secretos.
- [x] Límites de alcance declarados.
- [x] Orden de implementación declarado.
- [x] Comandos de validación declarados.
- [x] Smoke-test de Python, Node y npm ejecutado.
- [x] Integridad de Spec, Skills y prompt verificada.
- [ ] MySQL iniciado mediante XAMPP y conexión real verificada por el agente de f₆.

## Gate de salida

Python 3.12, Node 24 y npm 11 fueron detectados en el entorno de preparación. El cliente MySQL no está disponible en este workspace, por lo que el agente de codificación debe ejecutar el smoke-test de MySQL en el equipo donde esté activo XAMPP antes de escribir el primer modelo. Si falla, debe reportar bloqueo sin sustituir MySQL por otra base.
