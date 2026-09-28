# MANUAL DE USUARIO — SIGMA ITM
## Sistema Integral de Gestión de Modalidades de Grado
**Facultad de Ingenierías — Instituto Tecnológico Metropolitano (ITM)**
*Medellín, Colombia | Versión del Sistema: 1.0 (2026) | Documentación Oficial*

---

<p align="center">
  <img src="img/banner.jpg" alt="SIGMA ITM — Banner Institucional" width="100%" />
</p>

---

## TABLA DE CONTENIDOS

- [1. Introducción y Marco Normativo](#1-introducción-y-marco-normativo)
  - [1.1 Propósito y Alcance del Sistema](#11-propósito-y-alcance-del-sistema)
  - [1.2 Marco Normativo Institucional](#12-marco-normativo-institucional)
  - [1.3 Requisitos Técnicos de Acceso](#13-requisitos-técnicos-de-acceso)
  - [1.4 Glosario de Términos Clave](#14-glosario-de-términos-clave)
- [2. Arquitectura de Seguridad y Control de Acceso (RBAC)](#2-arquitectura-de-seguridad-y-control-de-acceso-rbac)
  - [2.1 Los Cuatro Roles del Sistema](#21-los-cuatro-roles-del-sistema)
  - [2.2 Matriz Completa de Permisos por Rol](#22-matriz-completa-de-permisos-por-rol)
  - [2.3 Politica de Sesiones y Tokens JWT](#23-politica-de-sesiones-y-tokens-jwt)
  - [2.4 Validacion Binaria de Archivos (Magic Bytes)](#24-validacion-binaria-de-archivos-magic-bytes)
- [3. Modulo de Autenticacion y Registro de Usuarios](#3-modulo-de-autenticacion-y-registro-de-usuarios)
  - [3.1 Portal de Bienvenida — Landing Page](#31-portal-de-bienvenida--landing-page)
  - [3.2 Formulario de Registro Multietapa](#32-formulario-de-registro-multietapa)
  - [3.3 Flujo de Activacion Administrativa de Cuentas](#33-flujo-de-activacion-administrativa-de-cuentas)
  - [3.4 Inicio de Sesion — Pantalla de Login](#34-inicio-de-sesion--pantalla-de-login)
  - [3.5 Acceso Rapido con Perfiles de Prueba (Ambiente Demo)](#35-acceso-rapido-con-perfiles-de-prueba-ambiente-demo)
- [4. Modulo del Estudiante: Radicacion y Seguimiento de Tramites](#4-modulo-del-estudiante-radicacion-y-seguimiento-de-tramites)
  - [4.1 Descripcion del Panel del Estudiante](#41-descripcion-del-panel-del-estudiante)
  - [4.2 Guia de Radicacion: Las 10 Modalidades de Grado](#42-guia-de-radicacion-las-10-modalidades-de-grado)
  - [4.3 Carga y Gestion de Documentos Anexos](#43-carga-y-gestion-de-documentos-anexos)
  - [4.4 Interpretacion del Stepper de Progreso](#44-interpretacion-del-stepper-de-progreso)
  - [4.5 Protocolo de Subsanacion de Correcciones](#45-protocolo-de-subsanacion-de-correcciones)
  - [4.6 Historial de Tramites Anteriores](#46-historial-de-tramites-anteriores)
  - [4.7 Descarga del Certificado Oficial de Finalizacion (PDF)](#47-descarga-del-certificado-oficial-de-finalizacion-pdf)
- [5. Modulo del Docente Asesor: Supervision y Aval Tecnico](#5-modulo-del-docente-asesor-supervision-y-aval-tecnico)
  - [5.1 Panel de Control del Docente Asesor](#51-panel-de-control-del-docente-asesor)
  - [5.2 Gestion de la Etapa de Desarrollo (EN_PROCESO)](#52-gestion-de-la-etapa-de-desarrollo-en_proceso)
  - [5.3 Devolucion Formativa vs. Visto Bueno](#53-devolucion-formativa-vs-visto-bueno)
  - [5.4 Programacion y Calificacion de Sustentaciones](#54-programacion-y-calificacion-de-sustentaciones)
- [6. Modulo del Comite de Grados: Dictamen y Gobierno Academico](#6-modulo-del-comite-de-grados-dictamen-y-gobierno-academico)
  - [6.1 Panel de Control de Procesos del Comite](#61-panel-de-control-de-procesos-del-comite)
  - [6.2 KPIs Institucionales en Tiempo Real](#62-kpis-institucionales-en-tiempo-real)
  - [6.3 Revision Documental de Nuevas Postulaciones](#63-revision-documental-de-nuevas-postulaciones)
  - [6.4 Asignacion de Docente Asesor y Emision de Directriz](#64-asignacion-de-docente-asesor-y-emision-de-directriz)
  - [6.5 Pestana de Revision Comite: Ratificacion y Cierre de Expedientes](#65-pestana-de-revision-comite-ratificacion-y-cierre-de-expedientes)
  - [6.6 Historial y Trazabilidad de Proyectos](#66-historial-y-trazabilidad-de-proyectos)
  - [6.7 Causales de Rechazo y Procedimiento Notificatorio](#67-causales-de-rechazo-y-procedimiento-notificatorio)
- [7. Modulo del Administrador: Control Total y Analitica Institucional](#7-modulo-del-administrador-control-total-y-analitica-institucional)
  - [7.1 Gestion de Cuentas Pendientes de Aprobacion](#71-gestion-de-cuentas-pendientes-de-aprobacion)
  - [7.2 Tablero Analitico Institucional (Dashboard)](#72-tablero-analitico-institucional-dashboard)
  - [7.3 Auditoria Forense — Historial de Estados](#73-auditoria-forense--historial-de-estados)
- [8. Maquina de Estados: Ciclo de Vida Completo de una Postulacion](#8-maquina-de-estados-ciclo-de-vida-completo-de-una-postulacion)
  - [8.1 Diagrama Oficial de la Maquina de Estados](#81-diagrama-oficial-de-la-maquina-de-estados)
  - [8.2 Matriz Detallada de Transiciones de Estado](#82-matriz-detallada-de-transiciones-de-estado)
- [9. Casos Practicos de Extremo a Extremo (Walkthrough Completo)](#9-casos-practicos-de-extremo-a-extremo-walkthrough-completo)
  - [9.1 Caso A: Flujo Regular Aprobado (Trabajo de Grado)](#91-caso-a-flujo-regular-aprobado-trabajo-de-grado)
  - [9.2 Caso B: Flujo con Correccion Documental (Practicas Profesionales)](#92-caso-b-flujo-con-correccion-documental-practicas-profesionales)
  - [9.3 Caso C: Flujo de Rechazo por Incumplimiento](#93-caso-c-flujo-de-rechazo-por-incumplimiento)
- [10. Preguntas Frecuentes y Solucion de Problemas (Troubleshooting)](#10-preguntas-frecuentes-y-solucion-de-problemas-troubleshooting)

---

## 1. Introduccion y Marco Normativo

### 1.1 Proposito y Alcance del Sistema

El **Sistema Integral de Gestion de Modalidades de Grado (SIGMA ITM)** es la plataforma oficial de la Facultad de Ingenierias del Instituto Tecnologico Metropolitano (ITM) para la gestion digital, centralizada y trazable de todos los tramites de opciones de grado.

**SIGMA ITM elimina definitivamente los siguientes problemas del proceso tradicional:**

| Problema Anterior (Proceso Manual) | Solucion en SIGMA ITM |
| :--- | :--- |
| Estudiantes enviando documentos por correo personal a coordinadores | Repositorio digital centralizado con control de versiones |
| Desconocimiento del estudiante sobre el estado de su solicitud | Stepper de progreso en tiempo real con notificaciones |
| Sin registro de observaciones, devoluciones ni compromisos de asesor | Bitacora inmutable de HistorialEstado con timestamps UTC |
| Demoras en emision de paz y salvos y certificados de grado | Generacion automatica de Certificado PDF firmado digitalmente |
| Documentos falsificados o manipulados | Validacion de firmas binarias (Magic Bytes) con python-magic |
| Riesgo de perder expedientes fisicos | Persistencia en PostgreSQL con backups automatizados |

**Alcance funcional del sistema:**
- Registro y autenticacion segura de usuarios con roles diferenciados.
- Radicacion digital de las 10 modalidades de grado aprobadas por el ITM.
- Gestion del flujo completo: postulacion → revision → asignacion → desarrollo → sustentacion → finalizacion.
- Emision de certificados oficiales con hash SHA-256 verificable.
- Tablero analitico para decision de coordinacion academica.

---

### 1.2 Marco Normativo Institucional

SIGMA ITM opera bajo los lineamientos del **Reglamento Estudiantil de la Facultad de Ingenierias del ITM** y los siguientes principios de gobierno academico:

1. **Unicidad del Tramite:** Ningun estudiante puede tener mas de una postulacion activa en el sistema. Si desea cambiar de modalidad, el tramite activo debe ser cerrado primero.
2. **Inmutabilidad del Historial:** Cada accion del sistema —revision, correccion, asignacion, cambio de estado— genera un registro inalterable en base de datos. No es posible editar ni eliminar el historial.
3. **Validez Documental:** La documentacion aportada debe corresponder a los formatos institucionales aprobados, sin tachaduras, inconsistencias en sellos ni firmas no reconocibles.
4. **Confidencialidad:** Los expedientes de un estudiante solo son visibles para el estudiante mismo, su docente asesor asignado, los miembros del comite de grado y el administrador.

---

### 1.3 Requisitos Tecnicos de Acceso

| Parametro | Requerimiento Tecnico |
| :--- | :--- |
| **Navegadores Soportados** | Google Chrome v100+, Mozilla Firefox v100+, Microsoft Edge v100+, Safari v15+ |
| **Resolucion de Pantalla** | Minima 1280 x 720 px. Recomendada 1920 x 1080 px. Totalmente responsivo |
| **Conectividad** | Internet o red institucional ITM con acceso a puertos 5173 (frontend) y 8000 (API) |
| **Tipos de Archivos Aceptados** | `.pdf` (Adobe PDF), `.docx` (Microsoft Word moderno), `.zip` (archivos comprimidos) |
| **Tamano Maximo por Archivo** | 10.0 MB por archivo individual |
| **JavaScript** | Debe estar habilitado. La aplicacion es una SPA (Single Page Application) |

> **Nota de Produccion:** En el entorno de despliegue del ITM, el sistema es accesible mediante la URL institucional asignada por la Direccion de Informatica. En ambiente local de desarrollo, el frontend corre en `http://localhost:5173`.

---

### 1.4 Glosario de Terminos Clave

| Termino | Definicion |
| :--- | :--- |
| **Postulacion** | Solicitud formal de un estudiante para iniciar un tramite de opcion de grado |
| **Modalidad** | Una de las 10 alternativas formativas para obtener el titulo de grado |
| **Estado** | Etapa actual en la que se encuentra el tramite dentro del flujo de trabajo |
| **Stepper** | Barra visual de progreso que muestra las etapas completadas y pendientes |
| **Subsanacion** | Accion del estudiante de corregir y reenviar documentos observados |
| **Directriz** | Instruccion oficial emitida por el Comite al asignar un docente asesor |
| **Acta de Grado** | Documento oficial emitido por el Consejo de Facultad que certifica la aprobacion |
| **Hash SHA-256** | Huella digital criptografica del certificado que garantiza su autenticidad |
| **JWT** | Token de autenticacion digital que identifica al usuario en cada peticion |
| **RBAC** | Control de Acceso Basado en Roles: cada rol tiene permisos especificos |

---

## 2. Arquitectura de Seguridad y Control de Acceso (RBAC)

### 2.1 Los Cuatro Roles del Sistema

SIGMA ITM opera con cuatro roles perfectamente diferenciados. Cada usuario tiene exactamente un rol asignado por el administrador:

```
 ESTUDIANTE   -->  Radica, da seguimiento, sube documentos, subsana, descarga certificado
 DOCENTE ASESOR  -->  Supervisa EN_PROCESO, programa sustentacion, califica, da visto bueno
 COMITE          -->  Revisa documentacion, aprueba, asigna asesores, ratifica actas, finaliza
 ADMINISTRADOR   -->  Aprueba cuentas, parametriza sistema, audita todo, acceso total
```

El frontend React detecta automaticamente el rol del usuario al iniciar sesion y redirige a la interfaz correspondiente:
- **Estudiante** → `/estudiante` — Panel personal del estudiante
- **Docente Asesor** → `/aprobacion` — Panel de aprobacion y seguimiento
- **Comite** → `/aprobacion` — Panel de control de procesos (con mas permisos)
- **Administrador** → `/aprobacion` + `/dashboard` — Acceso total

---

### 2.2 Matriz Completa de Permisos por Rol

| Accion / Funcionalidad | Estudiante | Docente Asesor | Comite de Grados | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| Crear cuenta de usuario | Publico | Publico | No (solo Admin) | Si |
| Radicar nueva postulacion | Si (propia) | No | No | Si |
| Consultar expediente propio | Si | No | No | Si |
| Subir archivos anexos | Si | No | No | Si |
| Subsanar observaciones del evaluador | Si | No | No | No |
| Descargar certificado oficial PDF | Si (al finalizar) | Si | Si | Si |
| Iniciar Revision Documental | No | No | Si | Si |
| Aprobar o devolver requisitos documentales | No | No | Si | Si |
| Asignar docente asesor con directriz | No | No | Si | Si |
| Gestionar etapa EN_PROCESO | No | Si (solo asignado) | No | Si |
| Programar y calificar sustentacion | No | Si (solo asignado) | No | Si |
| Ratificar acta en REVISION_COMITE | No | No | Si | Si |
| Aprobar o rechazar cuentas pendientes | No | No | No | Si |
| Acceso al Dashboard analitico | No | Si (vista limitada) | Si (vista completa) | Si (completo) |
| Auditar HistorialEstado | No | No | Si | Si |

---

### 2.3 Politica de Sesiones y Tokens JWT

El sistema implementa autenticacion mediante **JSON Web Tokens (JWT)** con renovacion automatica silenciosa:

- **Access Token:** Vida util de **20 minutos**. Se envia en cada peticion en el header `Authorization: Bearer <token>`. Si expira y el usuario esta activo, se renueva automaticamente.
- **Refresh Token:** Vida util de **7 dias**. Permite solicitar un nuevo Access Token sin que el usuario tenga que iniciar sesion de nuevo.
- **Lista Negra (Blacklist):** Al cerrar sesion, el token queda invalidado en base de datos. Un atacante que lo robe no podra usarlo.
- **Proteccion Fuerza Bruta:** El endpoint `/api/token/` aplica rate limiting: si una IP realiza mas de 5 intentos fallidos, queda bloqueada temporalmente.

---

### 2.4 Validacion Binaria de Archivos (Magic Bytes)

> [!CAUTION]
> **Inspeccion de Firmas Binarias:** El sistema **no confia** en la extension del archivo. Cada documento subido pasa por una verificacion de encabezados binarios con `python-magic`. Si un usuario intenta subir un archivo ejecutable (`.exe`, `.bat`, `.sh`, `.js`) renombrado como `.pdf` o `.docx`, el servidor lo rechaza con un error `400 Bad Request` y registra el intento.

Formatos aceptados y sus firmas binarias reconocidas:
- **PDF:** Encabezado `%PDF-`
- **DOCX:** Estructura ZIP con `[Content_Types].xml` (formato Open XML)
- **ZIP:** Encabezado `PK`

---

## 3. Modulo de Autenticacion y Registro de Usuarios

### 3.1 Portal de Bienvenida — Landing Page

Al abrir la URL del sistema sin haber iniciado sesion, el navegador muestra el **Portal de Bienvenida Institucional de SIGMA ITM**:

<p align="center">
  <img src="img/screenshot_landing.png" alt="Portal de Bienvenida SIGMA ITM — Landing Page" width="92%" />
</p>

**Descripcion detallada de la pantalla:**

La pantalla tiene fondo degradado gris claro y se divide en dos zonas principales:

**Zona superior — Barra de navegacion:**
- Logotipo oficial del ITM en la esquina superior izquierda con el texto "SIGMA ITM".
- Un unico boton de accion en la esquina superior derecha: **"Iniciar Sesion"** (boton oscuro redondeado).

**Zona central — Hero Section:**
- Etiqueta "PLATAFORMA ACADEMICA" en un recuadro gris redondeado.
- Titulo principal en negrita grande: *"Gestiona tu Opcion de Grado facilmente."*, con la palabra "Grado" en color morado institucional.
- Parrafo descriptivo: *"El sistema oficial del Instituto Tecnologico Metropolitano (ITM) para administrar, revisar y aprobar los proyectos y practicas de nuestros estudiantes."*
- Dos botones de llamado a la accion:
  - **"Comenzar mi proceso"** (boton oscuro principal, lleva al registro).
  - **"Ver modalidades"** (boton blanco con borde, muestra el catalogo informativo).

**Zona inferior — Seccion "Modalidades Disponibles":**
- Titulo: *"Modalidades Disponibles — Conoce las opciones que tienes para culminar tu carrera"*.
- Tarjetas informativas con cada una de las 10 opciones de grado disponibles.

**Acciones disponibles desde esta pantalla:**
1. Clic en **"Comenzar mi proceso"** o **"Iniciar Sesion"** → Navegar a `/login`.
2. Clic en **"Ver modalidades"** → Desplazarse a la seccion informativa de modalidades.

---

### 3.2 Formulario de Registro Multietapa

Para acceder al sistema por primera vez, un usuario debe crear una cuenta. Haga clic en **"Comenzar mi proceso"** desde la landing page o navegue a `/crear-usuario`:

**El formulario se divide en dos pasos secuenciales:**

#### Paso 1: Datos Personales e Identidad Academica
Rellene los siguientes campos:

| Campo | Descripcion | Ejemplo |
| :--- | :--- | :--- |
| **Nombre** | Nombre(s) segun documento de identidad | Maria Fernanda |
| **Apellido** | Apellidos completos | Gonzalez Restrepo |
| **Correo Electronico** | Correo institucional `@itm.edu.co` o correo valido | mfgonzalez@itm.edu.co |
| **Cedula de Ciudadania** | Numero sin puntos ni comas | 1037812345 |
| **Programa Academico** | Menu desplegable con carreras oficiales del ITM | Ingenieria de Sistemas |
| **Rol Solicitado** | Seleccion entre Estudiante o Docente Asesor | Estudiante |

Programas disponibles en el desplegable:
- Ingenieria de Sistemas
- Ingenieria Electronica
- Ingenieria Biomedica
- Tecnologia en Sistemas de Informacion
- Tecnologia en Electronica
- Administracion Tecnologica
- Tecnologia en Desarrollo de Software

#### Paso 2: Credenciales de Acceso
| Campo | Descripcion | Restricciones |
| :--- | :--- | :--- |
| **Nombre de Usuario** | Identificador unico del sistema | Solo letras, numeros y puntos |
| **Contrasena** | Clave de acceso segura | Min. 8 caracteres, 1 mayuscula, 1 numero, 1 especial |
| **Indicador de Fortaleza** | Barra visual que evalua la robustez | Muy debil → Excelente |
| **Confirmacion de Contrasena** | Repeticion exacta de la contrasena | Debe coincidir exactamente |

---

### 3.3 Flujo de Activacion Administrativa de Cuentas

> [!IMPORTANT]
> **Aprobacion Obligatoria:** Tras enviar el formulario, la cuenta **NO se activa de inmediato**. El usuario recibira el mensaje *"Tu solicitud fue recibida y esta Pendiente de Aprobacion por el Administrador"*. El Administrador del ITM debe verificar la matricula activa del estudiante o la vinculacion del docente antes de habilitar el acceso al sistema. Solo entonces el usuario puede iniciar sesion.

**¿Cuanto demora la activacion?** Depende de la carga del Administrador. En periodos normales, de 24 a 48 horas habiles. En periodos de matricula, puede ser el mismo dia.

---

### 3.4 Inicio de Sesion — Pantalla de Login

Al navegar a `/login` (o al hacer clic en "Iniciar Sesion"), el sistema muestra la pantalla de autenticacion oficial:

<p align="center">
  <img src="img/screenshot_login.png" alt="Pantalla de Inicio de Sesion — SIGMA ITM" width="85%" />
</p>

**Descripcion detallada de la pantalla:**

La pantalla tiene un **fondo oscuro azul marino con gradiente a morado** y puntos decorativos, estableciendo una estetica institucional distinguida. Al centro hay una tarjeta blanca con:

- **Encabezado del sistema:** Titulo "SIGMA ITM" en texto blanco grande y bold sobre el fondo oscuro.
- **Subtitulo:** *"Sistema de Seguimiento y Control de Modalidades de Opcion de Grado"* en color morado claro.
- **Campo "USUARIO O CORREO INSTITUCIONAL":** Campo de texto con placeholder *"ej: estudiante1 o usuario@correo.itm.edu.co"*. Acepta tanto el nombre de usuario como el correo registrado.
- **Campo "CONTRASENA":** Campo enmascarado con puntos.
- **Boton "INGRESAR AL SISTEMA":** Boton morado/lila de ancho completo. Al presionarlo, el sistema valida las credenciales.
- **Enlace** *"No tienes cuenta? Crear una aqui"* (icono estrella) en la parte inferior del formulario.
- **Seccion "ACCESO RAPIDO A PERFILES DE PRUEBA":** Cuatro botones de acceso directo para el ambiente demo:
  - Estudiante (Jorge Bernal)
  - Docente Asesor (Miguel Ojeda)
  - Comite Grado (Comite Principal)
  - Administrador (Admin General)
  - Contrasena de todos: `sigma2026`

#### Posibles Respuestas del Sistema al Intentar Ingresar:

| Respuesta | Significado | Accion Recomendada |
| :--- | :--- | :--- |
| Redireccion automatica al panel del rol | Acceso exitoso | Ningun problema |
| *"No active account found with the given credentials"* | Usuario o contrasena incorrectos | Verifique la contrasena. Use "Recuperar Contrasena" |
| *"Tu cuenta esta pendiente de aprobacion"* | Registro exitoso pero no activado aun | Espere la aprobacion del Administrador |
| *"Demasiados intentos fallidos. Intente nuevamente en unos minutos"* | Bloqueo por rate limiting (5+ intentos) | Espere 15 minutos y reintente |

---

### 3.5 Acceso Rapido con Perfiles de Prueba (Ambiente Demo)

El sistema incluye cuatro cuentas de demostracion pre-cargadas para facilitarle a evaluadores, jurados y demostraciones academicas el acceso inmediato sin necesidad de registro:

| Perfil de Prueba | Nombre | Usuario | Contrasena | Rol |
| :--- | :--- | :--- | :--- | :--- |
| Estudiante | Jorge Bernal | jorge.bernal | sigma2026 | Estudiante |
| Docente Asesor | Miguel Ojeda | miguel.ojeda | sigma2026 | Asesor |
| Comite de Grado | Jorge Ivan (Comite Principal) | comite1 | sigma2026 | Comite |
| Administrador | Admin General | admin | sigma2026 | Administrador |

> **Nota:** Estos perfiles se cargan con el comando `python manage.py seed_data` del backend. Los datos de los estudiantes de prueba incluyen postulaciones en distintos estados del flujo para facilitar la evaluacion completa del sistema.

---

## 4. Modulo del Estudiante: Radicacion y Seguimiento de Tramites

### 4.1 Descripcion del Panel del Estudiante

Al iniciar sesion como **Estudiante**, el sistema redirige automaticamente a `/estudiante`, que es el panel operativo personal del usuario:

<p align="center">
  <img src="img/screenshot_panel_estudiante.png" alt="Panel Personal del Estudiante — SIGMA ITM" width="92%" />
</p>

**Descripcion detallada de la pantalla:**

La interfaz del estudiante tiene una **barra lateral oscura** a la izquierda y el area de contenido principal a la derecha.

**Barra lateral izquierda:**
- Logo "SIGMA ITM" en la parte superior.
- Menu con la opcion **"Mi Proceso"** resaltada en azul (opcion activa).
- En la parte inferior: nombre del usuario logueado ("Jorge Bernal"), rol ("ESTUDIANTE") y boton "Cerrar Sesion" en rojo.

**Encabezado del area de contenido:**
- Titulo de pagina: **"Mi Proceso de Opcion de Grado"**
- Subtitulo con datos del usuario: *"Jorge Bernal · Tecnologia en Desarrollo de Software"*
- Icono de campana de notificaciones (esquina superior derecha) con indicador de notificaciones pendientes.

**Tarjeta principal del portal del estudiante (fondo oscuro):**
- Etiqueta "PORTAL DEL ESTUDIANTE · Jorge Bernal"
- Titulo: **"Gestion de Opciones de Grado"**
- Datos del estudiante: CC, Programa, Correo institucional
- Boton destacado: **"POSTULAR A NUEVA OPCION DE GRADO"** (morado/violeta)

**Seccion "TUS TRAMITES DE OPCION DE GRADO":**
- Muestra etiquetas de cada tramite registrado con su estado actual. En la captura real, el estudiante Jorge Bernal tiene tres tramites: dos Pasantias y un Trabajo de Grado, todos en estado **"Finalizado"** (etiqueta verde).
- Botones para seleccionar cual tramite ver en detalle.

**Botones de navegacion del expediente activo:**
- **"Detalle de este Proceso (Pasantia)"** (boton azul oscuro): abre el expediente completo del tramite seleccionado.
- **"Historial de Mis Proyectos Anteriores (3)"** (icono naranja): muestra el historial academico de tramites cerrados.

**Seccion del expediente activo:**
- Muestra la modalidad del tramite activo con icono y estado en verde.
- Nombre del proyecto: **"DOGMA1.0"** — Pasantia
- Informacion del Docente Asesor Asignado: nombre completo, boton con correo electronico.
- Directriz del Comite/Administrador visible en texto cursiva.

---

### 4.2 Guia de Radicacion: Las 10 Modalidades de Grado

Si el estudiante no tiene ningun tramite activo —o quiere postular a otra modalidad disponible—, hace clic en el boton **"POSTULAR A NUEVA OPCION DE GRADO"**. Esto abre el formulario de radicacion.

**Campos generales (para todas las modalidades):**
- **Titulo del Proyecto:** Nombre oficial definitivo de la propuesta (maximo 250 caracteres).
- **Modalidad:** Menu desplegable con las 10 opciones vigentes (ver tabla abajo).

**Descripcion de las 10 Modalidades y sus Documentos Requeridos:**

| # | Modalidad | Codigo | Datos Especificos Requeridos | Documentos Obligatorios a Adjuntar |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Trabajo de Grado** | TRABAJO_GRADO | Linea de investigacion, planteamiento del problema, objetivos generales y especificos | Anteproyecto formal firmado + Paz y salvo academico |
| 2 | **Practicas Profesionales** | PRACTICAS_PROFESIONALES | Razon social empresa, NIT, nombre del jefe inmediato, telefono, cargo a desempenar | Carta de aceptacion empresarial + Certificado afiliacion ARL + Plan de practica |
| 3 | **Pasantia de Investigacion** | PASANTIA | Institucion o laboratorio receptor, investigador principal, pais/ciudad, cronograma | Carta de invitacion oficial + Convenio interinstitucional + Plan de pasantia |
| 4 | **Emprendimiento** | EMPRENDIMIENTO | Nombre de la iniciativa, sector economico, estado del Canvas, incubadora vinculada | Plan de negocio + Aval de Parque E o Centro de Emprendimiento ITM |
| 5 | **Producto en Laboratorio** | PRODUCTO_LABORATORIO | Laboratorio sede, nombre del prototipo, ficha tecnica, insumos requeridos | Aval firmado por Jefatura de Laboratorios + Memoria tecnica del prototipo |
| 6 | **Producto de Investigacion** | PRODUCTO_INVESTIGACION | Grupo de investigacion, codigo MinCiencias, titulo del paper/patente, revista/congreso | Constancia del Lider del Grupo + Borrador del articulo o notificacion de patente |
| 7 | **Reconocimiento Laboral** | RECONOCIMIENTO_LABORAL | Empresa actual, tiempo laborado (min. 1 ano afin), funciones desempenadas, cargo | Certificado laboral con funciones + Memoria tecnica de labores ejecutadas |
| 8 | **Certificacion Internacional** | CERTIFICACION | Casa certificadora (AWS, Cisco, Microsoft, etc.), codigo del examen, vigencia, puntaje | Voucher o certificado digital oficial + Ficha tecnica de competencias evaluadas |
| 9 | **Cursos de Posgrado** | CURSOS_POSGRADO | Maestria o especializacion ITM, asignaturas matriculadas, creditos acumulados | Constancia de matricula de posgrado + Certificado de calificaciones |
| 10 | **Ingenieria para la Gente** | INGENIERIA_GENTE | Comunidad beneficiaria, diagnostico comunitario, poblacion atendida | Carta de aval comunitario + Diagnostico del problema + Plan de intervencion social |

> **Nota importante:** Los campos especificos se despliegan dinamicamente segun la modalidad seleccionada. No apareceran campos innecesarios.

---

### 4.3 Carga y Gestion de Documentos Anexos

Dentro del expediente activo, la zona **"Documentos del Proyecto"** permite adjuntar todos los archivos de soporte:

**Proceso paso a paso:**
1. Ingrese el **Nombre Descriptivo** del archivo en el campo de texto (ej. `Anteproyecto_V2_Final`, `Certificado_ARL_2026`).
2. Haga clic en **"Examinar..."** y seleccione el archivo desde su computador.
3. El sistema valida en el navegador que:
   - El archivo no supere los **10 MB** de tamano.
   - La extension sea `.pdf`, `.docx` o `.zip`.
4. Presione **"Subir Archivo"**.
5. El servidor realiza la validacion binaria (Magic Bytes). Si el archivo es legitimo, aparece en la tabla de anexos con:
   - Nombre del archivo.
   - Fecha y hora exacta de subida.
   - Tamano en KB o MB.
   - Boton para **Visualizar / Descargar** el archivo.

**Errores comunes y su soluciones:**

| Error | Causa | Solucion |
| :--- | :--- | :--- |
| *"Archivo demasiado grande"* | Supera 10 MB | Comprima el PDF con Smallpdf o ilovepdf.com |
| *"Tipo de archivo no permitido"* | Formato invalido | Exporte el documento a PDF estandar |
| *"Firma binaria invalida"* | Archivo corrupto o disfrazado | Vuelva a generar el PDF desde el programa original |

---

### 4.4 Interpretacion del Stepper de Progreso

La **Linea de Tiempo Interactiva (Stepper)** muestra de forma clara y visual el avance del tramite a traves de sus 7 etapas:

```
 Paso 1         Paso 2          Paso 3        Paso 4      Paso 5         Paso 6        Paso 7
[Radicacion] → [Rev. Doc.] → [Aprobacion] → [En Proceso] → [Sustentacion] → [Rev. Comite] → [Finalizado]
 Estudiante      Comite          Comite         Asesor         Asesor           Comite       (Graduacion)
```

**Significado visual de los nodos:**
| Apariencia del Nodo | Significado |
| :--- | :--- |
| Circulo azul/verde solido con checkmark | Etapa ya cursada y aprobada exitosamente |
| Circulo con borde azul pulsante y texto en negrita | **Etapa actual activa** — es aqui donde se requiere accion |
| Circulo gris con numero | Etapa futura aun no habilitada |
| Circulo rojo / icono de X | Tramite rechazado en esta etapa |
| Circulo amarillo / icono de alerta | Tramite pausado en esta etapa por correccion pendiente |

**Responsable de cada etapa:**
- Pasos 1: El estudiante crea el tramite.
- Pasos 2, 3: El Comite de Grados actua.
- Paso 4: El Docente Asesor gestiona el desarrollo.
- Paso 5: El Asesor programa y califica la sustentacion.
- Paso 6: El Comite ratifica el resultado.
- Paso 7: Sistema genera el certificado automaticamente.

---

### 4.5 Protocolo de Subsanacion de Correcciones

Cuando el Comite o el Asesor solicitan una correccion, el tramite se pausa y el estudiante recibe una notificacion. Al ingresar al panel, el expediente muestra:

1. **Alerta visual amarilla/naranja** destacada: *"Tramite Pausado: Requiere Correccion del Estudiante"*.
2. **Cuadro de Observacion del Evaluador:** Texto exacto de lo que debe corregirse (ej. *"Falta adjuntar el certificado de afiliacion a la ARL emitido por la empresa"*).
3. **Formulario de Subsanacion:** Dos campos obligatorios:
   - **Mensaje de Subsanacion:** Explicacion textual de las correcciones realizadas punto por punto.
   - **Archivo Corregido:** El nuevo documento que reemplaza o complementa al anterior.
4. Presione el boton **"Enviar Subsanacion"**.

**Que ocurre al enviar:**
- La bandera `requiere_correccion` se desactiva en base de datos.
- El trámite se descongela y vuelve a estar activo.
- El evaluador (Comite o Asesor) recibe la notificacion y puede revisarlo.
- Se genera un nuevo registro en el `HistorialEstado` con la subsanacion.

> [!WARNING]
> No puede enviar una subsanacion vacia. Debe incluir tanto el mensaje textual como el archivo corregido. De lo contrario, el sistema mostrara el error de validacion correspondiente.

---

### 4.6 Historial de Tramites Anteriores

El panel del estudiante incluye un boton **"Historial de Mis Proyectos Anteriores (N)"** que muestra todos los tramites cerrados o finalizados del usuario a lo largo de su historia academica en el ITM. En la captura real del sistema, el estudiante Jorge Bernal tiene 3 proyectos anteriores.

Desde el historial puede:
- Consultar el estado final de cada tramite (Finalizado o Rechazado).
- Ver los documentos que adjunto en cada tramite.
- Descargar el Certificado Oficial PDF si el tramite quedo en estado **Finalizado**.

---

### 4.7 Descarga del Certificado Oficial de Finalizacion (PDF)

Cuando el tramite alcanza el estado definitivo **`FINALIZADO`**:

1. El boton **"Descargar Certificado Oficial (PDF)"** en color verde aparece habilitado.
2. Al presionarlo, el sistema genera el documento al instante (motor ReportLab) con:
   - **Membrete y escudo oficial del ITM** en el encabezado.
   - **Nombre completo del graduando** y numero de documento.
   - **Modalidad de grado convalidada** y titulo del proyecto.
   - **Fecha de sustentacion** y calificacion numerica obtenida (ej. 4.8).
   - **Numero de Acta de Grado** oficial asignado por el Consejo de Facultad.
   - **Hash SHA-256** al pie del documento para verificacion de autenticidad.
3. El archivo se descarga al computador en formato PDF, listo para presentar a la Secretaria General.

---

## 5. Modulo del Docente Asesor: Supervision y Aval Tecnico

### 5.1 Panel de Control del Docente Asesor

Al iniciar sesion con el rol **Docente Asesor**, el sistema redirige a `/aprobacion`, el Panel de Control de Procesos:

<p align="center">
  <img src="img/screenshot_panel_aprobacion.png" alt="Panel de Control de Procesos — Vista del Docente Asesor / Comite" width="92%" />
</p>

La vista del Docente Asesor dentro de este panel es mas restringida que la del Comite: **solo ve los tramites en los que fue formalmente designado como asesor**.

**Descripcion detallada de la pantalla (lectura de la captura real):**

La barra lateral izquierda oscura muestra:
- "SIGMA ITM" como logo.
- Opciones de menu: **Procesos** (activa) y **Estadisticas**.
- En la parte inferior: nombre del usuario logueado ("Jorge Ivan Bedoya R..."), rol ("COMITE") y boton "Cerrar Sesion".

La tarjeta principal de encabezado (fondo oscuro) muestra:
- Etiqueta "COMITE DE TRABAJOS DE GRADO · Jorge Ivan"
- Titulo: **"Panel de Control de Procesos"**
- Descripcion: *"Revision documental, aprobacion de postulaciones, asignacion de docentes asesores y control de sustentaciones."*
- **KPIs en tiempo real** en 4 tarjetas numericas:
  - **6** — Total Tramites
  - **1** — En Proceso
  - **0** — Correccion
  - **1** — Sin Asesor

---

### 5.2 Gestion de la Etapa de Desarrollo (EN_PROCESO)

Cuando el Comite aprueba y asigna al docente, el tramite pasa a estado `EN_PROCESO`. El docente puede:

1. Abrir el expediente del estudiante haciendo clic en **"Ver Detalle / Gestionar"**.
2. Leer la **Directriz del Comite** recibida al momento de la asignacion.
3. Descargar los archivos de trabajo del estudiante para revisarlos.
4. Registrar **Notas de Asesoria** periodicas (bitacora de reuniones y compromisos de avance).

---

### 5.3 Devolucion Formativa vs. Visto Bueno

El asesor tiene dos opciones segun el desempeño del estudiante:

**Opcion A — Solicitar Correccion de Avance:**
Si el informe tecnico o prototipo presenta inconsistencias metodologicas:
1. Haga clic en **"Solicitar Correccion"**.
2. Escriba las observaciones tecnicas detalladas en el campo de texto.
3. Adjunte opcionalmente un archivo con anotaciones o correcciones (`archivo_asesor`).
4. Confirme. El sistema bloquea al estudiante hasta que entregue la subsanacion.

**Opcion B — Otorgar Visto Bueno (Avanzar a Sustentacion):**
Cuando el estudiante cumple el 100% de los objetivos del proyecto:
1. Haga clic en el boton verde **"Dar Visto Bueno (Avanzar a Sustentacion)"**.
2. El sistema abre el modal de programacion de la defensa publica.
3. El estado pasa a `SUSTENTACION`.

---

### 5.4 Programacion y Calificacion de Sustentaciones

**Programar la Sustentacion:**
En el modal de programacion, el asesor ingresa:
- **Fecha y Hora:** Seleccionadas del calendario y selector de tiempo.
- **Lugar:** Puede ser un aula fisica (ej. *Campus Robledo - Bloque E, Aula 302*) o un enlace virtual (ej. *Enlace Microsoft Teams: https://...*).

Al guardar, el estudiante recibe notificacion inmediata con la fecha, hora y lugar de la sustentacion visible en su panel.

**Calificar la Sustentacion:**
Tras la defensa publica:
1. El docente hace clic en **"Calificar Sustentacion"**.
2. Ingresa la **Calificacion Numerica** (escala 0.0 a 5.0, decimales permitidos).
3. Escribe el **Concepto del Jurado** (fortalezas del proyecto, observaciones y recomendaciones).
4. Confirma la calificacion.

**Reglas de transicion segun la calificacion:**
- Nota **>= 3.0:** El sistema aprueba automaticamente y avanza a `REVISION_COMITE` para el cierre formal.
- Nota **< 3.0:** El sistema puede marcar el tramite como `RECHAZADO` segun decision del comite.

---

## 6. Modulo del Comite de Grados: Dictamen y Gobierno Academico

### 6.1 Panel de Control de Procesos del Comite

Los miembros del Comite de Trabajos de Grado tienen acceso al mismo panel `/aprobacion` que el Docente Asesor, pero con **visibilidad y permisos ampliados sobre todos los tramites de la facultad**:

<p align="center">
  <img src="img/screenshot_panel_aprobacion.png" alt="Panel de Control de Procesos — Vista del Comite de Grados" width="92%" />
</p>

El Panel de Control de Procesos se organiza en **tres pestanas principales** visibles en la barra de navegacion superior del contenido:

1. **"Gestion de Procesos (N)"** — Tramites activos que requieren accion del Comite.
2. **"Revision Comite (N)"** — Sustentaciones calificadas listas para ratificacion y cierre.
3. **"Historial y Trazabilidad de Proyectos"** — Registro completo de todos los tramites (activos y cerrados).

---

### 6.2 KPIs Institucionales en Tiempo Real

La tarjeta de encabezado oscura muestra **cuatro indicadores clave de gestion (KPIs)** que se actualizan en tiempo real al recargar el panel:

| KPI | Descripcion | Valor en la captura |
| :--- | :--- | :---: |
| **Total Tramites** | Total de postulaciones registradas en el sistema | **6** |
| **En Proceso** | Tramites actualmente en etapa de desarrollo con asesor | **1** |
| **Correccion** | Tramites pausados esperando subsanacion del estudiante | **0** |
| **Sin Asesor** | Tramites en estado `APROBACION` que aun no tienen asesor asignado | **1** |

> El KPI **"Sin Asesor" = 1** es una alerta operativa critica: indica que hay un tramite aprobado que esta esperando la asignacion formal de un docente asesor para continuar. El Comite debe atenderlo con prioridad.

---

### 6.3 Revision Documental de Nuevas Postulaciones

Cuando un estudiante radica una nueva postulacion, aparece en la pestana **"Gestion de Procesos"** con estado `POSTULACION`. El flujo del Comite es:

**Paso 1: Iniciar Revision Documental**
- El miembro del Comite abre el expediente del estudiante.
- Hace clic en **"Iniciar Revision Documental"** → el estado cambia a `REVISION_DOCUMENTAL`.

**Paso 2: Revisar Documentos Adjuntos**
El Comite descarga y coteja cada documento:
- ¿Cumple el numero minimo de creditos aprobados?
- ¿El anteproyecto incluye planteamiento, objetivos y metodologia clara?
- ¿Las cartas empresariales o de laboratorio estan firmadas y selladas?
- ¿El documento es el formato institucional aprobado?

**Paso 3A: Aprobar (si todo esta correcto)**
- Clic en **"Aprobar Requisitos Documentales"** → estado avanza a `APROBACION`.

**Paso 3B: Solicitar Correccion (si hay deficiencias)**
- Clic en **"Solicitar Correccion"**.
- Escribir la observacion detallada para el estudiante.
- El estado permanece en `REVISION_DOCUMENTAL` pero `requiere_correccion = True`.
- El estudiante queda bloqueado hasta subsanar.

**Paso 3C: Rechazar definitivamente (si no hay solucion posible)**
- Clic en **"Rechazar Definitivamente"** + causal reglamentaria.

---

### 6.4 Asignacion de Docente Asesor y Emision de Directriz

Cuando un tramite esta en estado `APROBACION`, el Comite debe asignar el docente asesor:

1. Abrir el expediente del estudiante.
2. Hacer clic en **"Asignar Docente Asesor"**.
3. Del menu desplegable, seleccionar un docente del listado de **Docentes Asesores Activos** registrados en el sistema.
4. **Redactar la Directriz Tecnica Institucional** (campo obligatorio de texto libre). Ejemplo: *"El estudiante debe enfocar el desarrollo del prototipo IoT en la normativa tecnica nacional NTC-4144 y presentar informe de avance cada 30 dias al asesor designado."*
5. Hacer clic en **"Confirmar Asignacion"**.

**Que ocurre al confirmar:**
- El sistema asocia al docente con el expediente del estudiante.
- El estado cambia a `EN_PROCESO`.
- La directriz queda registrada permanentemente en el expediente.
- El docente asesor puede ver el tramite desde su propio panel.
- El estudiante ve el nombre y correo del asesor asignado en su panel.

---

### 6.5 Pestana de Revision Comite: Ratificacion y Cierre de Expedientes

Tras una sustentacion aprobada, el tramite llega a la bandeja en estado **`REVISION_COMITE`** (pestana "Revision Comite (N)"):

1. El Comite abre el expediente y revisa el acta de sustentacion y la calificacion registrada.
2. Verifica que la nota sea >= 3.0 y que el concepto del jurado sea completo.
3. Hace clic en **"Ratificar y Finalizar Proceso de Grado"**.
4. Ingresa el **Numero Oficial de Acta de Grado** emitido por el Consejo de Facultad (ej. `ITM-FI-2026-089`).
5. Hace clic en **"Finalizar Proyecto"**.

**Efectos inmediatos al finalizar:**
- El estado pasa definitivamente a **`FINALIZADO`**.
- El expediente queda sellado (inmutable).
- El motor **ReportLab** genera automaticamente el Certificado Oficial de Grado.
- El hash SHA-256 del certificado se registra en la base de datos.
- El estudiante puede descargar su certificado desde su panel.

---

### 6.6 Historial y Trazabilidad de Proyectos

La pestana **"Historial y Trazabilidad de Proyectos"** es la vista de auditoria del Comite. Muestra **todos** los tramites registrados en el sistema (activos, finalizados y rechazados) con filtros avanzados:

- **Filtro por Estado:** POSTULACION, REVISION_DOCUMENTAL, APROBACION, EN_PROCESO, SUSTENTACION, REVISION_COMITE, FINALIZADO, RECHAZADO.
- **Filtro por Modalidad:** Trabajo de Grado, Practicas, Emprendimiento, etc.
- **Busqueda Dinamica:** Por nombre del estudiante, cedula o titulo del proyecto (sin recargar la pagina).

---

### 6.7 Causales de Rechazo y Procedimiento Notificatorio

El Comite puede rechazar una postulacion en cualquiera de las siguientes causales reglamentarias:

| Causal | Descripcion |
| :--- | :--- |
| **Documentacion Falsa** | Se detecto adulteracion o falsedad en documentos adjuntos |
| **Modalidad No Aplicable** | El estudiante no cumple los requisitos previos para la modalidad elegida |
| **Incumplimiento de Plazos** | No presento la subsanacion dentro del tiempo reglamentario |
| **Retiro Voluntario** | El estudiante solicito formalmente el retiro del tramite |
| **Plagio Academico** | El asesor o jurado detecto plagio en el trabajo de grado |
| **Reprobacion de Sustentacion** | Nota final de sustentacion inferior a 3.0 |
| **Inviabilidad Tecnica** | El Comite determina que el proyecto no es tecnicamente viable |

Al rechazar, el sistema exige una **justificacion escrita** del evaluador que queda permanentemente registrada en el HistorialEstado.

---

## 7. Modulo del Administrador: Control Total y Analitica Institucional

### 7.1 Gestion de Cuentas Pendientes de Aprobacion

El Administrador tiene acceso a la seccion `/usuarios/pendientes`, donde se acumulan todos los registros de nuevos usuarios que esperan verificacion:

**Lista de cuentas pendientes:**
Cada registro muestra:
- Nombre completo del solicitante.
- Correo electronico registrado.
- Cedula de Ciudadania.
- Programa academico seleccionado.
- Rol solicitado (Estudiante o Docente Asesor).
- Fecha y hora exacta del registro.

**Acciones disponibles por cada cuenta:**
- **Aprobar (boton verde):** Activa la cuenta al instante (`is_active = True`). El usuario puede iniciar sesion en ese mismo segundo.
- **Rechazar (boton rojo):** Elimina la solicitud de la base de datos sin posibilidad de recuperacion. Ideal para registros fraudulentos o duplicados.

> [!IMPORTANT]
> Solo el Administrador puede aprobar o rechazar cuentas. Los roles de Comite y Docente Asesor no tienen acceso a esta funcionalidad.

---

### 7.2 Tablero Analitico Institucional (Dashboard)

El Dashboard analitico en `/dashboard` proporciona metricas estrategicas de decision para la Coordinacion de Grados:

<p align="center">
  <img src="img/screenshot_panel_aprobacion.png" alt="Panel de Control del Comite / Administrador con KPIs en tiempo real" width="92%" />
</p>

Los indicadores clave de gestion visibles en la captura real:

**KPIs de la tarjeta superior:**
- **Total Tramites:** Conteo total de postulaciones registradas en el sistema.
- **En Proceso:** Tramites activamente en desarrollo con asesor.
- **Correccion:** Tramites bloqueados por correccion pendiente.
- **Sin Asesor:** Tramites aprobados sin asesor asignado (requieren atencion prioritaria).

**Metricas adicionales del Dashboard completo (`/dashboard`):**
- Grafico de barras por estado: cuantos procesos estan en cada etapa.
- Grafico de torta (pie chart) por modalidad: distribucion porcentual de las 10 modalidades.
- Tabla de carga por docente asesor: cuantos estudiantes tiene activos cada asesor.
- Tiempos promedio de atencion por etapa.
- Tendencias historicas por semestre.

---

### 7.3 Auditoria Forense — Historial de Estados

Cada accion ejecutada en SIGMA ITM genera un registro permanente e inmutable en la tabla `HistorialEstado` de la base de datos PostgreSQL:

| Campo Registrado | Descripcion | Ejemplo |
| :--- | :--- | :--- |
| **ID de Postulacion** | Identificador unico del tramite | `#42` |
| **Usuario Ejecutor** | Quien realizo la accion y su rol actual | `comite1 (COMITE)` |
| **Estado Anterior** | Estado en que estaba el tramite | `POSTULACION` |
| **Estado Nuevo** | Estado al que transiciono | `REVISION_DOCUMENTAL` |
| **Observacion** | Texto completo ingresado por el evaluador | `"Documentacion completa y conforme"` |
| **fue_correccion** | Indica si fue una accion de correccion | `True / False` |
| **Timestamp UTC** | Marca de tiempo exacta de la accion | `2026-09-28T15:42:01.332Z` |

Esta bitacora permite al Administrador y al Comite:
- Reconstruir cronologicamente todo lo que paso con un expediente.
- Identificar responsables de cada decision.
- Responder a reclamos academicos con evidencia objetiva e irrebatible.
- Soportar auditorias de acreditacion de alta calidad institucional.

---

## 8. Maquina de Estados: Ciclo de Vida Completo de una Postulacion

### 8.1 Diagrama Oficial de la Maquina de Estados

El siguiente diagrama representa de forma exhaustiva la maquina de estados finita que gobierna el ciclo de vida de cada postulacion:

<p align="center">
  <img src="img/diagrama_estados.svg" alt="Diagrama Completo de la Maquina de Estados — SIGMA ITM" width="100%" />
</p>

---

### 8.2 Matriz Detallada de Transiciones de Estado

| Estado Origen | Estado Destino | Actor Responsable | Condicion Previa Requerida | Efecto en el Sistema |
| :--- | :--- | :--- | :--- | :--- |
| Inicio (nuevo tramite) | POSTULACION | Estudiante | Formulario completo + anexo obligatorio de la modalidad | Tramite creado en BD. Notifica a Coordinacion. |
| POSTULACION | REVISION_DOCUMENTAL | Comite | Documentos subidos y legibles | Apertura formal del expediente para estudio. |
| POSTULACION | RECHAZADO | Comite | Falsedad documental o modalidad no aplicable | Tramite cerrado negativamente. |
| REVISION_DOCUMENTAL | APROBACION | Comite | Anexos completos y conformes al reglamento | Tramite avalado para asignacion docente. |
| REVISION_DOCUMENTAL | REVISION_DOCUMENTAL | Comite | Documentacion incompleta o con errores | Activa `requiere_correccion = True`. Pausa el tramite. |
| REVISION_DOCUMENTAL | RECHAZADO | Comite | No subsanacion en plazo o inviabilidad tecnica | Tramite archivado con rechazo formal. |
| APROBACION | EN_PROCESO | Comite | Seleccion de Asesor + Directriz escrita | Asesor asignado. Inicia periodo de trabajo. |
| APROBACION | RECHAZADO | Comite | Incompatibilidad de lineas o cupos agotados | Tramite rechazado por disponibilidad de facultad. |
| EN_PROCESO | EN_PROCESO | Docente Asesor | Avances parciales con observaciones formativas | Activa flag de correccion. Notifica al estudiante. |
| EN_PROCESO | SUSTENTACION | Docente Asesor | Objetivos al 100% + Visto Bueno firmado | Habilita calendario de sustentacion publica. |
| EN_PROCESO | RECHAZADO | Docente Asesor | Abandono injustificado o plagio confirmado | Cierre disciplinario o academico. |
| SUSTENTACION | REVISION_COMITE | Docente Asesor | Sustentacion celebrada con calificacion >= 3.0 | Envio de acta de sustentacion al Comite. |
| SUSTENTACION | RECHAZADO | Docente Asesor | Calificacion reprobatoria (< 3.0) definitiva | Reprobacion formal de la opcion de grado. |
| REVISION_COMITE | FINALIZADO | Comite | Acta de Grado aprobada por Consejo de Facultad | Expedicion del Certificado Oficial con Hash SHA-256. |
| REVISION_COMITE | RECHAZADO | Comite | Inconsistencias insubsanables en acta de jurados | No ratificacion del grado. |

---

## 9. Casos Practicos de Extremo a Extremo (Walkthrough Completo)

### 9.1 Caso A: Flujo Regular Aprobado (Trabajo de Grado)

Este es el recorrido ideal de un estudiante desde el registro hasta la descarga del certificado.

| Evento | Fecha | Actor | Accion | Estado Resultante |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Dia 1 | Valentina Rios (Estudiante) | Se registra en el sistema | Pendiente de aprobacion |
| 2 | Dia 1 | Admin | Verifica matricula activa y aprueba la cuenta | Cuenta activa |
| 3 | Dia 2 | Valentina | Inicia sesion y radica el proyecto *"Sistema IoT para Monitoreo de Calidad del Aire en Campus ITM"* — Modalidad: Trabajo de Grado | POSTULACION |
| 4 | Dia 3 | Comite | Revisa documentos, los encuentra conformes | REVISION_DOCUMENTAL |
| 5 | Dia 3 | Comite | Aprueba los requisitos documentales | APROBACION |
| 6 | Dia 4 | Comite | Asigna al docente *"Carlos Mario Perez"* con directriz: *"Enfocar el prototipo en sensores MQ-135 calibrados con norma nacional."* | EN_PROCESO |
| 7 | Meses 1–4 | Valentina + Carlos Mario | Asesorias periodicas, entregas parciales, notas de avance en el panel | EN_PROCESO (activo) |
| 8 | Mes 5 | Carlos Mario (Asesor) | Otorga Visto Bueno. Programa sustentacion: *15/11/2026 - 10:00 AM - Aula E-204* | SUSTENTACION |
| 9 | 15/11/2026 | Carlos Mario + Jurados | Valentina defiende. Calificacion: **4.8 — Aprobado con honores** | REVISION_COMITE |
| 10 | 16/11/2026 | Comite | Ratifica el acta, asigna N° Acta `ITM-FI-2026-089`, finaliza el proceso | FINALIZADO |
| 11 | 16/11/2026 | Valentina | Descarga el Certificado Oficial PDF desde su panel | — |

---

### 9.2 Caso B: Flujo con Correccion Documental (Practicas Profesionales)

| Evento | Actor | Accion | Estado Resultante |
| :--- | :--- | :--- | :--- |
| 1 | Andres Mejia | Radica Practicas Profesionales con carta empresarial | POSTULACION |
| 2 | Comite | Inicia revision documental | REVISION_DOCUMENTAL |
| 3 | Comite | Detecta que la carta no especifica la ARL. Solicita correccion: *"Falta el certificado de afiliacion a riesgos laborales (ARL) emitido por la empresa"* | REVISION_DOCUMENTAL (requiere_correccion = True) |
| 4 | Andres Mejia | Ve la alerta en su panel. Solicita el certificado a RRHH de la empresa | (tramite pausado) |
| 5 | Andres Mejia | Envia subsanacion: mensaje + PDF del certificado ARL | REVISION_DOCUMENTAL (requiere_correccion = False) |
| 6 | Comite | Revisa el nuevo documento, confirma que es correcto | APROBACION |
| 7 | Comite | Asigna docente asesor con directriz | EN_PROCESO |
| 8 | (... flujo normal) | ... | ... → FINALIZADO |

---

### 9.3 Caso C: Flujo de Rechazo por Incumplimiento

| Evento | Actor | Accion | Estado Resultante |
| :--- | :--- | :--- | :--- |
| 1 | Pablo Arango | Radica Trabajo de Grado | POSTULACION |
| 2 | Comite | Inicia revision documental | REVISION_DOCUMENTAL |
| 3 | Comite | Solicita correccion por paz y salvo vencido | REVISION_DOCUMENTAL (requiere_correccion = True) |
| 4 | Pablo | Pasan 15 dias habiles sin enviar subsanacion | (tramite congelado) |
| 5 | Comite | Rechaza el tramite con causal: *"Incumplimiento de plazos reglamentarios para subsanacion de documentos"* | RECHAZADO |
| 6 | Pablo | Recibe notificacion de rechazo. Puede iniciar un nuevo tramite en el siguiente periodo academico | — |

---

## 10. Preguntas Frecuentes y Solucion de Problemas (Troubleshooting)

### Preguntas sobre Acceso y Cuentas

**P1: Olvide mi contrasena. ¿Como la restablezco?**
> Por seguridad institucional, el restablecimiento de contrasenas debe hacerse a traves del Administrador del sistema. Contacte a la Coordinacion de Grados de su facultad con su cedula y correo institucional para que el Administrador genere un enlace seguro de restablecimiento. Actualmente no hay un flujo de "Olvide mi contrasena" automatico.

**P2: Me registro pero no puedo iniciar sesion.**
> El sistema requiere que el Administrador apruebe manualmente todas las cuentas nuevas. Esto es por seguridad institucional. Puede demorar entre 24 y 48 horas habiles. Si han pasado mas de 3 dias habiles sin respuesta, contacte a la Coordinacion de Grados.

**P3: El sistema dice que mi cuenta esta inactiva.**
> Su cuenta fue registrada pero no activada aun, o fue rechazada. Contacte al Administrador del sistema indicando su cedula y correo institucional para verificar el estado.

---

### Preguntas sobre Documentos y Archivos

**P4: No puedo subir mi archivo aunque pese menos de 10 MB. ¿Por que?**
> El sistema verifica la firma binaria del archivo, no solo su tamano. Las causas mas comunes son:
> - El archivo esta danado o corrupto: intente generarlo de nuevo desde el programa original.
> - Esta en formato Word antiguo (`.doc`): abra el archivo y guardelo como `.docx` (Word moderno) o exportelo como PDF.
> - El PDF fue generado con un programa de imagen (como convertir fotos a PDF): asegurese de que sea un PDF nativo generado desde Word, LibreOffice o Adobe.

**P5: ¿Puedo reemplazar un archivo ya subido?**
> No es posible eliminar archivos ya subidos por razones de trazabilidad. Sin embargo, puede subir una nueva version del archivo con un nombre diferente (ej. `Anteproyecto_V3_Corregido.pdf`). El Comite y el Asesor veran todas las versiones disponibles.

---

### Preguntas sobre el Flujo y los Estados

**P6: Los botones de aprobacion estan deshabilitados para el docente asesor. ¿Por que?**
> Los botones de gestion solo se activan cuando se cumplen TODAS estas condiciones:
> 1. El usuario logueado es el asesor formalmente asignado al tramite (no otro docente).
> 2. El tramite esta en estado `EN_PROCESO` o `SUSTENTACION` (etapas bajo responsabilidad del asesor).
> 3. El tramite NO esta pausado por una correccion pendiente del estudiante.

**P7: ¿Puedo tener mas de una postulacion activa al mismo tiempo?**
> No. El reglamento institucional establece la unicidad del tramite: un estudiante solo puede tener una postulacion activa. Si desea cambiar de modalidad o de proyecto, el Comite o el Administrador deben cerrar el tramite activo primero.

**P8: ¿Que pasa si la calificacion de la sustentacion es exactamente 3.0?**
> Una nota de 3.0 se considera **aprobada**. El sistema aplica la condicion `calificacion >= 3.0` para transicionar a `REVISION_COMITE`. Solo las notas estrictamente menores a 3.0 pueden derivar en rechazo.

---

### Preguntas sobre el Certificado PDF

**P9: ¿Que validez tiene el hash SHA-256 del certificado?**
> El hash SHA-256 es una huella digital matematica unica generada con los datos del acta (nombre del estudiante, calificacion, fecha, numero de acta). La Secretaria General del ITM puede verificar la autenticidad del certificado en cualquier momento ingresando el hash al sistema. Si el documento fue alterado —incluso un solo caracter— el hash no coincidera y el certificado sera invalido.

**P10: ¿Cuando queda disponible el certificado para descargar?**
> El certificado se genera automaticamente en el momento en que el Comite ejecuta la accion **"Finalizar Proyecto"** y asigna el numero de acta oficial. Desde ese instante, el boton de descarga aparece habilitado en el panel del estudiante.

---

<div align="center">

---

**Instituto Tecnologico Metropolitano (ITM)**
*Institucion Universitaria acreditada en Alta Calidad*
Facultad de Ingenierias — Medellin, Colombia
**SIGMA ITM — Version 1.0 | Septiembre 2026**

*Documento elaborado con informacion verificada del sistema en produccion.*
*Toda reproduccion parcial o total debe citar la fuente institucional.*

---

</div>
