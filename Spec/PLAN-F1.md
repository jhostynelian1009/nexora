# Nexora — Plan de proyecto

> PolkDev v2.0 | Fase f₁ — Planificación | Skill K-012 Planner

## 1. Brief validado

Nexora es una red social web con identidad estudiantil que permite compartir contenido académico, proyectos y publicaciones de entretenimiento cotidiano. El producto será un MVP funcional, moderno y responsive construido con React y FastAPI, conectado a MySQL y desplegado en servicios públicos.

## 2. Stakeholders

| Stakeholder | Interés principal |
|---|---|
| Docente evaluador | Cumplimiento de la consigna, funcionamiento y exposición técnica |
| Equipo de seis estudiantes autorizado | Desarrollo, documentación, demostración y defensa del proyecto |
| Usuarios registrados | Publicar, descubrir e interactuar con contenido |
| Visitantes | Comprender el propósito de Nexora y acceder a registro/inicio de sesión |

### Integrantes

- Jhostyn Baños — líder del equipo.
- Mariana.
- Jaider.
- Génesis.
- Amy.
- Diana.

> Los apellidos faltantes se completarán en S08/README antes de f₉.

## 3. Restricciones

- Tiempo total disponible: 5 horas.
- Tecnologías obligatorias: React, FastAPI, base de datos, GitHub y despliegue online.
- Repositorio público y README técnico obligatorio.
- Equipo de seis integrantes autorizado expresamente por el docente.
- Solo se implementará el MVP necesario para cubrir la rúbrica.
- Ningún secreto o credencial será almacenado en el repositorio.

## 4. Entorno propuesto

| Área | Elección de f₁ | Estado formal |
|---|---|---|
| Frontend | React + Vite + JavaScript | Pendiente de ADR en f₃ |
| Backend | FastAPI + Python 3.12 | Restricción obligatoria |
| Persistencia | MySQL + SQLAlchemy | Pendiente de ADR en f₃ |
| Autenticación | JWT | Pendiente de ADR en f₃ |
| Pruebas | Pytest/TestClient y Vitest | Pendiente de ADR en f₃ |
| Frontend online | Vercel | Pendiente de ADR en f₃ |
| Backend online | Render | Pendiente de ADR en f₃ |
| MySQL online | Aiven Free | Pendiente de ADR en f₃ |
| Repositorio | GitHub público tipo monorepo | Pendiente de ADR en f₃ |

## 5. Roadmap acelerado

| Tiempo | Fase | Resultado esperado |
|---|---|---|
| 00:00–00:35 | f₁–f₂ | Plan y Spec S01–S09 completos |
| 00:35–01:00 | f₃–f₅ | Arquitectura, ADR, skills y entorno listos |
| 01:00–03:30 | f₆ | MVP implementado por verticales funcionales |
| 03:30–04:05 | f₇–f₈ | Pruebas, correcciones y auditoría mínima |
| 04:05–04:35 | f₉–f₁₀ | README, documentación y validación |
| 04:35–05:00 | f₁₁ | Despliegue, health-check y evidencias |
| Posterior | f₁₂ | Evaluación tras la demostración |

## 6. Iteraciones de implementación previstas

1. Base técnica y autenticación.
2. Perfil y publicaciones.
3. Feed, likes y comentarios.
4. Dashboard, responsive y datos demostrativos.
5. Integración, validación y despliegue.

## 7. Supuestos

- Los usuarios publicarán texto y opcionalmente una imagen mediante URL.
- No se almacenarán archivos binarios en el servidor durante el MVP.
- MySQL estará disponible localmente mediante XAMPP y online mediante un servicio administrado.
- El equipo dispone de una cuenta de GitHub y podrá crear cuentas gratuitas de despliegue.
- Las decisiones técnicas de esta fase son propuestas; serán formalizadas en S03 y S09 durante f₃.

## 8. Riesgos iniciales

| Riesgo | Probabilidad | Impacto | Mitigación inicial |
|---|---:|---:|---|
| Tiempo insuficiente | Alta | Alto | Alcance cerrado y trabajo por verticales |
| Fallo durante despliegue | Media | Alto | Desplegar antes de la última media hora |
| Errores CORS o variables de entorno | Media | Medio | Configuración centralizada y smoke tests |
| Credenciales expuestas | Baja | Alto | `.env`, `.env.example` y `.gitignore` |
| Integrantes sin participación demostrable | Media | Medio | Distribución de exposición y commits documentados |

## 9. Gate de salida f₁

- [x] Brief con propósito, usuarios y plazo.
- [x] Stakeholders identificados.
- [x] Roadmap acelerado definido.
- [x] Supuestos y restricciones registrados.
- [x] S01 y S02 redactados como borradores.
- [ ] Aprobación explícita del stakeholder.

