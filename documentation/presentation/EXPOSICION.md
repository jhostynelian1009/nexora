# Guía de Exposición y Demostración Técnica — Nexora Platform

**Sistema:** PolkDev v2.0  
**Proyecto:** Nexora — Red Social Académica  
**Documento:** `documentation/presentation/EXPOSICION.md`  
**Duración Total Estimada:** **20 a 25 minutos**  
**Versión:** 2.0.0 (Actualizada para 6 Integrantes y Despliegue Cloud Aiven/Render/Vercel)

---

## 1. Distribución de la Exposición por Integrantes (6 Expositores)

| Integrante / Rol | Tema Asignado | Tiempo | Contenido Principal |
|---|---|---|---|
| **Integrante 1** (Jhostyn Elian Benavides) | **1. Introducción, Problema y Objetivo** | 4 mins | Contexto universitario, fragmentación de la comunicación académica, visión del producto Nexora y objetivos del MVP. |
| **Integrante 2** (Alexander Ramos Flores) | **2. Arquitectura del Sistema (React → FastAPI → MySQL)** | 4 mins | Desacoplamiento de capas, patrón REST, flujo de comunicación cliente-servidor y selección del stack tecnológico. |
| **Integrante 3** (María Fernanda Castillo) | **3. Backend, API y Autenticación** | 4 mins | Endpoints en FastAPI, modelos Pydantic v2, autenticación stateless con JWT y hashing de contraseñas con bcrypt. |
| **Integrante 4** (Carlos Eduardo Mendoza) | **4. Frontend, Navegación y Responsive** | 4 mins | SPA en React + Vite, arquitectura Vanilla CSS, gestión de estado con Context API y adaptabilidad responsiva móvil. |
| **Integrante 5** (Sofía Isabel Gutiérrez) | **5. Base de Datos y Demostración Funcional** | 4 mins | Modelo de datos relacional en MySQL (Users, Posts, Likes, Comments) y Live Demo de registro, feed, reacciones y perfil. |
| **Integrante 6** (Diego Armando Torres) | **6. Pruebas, Seguridad, Despliegue y Conclusiones** | 4-5 mins | Cobertura Pytest (90%), Vitest, Config Guard de producción, despliegue Aiven → Render → Vercel y conclusiones técnicas. |

---

## 2. Guión Detallado por Bloque de Exposición

### Bloque 1: Introducción, Problema y Objetivo (Integrante 1 — 4 mins)
- **Problema Académico:** La comunicación entre estudiantes y docentes suele estar dispersa en múltiples plataformas informales carentes de contexto educativo.
- **Propuesta Nexora:** Una red social universitaria liviana, desacoplada y orientada al intercambio académico directo mediante publicaciones, comentarios y reacciones.
- **Objetivos de Negocio & MVP:** Implementar las funcionalidades del backlog Must (B-001 a B-014 y B-017) bajo la metodología PolkDev v2.0.

### Bloque 2: Arquitectura del Sistema (Integrante 2 — 4 mins)
- **Patrón Arquitectónico:** Arquitectura en 3 capas totalmente desacopladas:
  1. Frontend SPA (React + Vite)
  2. Backend REST API (FastAPI + Python)
  3. Base de Datos Relacional (MySQL 8)
- **Protocolo de Comunicación:** Peticiones HTTP/HTTPS asíncronas transmitiendo JSON con encabezados `Authorization: Bearer <token>`.

### Bloque 3: Backend, API y Autenticación (Integrante 3 — 4 mins)
- **Estructura FastAPI:** Routers modulares (`auth`, `users`, `posts`, `dashboard`), servicios de negocio y repositorios de datos.
- **Seguridad en Autenticación:** Generación de JWT firmados con `HS256`, hash de contraseñas con `bcrypt` (`pwdlib`) y validación estricta de esquemas de entrada.
- **Auto-documentación:** Swagger/OpenAPI 3.1 generado automáticamente en `/docs` y exportado en `documentation/api/openapi.json`.

### Bloque 4: Frontend, Navegación y Adaptabilidad Responsiva (Integrante 4 — 4 mins)
- **Estructura React SPA:** Vistas principales (`LoginPage`, `FeedPage`, `ProfilePage`, `DashboardPage`).
- **Control de Acceso en Cliente:** Componente `ProtectedRoute` para proteger rutas privadas y gestionar estado de sesión global mediante `AuthContext`.
- **Diseño Responsivo:** Layout adaptable a resoluciones móviles (375px) mediante media queries y Vanilla CSS sin dependencias pesadas.

### Bloque 5: Modelo de Base de Datos y Demostración Funcional en Vivo (Integrante 5 — 4 mins)
- **Modelo Relacional:** Explicación del diagrama ERD (Entidades `users`, `posts`, `likes`, `comments` con llaves foráneas e integridad referencial).
- **Demostración en Vivo (Live Demo):**
  1. Registro de usuario e inicio de sesión.
  2. Creación de una publicación académica en el Feed.
  3. Reacción "Me Gusta" (toggle en tiempo real) y publicación de comentario.
  4. Actualización parcial del perfil del usuario.
  5. Consulta del Dashboard de estadísticas globales.

### Bloque 6: Pruebas, Seguridad, Despliegue Cloud y Conclusiones (Integrante 6 — 4-5 mins)
- **Calidad & Pruebas:** 31 pruebas en Pytest (90% cobertura líneas, 85.7% ramas), 5 pruebas en Vitest y script E2E contra MySQL.
- **Seguridad & Guards:** Production Config Guard para `SECRET_KEY` ($\ge 64$ caracteres) y Safety Guard contra limpiezas accidentales en BD (`verify_safety_guard()`).
- **Despliegue Cloud (ADR-006):**
  1. MySQL alojado en **Aiven**.
  2. Backend FastAPI desplegado en **Render**.
  3. Frontend React/Vite desplegado en **Vercel**.
- **Conclusiones:** Logro del MVP en tiempo récord con cero vulnerabilidades críticas y arquitectura lista para producción.

---

## 3. Preguntas Frecuentes Técnicas (FAQ)

- **¿Por qué la arquitectura de despliegue principal usa Aiven, Render y Vercel (ADR-006)?**
  Porque es el estándar de nube Serverless/PaaS desacoplado que permite escalado independiente, certificados SSL automáticos y administración zero-ops para cada capa.
- **¿Cómo se asegura que las pruebas no borren datos en producción o desarrollo?**
  Mediante `verify_safety_guard()` en `conftest.py`, el cual cancela inmediatamente la ejecución (`RuntimeError`) si el nombre de la base de datos no termina estrictamente en `_test`.
- **¿Cuál es el estado de la vulnerabilidad de Rate Limiting?**
  Está documentada como el riesgo residual **RSK-004 (MEDIO)**, recomendando la implementación de Nginx/Cloudflare Rate Limiting o `slowapi` antes del despliegue masivo a producción pública.
