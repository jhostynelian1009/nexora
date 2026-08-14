# V2-S07 — Historias de Usuario de Nexora Social v2

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## Historias de Usuario (HU2)

### HU2-001 — Buscar y explorar perfiles públicos
**Como** estudiante registrado en Nexora,  
**Quiero** buscar otros usuarios por nombre o carrera y acceder a sus perfiles públicos,  
**Para** conocer sus publicaciones, intereses y conectar con ellos.  
*Criterios de Aceptación:*
- Búsqueda en tiempo real o por formulario que retorne coincidencia de nombre o carrera.
- Muestra de avatar, biografía, carrera, total de posts, seguidores, seguidos y sus publicaciones.

### HU2-002 — Seguir usuarios y filtrar feed
**Como** usuario activo,  
**Quiero** seguir a compañeros y filtrar mi feed principal entre "Todos" y "Siguiendo",  
**Para** personalizar mi flujo de noticias con el contenido que más me interesa.  
*Criterios de Aceptación:*
- Botón interactivo "Seguir / Siguiendo" que actualiza contadores.
- Imposibilidad de seguirse a uno mismo o duplicar seguimiento.
- Selector en feed que filtra adecuadamente la lista de publicaciones.

### HU2-003 — Subir imágenes a Cloudinary
**Como** creador de contenido,  
**Quiero** subir fotos reales desde mi dispositivo para mi avatar o mis publicaciones,  
**Para** expresar mis ideas visualmente sin errores de enlaces ni almacenamiento local frágil.  
*Criterios de Aceptación:*
- Selección de archivo con vista previa inmediata en el cliente.
- Validación de tipo de imagen (JPEG/PNG/WEBP) y tamaño (<5MB).
- Reemplazo y limpieza automática en Cloudinary al cambiar de avatar o borrar post.

### HU2-004 — Mensajería privada en tiempo real
**Como** usuario conectado,  
**Quiero** chatear de forma instantánea con otros estudiantes y ver cuándo están escribiendo,  
**Para** coordinar trabajos o conversar privadamente de forma fluida.  
*Criterios de Aceptación:*
- Botón "Mensaje" en el perfil público que abre o reutiliza una conversación.
- Transmisión instantánea por WebSockets con persistencia en MySQL.
- Indicador visual "Escribiendo..." animado.

### HU2-005 — Recibir notificaciones en tiempo real
**Como** usuario de Nexora,  
**Quiero** recibir alertas instantáneas cuando me sigan, me den like, me comenten o me chateen,  
**Para** mantenerme al tanto de las interacciones sociales sin refrescar la página.  
*Criterios de Aceptación:*
- Badge rojo animado con contador de no leídas.
- Panel desplegable de notificaciones con redirección rápida.
- Marcado de lectura individual o completo.

### HU2-006 — Recuperar contraseña mediante OTP
**Como** usuario que olvidó su clave,  
**Quiero** solicitar un código de verificación de 6 dígitos para restablecer mi contraseña,  
**Para** recuperar el acceso a mi cuenta de manera segura.  
*Criterios de Aceptación:*
- Código de 6 dígitos válido por 5 minutos y máx 5 intentos.
- Respuesta genérica en pantalla para prevenir enumeración.
- Soporte para proveedor Development (consola) o WhatsApp.
