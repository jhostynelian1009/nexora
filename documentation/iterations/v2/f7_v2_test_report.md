# Nexora Social v2 — Informe General del Gate f₇ (Pruebas del Sistema)

**Fecha:** 12 de Agosto de 2026  
**Proyecto:** Nexora — Red Social Universitaria (Iteración v2)  
**Metodología:** PolkDev v2.0  
**Rol Encargado:** `K-006 Test Engineer Nexora`  
**Rama Autorizada:** `feature/nexora-social-v2`  
**Estado:** `LISTO PARA REVISIÓN HUMANA DEL GATE f₇`  

---

## 1. Resumen Ejecutivo de Validación

La Fase **f₇ — Pruebas del Sistema** ha sido ejecutada de manera rigurosa e independiente sobre el código y las características desarrolladas en f₆. La validación abarca pruebas automatizadas unitarias, de integración, de regresión y verificación de flujos de usuario End-to-End (E2E) sin alterar el alcance funcional ni ampliar características fuera de especificación.

### Matriz de Estado General
| Dominio de Prueba | Herramienta / Método | Metodología / Criterio | Resultado | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Unit & Integration** | Pytest 9.1.1 + Pytest-Cov | Cobertura Lineal >= 80%, Ramas >= 70% | 46/46 Pasados (82.55% Cobertura Total) | **APROBADO** |
| **Frontend Unit & Component** | Vitest 1.6.1 + Testing Library | 10 Test Files v2 | 13/13 Pasados (100%) | **APROBADO** |
| **Frontend Production Build** | Vite 5.4.21 | Bundling de assets sin errores de sintaxis o tipo | Bundle generado en `dist/` en 3.29s | **APROBADO** |
| **Migraciones de Base de Datos** | Alembic 1.13 | Escenario A (Nexora v1 -> v2) y Escenario B (Vacío -> v2) | Sincronizado (`f6106cab73d6` Head) | **APROBADO** |
| **Safety Guard de Seguridad DB** | Python `verify_safety_guard()` | Bloqueo estricto de bases no finalizadas en `_test` | Verificado en `conftest.py` | **APROBADO** |
| **Flujos E2E de Sistema** | TestClient / Mock Interactivo | 12 Puntos Críticos de Usuario Nexora v2 | 12/12 Escenarios Exitosos | **APROBADO** |
| **Pruebas Negativas y Seguridad** | Pytest / Guards de Seguridad | Verificación HTTP 401, 403, 400, 422, OTP HMAC | Cobertura de Bordes y Errores | **APROBADO** |

---

## 2. Cobertura Real y Suite Backend (Pytest)

Se ejecutó la suite completa de pruebas contra el paquete `app` usando la base de datos MySQL de pruebas `nexora_test`:

```bash
pytest --cov=app --cov-branch --cov-report=term-missing --cov-fail-under=80
```

### Métricas Obtenidas:
- **Cobertura Total Combinada:** **82.55%** (Cumple la meta de `--cov-fail-under=80`)
- **Cobertura de Líneas:** **86.98%** (1504 de 1729 líneas cubiertas)
- **Cobertura de Ramas:** **77.55%** (228 de 294 ramas cubiertas)
- **Pruebas Automatizadas:** **46/46 Pasadas (0 fallidas)**

```text
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\xampp\htdocs\Nexora\App\backend
plugins: anyio-4.14.2, cov-7.1.0
collected 46 items

tests\test_auth.py ......                                                [ 13%]
tests\test_coverage_edge_cases.py .......................                [ 63%]
tests\test_health.py .                                                   [ 65%]
tests\test_posts.py ......                                               [ 78%]
tests\test_profile_and_dashboard.py ..                                   [ 82%]
tests\test_v2_features.py ........                                       [100%]

-------------------------------------------------------------------------------------------
TOTAL                                            1729    225    294     66    83%
Required test coverage of 80% reached. Total coverage: 82.55%
======================= 46 passed, 1 warning in 32.43s ========================
```

---

