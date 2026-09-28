# Guía de Contribución — SIGMA ITM

¡Gracias por tu interés en contribuir al proyecto SIGMA ITM! Este documento describe las convenciones y el flujo de trabajo del equipo.

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Configuración del entorno](#2-configuración-del-entorno)
3. [Flujo de trabajo con Git](#3-flujo-de-trabajo-con-git)
4. [Estándares de código](#4-estándares-de-código)
5. [Pruebas](#5-pruebas)
6. [Pull Requests](#6-pull-requests)

---

## 1. Requisitos previos

- Python **3.11+**
- Node.js **18+**
- Git configurado con nombre y email

## 2. Configuración del entorno

```bash
# Clonar el repositorio
git clone https://github.com/<org>/sigma-itm.git
cd sigma-itm

# Backend
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_data

# Frontend (en otra terminal)
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

## 3. Flujo de trabajo con Git

### Ramas

| Rama       | Propósito                                      |
|------------|------------------------------------------------|
| `main`     | Código estable, listo para producción          |
| `develop`  | Integración de features                        |
| `feature/` | Nueva funcionalidad (`feature/HU-05-pdf-cert`) |
| `fix/`     | Corrección de bug (`fix/login-redirect`)       |
| `docs/`    | Solo documentación                             |

### Convención de commits

Usa el formato [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance>): <descripción corta>

[cuerpo opcional]

[pie opcional: refs #issue]
```

**Tipos válidos:**

| Tipo       | Cuándo usarlo                              |
|------------|--------------------------------------------|
| `feat`     | Nueva funcionalidad                        |
| `fix`      | Corrección de bug                          |
| `docs`     | Sólo documentación                         |
| `style`    | Formato (sin cambio de lógica)             |
| `refactor` | Refactoring sin bug fix ni feature         |
| `test`     | Añadir o corregir pruebas                  |
| `chore`    | Tareas de mantenimiento (deps, config)     |

**Ejemplos:**

```
feat(backend): agrega endpoint de generación de certificado PDF
fix(frontend): corrige redirección tras login expirado
test(backend): agrega pruebas para transición de estados
docs: actualiza README con instrucciones de Docker
```

## 4. Estándares de código

### Backend (Python / Django)

- Seguir **PEP 8** (máximo 99 caracteres por línea).
- Docstrings en todas las funciones y clases públicas.
- Variables y funciones en `snake_case`; clases en `PascalCase`.
- No dejar `print()` ni código comentado en commits de `main`/`develop`.

### Frontend (JavaScript / React)

- Componentes en **PascalCase** (`PanelEstudiante.jsx`).
- Hooks personalizados con prefijo `use` (`useAuth`).
- No usar `var`; preferir `const` sobre `let`.
- Correr `npm run lint` antes de cada commit.

## 5. Pruebas

Toda nueva funcionalidad **debe** incluir pruebas.

```bash
# Backend
cd backend
pytest -v

# Frontend
cd frontend
npm test
```

Cobertura mínima esperada: **70%** en módulos críticos (`models.py`, `views.py`).

## 6. Pull Requests

1. Crea tu rama desde `develop`: `git checkout -b feature/HU-XX-descripcion`
2. Haz commits atómicos siguiendo la convención.
3. Asegúrate de que los tests pasan: `make test`
4. Abre un PR a `develop` con:
   - **Título**: sigue la convención de commits.
   - **Descripción**: qué cambia, por qué y cómo probarlo.
   - **Historia de usuario**: referencia a la HU que implementa (ej. `refs HU-05`).
5. Espera aprobación de al menos **un revisor** antes de hacer merge.

---

> Ante cualquier duda, abre un issue o contacta al equipo en el canal del proyecto.
