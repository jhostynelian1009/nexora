# S07 — Historias de usuario

> Estado: Completo en f₂ | Responsable: K-001 Spec Builder

## HU-001 — Registro

Como visitante quiero crear una cuenta para participar en Nexora.  
**Dado** un correo nuevo y datos válidos, **cuando** envío el registro, **entonces** se crea mi cuenta y recibo una sesión.  
**Dado** un correo existente, **cuando** intento registrarme, **entonces** veo un error y no se duplica la cuenta.

## HU-002 — Inicio de sesión

Como usuario quiero iniciar sesión para acceder a mis funciones privadas.  
**Dado** credenciales válidas, **cuando** ingreso, **entonces** accedo al feed con un JWT.  
**Dado** credenciales inválidas, **cuando** ingreso, **entonces** recibo un mensaje controlado.

## HU-003 — Perfil

Como usuario quiero editar mi perfil para expresar mi identidad.  
**Dado** que estoy autenticado, **cuando** actualizo mis datos válidos, **entonces** los cambios persisten y se reflejan en la interfaz.

## HU-004 — Publicar

Como usuario quiero publicar texto e imágenes por URL para compartir contenido académico o de entretenimiento.  
**Dado** contenido válido, **cuando** publico, **entonces** aparece al inicio del feed.  
**Dado** contenido vacío, **cuando** intento publicar, **entonces** el sistema lo rechaza.

## HU-005 — Feed

Como usuario quiero consultar un feed para descubrir contenido reciente.  
**Dado** que existen publicaciones, **cuando** abro el feed, **entonces** las observo de la más reciente a la más antigua con autor e interacciones.

## HU-006 — Like

Como usuario quiero expresar que una publicación me gusta.  
**Dado** que no marqué like, **cuando** pulso el control, **entonces** se registra uno solo.  
**Dado** que ya marqué like, **cuando** vuelvo a pulsarlo, **entonces** se elimina.

## HU-007 — Comentario

Como usuario quiero comentar para participar en una conversación.  
**Dado** un comentario no vacío, **cuando** lo envío, **entonces** aparece asociado a mi identidad y a la publicación.

## HU-008 — Dashboard

Como usuario quiero ver un resumen para comprender la actividad de Nexora.  
**Dado** que existe actividad, **cuando** abro el dashboard, **entonces** observo métricas globales y personales actualizadas.

## HU-009 — Navegación responsive

Como usuario móvil quiero navegar cómodamente para utilizar Nexora desde mi teléfono.  
**Dado** un ancho de 375 px, **cuando** recorro las pantallas, **entonces** no existe desbordamiento y los controles principales siguen accesibles.

## HU-010 — Demostración reproducible

Como docente quiero ejecutar y revisar el proyecto para evaluar su arquitectura y funcionalidades.  
**Dado** el repositorio limpio, **cuando** sigo el README, **entonces** puedo configurar, ejecutar y comprender el sistema.