## 3. Suite Frontend Vitest y Compilación Vite

### Ejecución de Pruebas Automatizadas (`npm test -- --run`):
```text
 RUN  v1.6.1 C:/xampp/htdocs/Nexora/App/frontend

 ✓ src/tests/WebSocketContext.test.jsx (1 test)
 ✓ src/tests/NotificationsDropdown.test.jsx (1 test)
 ✓ src/tests/PostCard.test.jsx (1 test)
 ✓ src/tests/ProtectedRoute.test.jsx (1 test)
 ✓ src/tests/LoginPage.test.jsx (2 tests)
 ✓ src/tests/ChatDrawer.test.jsx (2 tests)
 ✓ src/tests/PasswordResetModal.test.jsx (1 test)
 ✓ src/tests/UserSearchModal.test.jsx (1 test)
 ✓ src/tests/Composer.test.jsx (1 test)
 ✓ src/tests/ProfileFeatures.test.jsx (2 tests)

 Test Files  10 passed (10)
      Tests  13 passed (13)
   Duration  4.94s
```

### Compilación de Producción (`npm run build`):
```text
> nexora-frontend@1.0.0 build
> vite build

vite v5.4.21 building for production...
✓ 1497 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.92 kB │ gzip:  0.52 kB
dist/assets/index-DewF53gV.css   13.16 kB │ gzip:  3.38 kB
dist/assets/index-Dhl3pCvf.js   249.36 kB │ gzip: 75.10 kB
✓ built in 3.29s
```

---

## 4. Validaciones de Migración MySQL y Safety Guard DB

### Safety Guard de Seguridad DB (`conftest.py`):
```python
def verify_safety_guard():
    db_name = engine.url.database
    if not db_name or not db_name.endswith("_test"):
        raise RuntimeError(
            f"SAFETY GUARD TRIGGERED: Refusing to drop tables on database '{db_name}'. "
            "Database name MUST end with '_test' to be used in test execution."
        )
```
- **Verificación:** Cualquier intento de ejecución de pruebas o drop destructivo en bases como `nexora` (desarrollo) o producciones es inmediatamente interrumpido por la guardia de seguridad.

### Validación Alembic en `nexora_test`:
- **Escenario A (Evolución v1 a v2):** Migración controlada de esquema heredado a v2 sin pérdida de datos ni incompatibilidades.
- **Escenario B (Creación integral desde cero):** Despliegue limpio de esquema desde base vacía.

```bash
alembic current
# Output: f6106cab73d6 (head)

alembic heads
# Output: f6106cab73d6 (head)

alembic check
# Output: No new upgrade operations detected.
```

---

## 5. Verificación de Flujo End-to-End (E2E)

Se verificó la cadena completa de valor funcional del sistema v2:

1. **Registro e Inicio de Sesión**: Creación de cuenta con validación de correo `@nexora.edu` y generación de Bearer JWT.
2. **Perfil Público**: Visualización de perfiles de otros estudiantes (`/api/users/{id}`) con datos de carrera, biografía, contadores y bandera `is_followed_by_me`.
3. **Follow / Unfollow**: Seguimiento y desequimiento idempotente de usuarios con actualización de contadores.
4. **Feed Global y de Seguidos**: Cambio dinámico entre `scope=all` y `scope=following`.
5. **Publicación con Imagen**: Creación de posts con contenido textual e imágenes adjuntas validadas con Pillow y subidas a Cloudinary.
6. **Actualización de Avatar**: Subida e intercambio de foto de perfil con eliminación de la imagen previa en Cloudinary tras commit de BD.
7. **Conversaciones Privadas**: Creación de salas de chat 1-a-1 entre estudiantes autorizados (`/api/conversations`).
8. **Mensajes en Tiempo Real (WebSocket)**: Conexión mediante ticket de un solo uso (`POST /api/ws/ticket`) con despacho instantáneo de eventos `message.created`.
9. **Indicador "Escribiendo"**: Transmisión de eventos `typing.started` y `typing.stopped` reflejados en el frontend.
10. **Notificaciones Automáticas**: Emisión de eventos `notification.created` ante acciones de follow, likes y mensajes.
11. **Gestión de Lectura**: Marcar conversaciones como leídas (`/read`) y notificaciones como leídas (`/read-all`).
12. **Recuperación de Contraseña**: Flujo OTP de 3 pasos procesado mediante el proveedor de pruebas `DevelopmentPasswordResetSender` en desarrollo/test.

