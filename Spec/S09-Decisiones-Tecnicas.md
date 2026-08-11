# S09 — Decisiones técnicas

> Estado: ADR cerrados en f₃ | Skill: K-002 Architecture Designer

## ADR-001 — Monorepo cliente-servidor

- **Contexto:** React y FastAPI son obligatorios y deben demostrarse como capas separadas.
- **Opciones:** repositorios separados; monorepo; monolito sirviendo React.
- **Decisión:** monorepo con `App/frontend` y `App/backend` desplegables por separado.
- **Consecuencias:** coordinación y trazabilidad simples; exige configurar dos servicios.
- **Ref:** RNF-008, RNF-010.

## ADR-002 — React con Vite y JavaScript

- **Contexto:** el plazo prioriza velocidad y la rúbrica no exige TypeScript.
- **Opciones:** CRA; Vite/JavaScript; Vite/TypeScript; Next.js.
- **Decisión:** React + Vite + JavaScript + React Router; CSS propio y Lucide React.
- **Consecuencias:** configuración mínima y entrega rápida; menor verificación estática que TypeScript.
- **Ref:** RF-018, RNF-001, RNF-011.

## ADR-003 — SQLAlchemy 2 y MySQL

- **Contexto:** MySQL es preferencia del stakeholder y XAMPP está disponible localmente.
- **Opciones:** SQL directo; SQLModel; SQLAlchemy 2.
- **Decisión:** SQLAlchemy 2 con PyMySQL y modelos declarativos; creación idempotente para el MVP.
- **Consecuencias:** separación clara y cambio de URL por entorno; migraciones Alembic quedan como mejora posterior.
- **Ref:** RF-001–RF-016, RNF-008, RNF-010.

## ADR-004 — JWT Bearer y hash bcrypt

- **Contexto:** SPA y API se despliegan en dominios distintos.
- **Opciones:** cookies de sesión; JWT en cookie; JWT Bearer.
- **Decisión:** JWT Bearer de 24 horas y bcrypt mediante `pwdlib`; el cliente conserva la sesión en almacenamiento local durante el MVP.
- **Consecuencias:** integración simple; requiere mitigar XSS y retirar el token al cerrar sesión.
- **Ref:** RF-003–RF-005, RF-017, RNF-003, RNF-004.

## ADR-005 — Imágenes mediante URL

- **Contexto:** almacenamiento binario no es requisito y excede cinco horas.
- **Opciones:** disco local; object storage; URL externa.
- **Decisión:** URL HTTPS opcional validada por Pydantic y fallback visual.
- **Consecuencias:** evita infraestructura; la disponibilidad depende del origen externo.
- **Ref:** RF-008, OUT-02.

## ADR-006 — Vercel, Render y Aiven

- **Contexto:** se requiere despliegue público y MySQL.
- **Opciones:** VPS único; Railway completo; servicios separados.
- **Decisión:** Vercel para Vite, Render para FastAPI y Aiven Free para MySQL.
- **Consecuencias:** despliegue claro por capas; requiere configurar CORS y tres entornos.
- **Ref:** OBJ-05, RNF-008, RNF-012.

## ADR-007 — Estrategia de pruebas

- **Contexto:** PromptMaster exige test-first y cobertura mínima.
- **Opciones:** pruebas manuales; backend únicamente; pirámide mínima.
- **Decisión:** Pytest/TestClient para dominio y endpoints; Vitest/Testing Library para componentes críticos; smoke E2E documentado.
- **Consecuencias:** mayor confianza dentro del plazo; E2E automatizado completo queda diferido.
- **Ref:** RNF-007, S12 MQ-02, MQ-03.

## ADR-008 — API bajo `/api`

- **Contexto:** solo existe una versión académica del MVP.
- **Opciones:** `/api`; `/api/v1`; GraphQL.
- **Decisión:** REST JSON bajo `/api`; se reserva `/health`, `/docs` y `/openapi.json` para operación.
- **Consecuencias:** URLs cortas; una ruptura futura requerirá introducir `/api/v2`.
- **Ref:** RF-020, RNF-006.

