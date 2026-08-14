# V2-S12 — Métricas de Calidad de Nexora Social v2

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## Métricas de Aceptación v2

1. **Cobertura Backend:**  
   - Cobertura de líneas $\ge 80\%$.  
   - Cobertura de ramas $\ge 70\%$.

2. **Calidad de Seguridad:**  
   - 0 vulnerabilidades de severidad Alta o Crítica en `pip-audit`.  
   - 0 vulnerabilidades de severidad Alta o Media en `bandit -r app`.  
   - 0 vulnerabilidades en dependencias de producción en `npm audit`.  
   - 0 secretos o JWTs registrados en logs.

3. **Pruebas Frontend:**  
   - Build de producción (`npm run build`) $100\%$ exitoso y libre de errores.  
   - Pruebas unitarias en Vitest pasando al $100\%$.

4. **Integridad de Datos:**  
   - Migración exitosa mediante Alembic desde el esquema v1 sin pérdida de registros existentes.
