# S04 — Casos de uso

> Estado: Completo en f₂ | Responsable: K-001 Spec Builder

## Actores

- Visitante.
- Usuario registrado.
- Docente evaluador como observador de la demostración.

## UC-01 — Registrar cuenta

**Actor:** Visitante. **Precondición:** no existe una cuenta con el correo.  
**Flujo:** completa datos → sistema valida → cifra contraseña → crea usuario → devuelve sesión.  
**Alternativa:** correo duplicado o datos inválidos → mensaje controlado.  
**Postcondición:** cuenta persistida y usuario autenticado.

## UC-02 — Iniciar sesión

**Actor:** Visitante. **Precondición:** cuenta registrada.  
**Flujo:** ingresa credenciales → API verifica → emite JWT → SPA abre el feed.  
**Alternativa:** credenciales incorrectas → 401 sin revelar qué campo falló.  
**Postcondición:** sesión activa en el cliente.

## UC-03 — Gestionar perfil

**Actor:** Usuario registrado. **Precondición:** sesión válida.  
**Flujo:** consulta perfil → modifica nombre, carrera/interés, biografía o avatar URL → guarda.  
**Postcondición:** perfil actualizado y visible en sus publicaciones.

## UC-04 — Crear publicación

**Actor:** Usuario registrado. **Precondición:** sesión válida.  
**Flujo:** escribe texto → añade URL opcional → publica → API valida y persiste.  
**Alternativa:** contenido vacío → validación y conservación del formulario.  
**Postcondición:** publicación visible al inicio del feed.

## UC-05 — Consultar feed

**Actor:** Usuario registrado. **Precondición:** sesión válida.  
**Flujo:** abre inicio → API retorna publicaciones cronológicas con autor, likes y comentarios.  
**Postcondición:** feed renderizado con estados de interacción correctos.

## UC-06 — Alternar like

**Actor:** Usuario registrado. **Precondición:** publicación existente.  
**Flujo:** pulsa like → API crea o elimina la relación única → actualiza contador.  
**Postcondición:** estado persistido sin likes duplicados.

## UC-07 — Comentar publicación

**Actor:** Usuario registrado. **Precondición:** publicación existente y sesión válida.  
**Flujo:** escribe comentario → API valida → persiste → SPA muestra el comentario.  
**Postcondición:** comentario asociado al usuario y publicación.

## UC-08 — Consultar dashboard

**Actor:** Usuario registrado. **Precondición:** sesión válida.  
**Flujo:** abre panel → API calcula métricas globales y personales → SPA presenta tarjetas.  
**Postcondición:** estadísticas actualizadas disponibles para demostración.

## UC-09 — Cerrar sesión

**Actor:** Usuario registrado. **Flujo:** selecciona salir → SPA elimina token → redirige al login.  
**Postcondición:** rutas privadas dejan de ser accesibles desde el cliente.

