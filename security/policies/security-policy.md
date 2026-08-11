# Política de Seguridad — Nexora Platform

**Versión:** 1.0.0  
**Proyecto:** Nexora — Red Social Académica  
**Última actualización:** 11 de Agosto, 2026  
**Aprobado por:** K-007 Security Auditor Nexora

---

## 1. Declaración de Principios

Nexora aplica el principio de **Defensa en Profundidad (Defense in Depth)** y **Mínimo Privilegio (Least Privilege)** para proteger la confidencialidad, integridad y disponibilidad de la información de la comunidad académica universitaria.

---

## 2. Gestión de Credenciales y Autenticación

1. **Hashing de Contraseñas:**
   - Queda estrictamente prohibido el almacenamiento de contraseñas en texto plano o con algoritmos obsoletos (MD5, SHA1).
   - Se requiere el uso de algoritmos modernos y resistentes a ataques de fuerza bruta: **bcrypt** (factor de costo $\ge 12$) o **Argon2id**.

2. **Tokens de Sesión (JWT):**
   - El almacenamiento de tokens se realiza en clientes desacoplados utilizando cabeceras estándar `Authorization: Bearer <token>`.
   - Firma de tokens con algoritmo `HS256` y clave secreta `SECRET_KEY` de mínimo 256 bits (32 caracteres).
   - Expiración de tokens limitada a un máximo de 24 horas (1440 minutos) en entornos normales.

3. **Manejo de Secretos y Configuración:**
   - Prohibido incluir llaves API, claves JWT o contraseñas en el control de versiones (Git).
   - Todos los secretos deben ser inyectados mediante variables de entorno (`.env`).
   - Los archivos `.env` deben ser excluidos explícitamente en `.gitignore`. Solamente se permiten ejemplos vacíos (`.env.example`).

---

## 3. Seguridad en la Capa de Datos (MySQL)

1. **Aislamiento de Entornos de Pruebas:**
   - La suite de pruebas automáticas (`pytest`) se debe ejecutar exclusivamente sobre una base de datos de pruebas dedicada cuyo nombre termine en `_test` (e.g. `nexora_test`).
   - Todos los scripts de prueba deben contar con un mecanismo de protección (**Safety Guard**) que aborte la ejecución si se intenta limpiar una base de datos sin el sufijo `_test`.

2. **Prevención de Inyección SQL:**
   - Las consultas a la base de datos se realizan exclusivamente a través de SQLAlchemy ORM mapeado mediante consultas parametrizadas.
   - Queda prohibida la concatenación directa de cadenas SQL con variables del usuario.

3. **Control de Acceso a Objetos (BOLA / IDOR):**
   - Las operaciones de modificación o eliminación de recursos (publicaciones, comentarios, perfil) deben validar la propiedad explícita mediante la comparación `resource.author_id == current_user.id`.

---

## 4. Validación de Entradas y Sanitización (OWASP)

1. **Sanitización contra XSS:**
   - Todo el contenido ingresado por usuarios (publicaciones, comentarios, perfil) debe ser validado y escapado automáticamente por el motor de renderizado del cliente (React JSX).
   - Queda prohibido el uso de `dangerouslySetInnerHTML` sin sanitización explícita mediante DOMPurify.

2. **Validación de URLs Externas:**
   - Los campos de URLs de imágenes y avatares deben ser validados mediante esquemas Pydantic asegurando que inicien estrictamente con esquemas seguros (`http://` o `https://`).
   - Se rechaza el uso de esquemas inseguros o peligrosos (`javascript:`, `data:`, `file:`, `ftp:`).

---

## 5. Auditoría Continua de Vulnerabilidades

1. **Backend:** Ejecución periódica de `pip-audit` para detectar dependencias vulnerables y `bandit` para análisis estático de código Python.
2. **Frontend:** Ejecución de `npm audit` antes de cada despliegue a producción.

---

## 6. Reporte de Vulnerabilidades

Cualquier vulnerabilidad o fallo de seguridad descubierto debe ser notificado al equipo de seguridad de Nexora antes de su divulgación pública.
