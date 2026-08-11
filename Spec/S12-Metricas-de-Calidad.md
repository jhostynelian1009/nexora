# S12 — Métricas de calidad

| ID | Métrica | Umbral de aceptación | Evidencia |
|---|---|---|---|
| MQ-01 | Requisitos Must implementados | 100% | Matriz de trazabilidad |
| MQ-02 | Tests críticos exitosos | 100% | Reporte Pytest/Vitest |
| MQ-03 | Cobertura backend | ≥80% líneas, ≥70% ramas cuando la herramienta lo reporte | Coverage |
| MQ-04 | Defectos bloqueantes | 0 abiertos | Reporte f₁₀ |
| MQ-05 | Vulnerabilidades críticas/altas sin mitigar | 0 | Auditoría f₈ |
| MQ-06 | Tiempo de respuesta API en demo | p95 <800 ms | Smoke/benchmark |
| MQ-07 | Responsive | Sin overflow a 375 px y 1280 px | Capturas/QA |
| MQ-08 | Health-check online | HTTP 200 | Evidencia f₁₁ |
| MQ-09 | Reproducibilidad | README ejecutado desde entorno limpio | Checklist |
| MQ-10 | Trazabilidad | 100% RF Must enlazados a backlog, código y test | Matriz f₁₀ |

