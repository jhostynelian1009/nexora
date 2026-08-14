# V2-S04 — Casos de Uso de Nexora Social v2

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## Matriz de Casos de Uso v2

| ID | Nombre | Actor | Descripción | Precondición |
|---|---|---|---|---|
| CU2-001 | Buscar y ver perfil público | Usuario Autenticado | Buscar usuarios por nombre/carrera y ver su perfil público con posts y contadores. | Sesión activa |
| CU2-002 | Seguir y dejar de seguir | Usuario Autenticado | Establecer o eliminar relación de seguimiento con otro usuario. | Sesión activa, no ser el mismo usuario |
| CU2-003 | Subir imagen a Cloudinary | Usuario Autenticado | Cargar foto de perfil o imagen para publicación a Cloudinary. | Sesión activa, archivo < 5MB |
| CU2-004 | Chatear en tiempo real | Usuario Autenticado | Enviar y recibir mensajes privados 1 a 1 vía WebSockets con indicador de escritura. | Sesión activa, ambos usuarios existen |
| CU2-005 | Gestionar notificaciones | Usuario Autenticado | Ver lista de notificaciones, contador no leído y marcar como leídas. | Sesión activa |
| CU2-006 | Recuperar contraseña vía OTP | Usuario | Solicitar OTP de 6 dígitos, verificarlo e ingresar nueva contraseña. | Teléfono registrado o email válido |

## Flujo principal: CU2-004 (Chatear en tiempo real)
1. El usuario abre una conversación desde el perfil público de otro usuario o desde la lista de chats.
2. El cliente establece/reutiliza la conexión WebSocket `WS /ws?token=<JWT>`.
3. El usuario escribe un mensaje: la app cliente emite evento `typing.start` con debounce.
4. El usuario envía el mensaje: el cliente emite `message.send`.
5. El backend guarda el mensaje en la tabla `messages` en MySQL.
6. El backend emite `message.created` al destinatario (si está conectado) y la notificación persistida.
7. El destinatario visualiza el mensaje y el estado cambia a `enviado`/`leído`.
