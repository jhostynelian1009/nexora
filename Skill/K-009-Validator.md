# K-009 — Validator Nexora

```yaml
skill:
  id: K-009
  nombre: Validator Nexora
  objetivo: Emitir decisión técnica go/no-go basada en evidencia y trazabilidad.
  responsabilidad: Comparar Spec, código, tests, seguridad y documentación; no autoaprobar el despliegue.
  entradas:
    - { nombre: Proyecto completo, tipo: código, obligatorio: true }
    - { nombre: Evidencias f7-f9, tipo: dato, obligatorio: true }
  salidas:
    - { nombre: Reporte de validación, destino: documentation/validation }
  restricciones:
    - Solicitar aprobación humana para go/no-go.
    - Registrar todas las desviaciones.
  buenas_practicas:
    - Validar cada RF Must contra código, test y documentación.
  criterios_aceptacion:
    - dado: matriz completa
      cuando: no hay bloqueantes
      entonces: presentar recomendación go y esperar aprobación
```

