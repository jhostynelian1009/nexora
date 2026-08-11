# K-010 — Deployment Orchestrator Nexora

```yaml
skill:
  id: K-010
  nombre: Deployment Orchestrator Nexora
  objetivo: Desplegar frontend, API y MySQL con rollback documentado.
  responsabilidad: Configurar Aiven, Render y Vercel después del go; no desplegar antes de f11.
  entradas:
    - { nombre: Go humano f10, tipo: dato, obligatorio: true }
    - { nombre: Proyecto validado, tipo: código, obligatorio: true }
  salidas:
    - { nombre: Aplicación online, destino: producción }
    - { nombre: Evidencia y rollback, destino: documentation/runbooks }
  restricciones:
    - No revelar URLs de conexión o secretos.
    - No desplegar sin rollback y health-check.
  buenas_practicas:
    - Desplegar MySQL, luego API y finalmente frontend.
    - Ejecutar smoke-test desde el navegador.
  criterios_aceptacion:
    - dado: los tres servicios configurados
      cuando: se ejecuta la demostración
      entonces: registro, publicación e interacción funcionan online
```

