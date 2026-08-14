# V2-S01 — Objetivos de Nexora Social v2

> Estado: Especificado para v2 | Responsable: Agente Principal PolkDev v2.0

## Objetivo general

Ampliar la plataforma Nexora (v1) a la iteración funcional "Nexora Social v2", introduciendo perfiles públicos interactivos, sistema de seguidores, carga y gestión real de imágenes con Cloudinary, mensajería privada 1 a 1 en tiempo real mediante WebSockets, sistema de notificaciones persistidas y en tiempo real, recuperación de contraseña por arquitectura de proveedores (Development / WhatsApp) y mejoras de experiencia visual y animaciones sin comprometer la estabilidad ni romper la compatibilidad de la v1.

## Objetivos específicos SMART

### OBJ2-01 — Perfiles Públicos y Red de Seguidores
Implementar búsqueda de usuarios por nombre o carrera, visualización de perfiles públicos con contadores y listados de seguidores/seguidos, y filtrado del feed por publicaciones de usuarios seguidos.

### OBJ2-02 — Gestión Multimedia en la Nube
Integrar la subida autenticada de imágenes (avatares y publicaciones) hacia Cloudinary mediante FastAPI con validaciones estrictas (formato, máx 5MB, comprobación de contenido) y reemplazo/eliminación transaccional segura.

### OBJ2-03 — Chat Privado en Tiempo Real
Desarrollar un subsistema de conversación 1 a 1 sobre WebSockets con persistencia previa en MySQL, indicador efímero de escritura ("Escribiendo..."), control de lectura y reconexión automática con backoff exponencial.

### OBJ2-04 — Sistema de Notificaciones
Crear un centro de notificaciones en tiempo real y persistido para eventos de seguimiento, likes, comentarios y mensajes privados con contador de no leídos y marcado masivo o individual.

### OBJ2-05 — Recuperación Segura de Contraseña
Implementar un flujo de OTP criptográfico de 6 dígitos con límite de intentos y expiración de 5 minutos, abstrayendo la entrega en proveedores configurables (`DevelopmentPasswordResetSender` y `WhatsAppPasswordResetSender`), con guard de seguridad para entorno de producción.

### OBJ2-06 — Calidad, Animaciones y Migración Transparente
Garantizar la migración de datos desde v1 usando Alembic, incorporar rate-limiting en endpoints sensibles, animaciones accesibles (`prefers-reduced-motion`) y mantener cobertura de pruebas backend $\ge 80\%$ y ramas $\ge 70\%$.
