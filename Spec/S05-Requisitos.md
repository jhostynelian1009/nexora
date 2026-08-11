# S05 — Requisitos

> Estado: Completo en f₂ | Responsable: K-001 Spec Builder

## Requisitos funcionales

| ID | Requisito | Prioridad |
|---|---|---|
| RF-001 | Registrar usuarios con nombre, correo, contraseña y carrera/interés | Must |
| RF-002 | Impedir correos duplicados | Must |
| RF-003 | Autenticar usuarios y emitir JWT | Must |
| RF-004 | Consultar los datos del usuario autenticado | Must |
| RF-005 | Cerrar la sesión en el cliente | Must |
| RF-006 | Consultar y actualizar el perfil propio | Must |
| RF-007 | Crear publicaciones con texto obligatorio | Must |
| RF-008 | Asociar una URL de imagen opcional a una publicación | Should |
| RF-009 | Listar publicaciones en orden cronológico descendente | Must |
| RF-010 | Mostrar autor, fecha, contenido e interacciones de cada publicación | Must |
| RF-011 | Crear un like único por usuario y publicación | Must |
| RF-012 | Retirar el like propio | Must |
| RF-013 | Crear comentarios no vacíos | Must |
| RF-014 | Listar comentarios por publicación | Must |
| RF-015 | Mostrar métricas globales de usuarios, publicaciones, likes y comentarios | Should |
| RF-016 | Mostrar métricas personales del usuario | Should |
| RF-017 | Proteger creación y modificación mediante autenticación | Must |
| RF-018 | Proveer navegación entre feed, perfil y dashboard | Must |
| RF-019 | Cargar datos demostrativos de forma reproducible | Should |
| RF-020 | Exponer health-check y documentación OpenAPI | Must |

## Requisitos no funcionales

| ID | Requisito verificable |
|---|---|
| RNF-001 | La interfaz funcionará sin desbordamiento horizontal entre 375 px y 1440 px |
| RNF-002 | El 95% de respuestas API del MVP será menor a 800 ms bajo carga de demostración |
| RNF-003 | Las contraseñas se almacenarán con hash adaptativo y nunca en texto plano |
| RNF-004 | Las rutas privadas rechazarán tokens ausentes, inválidos o expirados |
| RNF-005 | El repositorio no contendrá secretos; usará `.env.example` |
| RNF-006 | La API empleará códigos HTTP y mensajes de error consistentes |
| RNF-007 | Las operaciones críticas tendrán pruebas unitarias o de integración |
| RNF-008 | Frontend, API y MySQL podrán configurarse por entorno sin cambiar código |
| RNF-009 | El README permitirá instalar y ejecutar el sistema desde cero |
| RNF-010 | La API mantendrá separación entre rutas, lógica, modelos y esquemas |
| RNF-011 | La navegación y controles principales serán utilizables con teclado |
| RNF-012 | El sistema tendrá disponibilidad suficiente para la demostración online |

