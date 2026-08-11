# Runbook de desarrollo local

> Configuración de f₅ | No contiene credenciales reales

## Requisitos

- Python 3.12.
- Node.js 22 o superior.
- XAMPP con MySQL activo.
- Git.

## Preparar MySQL en XAMPP

1. Iniciar MySQL desde el panel de XAMPP.
2. Abrir phpMyAdmin o la consola MySQL.
3. Crear la base con `utf8mb4`:

```sql
CREATE DATABASE nexora
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

4. Crear un usuario local específico o utilizar el usuario local configurado en XAMPP.
5. Copiar `App/backend/.env.example` como `App/backend/.env` y sustituir únicamente los valores locales.
6. No subir `.env` a GitHub.

## Smoke-test requerido para habilitar f₆

El agente debe comprobar:

```text
1. Python y Node responden con sus versiones.
2. MySQL está escuchando en 127.0.0.1:3306.
3. DATABASE_URL permite abrir una conexión.
4. La base activa se llama nexora.
5. No se imprime la contraseña en logs o reportes.
```

Si el puerto, usuario o contraseña difieren, modificar únicamente `.env`. No cambiar el código ni sustituir el motor.

## Servicios locales previstos

| Servicio | URL |
|---|---|
| React | `http://localhost:5173` |
| FastAPI | `http://localhost:8000` |
| Swagger | `http://localhost:8000/docs` |
| Health-check | `http://localhost:8000/health` |

