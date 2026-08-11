# S01 — Objetivos de Nexora

> Estado: Aprobado en f₁ y consolidado en f₂ | Responsables: K-012 Planner, K-001 Spec Builder

## Objetivo general

Desarrollar y desplegar en cinco horas un MVP funcional de una red social web denominada Nexora, utilizando React, FastAPI y MySQL bajo arquitectura cliente-servidor, que permita a usuarios registrados crear perfiles, publicar contenido académico o de entretenimiento e interactuar mediante likes y comentarios.

## Objetivos específicos SMART

### OBJ-01 — Acceso seguro

Implementar antes de finalizar f₆ el registro, inicio de sesión y consulta del usuario autenticado, protegiendo las operaciones privadas mediante tokens JWT y almacenamiento no reversible de contraseñas.

**Criterio de éxito:** un usuario puede registrarse, autenticarse y acceder a una ruta protegida; credenciales incorrectas reciben una respuesta controlada.

### OBJ-02 — Publicación y feed

Permitir antes de finalizar f₆ que cada usuario cree publicaciones de texto con imagen opcional mediante URL y que dichas publicaciones aparezcan en un feed ordenado de la más reciente a la más antigua.

**Criterio de éxito:** una publicación creada desde React se almacena en MySQL y aparece en el feed sin recargar manualmente la aplicación.

### OBJ-03 — Interacción social

Implementar antes de finalizar f₆ likes únicos por usuario y comentarios asociados a publicaciones.

**Criterio de éxito:** el usuario puede alternar su like y añadir comentarios; los contadores reflejan el estado persistido.

### OBJ-04 — Experiencia y navegación

Entregar una interfaz moderna y responsive con navegación funcional entre inicio de sesión, registro, feed, perfil y dashboard.

**Criterio de éxito:** los flujos críticos funcionan en anchos de 375 px y 1280 px sin desbordamiento horizontal.

### OBJ-05 — Calidad y entrega

Publicar el proyecto en GitHub con README técnico, documentación OpenAPI, pruebas de los flujos críticos y enlaces online operativos.

**Criterio de éxito:** frontend, backend y base de datos se encuentran conectados; el health-check responde correctamente y el README permite reproducir la instalación.

## Correspondencia con la rúbrica

| Criterio | Objetivos relacionados |
|---|---|
| Funcionamiento del sistema | OBJ-01, OBJ-02, OBJ-03 |
| Uso de React y FastAPI | OBJ-02, OBJ-05 |
| Arquitectura y base de datos | OBJ-02, OBJ-03, OBJ-05 |
| Diseño y experiencia | OBJ-04 |
| Repositorio y documentación | OBJ-05 |
| Presentación técnica | OBJ-05 |
