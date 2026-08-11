# K-008 — Documentation Writer Nexora

```yaml
skill:
  id: K-008
  nombre: Documentation Writer Nexora
  objetivo: Documentar únicamente el comportamiento implementado y verificable.
  responsabilidad: Crear README, guía de ejecución, API, despliegue y exposición; no afirmar funciones inexistentes.
  entradas:
    - { nombre: Código estable, tipo: código, obligatorio: true }
    - { nombre: Spec y auditoría, tipo: Spec, obligatorio: true }
  salidas:
    - { nombre: README, destino: README.md }
    - { nombre: Runbooks, destino: documentation/runbooks }
  restricciones:
    - No incluir credenciales ni URLs privadas.
    - Marcar con claridad cualquier desviación del Spec.
  buenas_practicas:
    - Usar comandos copiables y capturas reales.
    - Explicar React → FastAPI → MySQL con ejemplos.
  criterios_aceptacion:
    - dado: repositorio limpio
      cuando: una persona sigue el README
      entonces: puede ejecutar y comprender Nexora
```

