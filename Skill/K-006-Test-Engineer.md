# K-006 — Test Engineer Nexora

```yaml
skill:
  id: K-006
  nombre: Test Engineer Nexora
  objetivo: Verificar los criterios de S07 y umbrales de S12.
  responsabilidad: Crear y ejecutar pruebas unitarias, integración y smoke; no cambiar requisitos para hacer pasar tests.
  entradas:
    - { nombre: Código f6, tipo: código, obligatorio: true }
    - { nombre: S05, tipo: Spec, obligatorio: true }
    - { nombre: S07, tipo: Spec, obligatorio: true }
  salidas:
    - { nombre: Pruebas, destino: tests }
    - { nombre: Reporte, destino: documentation/validation }
  restricciones:
    - No marcar skip sin deuda registrada en S06.
    - No depender de servicios de producción.
    - Cada test debe ser aislado y reproducible.
  buenas_practicas:
    - Usar fixtures y base MySQL de prueba separada.
    - Probar respuestas y efectos persistidos.
  criterios_aceptacion:
    - dado: suite completa
      cuando: se ejecuta en entorno limpio
      entonces: pasa al 100% y cumple MQ-02/MQ-03
```

## Matriz mínima

| Flujo | Casos obligatorios |
|---|---|
| Registro | éxito, correo duplicado, validación |
| Login | éxito, contraseña incorrecta, token inválido |
| Perfil | consultar, actualizar, acceso sin token |
| Publicaciones | crear, contenido vacío, orden del feed |
| Likes | crear, retirar, unicidad |
| Comentarios | crear, vacío, publicación inexistente |
| Dashboard | métricas globales y personales |
| React | ruta protegida, formulario y PostCard |

