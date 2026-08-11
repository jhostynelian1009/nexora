# S11 — Registro de riesgos

| ID | Riesgo | P | I | Mitigación | Responsable |
|---|---|---:|---:|---|---|
| R-01 | Exceder cinco horas | Alta | Alto | Alcance Must-first y sin extras | Líder |
| R-02 | Despliegue tardío o fallido | Media | Alto | Preparar configuración desde f₅ | Backend |
| R-03 | Error de conexión MySQL/TLS | Media | Alto | Probar URL online antes de f₆ | Backend |
| R-04 | CORS incorrecto | Media | Medio | Orígenes por variable y smoke-test | Backend |
| R-05 | Secreto en GitHub | Baja | Alto | `.gitignore`, escaneo y `.env.example` | Seguridad |
| R-06 | Contrato frontend/API divergente | Media | Alto | Esquemas y cliente centralizado | Integración |
| R-07 | Dependencia vulnerable | Media | Alto | `pip-audit` y `npm audit` en f₈ | Seguridad |
| R-08 | UI móvil deficiente | Media | Medio | Prueba a 375 px antes de f₁₀ | Frontend |
| R-09 | Datos demo insuficientes | Baja | Medio | Seeder reproducible | Backend |
| R-10 | Participación grupal poco clara | Media | Medio | Reparto de exposición y commits | Equipo |

