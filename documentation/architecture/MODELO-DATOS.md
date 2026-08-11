# Modelo de datos MySQL

> Fuente normativa: S03, RF-001–RF-016

## Tablas

### `users`

| Columna | Tipo | Restricción |
|---|---|---|
| id | INT | PK, autoincrement |
| name | VARCHAR(80) | NOT NULL |
| email | VARCHAR(160) | NOT NULL, UNIQUE, INDEX |
| password_hash | VARCHAR(255) | NOT NULL |
| career | VARCHAR(120) | NOT NULL |
| bio | VARCHAR(240) | NOT NULL, default |
| avatar_url | VARCHAR(500) | NULL |
| created_at | DATETIME | NOT NULL, default actual |

### `posts`

| Columna | Tipo | Restricción |
|---|---|---|
| id | INT | PK, autoincrement |
| content | TEXT | NOT NULL |
| image_url | VARCHAR(500) | NULL |
| author_id | INT | FK users.id, INDEX |
| created_at | DATETIME | NOT NULL, INDEX |

### `likes`

| Columna | Tipo | Restricción |
|---|---|---|
| id | INT | PK, autoincrement |
| user_id | INT | FK users.id |
| post_id | INT | FK posts.id, INDEX |
| created_at | DATETIME | NOT NULL |

Índice único: `(user_id, post_id)`.

### `comments`

| Columna | Tipo | Restricción |
|---|---|---|
| id | INT | PK, autoincrement |
| content | VARCHAR(500) | NOT NULL |
| author_id | INT | FK users.id |
| post_id | INT | FK posts.id, INDEX |
| created_at | DATETIME | NOT NULL |

## Reglas

- Usar InnoDB y `utf8mb4`.
- Aplicar `ON DELETE CASCADE` desde usuarios/publicaciones hacia dependencias.
- Mantener transacción única para alternar likes.
- Cargar relaciones del feed evitando consultas N+1.
- El seeder debe ser idempotente y usar correos demostrativos conocidos.

