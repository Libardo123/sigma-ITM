# ðŸŽ“ SIGMA ITM â€” Sistema Integral de GestiÃ³n de Modalidades de Grado

<div align="center">

<img src="sigma-itm/docs/img/banner.jpg" alt="SIGMA ITM Banner" width="100%" />

<br/>

[![Django](https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15-red?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-57%20Pytest%20|%2018%20Vitest-brightgreen?style=for-the-badge)](https://pytest.org/)

**Plataforma institucional para la radicaciÃ³n, supervisiÃ³n docente, revisiÃ³n documental, sustentaciÃ³n y certificaciÃ³n automatizada de trabajos y modalidades de grado.**

*Facultad de IngenierÃ­as â€” Instituto TecnolÃ³gico Metropolitano (ITM), MedellÃ­n, Colombia*

</div>

---

## ðŸ“‘ Tabla de Contenidos

- [1. DescripciÃ³n y PropÃ³sito](#-descripciÃ³n-y-propÃ³sito)
- [2. Vista Previa de la Interfaz](#-vista-previa-de-la-interfaz)
- [3. CatÃ¡logo de Modalidades de Grado](#-catÃ¡logo-de-modalidades-de-grado)
- [4. MÃ¡quina de Estados y Ciclo de Vida](#-mÃ¡quina-de-estados-y-ciclo-de-vida)
- [5. Arquitectura del Sistema](#-arquitectura-del-sistema)
- [6. Control de Acceso Basado en Roles (RBAC)](#-control-de-acceso-basado-en-roles-rbac)
- [7. Seguridad y Buenas PrÃ¡cticas](#-seguridad-y-buenas-prÃ¡cticas)
- [8. CatÃ¡logo de Endpoints API REST](#-catÃ¡logo-de-endpoints-api-rest)
- [9. Estructura de Directorios](#-estructura-de-directorios)
- [10. GuÃ­a de Inicio RÃ¡pido](#-guÃ­a-de-inicio-rÃ¡pido)
  - [OpciÃ³n A: Docker Compose (Recomendada)](#opciÃ³n-a-con-docker-compose-recomendado)
  - [OpciÃ³n B: Entorno Local (Paso a Paso)](#opciÃ³n-b-entorno-local-nativo)
- [11. Usuarios y Datos de Prueba](#-usuarios-y-datos-de-prueba)
- [12. AutomatizaciÃ³n con Makefile](#-automatizaciÃ³n-con-makefile)
- [13. Suite de Pruebas Automatizadas](#-suite-de-pruebas-automatizadas)
- [14. Variables de Entorno](#-variables-de-entorno)
- [15. Estado del Proyecto y Roadmap](#-estado-del-proyecto-y-roadmap)
- [16. DocumentaciÃ³n Adicional](#-documentaciÃ³n-adicional)
- [17. CrÃ©ditos y Licencia](#-crÃ©ditos-y-licencia)

---

## ðŸ“– DescripciÃ³n y PropÃ³sito

El **Instituto TecnolÃ³gico Metropolitano (ITM)** ofrece diversas alternativas para que los estudiantes de pregrado y posgrado de la Facultad de IngenierÃ­as culminen su ciclo formativo mediante opciones de grado que integran investigaciÃ³n, desarrollo tecnolÃ³gico, inserciÃ³n laboral o emprendimiento.

**SIGMA ITM** digitaliza y centraliza este ecosistema administrativo y acadÃ©mico, resolviendo problemÃ¡ticas histÃ³ricas:

- âŒ Procesos dispersos en correos electrÃ³nicos o formularios manuales.
- âŒ PÃ©rdida de trazabilidad sobre fechas de radicaciÃ³n, revisiones y correcciones.
- âŒ Falta de visibilidad en tiempo real para el estudiante sobre el estado de su trÃ¡mite.
- âŒ Dificultad para coordinar sustentaciones, directrices y asignaciÃ³n de docentes asesores.
- âŒ Retrasos en la emisiÃ³n de certificados de culminaciÃ³n y paz y salvo de grado.

### Objetivos Clave

1. **Trazabilidad Inmutable:** Cada cambio de estado, observaciÃ³n de correcciÃ³n o asignaciÃ³n de asesor queda grabado permanentemente en una bitÃ¡cora auditada (`HistorialEstado`).
2. **Gobernanza por Roles:** Estricta segregaciÃ³n de funciones entre el Estudiante titular, el Docente Asesor asignado, el ComitÃ© de Trabajos de Grado y la AdministraciÃ³n AcadÃ©mica.
3. **ValidaciÃ³n Preventiva:** El sistema valida la presencia obligatoria de los documentos requeridos para cada modalidad especÃ­fica antes de autorizar la apertura formal del trÃ¡mite.
4. **CertificaciÃ³n Oficial Inmediata:** GeneraciÃ³n automÃ¡tica de certificados oficiales de finalizaciÃ³n en formato PDF con firma y metadatos una vez concluido el proceso.

---

## ðŸ–¥ï¸ Vista Previa de la Interfaz (Capturas Reales de la Plataforma)

A continuaciÃ³n se presentan capturas reales de la aplicaciÃ³n en ejecuciÃ³n, ilustrando los diferentes mÃ³dulos del sistema segÃºn el rol del usuario:

### 1. ðŸŒ Portal PÃºblico Institucional (Landing Page)

PresentaciÃ³n formal del sistema para aspirantes y estudiantes, con el catÃ¡logo interactivo de modalidades, etapas y requisitos.

<div align="center">
  <img src="sigma-itm/docs/img/screenshot_landing.png" alt="SIGMA ITM - Landing Page Real" width="95%" style="border-radius: 10px; border: 1px solid #cbd5e1; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" />
</div>

<br/>

### 2. ðŸ” AutenticaciÃ³n Segura (Login Institucional con JWT)

Acceso al sistema con credenciales institucionales, control de fuerza bruta y redirecciÃ³n automÃ¡tica segÃºn el rol asignado.

<div align="center">
  <img src="sigma-itm/docs/img/screenshot_login.png" alt="SIGMA ITM - Login Real" width="95%" style="border-radius: 10px; border: 1px solid #cbd5e1; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" />
</div>

<br/>

### 3. ðŸ‘¨â€ðŸŽ“ Portal del Estudiante (LÃ­nea de Tiempo y Expediente)

Seguimiento paso a paso del ciclo de vida del trÃ¡mite, gestiÃ³n de documentos con validaciÃ³n por *magic bytes*, ediciÃ³n de tÃ­tulo y radicaciÃ³n de subsanaciones.

<div align="center">
  <img src="sigma-itm/docs/img/screenshot_panel_estudiante.png" alt="SIGMA ITM - Panel Estudiante Real" width="95%" style="border-radius: 10px; border: 1px solid #cbd5e1; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" />
</div>

<br/>

### 4. ðŸ›ï¸ Panel de Control y EvaluaciÃ³n (ComitÃ© de Grados y Asesores)

GestiÃ³n integral de trÃ¡mites radicados, inspecciÃ³n de archivos anexos, solicitud de correcciones con bloqueo de avance, asignaciÃ³n de docentes con directrices tÃ©cnicas y control de sustentaciones.

<div align="center">
  <img src="sigma-itm/docs/img/screenshot_panel_aprobacion.png" alt="SIGMA ITM - Panel AprobaciÃ³n Real" width="95%" style="border-radius: 10px; border: 1px solid #cbd5e1; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" />
</div>

<br/>

### 5. ðŸ“Š Tablero de AnalÃ­tica y MÃ©tricas Institucionales (Dashboard)

VisualizaciÃ³n en tiempo real de estadÃ­sticas consolidadas: distribuciÃ³n por estados, desglose por modalidad mediante grÃ¡ficos interactivos (`Recharts`) y KPIs de gestiÃ³n acadÃ©mica.

<div align="center">
  <img src="sigma-itm/docs/img/screenshot_dashboard.png" alt="SIGMA ITM - Dashboard AnalÃ­tico Real" width="95%" style="border-radius: 10px; border: 1px solid #cbd5e1; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" />
</div>

---

## ðŸŽ“ CatÃ¡logo de Modalidades de Grado

SIGMA ITM modela las **10 modalidades de grado** reglamentadas en la Facultad de IngenierÃ­as del ITM, cada una con sus validaciones y documentos requeridos:

| #            | Modalidad                                 | CÃ³digo                     | Documentos Obligatorios Requeridos                                               | Responsable de AprobaciÃ³n |
| ------------ | ----------------------------------------- | --------------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| **1**  | **Trabajo de Grado**                | `TRABAJO_GRADO`           | Anteproyecto o Propuesta de Grado, Paz y Salvo AcadÃ©mico                        | Asesor + ComitÃ©           |
| **2**  | **PrÃ¡cticas Profesionales**        | `PRACTICAS_PROFESIONALES` | Carta de AceptaciÃ³n Empresarial, Convenio / ARL, Plan de Trabajo                | ComitÃ© de PrÃ¡cticas      |
| **3**  | **PasantÃ­a de InvestigaciÃ³n**     | `PASANTIA`                | Carta de AceptaciÃ³n de la InstituciÃ³n Receptora, Plan de PasantÃ­a             | Asesor + ComitÃ©           |
| **4**  | **Emprendimiento**                  | `EMPRENDIMIENTO`          | Modelo Canvas / Plan de Negocio, CertificaciÃ³n Parque E o Centro Emprendimiento | ComitÃ© de Emprendimiento  |
| **5**  | **Producto en Laboratorio**         | `PRODUCTO_LABORATORIO`    | Aval de la Jefatura de Laboratorio, Ficha TÃ©cnica del Prototipo                 | ComitÃ© de Grados          |
| **6**  | **Producto de InvestigaciÃ³n**      | `PRODUCTO_INVESTIGACION`  | Constancia del Grupo de InvestigaciÃ³n (MinCiencias), ArtÃ­culo o Ponencia       | Asesor / LÃ­der Grupo      |
| **7**  | **Reconocimiento Laboral**          | `RECONOCIMIENTO_LABORAL`  | Certificado Laboral (mÃ­n. 1 aÃ±o en el Ã¡rea), Memoria TÃ©cnica de Labores      | ComitÃ© de Grados          |
| **8**  | **CertificaciÃ³n Internacional**    | `CERTIFICACION`           | Voucher o Certificado Oficial de Industria, Ficha TÃ©cnica de la CertificaciÃ³n  | ComitÃ© de Grados          |
| **9**  | **Cursos de Posgrado (Coterminal)** | `CURSOS_POSGRADO`         | MatrÃ­cula formal de asignaturas de posgrado, Certificado de Calificaciones      | CoordinaciÃ³n de Posgrados |
| **10** | **IngenierÃ­a para la Gente**       | `INGENIERIA_GENTE`        | Carta de la Comunidad Receptora, DiagnÃ³stico Comunitario, Plan de IntervenciÃ³n | ComitÃ© Social / Grados    |

---

## ðŸ”„ MÃ¡quina de Estados y Ciclo de Vida

El ciclo de vida de un trÃ¡mite en SIGMA ITM estÃ¡ gobernado por una **mÃ¡quina de estados finita** implementada directamente en el modelo de base de datos (`Postulacion.transicionar()`). Las transiciones no permitidas son rechazadas a nivel de servidor.

<p align="center">
  <img src="sigma-itm/docs/img/diagrama_estados.svg" alt="Diagrama de MÃ¡quina de Estados SIGMA-ITM" width="100%" />
</p>

### Reglas de Negocio del Motor de Estados:

- **ValidaciÃ³n Documental Previa:** No es posible avanzar de `POSTULACION` a `REVISION_DOCUMENTAL` si la postulaciÃ³n no cuenta con los archivos mÃ­nimos exigidos por la modalidad.
- **Bloqueo por CorrecciÃ³n Pendiente:** Cuando un evaluador o asesor activa `requiere_correccion = True`, los botones de avance de etapa se **bloquean inmediatamente**. El trÃ¡mite solo se descongela cuando el estudiante radica formalmente la subsanaciÃ³n (con mensaje explicativo y archivo corregido).
- **Inmutabilidad de Estados Terminales:** Los estados `FINALIZADO` y `RECHAZADO` son estrictamente terminales. NingÃºn actor puede modificar un proceso cerrado.

---

## ðŸ›ï¸ Arquitectura del Sistema

El proyecto sigue una arquitectura desacoplada y escalable basada en micro-servicios lÃ³gicos:

<p align="center">
  <img src="sigma-itm/docs/img/diagrama_arquitectura.svg" alt="Diagrama de Arquitectura de Software SIGMA-ITM" width="100%" />
</p>

### Modelo Entidad-RelaciÃ³n Conceptual

<p align="center">
  <img src="sigma-itm/docs/img/diagrama_entidad_relacion.svg" alt="Diagrama Entidad RelaciÃ³n SIGMA-ITM" width="100%" />
</p>

---

## ðŸ›¡ï¸ Control de Acceso Basado en Roles (RBAC)

SIGMA ITM implementa un esquema estricto de permisos mediante clases personalizadas en `backend/core/permissions.py` y filtros a nivel de ORM en `get_queryset()`:

| Funcionalidad / Etapa                                    |  ðŸ‘¨â€ðŸŽ“ Estudiante  | ðŸ‘¨â€ðŸ« Docente Asesor | ðŸ›ï¸ ComitÃ© de Grados | âš¡ Administrador |
| -------------------------------------------------------- | :------------------: | :-------------------: | :--------------------: | :--------------: |
| **Radicar nueva postulaciÃ³n**                     | âœ… (Solo la propia) |          âŒ          |           âŒ           |        âœ…        |
| **Consultar expediente propio**                    |          âœ…          |          âŒ          |           âŒ           |        âœ…        |
| **Subir / Eliminar documentos**                    | âœ… (En postulaciÃ³n) |          âŒ          |           âŒ           |        âœ…        |
| **Subsanar correcciones**                          |          âœ…          |          âŒ          |           âŒ           |        âŒ        |
| **Descargar certificado oficial PDF**              |  âœ… (Al finalizar)  |          âœ…          |           âœ…           |        âœ…        |
| **Gestionar etapa `POSTULACION` y `REVISION`** |          âŒ          |          âŒ          |           âœ…           |        âœ…        |
| **Asignar docente asesor con directriz**           |          âŒ          |          âŒ          |           âœ…           |        âœ…        |
| **Gestionar etapa `EN_PROCESO`**                 |          âŒ          |  âœ… (Solo asignado)  |           âŒ           |        âœ…        |
| **Programar y calificar `SUSTENTACION`**         |          âŒ          |  âœ… (Solo asignado)  |           âŒ           |        âœ…        |
| **Cierre final en `REVISION_COMITE`**            |          âŒ          |          âŒ          |           âœ…           |        âœ…        |
| **Aprobar / Activar cuentas de usuario**           |          âŒ          |          âŒ          |           âŒ           |        âœ…        |
| **Ver Dashboard de AnalÃ­tica Global**             |          âŒ          |  âœ… (Solo asignados)  |   âœ… (Institucional)   |    âœ… (Total)    |

---

## ðŸ”’ Seguridad y Buenas PrÃ¡cticas

1. **Tokens JWT con RotaciÃ³n y Blacklist:**
   - Access token de corta duraciÃ³n (**20 minutos**).
   - Refresh token (**7 dÃ­as**) con rotaciÃ³n obligatoria. Al renovar, el token previo es invalidado inmediatamente en lista negra (`rest_framework_simplejwt.token_blacklist`).
2. **ValidaciÃ³n de Archivos por Contenido (Magic Bytes):**
   - No se confÃ­a en la extensiÃ³n del archivo enviada por el cliente. Se utiliza `python-magic` para inspeccionar la firma binaria real del archivo (evitando subida de ejecutables disfrazados de PDF).
3. **ProtecciÃ³n Anti-Fuerza Bruta:**
   - El endpoint de autenticaciÃ³n `/api/token/` cuenta con rate limiting (`django-ratelimit`) para prevenir ataques de diccionario.
4. **ActivaciÃ³n de Cuentas por Gobierno Administrativo:**
   - Los nuevos usuarios registrados permanecen inactivos (`is_active = False`) hasta que el Administrador verifica su afiliaciÃ³n institucional y aprueba la solicitud.
5. **AuditorÃ­a Inmutable:**
   - Todo movimiento de etapa, asignaciÃ³n o correcciÃ³n genera un registro no modificable en `HistorialEstado`.

---

## ðŸ“¡ CatÃ¡logo de Endpoints API REST

La API REST expone servicios estandarizados bajo el prefijo `/api/`:

### AutenticaciÃ³n y Cuentas

| MÃ©todo  | Endpoint                         | Permiso              | DescripciÃ³n                                                 |
| -------- | -------------------------------- | -------------------- | ------------------------------------------------------------ |
| `POST` | `/api/token/`                  | PÃºblico             | Obtiene par de tokens JWT (usuario y contraseÃ±a)            |
| `POST` | `/api/token/refresh/`          | PÃºblico             | Renueva access token usando refresh token                    |
| `POST` | `/api/usuarios/registrar/`     | PÃºblico             | Registro pÃºblico de nuevos usuarios (pendiente aprobaciÃ³n) |
| `GET`  | `/api/usuarios/me/`            | Autenticado          | Perfil del usuario actualmente autenticado                   |
| `GET`  | `/api/usuarios/asesores/`      | Asesor/ComitÃ©/Admin | Lista de docentes asesores activos                           |
| `GET`  | `/api/usuarios/pendientes/`    | Solo Admin           | Solicitudes de usuario pendientes de aprobaciÃ³n             |
| `POST` | `/api/usuarios/{id}/aprobar/`  | Solo Admin           | Aprueba y activa una cuenta de usuario                       |
| `POST` | `/api/usuarios/{id}/rechazar/` | Solo Admin           | Rechaza la solicitud de creaciÃ³n de cuenta                  |

### Modalidades de Grado

| MÃ©todo  | Endpoint                   | Permiso     | DescripciÃ³n                                     |
| -------- | -------------------------- | ----------- | ------------------------------------------------ |
| `GET`  | `/api/modalidades/`      | Autenticado | CatÃ¡logo de las 10 modalidades de grado activas |
| `POST` | `/api/modalidades/`      | Solo Admin  | Crear nueva modalidad de grado                   |
| `PUT`  | `/api/modalidades/{id}/` | Solo Admin  | Modificar requisitos o descripciÃ³n de modalidad |

### Postulaciones y TrÃ¡mites

| MÃ©todo  | Endpoint                                            | Permiso          | DescripciÃ³n                                                                       |
| -------- | --------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `GET`  | `/api/postulaciones/`                             | RBAC Segregado   | Lista postulaciones (Estudiante: propias; Asesor: asignadas; ComitÃ©/Admin: todas) |
| `POST` | `/api/postulaciones/`                             | Estudiante/Admin | Radicar nueva opciÃ³n de grado                                                     |
| `GET`  | `/api/postulaciones/{id}/`                        | RBAC Segregado   | Detalle tÃ©cnico completo del trÃ¡mite                                             |
| `POST` | `/api/postulaciones/{id}/transicionar/`           | SegÃºn Etapa     | Avanza o cambia de estado registrando observaciÃ³n                                 |
| `POST` | `/api/postulaciones/{id}/solicitar_correccion/`   | SegÃºn Etapa     | Devuelve el trÃ¡mite para ajustes (pausa avance)                                   |
| `POST` | `/api/postulaciones/{id}/subsanar_correccion/`    | Solo Estudiante  | Radica ajustes con documento soporte y reactiva avance                             |
| `POST` | `/api/postulaciones/{id}/asignar_asesor/`         | ComitÃ© / Admin  | Asigna docente asesor con mensaje directriz                                        |
| `POST` | `/api/postulaciones/{id}/notificar_sustentacion/` | Asesor / Admin   | Notifica fecha, hora y aula de sustentaciÃ³n al alumno                             |
| `GET`  | `/api/postulaciones/{id}/validar_documentos/`     | RBAC Segregado   | Verifica cumplimiento de requisitos documentales                                   |
| `GET`  | `/api/postulaciones/{id}/certificado/`            | RBAC Segregado   | Descarga el certificado PDF oficial si el estado es`FINALIZADO`                  |
| `GET`  | `/api/postulaciones/{id}/historial/`              | RBAC Segregado   | Consulta la bitÃ¡cora cronolÃ³gica auditada                                        |

### Documentos Anexos

| MÃ©todo    | Endpoint                  | Permiso          | DescripciÃ³n                                           |
| ---------- | ------------------------- | ---------------- | ------------------------------------------------------ |
| `GET`    | `/api/documentos/`      | RBAC Segregado   | Documentos asociados a las postulaciones permitidas    |
| `POST`   | `/api/documentos/`      | Estudiante/Admin | Carga de archivo anexo con validaciÃ³n por magic bytes |
| `DELETE` | `/api/documentos/{id}/` | Titular/Admin    | Eliminar documento radicado (en etapas permitidas)     |

### MÃ©tricas y AnalÃ­tica

| MÃ©todo | Endpoint            | Permiso              | DescripciÃ³n                                            |
| ------- | ------------------- | -------------------- | ------------------------------------------------------- |
| `GET` | `/api/analitica/` | Asesor/ComitÃ©/Admin | Resumen estadÃ­stico por estado, modalidad y asesorÃ­as |

---

## ðŸ“‚ Estructura de Directorios

```
sigma-itm/
â”œâ”€â”€ docker-compose.yml              # OrquestaciÃ³n multicontenedor (PostgreSQL, Django, React)
â”œâ”€â”€ Makefile                        # AutomatizaciÃ³n de tareas de desarrollo y pruebas
â”œâ”€â”€ CONTRIBUTING.md                 # GuÃ­a para desarrolladores y estÃ¡ndares Git
â”œâ”€â”€ README.md                       # DocumentaciÃ³n principal del proyecto
â”œâ”€â”€ .gitignore                      # Reglas de exclusiÃ³n para Git
â”‚
â”œâ”€â”€ backend/                        # Backend REST con Django y DRF
â”‚   â”œâ”€â”€ Dockerfile                  # Imagen Docker optimizada (Python 3.11-slim)
â”‚   â”œâ”€â”€ requirements.txt            # Dependencias fijadas (Django, DRF, ReportLab, etc.)
â”‚   â”œâ”€â”€ pyproject.toml              # ConfiguraciÃ³n de pytest y type-checking
â”‚   â”œâ”€â”€ conftest.py                 # ConfiguraciÃ³n de entorno de pruebas en memoria
â”‚   â”œâ”€â”€ manage.py                   # CLI administrativo de Django
â”‚   â”œâ”€â”€ .env.example                # Plantilla documentada de variables de entorno
â”‚   â”‚
â”‚   â”œâ”€â”€ sigma_itm/                  # MÃ³dulo de configuraciÃ³n del proyecto
â”‚   â”‚   â”œâ”€â”€ settings.py             # ConfiguraciÃ³n (JWT, CORS, Base de datos, Mail)
â”‚   â”‚   â”œâ”€â”€ urls.py                 # Enrutamiento raÃ­z y routers DRF
â”‚   â”‚   â”œâ”€â”€ asgi.py                 # Punto de entrada ASGI
â”‚   â”‚   â””â”€â”€ wsgi.py                 # Punto de entrada WSGI
â”‚   â”‚
â”‚   â”œâ”€â”€ core/                       # AplicaciÃ³n central del dominio SIGMA ITM
â”‚   â”‚   â”œâ”€â”€ models.py               # Modelos: Usuario, Modalidad, Postulacion, etc.
â”‚   â”‚   â”œâ”€â”€ views.py                # ViewSets con lÃ³gica de negocio y acciones REST
â”‚   â”‚   â”œâ”€â”€ serializers.py          # Serializadores DRF y validaciones
â”‚   â”‚   â”œâ”€â”€ permissions.py          # Reglas de control de acceso por rol y etapa
â”‚   â”‚   â”œâ”€â”€ signals.py              # SeÃ±ales de auditorÃ­a y notificaciones por correo
â”‚   â”‚   â”œâ”€â”€ validadores_modalidad.py# Validador de requisitos por modalidad
â”‚   â”‚   â”œâ”€â”€ pdf_utils.py            # GeneraciÃ³n de certificados PDF con ReportLab
â”‚   â”‚   â”œâ”€â”€ admin.py                # Interfaz de administraciÃ³n Django (/admin/)
â”‚   â”‚   â”œâ”€â”€ tests.py                # Suite de pruebas automatizadas (57 tests)
â”‚   â”‚   â””â”€â”€ management/commands/
â”‚   â”‚       â””â”€â”€ seed_data.py        # Poblamiento de modalidades y cuentas demo
â”‚   â”‚
â”‚   â””â”€â”€ scripts/                    # Scripts auxiliares y pruebas de integraciÃ³n
â”‚       â””â”€â”€ simulacion_flujo_completo.py # SimulaciÃ³n E2E de 12 pasos punta a punta
â”‚
â”œâ”€â”€ frontend/                       # AplicaciÃ³n Web SPA con React 19 y Vite
â”‚   â”œâ”€â”€ Dockerfile                  # Imagen Docker de desarrollo (Node 20-alpine)
â”‚   â”œâ”€â”€ package.json                # Dependencias (React, Vite, Tailwind, Recharts)
â”‚   â”œâ”€â”€ vite.config.js              # ConfiguraciÃ³n del empaquetador Vite
â”‚   â”œâ”€â”€ vitest.config.js            # ConfiguraciÃ³n de pruebas unitarias Vitest
â”‚   â”œâ”€â”€ tailwind.config.js          # Sistema de diseÃ±o con colores institucionales ITM
â”‚   â”œâ”€â”€ .env.example                # Plantilla de variables de entorno frontend
â”‚   â”‚
â”‚   â”œâ”€â”€ public/                     # Recursos estÃ¡ticos (favicon, iconos)
â”‚   â”‚
â”‚   â””â”€â”€ src/                        # CÃ³digo fuente de la interfaz
â”‚       â”œâ”€â”€ main.jsx                # Montaje de la aplicaciÃ³n React
â”‚       â”œâ”€â”€ App.jsx                 # Rutas protegidas y layout principal
â”‚       â”œâ”€â”€ index.css               # Estilos globales y utilidades Tailwind
â”‚       â”œâ”€â”€ api/
â”‚       â”‚   â””â”€â”€ client.js           # Cliente Axios con renovaciÃ³n automÃ¡tica de JWT
â”‚       â”œâ”€â”€ context/
â”‚       â”‚   â””â”€â”€ AuthContext.jsx     # Estado global de sesiÃ³n y perfil
â”‚       â”œâ”€â”€ constants/
â”‚       â”‚   â””â”€â”€ modalidades.js      # Constantes de iconos, colores y nombres
â”‚       â”œâ”€â”€ components/             # Componentes reutilizables
â”‚       â”‚   â”œâ”€â”€ Layout.jsx          # Barra superior, navegaciÃ³n y logout
â”‚       â”‚   â”œâ”€â”€ EstadoBadge.jsx     # Badge con cÃ³digo de color segÃºn estado
â”‚       â”‚   â”œâ”€â”€ Timeline.jsx        # LÃ­nea de tiempo visual del proceso
â”‚       â”‚   â””â”€â”€ RutaProtegida.jsx   # GuardiÃ¡n de rutas por rol
â”‚       â”œâ”€â”€ pages/                  # Vistas principales
â”‚       â”‚   â”œâ”€â”€ Landing.jsx         # PÃ¡gina de bienvenida institucional
â”‚       â”‚   â”œâ”€â”€ Login.jsx           # Formulario de inicio de sesiÃ³n
â”‚       â”‚   â”œâ”€â”€ CrearUsuario.jsx    # Registro de cuenta con solicitud de rol
â”‚       â”‚   â”œâ”€â”€ PanelEstudiante.jsx # Portal del estudiante (trÃ¡mites y soporte)
â”‚       â”‚   â”œâ”€â”€ PanelAprobacion.jsx # Panel del evaluador (Asesor / ComitÃ© / Admin)
â”‚       â”‚   â””â”€â”€ Dashboard.jsx       # Tablero analÃ­tico y mÃ©tricas de gestiÃ³n
â”‚       â””â”€â”€ test/                   # Suite de pruebas frontend (Vitest)
â”‚           â”œâ”€â”€ setup.js            # ConfiguraciÃ³n de Jest-DOM y matchers
â”‚           â”œâ”€â”€ Layout.test.jsx
â”‚           â”œâ”€â”€ PanelAprobacion.test.jsx
â”‚           â””â”€â”€ PanelEstudiante.test.jsx
â”‚
â””â”€â”€ docs/                           # DocumentaciÃ³n formal del proyecto
    â”œâ”€â”€ README.md                   # Ãndice de documentaciÃ³n
    â”œâ”€â”€ ANALISIS_PROYECTO.md        # EspecificaciÃ³n tÃ©cnica y de arquitectura
    â”œâ”€â”€ plan_funcionalidad_flujos.md# Mapeo de flujos e historias de usuario
    â”œâ”€â”€ CF-FDE-201-Propuesta-TdG-FI-SIGMA-ITM-2devs-310826.docx # Formato oficial ITM
    â”œâ”€â”€ Historias_de_Usuario_SIGMA_ITM_310826.docx # Backlog detallado HU-01 a HU-15
    â””â”€â”€ img/                        # Recursos visuales de la documentaciÃ³n
        â”œâ”€â”€ banner.jpg              # Banner oficial SIGMA ITM
        â”œâ”€â”€ dashboard.jpg           # Captura del tablero analÃ­tico
        â”œâ”€â”€ logo-itm.png            # Logotipo oficial del ITM
        â””â”€â”€ hero.png                # GrÃ¡fico ilustrativo de portada
```

---

## ðŸš€ GuÃ­a de Inicio RÃ¡pido

### Requisitos Previos

- **Docker y Docker Compose** (para OpciÃ³n A), **o bien**:
- **Python 3.11 o superior**
- **Node.js 18 o superior** y **npm**
- **Git**

---

### OpciÃ³n A: Con Docker Compose (Recomendado)

Esta opciÃ³n levanta automÃ¡ticamente la base de datos PostgreSQL, el backend Django con migraciones y datos de prueba aplicados, y el frontend de Vite:

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_ORGANIZACION/sigma-itm.git
cd sigma-itm

# 2. Configurar archivos de entorno a partir de los ejemplos
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Construir e iniciar los servicios en segundo plano
docker compose up -d
```

Una vez levantados los contenedores:

- ðŸŒ **Frontend:** [http://localhost:5173](http://localhost:5173)
- ðŸ”Œ **API REST:** [http://localhost:8000/api/](http://localhost:8000/api/)
- âš™ï¸ **Panel Admin Django:** [http://localhost:8000/admin/](http://localhost:8000/admin/)

Para detener los servicios:

```bash
docker compose down
```

---

### OpciÃ³n B: Entorno Local Nativo

#### 1. Configurar Backend (Django)

```bash
# Navegar a la carpeta backend
cd backend

# Crear y activar entorno virtual
python -m venv venv
# En Windows:
.\venv\Scripts\activate
# En Linux / macOS:
# source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (usa SQLite por defecto)
cp .env.example .env

# Ejecutar migraciones
python manage.py migrate

# Poblar catÃ¡logo de modalidades y usuarios de prueba
python manage.py seed_data

# Iniciar servidor de desarrollo en puerto 8000
python manage.py runserver 8000
```

#### 2. Configurar Frontend (React + Vite)

En una **nueva terminal**:

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias Node
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo en puerto 5173
npm run dev
```

Abre tu navegador en [http://localhost:5173](http://localhost:5173).

---

## ðŸ‘¥ Usuarios y Datos de Prueba

El comando `python manage.py seed_data` crea automÃ¡ticamente las 10 modalidades oficiales y los siguientes usuarios de demostraciÃ³n listos para iniciar sesiÃ³n:

| Usuario                   | ContraseÃ±a                     | Rol en Plataforma           | Permisos y Alcance                                                                                   |
| ------------------------- | ------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `estudiante1`           | `sigma2026`                   | **Estudiante**        | Radica proyectos, sube anexos, consulta lÃ­nea de tiempo y descarga certificado                      |
| `asesor1`               | `sigma2026`                   | **Docente Asesor**    | Supervisa proyectos asignados en etapa`EN_PROCESO`, pide correcciones y aprueba para sustentaciÃ³n |
| `comite1`               | `sigma2026`                   | **ComitÃ© de Grados** | Revisa documentaciÃ³n, asigna asesores con directriz, aprueba actas y finaliza trÃ¡mites             |
| `admin1` *(Opcional)* | *(Crear con createsuperuser)* | **Administrador**     | Control total del sistema, activaciÃ³n de nuevos usuarios y catÃ¡logo                                |

> ðŸ’¡ **Para crear un Superusuario Administrador:**
>
> ```bash
> cd backend
> python manage.py createsuperuser
> ```

---

## ðŸ› ï¸ AutomatizaciÃ³n con Makefile

El proyecto incluye un [`Makefile`](Makefile) para facilitar el flujo de trabajo tanto en entornos locales como de integraciÃ³n continua (CI):

```bash
# Ver lista de comandos disponibles
make help

# InstalaciÃ³n completa de dependencias
make install

# Aplicar migraciones en backend
make migrate

# Cargar datos iniciales
make seed

# Ejecutar todas las pruebas (Backend + Frontend)
make test

# Ejecutar Ãºnicamente pruebas del Backend (pytest)
make test-backend

# Ejecutar Ãºnicamente pruebas del Frontend (vitest)
make test-frontend

# AnÃ¡lisis estÃ¡tico de cÃ³digo frontend
make lint

# Levantar servicios con Docker Compose
make docker-up

# Limpiar archivos temporales y caches (__pycache__, dist)
make clean
```

---

## ðŸ§ª Suite de Pruebas Automatizadas

La estabilidad de la lÃ³gica de negocio estÃ¡ garantizada por una amplia suite de pruebas que cubre el 100% de los escenarios crÃ­ticos:

### 1. Pruebas de Backend (`pytest` + `pytest-django`)

- **Total:** **57 tests automatizados** en [`backend/core/tests.py`](backend/core/tests.py).
- **Cobertura:**
  - Validaciones de transiciones de estado permitidas e invÃ¡lidas.
  - Bloqueo estricto de avance cuando existe correcciÃ³n pendiente.
  - GeneraciÃ³n de bitÃ¡cora inmutable en `HistorialEstado`.
  - Validadores por modalidad (presencia de documentos obligatorios).
  - SegregaciÃ³n de querysets por rol (RBAC).
  - Control de acceso por etapa (`puedeGestionarEtapa`).
  - EnvÃ­o automÃ¡tico de notificaciones por email.
  - Flujo de subsanaciÃ³n de observaciones con documento y mensaje.
  - EmisiÃ³n de certificado oficial en PDF.
  - AprobaciÃ³n y activaciÃ³n de cuentas por el Administrador.

```bash
cd backend
pytest -v
```

### 2. Pruebas de Frontend (`Vitest` + `@testing-library/react`)

- **Total:** **18 tests unitarios y de integraciÃ³n** en [`frontend/src/test/`](frontend/src/test/).
- **Cobertura:**
  - Renderizado condicional del menÃº segÃºn el rol autenticado.
  - VisualizaciÃ³n y descarga de expedientes documentales.
  - Bloqueo visual del panel cuando se requiere correcciÃ³n.
  - Modo solo lectura cuando la etapa no corresponde al rol del usuario.
  - Flujo interactivo de radicaciÃ³n de subsanaciones mediante modal.
  - Descarga del certificado PDF y manejo de errores.

```bash
cd frontend
npm test
```

### 3. SimulaciÃ³n de Flujo E2E Punta a Punta

El script [`backend/scripts/simulacion_flujo_completo.py`](backend/scripts/simulacion_flujo_completo.py) ejecuta una prueba de integraciÃ³n completa de **12 pasos consecutivos**:

```bash
cd backend
python scripts/simulacion_flujo_completo.py
```

---

## âš™ï¸ Variables de Entorno

### Backend (`backend/.env`)

| Variable                 | Tipo    | Por Defecto                   | DescripciÃ³n                                            |
| ------------------------ | ------- | ----------------------------- | ------------------------------------------------------- |
| `SECRET_KEY`           | String  | *Insegura en dev*           | Clave criptogrÃ¡fica de Django (cambiar en producciÃ³n) |
| `DEBUG`                | Boolean | `True`                      | Activa modo depuraciÃ³n (debe ser`False` en prod)     |
| `ALLOWED_HOSTS`        | CSV     | `localhost,127.0.0.1`       | Dominios/IPs autorizados para recibir peticiones        |
| `DB_ENGINE`            | String  | `sqlite`                    | `sqlite` (local) o `postgres` (producciÃ³n/Docker)  |
| `DB_NAME`              | String  | `sigma_itm`                 | Nombre de la base de datos PostgreSQL                   |
| `DB_USER`              | String  | `sigma_itm`                 | Usuario de PostgreSQL                                   |
| `DB_PASSWORD`          | String  | *(vacÃ­o)*                  | ContraseÃ±a de PostgreSQL                               |
| `DB_HOST`              | String  | `localhost`                 | Host de base de datos (`db` en Docker)                |
| `DB_PORT`              | Integer | `5432`                      | Puerto de conexiÃ³n a PostgreSQL                        |
| `CORS_ALLOWED_ORIGINS` | CSV     | `http://localhost:5173,...` | OrÃ­genes web autorizados para consultar la API         |
| `EMAIL_BACKEND`        | String  | `...console.EmailBackend`   | `console` (desarrollo) o `smtp` (producciÃ³n)       |

### Frontend (`frontend/.env`)

| Variable              | Tipo | Por Defecto                   | DescripciÃ³n                               |
| --------------------- | ---- | ----------------------------- | ------------------------------------------ |
| `VITE_API_BASE_URL` | URL  | `http://127.0.0.1:8000/api` | DirecciÃ³n base de la API REST del backend |

---

## ðŸ“ˆ Estado del Proyecto y Roadmap

### Funcionalidades Implementadas al 100% âœ…

- [X] AutenticaciÃ³n JWT con rotaciÃ³n de refresh tokens y lista negra.
- [X] CatÃ¡logo con las 10 modalidades oficiales de grado de la Facultad de IngenierÃ­as.
- [X] Motor de estados estricto con validaciones a nivel de servidor.
- [X] Control de acceso RBAC por rol y por etapa del trÃ¡mite.
- [X] Portal del estudiante con lÃ­nea de tiempo y ficha tÃ©cnica del proyecto.
- [X] Panel de evaluaciÃ³n para Asesores, ComitÃ©s y Administradores.
- [X] Carga, inspecciÃ³n y validaciÃ³n de documentos anexos por magic bytes.
- [X] Flujo bidireccional de correcciones y subsanaciones con soporte documental.
- [X] AsignaciÃ³n formal de docentes asesores con directriz tÃ©cnica.
- [X] NotificaciÃ³n de fechas y aulas para sustentaciones.
- [X] GeneraciÃ³n y descarga de certificados oficiales en formato PDF.
- [X] Tablero de analÃ­tica institucional con grÃ¡ficos interactivos (`Recharts`).
- [X] MÃ³dulo de gestiÃ³n y activaciÃ³n de nuevos usuarios por la AdministraciÃ³n.
- [X] Suite de 75 tests automatizados (57 backend + 18 frontend) pasando al 100%.

### PrÃ³ximos Hitos (Backlog Futuro) ðŸŽ¯

- [ ] IntegraciÃ³n con servidor de correo institucional Office 365 / Google Workspace vÃ­a SMTP.
- [ ] Firma digital criptogrÃ¡fica en el certificado PDF generado.
- [ ] Notificaciones push en navegador o mensajerÃ­a institucional.
- [ ] ConfiguraciÃ³n de despliegue automatizado mediante CI/CD (GitHub Actions).

---

## ðŸ“š DocumentaciÃ³n Adicional

En la carpeta [`docs/`](docs/) se encuentra disponible la documentaciÃ³n tÃ©cnica y acadÃ©mica complementaria:

- ðŸ“„ [**ANALISIS_PROYECTO.md**](docs/ANALISIS_PROYECTO.md): EspecificaciÃ³n tÃ©cnica exhaustiva del diseÃ±o de arquitectura.
- ðŸ“‹ [**plan_funcionalidad_flujos.md**](docs/plan_funcionalidad_flujos.md): Plan funcional detallado por casos de uso.
- ðŸ“‘ [**Propuesta de Trabajo de Grado (Formato ITM)**](docs/CF-FDE-201-Propuesta-TdG-FI-SIGMA-ITM-2devs-310826.docx): Documento oficial de formulaciÃ³n acadÃ©mica del proyecto.
- ðŸ“ [**Historias de Usuario (HU-01 a HU-15)**](docs/Historias_de_Usuario_SIGMA_ITM_310826.docx): EspecificaciÃ³n de requerimientos y criterios de aceptaciÃ³n.

---

## ðŸ¤ Contribuir

Las contribuciones son bienvenidas. Para mantener la coherencia y calidad del proyecto, consulta la [**GuÃ­a de ContribuciÃ³n**](CONTRIBUTING.md) antes de abrir un Pull Request:

- Formato de ramas: `feature/HU-XX-nombre`, `fix/descripcion`.
- ConvenciÃ³n de commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `test:`, `docs:`).
- EjecuciÃ³n obligatoria de `make test` antes de enviar cambios.

---

## ðŸ“œ CrÃ©ditos y Licencia

**Proyecto AcadÃ©mico y de Desarrollo TecnolÃ³gico**Facultad de IngenierÃ­as â€” **Instituto TecnolÃ³gico Metropolitano (ITM)**MedellÃ­n, Colombia â€¢ 2026.

- **InstituciÃ³n:** Instituto TecnolÃ³gico Metropolitano (ITM)
- **Facultad:** Facultad de IngenierÃ­as
- **Programa:** TecnologÃ­a en Desarrollo de Software / IngenierÃ­a de Sistemas
- **PropÃ³sito:** Trabajo de Grado e InnovaciÃ³n Institucional

---

<div align="center">
  <sub>Desarrollado con dedicaciÃ³n y excelencia para la comunidad acadÃ©mica del ITM.</sub>
</div>

