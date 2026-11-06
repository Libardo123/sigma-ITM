# 🏛️ Ficha Técnica de Decisiones Arquitectónicas Congeladas — SIGMA ITM

> **AVISO PARA AGENTES Y DESARROLLADORES:**  
> Las decisiones en este documento están **CONGELADAS**. Queda estrictamente prohibido cambiar librerías, proponer otros frameworks o modificar patrones arquitectónicos sin autorización expresa del usuario.

---

## 1. Stack Tecnológico Oficial

| Capa | Tecnología | Versión | Regla de Oro |
|---|---|---|---|
| **Backend** | Python / Django | 3.11+ / Django 5+ | Todo endpoint usa Django REST Framework (`rest_framework`). Prohibido FastAPI/Flask. |
| **API & Auth** | SimpleJWT | 5.x | Tokens JWT en cabecera `Authorization: Bearer <token>`. Rotación y blacklist activos. |
| **Base de Datos** | SQLite (Dev) / PostgreSQL (Prod) | 3 / 16 | Acceso exclusivo mediante ORM de Django y migraciones (`makemigrations`). |
| **Frontend** | React + Vite | React 19 / Vite | SPA desacoplada. Prohibido Next.js, Redux o librerías de estado sobre-complejas. |
| **Enrutamiento** | React Router | v7 | Enrutador declarativo en cliente con guardias por rol. |
| **Estilos** | Tailwind CSS | 3.4.x | Usar la paleta institucional ITM (`#001340`, `#011C5B`, `#661081`, `#C6C6C6`). Prohibido Bootstrap o CSS ad-hoc. |
| **Gráficos** | Recharts | 2.13.x | Gráficas del panel administrativo e indicadores de modalidad. |
| **Generación PDF** | ReportLab | 4.2.x | Generación nativa en backend de certificados con QR. Prohibido generar PDFs en cliente. |

---

## 2. Comandos Oficiales de Verificación (Pruebas Reales)

Todo agente debe ejecutar estos comandos antes de declarar una tarea completada:

### Backend:
```bash
# Correr suite de pruebas de backend
pytest sigma-itm/backend

# Si estás dentro de la carpeta backend:
pytest
```

### Frontend:
```bash
# Correr pruebas unitarias de frontend
cd sigma-itm/frontend && npm test

# Validar que el build empaqueta sin errores de sintaxis
cd sigma-itm/frontend && npm run build
```

---

## 3. Matriz de Roles y Reglas de Flujo

- **Roles válidos (`Usuario.rol`):**
  1. `ESTUDIANTE`
  2. `ASESOR` (Docente Asesor de Trabajo de Grado)
  3. `COMITE` (Comité de Grados)
  4. `ADMIN` (Administrador de Facultad)

- **Regla inviolable de Etapa 3:**
  - El estudiante entrega borradores y avances **únicamente a su Docente Asesor**.
  - Prohibido desviar entregables de Etapa 3 al Administrador o al Comité.

- **Regla de Subsanación Transversal:**
  - Si un evaluador solicita ajustes, el trámite se congela y, al responder el estudiante, **retorna al mismo evaluador que observó**.
