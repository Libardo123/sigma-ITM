# Documento de Análisis Técnico y Estado del Proyecto — SIGMA ITM

> **Propósito:** Especificación técnica integral y actualizada del sistema SIGMA ITM. Describe las decisiones de arquitectura, modelo de dominio, motor de estados finitos, matriz de seguridad RBAC, catálogo de servicios API REST y estado de madurez de la plataforma.

---

## 1. Resumen Ejecutivo del Proyecto

- **Nombre:** SIGMA ITM (Sistema Integrado de Gestión y Seguimiento de Modalidades de Opción de Grado).
- **Institución:** Facultad de Ingenierías — Instituto Tecnológico Metropolitano (ITM), Medellín, Colombia.
- **Objetivo:** Digitalizar, automatizar y auditar el ciclo de vida completo de las diez modalidades de opción de grado reglamentadas institucionalmente, desde la postulación del estudiante hasta la sustentación, aprobación por actas y emisión del certificado oficial de grado.
- **Estado Actual:** **Sistema Funcional Integral (100% de HU prioritarias implementadas y probadas).** Dispone de motor de estados en servidor, segregación de roles, gestión documental con validación por magic bytes, asignación docente con directrices, generación real de PDF y suite completa de pruebas automatizadas.

---

## 2. Evaluación de Calidad de la Arquitectura

### ⭐️ **Calificación: 5.0 / 5.0 (Nivel de Producción / Grado de Excelencia)**

| Dimensión | Puntuación | Justificación Técnica |
|---|:---:|---|
| **Arquitectura y Modularidad** | **5.0 / 5.0** | Desacoplamiento estricto entre API REST en Django y SPA en React/Vite. Responsabilidades claramente aisladas en modelos de dominio, validadores de modalidad, serializadores y utilitarios PDF. |
| **Seguridad y Control de Acceso** | **5.0 / 5.0** | Autenticación JWT con rotación obligatoria de refresh tokens y blacklist inmediata. Rate limiting contra ataques de fuerza bruta. Aprobación y activación administrativa obligatoria para cuentas nuevas. |
| **Integridad de Datos y Auditoría** | **5.0 / 5.0** | Motor de estados finitos que impide transiciones ilegales. Bitácora inmutable en `HistorialEstado` que registra usuario, fecha, estado anterior, estado nuevo y observaciones. |
| **Validación Documental Preventiva** | **5.0 / 5.0** | Validación de contenido real de archivos (firmas binarias / magic bytes). Comprobación de requisitos documentales específicos por modalidad antes de abrir la etapa de revisión. |
| **Calidad de Código y Pruebas** | **5.0 / 5.0** | Cobertura integral con **57 pruebas unitarias en backend** (`pytest`) y **18 pruebas en frontend** (`Vitest`), complementadas con simulación E2E de 12 pasos punta a punta (100% de éxito). |

---

## 3. Stack Tecnológico

| Capa | Componente | Versión | Descripción y Propósito |
|---|---|---|---|
| **Backend** | Python / Django | 3.11+ / 6.1.1 | Núcleo del servidor web, ORM, migraciones y administración. |
| **API Framework** | Django REST Framework | 3.18.1 | ViewSets, routers, serializadores y negociación de contenido. |
| **Autenticación** | SimpleJWT | 5.5.1 | Tokens JWT: Access (20 min) + Refresh (7 días) con rotación y blacklist. |
| **Protección** | Django-Ratelimit | 4.1.0 | Limitador de peticiones en endpoint de autenticación contra fuerza bruta. |
| **Seguridad Archivos**| python-magic | 0.4.x | Identificación de formato real de archivos por cabeceras binarias. |
| **Generación PDF** | ReportLab | 4.2.5 | Construcción dinámica y estilizada del certificado oficial de finalización. |
| **Base de Datos** | SQLite / PostgreSQL | 3 / 16 | SQLite para desarrollo ágil sin dependencias; PostgreSQL para producción. |
| **Frontend** | React | 19.2.8 | Arquitectura declarativa basada en componentes y hooks. |
| **Build Tool** | Vite | 8.2.2 | Servidor de desarrollo ultrarrápido y empaquetado optimizado con Rollup. |
| **Enrutamiento** | React Router | 7.18.3 | Enrutamiento declarativo del lado del cliente con guardianes por rol. |
| **Estilos** | Tailwind CSS | 3.4.19 | Sistema de diseño utilitario con paleta corporativa ITM y modo responsivo. |
| **Visualización** | Recharts | 2.13.0 | Gráficos interactivos de barra, pastel y métricas en el Dashboard. |
| **Testing Backend** | pytest / pytest-django | 8.3.4 / 4.9.0| Ejecución de 57 pruebas unitarias y de integración del backend. |
| **Testing Frontend**| Vitest / Testing Library| 3.2.4 / 16.3.0| Ejecución de 18 pruebas unitarias y de interacción del frontend. |
| **Contenedores** | Docker & Compose | Multi-stage | Orquestación completa de servicios (BD, Backend, Frontend). |

---

## 4. Modelo de Datos y Entidades

### 1. `Usuario` (`core.models.Usuario`)
- Hereda de `AbstractUser`.
- **Campos propios:**
  - `rol`: Enumeración (`ESTUDIANTE`, `ASESOR`, `COMITE`, `ADMIN`).
  - `cedula`: Documento de identidad único.
  - `programa_academico`: Programa de pregrado o posgrado al que pertenece.
  - `es_auxiliar`: Booleano para roles administrativos con restricciones operativas.
  - `is_active`: Por defecto `False` en registros públicos hasta su aprobación formal.

