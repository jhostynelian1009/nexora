# Guía para Contribuir a Nexora

¡Gracias por tu interés en contribuir a **Nexora**!

---

## 1. Código de Conducta

Nexora es un proyecto de ámbito académico. Se espera que todos los colaboradores mantengan un trato respetuoso, profesional e inclusivo.

---

## 2. Flujo de Trabajo y Ramas (PolkDev v2.0)

- La rama principal de desarrollo es `develop`.
- Las contribuciones deben realizarse mediante Pull Requests apuntando a `develop`.
- Cada feature o corrección debe incluir su trazabilidad hacia el backlog en los mensajes de commit:
  ```bash
  git commit -m "feat(posts): implement like toggle endpoint Ref: RF-009, HU-004, B-009"
  ```

---

## 3. Entorno de Desarrollo Local

1. Clonar el repositorio y configurar el backend en `App/backend`:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Configurar la base de datos MySQL en XAMPP (`nexora` y `nexora_test`).
3. Iniciar el servidor backend:
   ```bash
   uvicorn app.main:app --reload
   ```
4. Configurar e iniciar el frontend en `App/frontend`:
   ```bash
   npm install
   npm run dev
   ```

---

## 4. Estándares de Pruebas y Seguridad

Antes de enviar un Pull Request, asegúrate de ejecutar y aprobar todas las verificaciones:

```bash
# Backend tests & coverage
pytest --cov=app --cov-branch --cov-report=term-missing

# Frontend unit tests
npm test -- --run

# Frontend build
npm run build

# Security audit
pip-audit
bandit -r app
```
