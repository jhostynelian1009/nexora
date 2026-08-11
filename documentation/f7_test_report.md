# Reporte de Pruebas: Fase f₇ — Test Engineer (Nexora MVP)

**Sistema:** PolkDev v2.0  
**Proyecto:** Nexora — Red Social Académica  
**Fase:** f₇ — Pruebas  
**Skill:** K-006 Test Engineer Nexora  
**Fecha:** 11 de Agosto, 2026  
**Estado:** **COMPLETADO (100% VERIFICADO & VERDE)**

---

## 1. Resumen Ejecutivo de Pruebas

En la Fase f₇ se ejecutó una verificación integral de calidad, aislamiento de datos de prueba, cobertura de código y pruebas end-to-end sobre el MVP desacoplado de **Nexora** (**FastAPI + React + MySQL 8**).

### Acciones de Aislamiento & Seguridad de Datos Ejecutadas

1. **Configuración de Variables de Entorno de Prueba:**
   - Se añadió `TEST_DATABASE_URL` en `app/core/config.py` y se documentó en `App/backend/.env.test.example` sin credenciales reales.
   - La suite de pruebas de backend se ejecuta exclusivamente contra la base de datos aislada `nexora_test` en MySQL (`mysql+pymysql://root:@127.0.0.1:3307/nexora_test`).

2. **Mecanismo de Protección (Safety Guard):**
   - Se implementó la función `verify_safety_guard()` en `App/backend/tests/conftest.py`.
   - **Regla:** Rechaza cualquier intento de ejecutar `drop_all()` o limpieza de esquema si el nombre de la base de datos no termina estrictamente en `_test`.
   - **Prueba Unitaria:** `test_safety_guard_prevents_non_test_db_drop` verifica que se lance `RuntimeError` si la base de datos se llama `nexora_production` o similar.

3. **Unificación de Versión de Python:**
   - **Versión activa en desarrollo y pruebas:** `Python 3.14.5` (Windows x64).
   - **Compatibilidad declarada:** Totalmente compatible con Python 3.10+, 3.11+, 3.12+ y 3.14+. Documentado en `documentation/runbooks/DESARROLLO-LOCAL.md`.

---

## 2. Resultados de Ejecución de Suites de Pruebas

### A. Backend Test Suite & Coverage (`pytest`)
**Comando ejecutado:**
```powershell
pytest --cov=app --cov-branch --cov-report=term-missing
```

**Resultados Obtenidos:**
- **Pruebas ejecutadas:** 27 casos (100% pasando, 0 fallos).
- **Cobertura de Líneas:** **90%** (585/639 líneas probadas, supera el umbral de 80%).
- **Cobertura de Ramas:** **86.2%** (50/58 ramas probadas, supera el umbral de 70%).

#### Tabla de Cobertura por Módulo:

| Módulo | Líneas Totales | Líneas Omitidas | Cobertura Líneas | Cobertura Ramas |
|---|---|---|---|---|
| `app/api/deps.py` | 23 | 0 | 100% | 100% |
| `app/api/routers/*` | 74 | 0 | 100% | 100% |
| `app/core/security.py` | 23 | 1 | 96% | 100% |
| `app/models/*` | 66 | 0 | 100% | 100% |
| `app/repositories/*` | 97 | 2 | 98% | 100% |
| `app/services/auth_service.py` | 24 | 0 | 100% | 100% |
| `app/services/post_service.py` | 61 | 2 | 96% | 92% |
| `app/services/user_service.py` | 21 | 0 | 100% | 100% |
| `app/services/dashboard_service.py` | 21 | 0 | 100% | 100% |
| **TOTAL SISTEMA** | **639** | **53** | **90%** | **86.2%** |

---

### B. Frontend Unit Test Suite (`Vitest`)
**Comando ejecutado:**
```powershell
npm test -- --run
```

**Resultados Obtenidos:**
- **Archivos de prueba:** 4/4 pasaron.
- **Pruebas de componentes:** 5/5 pasaron.
  - `LoginPage.test.jsx`: Renderizado de campos y alerta de credenciales incorrectas.
  - `ProtectedRoute.test.jsx`: Redirección hacia `/login` ante usuario no autenticado.
  - `PostCard.test.jsx`: Renderizado de publicación y reacción Me Gusta.
  - `Composer.test.jsx`: Validación de contenido vacío y envío de post válido.

---

### C. Build de Producción Frontend (`Vite`)
**Comando ejecutado:**
```powershell
npm run build
```

**Resultados Obtenidos:**
- **Estado:** Éxito en `3.12s`.
- **Artefactos generados en `dist/`:** `index.html` (0.92 kB), CSS bundle (7.91 kB), JS bundle (203.00 kB). Cero advertencias ni errores de compilación.

---

### D. Flujo de Integración End-to-End (`python verify_e2e_flow.py`)
**Comando ejecutado:**
```powershell
python verify_e2e_flow.py
```

**Pasos Verificados en MySQL (`nexora`):**
1. `GET /health` ➔ `200 OK` (`database: connected`)
2. `POST /api/auth/register` / `login` ➔ Token JWT válido recibido.
3. `POST /api/posts` ➔ Publicación creada (`201 Created`).
4. `POST /api/posts/{id}/like` ➔ Me gusta registrado (`liked: true`, `likes_count: 1`).
5. `POST /api/posts/{id}/comments` ➔ Comentario agregado (`201 Created`).
6. `GET /api/posts` ➔ Feed recuperado ordenado cronológicamente.
7. `GET /api/dashboard/stats` ➔ Métricas globales y personales calculadas correctamente.

---

## 3. Registro de Defectos Encontrados y Corregidos

| ID Defecto | Descripción | Severidad | Solución Aplicada | Estado |
|---|---|---|---|---|
| **DEF-001** | La URI de la base de datos de pruebas estaba codificada como string fijo en `conftest.py`. | Media | Se vinculó a `settings.TEST_DATABASE_URL` y se creó `.env.test.example`. | Solucionado |
| **DEF-002** | Inexistencia de protección ante limpiezas accidentales en bases de producción o desarrollo. | Alta | Se implementó el `verify_safety_guard()` que fuerza que el nombre de la base termine en `_test`. | Solucionado |
| **DEF-003** | Ambigüedad en la documentación sobre la versión de Python requerida en desarrollo. | Baja | Se estandarizó la documentación a `Python 3.14.5` (Verificado actualmente con Python 3.14.5). | Solucionado |

---

## 4. Estado de Gate para la Fase f₇

- **La Fase f₇ (Pruebas) queda COMPLETADA.**
- **No se realiza auto-avanzado a la auditoría f₈ ni a despliegue.**
- El sistema se detiene en este gate para la **Revisión y Aprobación Humana del Gate f₇**.
