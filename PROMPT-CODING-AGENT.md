# Prompt de inicio para el agente de codificación

Copia desde “INICIO” hasta “FIN” en Codex, Antigravity u otro agente con acceso a la carpeta raíz de Nexora.

---

## INICIO DEL PROMPT

Actúa como agente de implementación del proyecto **Nexora** bajo el sistema formal **PolkDev v2.0**.

Tu fase activa es exclusivamente:

```text
[PolkDev | Fase: f₆ — Generación de Código | Skill: K-005 Code Generator Nexora]
```

Las fases f₁–f₅ ya están aprobadas. No replantees el producto, no cambies el stack y no despliegues todavía.

### Protocolo previo obligatorio

1. Lee completamente `PromptMaster.md` y `AGENTS.md`.
2. Lee estos artefactos antes de editar:
   - `Spec/S03-Arquitectura.md`
   - `Spec/S04-Casos-de-Uso.md`
   - `Spec/S05-Requisitos.md`
   - `Spec/S06-Backlog.md`
   - `Spec/S07-Historias-de-Usuario.md`
   - `Spec/S09-Decisiones-Tecnicas.md`
   - `Spec/S12-Metricas-de-Calidad.md`
   - `documentation/api/CONTRATO-REST.md`
   - `documentation/architecture/MODELO-DATOS.md`
   - `Skill/K-005-Code-Generator.md`
   - `Skill/K-006-Test-Engineer.md`
3. Verifica que las entradas obligatorias existen y reporta el estado PolkDev.
4. Construye el proyecto real dentro de `App/`; no generes otro plan paralelo.

### Stack cerrado

- Frontend: React + Vite + JavaScript, React Router, CSS responsive y Lucide React.
- Backend: Python 3.12, FastAPI, Pydantic, SQLAlchemy 2 y PyMySQL.
- Base de datos: MySQL 8 local mediante XAMPP y online mediante `DATABASE_URL`.
- Autenticación: JWT Bearer y bcrypt con `pwdlib`.
- Pruebas: Pytest/TestClient y Vitest/Testing Library.
- Arquitectura: SPA → API REST → MySQL.

### Objetivo de implementación

Entregar un MVP funcional con:

- Registro, login, sesión y rutas protegidas.
- Perfil editable.
- Publicaciones de texto con imagen URL opcional.
- Feed cronológico.
- Likes únicos que se pueden retirar.
- Comentarios.
- Dashboard de métricas.
- Seeder idempotente.
- Interfaz moderna responsive.
- Health-check y OpenAPI.

### Orden obligatorio

Implementa verticales trazables en este orden:

1. B-001, B-002 y B-017.
2. B-003–B-005.
3. B-006.
4. B-007–B-010.
5. B-011–B-014.
6. B-015–B-016.
7. B-018–B-019 y correcciones.

Para cada vertical:

1. Identifica RF, HU y B que la justifican.
2. Escribe o actualiza la prueba.
3. Implementa solo lo necesario.
4. Ejecuta pruebas y corrige.
5. Registra trazabilidad en el módulo.

### Límites estrictos

- No uses Laravel, SQLite, PostgreSQL, Firebase ni Supabase.
- No añadas chat, seguidores, videos, notificaciones, recuperación de contraseña ni uploads.
- No inventes endpoints o columnas que contradigan los contratos.
- No aceptes identidad o propiedad mediante `user_id` enviado por React.
- No incluyas claves, contraseñas ni URLs privadas.
- No marques pruebas como `skip`.
- No sustituyas fallos reales con datos simulados en producción.
- No ejecutes f₁₁ ni publiques servicios.

### Estructura esperada

```text
App/
├── backend/
│   ├── app/
│   │   ├── api/routers/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   └── styles/
    ├── package.json
    └── .env.example
```

### Gate de salida f₆

Antes de finalizar:

- Ejecuta todos los tests disponibles.
- Ejecuta el build de React.
- Verifica imports y arranque de FastAPI.
- Comprueba `/health` y un flujo crítico integrado.
- Revisa que no existan secretos.
- Resume archivos creados, comandos ejecutados, resultados y desviaciones.
- Detente en el gate de f₆ y solicita autorización para f₇ si corresponde.

Empieza ahora leyendo los archivos obligatorios y reportando la verificación Spec-as-Skill. Luego implementa sin pedirme decisiones que ya estén resueltas en los artefactos.

## FIN DEL PROMPT