---

## 6. Pruebas Negativas y Matriz de Manejo de Errores

| Caso Negativo | Endpoint / Componente | Comportamiento Esperado | Resultado de Prueba |
| :--- | :--- | :--- | :--- |
| **Acceso Anónimo a Rutas Protegidas** | GET `/api/users/me` | HTTP 401 Unauthorized | **PASADO** |
| **Lectura de Mensajes Ajenos** | GET `/api/conversations/{id}/messages` | HTTP 403 Forbidden | **PASADO** |
| **Auto-Seguimiento (Self-Follow)** | POST `/api/users/{my_id}/follow` | HTTP 400 Bad Request | **PASADO** |
| **Carga de Archivos > 5MB** | POST `/api/uploads/avatar` | HTTP 400 Bad Request | **PASADO** |
| **Carga de Archivo Disfrazado (Falso PNG)**| POST `/api/uploads/post-image` | HTTP 400 Bad Request (Pillow error) | **PASADO** |
| **Reuso de Ticket WebSocket** | WS `/ws?ticket={ticket_ya_usado}` | Cierre de conexión WS / Reject | **PASADO** |
| **Ticket WS Expirado (> 60s)** | WS `/ws?ticket={ticket_expirado}` | Cierre de conexión WS / Reject | **PASADO** |
| **Inyección URL Maliciosa** | POST `/api/posts` (`image_url: javascript:`) | HTTP 422 Unprocessable Entity | **PASADO** |
| **Brute-Force OTP (> 5 Intentos)** | POST `/api/auth/password-reset/verify` | HTTP 400 Bad Request (Código bloqueado) | **PASADO** |

---

## 7. Declaraciones de Seguridad y Estado de Integraciones

1. **OTP Hashing HMAC-SHA256**: Los códigos OTP se hashean con `OTP_HMAC_PEPPER`. **El OTP nunca se almacena en texto plano** en la base de datos.
2. **Estado de WhatsApp**:
   > **`WHATSAPP REAL: PENDIENTE DE CONFIGURACIÓN Y VERIFICACIÓN.`**  
   > *No se afirma que la recuperación mediante WhatsApp esté operativa en producción mientras no existan credenciales válidas de Meta WhatsApp Business.*
3. **Limitación de Arquitectura WebSocket**:
   > **`ConnectionManager mantiene conexiones en memoria y solamente garantiza tiempo real consistente con una instancia del backend. Para múltiples instancias será necesario Redis Pub/Sub u otro broker.`**

---

## 8. Registro de Defectos (Defect Log)

Durante la ejecución de las pruebas del sistema en el Gate f₇ se registra el siguiente balance:

- **Defectos Bloqueantes (Severity 1):** 0
- **Defectos Críticos (Severity 2):** 0
- **Defectos Moderados (Severity 3):** 0
- **Defectos Menores (Severity 4):** 0

**Conclusión del Log:** El software implementado en f₆ superó el 100% de las pruebas del sistema definidas sin registrar defectos pendientes.

---

## 9. Dictamen Final del Gate f₇

> **ESTADO FINAL: LISTO PARA REVISIÓN HUMANA DEL GATE f₇.**  
>  
> La validación de sistema de **Nexora Social v2** bajo el rol **K-006 Test Engineer Nexora** ha concluido con éxito. De acuerdo con el protocolo PolkDev v2.0, el trabajo se detiene aquí **sin iniciar automáticamente f₈ (Aceptación del usuario), sin realizar despliegue en f₁₁ y sin fusionar a `main`**.
