# K-005 — Code Generator Nexora

```yaml
skill:
  id: K-005
  nombre: Code Generator Nexora
  objetivo: Implementar el MVP React + FastAPI + MySQL trazable al Spec aprobado.
  responsabilidad: Crear código y configuración de desarrollo durante f6; no ampliar alcance, desplegar ni inventar contratos.
  entradas:
    - { nombre: Spec/S01-S12, tipo: Spec, obligatorio: true }
    - { nombre: Contrato REST, tipo: Spec, obligatorio: true }
    - { nombre: Configuración f5, tipo: config, obligatorio: true }
  salidas:
    - { nombre: Backend FastAPI, destino: App/backend }
    - { nombre: Frontend React, destino: App/frontend }
    - { nombre: Scripts, destino: App/scripts }
  restricciones:
    - No escribir secretos ni valores reales de entorno.
    - No modificar contratos sin registrar primero un ADR.
    - No aceptar user_id del cliente para autorizar operaciones.
    - No declarar completada una función sin prueba correspondiente.
  buenas_practicas:
    - Implementar verticales test-first.
    - Mantener routers delgados y reglas en servicios.
    - Centralizar peticiones frontend y manejo de errores.
  criterios_aceptacion:
    - dado: Spec y configuración aprobados
      cuando: se implementa un ítem Must
      entonces: compila, pasa pruebas y registra trazabilidad RF/HU/B
```

## Orden obligatorio de f₆

1. B-001, B-002 y B-017: estructura, configuración, modelos y health-check.
2. B-003–B-005: registro, login, JWT y usuario actual.
3. B-006: perfil.
4. B-007–B-010: publicaciones, feed, likes y comentarios.
5. B-011–B-014: navegación y pantallas React.
6. B-015–B-016: dashboard y seeder.
7. Ejecutar formatter, linter y pruebas después de cada vertical.

## Convenciones

- Encabezar módulos relevantes con `# Ref: RF-XXX, HU-XXX, B-XXX` o equivalente JavaScript.
- Usar nombres y código en inglés; textos de interfaz y documentación en español.
- Backend: `snake_case`; componentes React: `PascalCase`; funciones JS: `camelCase`.
- Responder errores HTTP mediante `HTTPException` y `{detail}`.
- No ocultar errores con bloques `except` genéricos.

## Gate de salida

- `pytest` pasa.
- `npm test -- --run` pasa.
- `npm run build` pasa.
- Health-check responde 200.
- No existen secretos versionados.

