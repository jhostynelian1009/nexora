# S02 — Alcance de Nexora

> Estado: Aprobado en f₁ y consolidado en f₂ | Responsables: K-012 Planner, K-001 Spec Builder

## 1. Población objetivo

Estudiantes y jóvenes que desean compartir proyectos, experiencias, intereses y contenido de entretenimiento en una comunidad digital sencilla.

## 2. Alcance incluido (IN)

| ID | Capacidad incluida |
|---|---|
| IN-01 | Registro de usuario con nombre, correo, contraseña y carrera/interés |
| IN-02 | Inicio y cierre de sesión mediante JWT |
| IN-03 | Perfil básico con nombre, biografía, carrera/interés y avatar por URL |
| IN-04 | Creación de publicaciones de texto con imagen opcional por URL |
| IN-05 | Feed principal cronológico |
| IN-06 | Like único por usuario en cada publicación |
| IN-07 | Creación y visualización de comentarios |
| IN-08 | Dashboard con estadísticas básicas globales y personales |
| IN-09 | Navegación entre autenticación, feed, perfil y dashboard |
| IN-10 | Interfaz responsive para móvil y escritorio |
| IN-11 | API REST documentada automáticamente con OpenAPI |
| IN-12 | Datos de demostración reproducibles |
| IN-13 | Repositorio público, README y aplicación desplegada |

## 3. Fuera de alcance (OUT)

| ID | Capacidad excluida | Motivo |
|---|---|---|
| OUT-01 | Subida y procesamiento de videos | Tiempo e infraestructura |
| OUT-02 | Almacenamiento físico de imágenes | Requeriría servicio de objetos |
| OUT-03 | Chat privado o tiempo real | No requerido por la rúbrica |
| OUT-04 | Historias temporales | Complejidad adicional |
| OUT-05 | Seguidores y solicitudes de amistad | No necesario para el MVP |
| OUT-06 | Notificaciones push o por correo | Requiere servicios externos |
| OUT-07 | Recuperación de contraseña | No crítica para la demostración |
| OUT-08 | Panel administrativo avanzado | Dashboard básico suficiente |
| OUT-09 | Moderación automática de contenido | Fuera del plazo |
| OUT-10 | Aplicación móvil nativa | La interfaz web será responsive |

## 4. Actores iniciales

| Actor | Responsabilidades y permisos |
|---|---|
| Visitante | Registrarse e iniciar sesión |
| Usuario registrado | Gestionar perfil, publicar, consultar feed, dar like y comentar |
| Equipo desarrollador | Configurar, probar, documentar y desplegar el sistema |
| Docente evaluador | Revisar cumplimiento y demostración |

## 5. Restricciones de alcance

- Una cuenta se identifica por correo único.
- Cada usuario puede dar máximo un like por publicación.
- Las publicaciones y comentarios requieren autenticación.
- Las imágenes se referencian mediante URL válida; Nexora no aloja archivos en el MVP.
- El feed será cronológico y no utilizará algoritmos de recomendación.
- Las funciones excluidas solo podrán entrar mediante una nueva iteración PolkDev.

## 6. Criterio de MVP terminado

El alcance se considera completado cuando un usuario puede registrarse, autenticarse, editar su perfil, publicar contenido, observarlo en el feed, dar like, comentar, consultar el dashboard y repetir el flujo desde la aplicación desplegada.