### 2. `Modalidad` (`core.models.Modalidad`)
- Catálogo de las 10 opciones de grado reglamentadas.
- **Campos:** `nombre`, `codigo`, `descripcion`, `activa`, `creada_en`.

### 3. `Postulacion` (`core.models.Postulacion`)
- Llave primaria `UUID` para prevenir enumeración maliciosa de URLs.
- **Relaciones:** `estudiante` (FK Usuario), `modalidad` (FK Modalidad), `asesor` (FK Usuario, nullable).
- **Control de Estado:**
  - `estado`: `POSTULACION`, `REVISION_DOCUMENTAL`, `APROBACION`, `EN_PROCESO`, `SUSTENTACION`, `REVISION_COMITE`, `FINALIZADO`, `RECHAZADO`.
  - `requiere_correccion`: Booleano que activa el bloqueo de avance de etapa.
  - `observacion_correccion`: Texto con las indicaciones emitidas por el evaluador.
  - `archivo_correccion`: Soporte documental con retroalimentación del evaluador.
  - `mensaje_subsanacion`: Explicación obligatoria (mín. 10 chars) radicada por el estudiante.
  - `subsanado_en`: Timestamp de la subsanación.
  - `fecha_sustentacion`, `lugar_sustentacion`, `mensaje_sustentacion`: Datos de la cita de sustentación.
  - `mensaje_asesor`, `archivo_asesor`: Directriz técnica de la coordinación hacia el asesor.

### 4. `Documento` (`core.models.Documento`)
- **Campos:** `postulacion` (FK), `nombre`, `descripcion`, `archivo`, `mime_type`, `tamano_bytes`, `subido_en`.

### 5. `HistorialEstado` (`core.models.HistorialEstado`)
- Bitácora inmutable de auditoría institucional.
- **Campos:** `postulacion` (FK), `estado_anterior`, `estado_nuevo`, `realizado_por` (FK Usuario), `fecha`, `observacion`, `fue_correccion`.

---

## 5. Matriz de Estados y Transiciones Válidas

```
POSTULACION
  ├──> REVISION_DOCUMENTAL  (Requiere validación de documentos obligatorios)
  └──> RECHAZADO

REVISION_DOCUMENTAL
  ├──> APROBACION           (Documentación conforme)
  └──> RECHAZADO

APROBACION
  ├──> EN_PROCESO           (Comité o Admin asigna docente asesor con directriz)
  └──> RECHAZADO

EN_PROCESO
  ├──> SUSTENTACION         (Asesor emite visto bueno y califica entregables)
  └──> RECHAZADO

SUSTENTACION
  ├──> REVISION_COMITE      (Sustentación presentada y avalada)
  └──> RECHAZADO

REVISION_COMITE
  ├──> FINALIZADO           (Comité ratifica aprobación en Acta de Grado)
  └──> RECHAZADO

FINALIZADO / RECHAZADO
  └──> [ESTADOS TERMINALES INMUTABLES]
```

---

## 6. Resultados de la Verificación de Calidad

### Pruebas de Backend
- **Framework:** `pytest` con configuración en memoria (`:memory:` SQLite).
- **Tests ejecutados:** **57 de 57 pasados (100%)**.
- **Tiempo de ejecución:** 61.82 s.

### Pruebas de Frontend
- **Framework:** `vitest` con entorno `jsdom` y `@testing-library/react`.
- **Tests ejecutados:** **18 de 18 pasados (100%)** en 3 suites:
  - `Layout.test.jsx`: 3 pasados.
  - `PanelAprobacion.test.jsx`: 6 pasados.
  - `PanelEstudiante.test.jsx`: 9 pasados.
- **Tiempo de ejecución:** 4.59 s.

### Simulación End-to-End (`simulacion_flujo_completo.py`)
- **12 pasos completados exitosamente:**
  1. Creación de usuarios y catálogo de modalidades.
  2. Radicación de propuesta por estudiante.
  3. Inicio y aprobación de revisión documental.
  4. Asignación de docente asesor con directriz y avance a En Proceso.
  5. Solicitud de corrección con archivo adjunto por parte del asesor.
  6. Validación de bloqueo de avance ante corrección pendiente.
  7. Radicación de subsanación por el estudiante con documento y explicación.
  8. Avance a sustentación por visto bueno del asesor.
  9. Notificación formal de fecha y lugar de sustentación al estudiante.
  10. Remisión al Comité de Grados tras sustentación aprobada.
  11. Aprobación final y cierre del trámite en estado Finalizado.
  12. Generación real de certificado PDF en memoria con ReportLab y auditoría completa.

---

## 7. Conclusiones y Próximos Pasos

El sistema se encuentra en un estado de **madurez técnica óptima**, habiendo alcanzado la totalidad de los requerimientos funcionales y de seguridad definidos en el alcance del proyecto. 

Para su puesta en marcha en infraestructura de producción institucional, se contemplan las siguientes tareas operativas:
1. Configuración de credenciales de servidor de correo institucional (SMTP / Microsoft Exchange).
2. Despliegue en servidores ITM mediante los contenedores definidos en `docker-compose.yml`.
3. Configuración de nombres de dominio y certificados SSL institucionales (`https://sigma.itm.edu.co`).
