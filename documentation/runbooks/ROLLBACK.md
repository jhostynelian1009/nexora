# Runbook de Reversión (Rollback Runbook) — Nexora

**Sistema:** PolkDev v2.0  
**Proyecto:** Nexora — Red Social Académica  
**Documento:** `documentation/runbooks/ROLLBACK.md`  
**Estrategia de Despliegue Principal:** Cloud Multi-Servidor (Vercel / Render / Aiven)  
**Versión:** 2.0.0

---

## 1. Criterios para Ejecutar Rollback

Un rollback de emergencia en el entorno de producción debe ejecutarse inmediatamente ante:
- Respuesta degradada o continua de HTTP 500 / 503 en `GET /health` en Render.
- Fallo de inicio del servicio FastAPI por rechazo de `SECRET_KEY` o variables mal configuradas.
- Errores de compilación o fallos JS fatales en el bundle de Vercel.
- Fuga de información o vulnerabilidad crítica post-despliegue.

---

## 2. Procedimiento de Rollback por Capa Cloud

### Capa 1: Rollback del Frontend en Vercel
1. Ir a la consola de administración del proyecto en **Vercel**.
2. Navegar a la pestaña **Deployments**.
3. Localizar la implementación anterior estable.
4. Hacer clic en el menú contextual (`...`) de dicha versión y seleccionar **Instant Rollback** (Promote to Production).
5. Confirmar el rollback. El trafico se redirigirá instantáneamente a la versión anterior sin necesidad de recompilaciones.

### Capa 2: Rollback del Backend en Render
1. Ir al panel del servicio Web Service en **Render**.
2. Navegar a la sección **Deploys**.
3. Seleccionar el commit o despliegue previo catalogado como estable.
4. Hacer clic en **Rollback to this deploy**.
5. Render reinstalará el contenedor con la revisión previa y reiniciará el proceso Uvicorn.
6. Verificar las variables de entorno en **Environment** si el fallo fue provocado por una variable incorrecta.

### Capa 3: Rollback de Base de Datos en Aiven
1. Si el despliegue ejecutó cambios de esquema destructivos en MySQL:
2. Ir a la consola de **Aiven for MySQL**.
3. Acceder a **Backups** / **Point-in-Time Recovery (PITR)**.
4. Seleccionar la estampa de tiempo previa al despliegue fallido para restaurar el estado de las tablas `users`, `posts`, `likes` y `comments`.

---

## 3. Verificación Post-Rollback

1. **Salud del Backend:**
   ```bash
   curl -f https://nexora-backend-api.onrender.com/health
   ```
   Confirmar `status: ok` y `database: connected`.

2. **Salud del Frontend:**
   Abrir `https://nexora-frontend.vercel.app` y verificar la carga de la SPA y el login de usuarios.

---

## 4. Alternativa Secundaría (Rollback VPS Tradicional)

Para instalaciones locales o servidores VPS autogestionados con Nginx y Systemd:
1. `sudo systemctl stop nexora-backend`
2. `git checkout <commit_anterior>`
3. `cd App/frontend && npm run build`
4. `sudo systemctl start nexora-backend && sudo systemctl restart nginx`
