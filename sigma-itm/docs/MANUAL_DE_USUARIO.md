# 📘 SIGMA ITM — Manual de Usuario Integral y Guía Operativa
### Sistema Integral de Gestión de Modalidades de Grado
**Facultad de Ingenierías — Instituto Tecnológico Metropolitano (ITM)**  
*Medellín, Colombia | Versión del Sistema: 1.0 (2026) | Documentación Oficial*

---

<p align="center">
  <img src="img/banner.jpg" alt="SIGMA ITM Banner" width="100%" />
</p>

---

## 📑 Tabla de Contenidos

- [1. Introducción y Marco Normativo](#1-introducción-y-marco-normativo)
  - [1.1 Propósito y Alcance](#11-propósito-y-alcance)
  - [1.2 Marco Normativo Institucional](#12-marco-normativo-institucional)
  - [1.3 Requisitos Técnicos y Entorno de Acceso](#13-requisitos-técnicos-y-entorno-de-acceso)
- [2. Arquitectura de Seguridad y Roles (RBAC)](#2-arquitectura-de-seguridad-y-roles-rbac)
  - [2.1 Matriz de Competencias y Privilegios](#21-matriz-de-competencias-y-privilegios)
  - [2.2 Políticas de Sesión y Tokens JWT](#22-políticas-de-sesión-y-tokens-jwt)
  - [2.3 Reglas de Validación de Archivos (Magic Bytes)](#23-reglas-de-validación-de-archivos-magic-bytes)
- [3. Módulo de Autenticación y Registro](#3-módulo-de-autenticación-y-registro)
  - [3.1 Portal de Bienvenida (Landing Page)](#31-portal-de-bienvenida-landing-page)
  - [3.2 Formulario de Registro Multietapa](#32-formulario-de-registro-multietapa)
  - [3.3 Flujo de Activación Administrativa de Cuentas](#33-flujo-de-activación-administrativa-de-cuentas)
  - [3.4 Inicio de Sesión y Manejo de Errores](#34-inicio-de-sesión-y-manejo-de-errores)
- [4. Módulo del Estudiante: Radicación y Seguimiento](#4-módulo-del-estudiante-radicación-y-seguimiento)
  - [4.1 Estructura del Panel del Estudiante](#41-estructura-del-panel-del-estudiante)
  - [4.2 Guía de Radicación: Las 10 Modalidades de Grado](#42-guía-de-radicación-las-10-modalidades-de-grado)
  - [4.3 Carga y Gestión de Documentos Anexos](#43-carga-y-gestión-de-documentos-anexos)
  - [4.4 Interpretación del Stepper / Línea de Tiempo](#44-interpretación-del-stepper--línea-de-tiempo)
  - [4.5 Protocolo de Subsanación de Correcciones](#45-protocolo-de-subsanación-de-correcciones)
  - [4.6 Descarga del Certificado Oficial de Finalización (PDF)](#46-descarga-del-certificado-oficial-de-finalización-pdf)
- [5. Módulo del Docente Asesor: Supervisión y Aval](#5-módulo-del-docente-asesor-supervisión-y-aval)
  - [5.1 Acceso y Filtrado de Estudiantes Asignados](#51-acceso-y-filtrado-de-estudiantes-asignados)
  - [5.2 Gestión de la Etapa de Desarrollo (`EN_PROCESO`)](#52-gestión-de-la-etapa-de-desarrollo-en_proceso)
  - [5.3 Devolución Formativa vs. Visto Bueno](#53-devolución-formativa-vs-visto-bueno)
  - [5.4 Programación y Calificación de la Sustentación](#54-programación-y-calificación-de-la-sustentación)
- [6. Módulo del Comité de Grados: Dictamen y Gobierno](#6-módulo-del-comité-de-grados-dictamen-y-gobierno)
  - [6.1 Bandeja de Entrada General y Filtros de Búsqueda](#61-bandeja-de-entrada-general-y-filtros-de-búsqueda)
  - [6.2 Revisión Documental y Requisitos Mínimos](#62-revisión-documental-y-requisitos-mínimos)
  - [6.3 Asignación de Docente Asesor y Emisión de Directriz](#63-asignación-de-docente-asesor-y-emisión-de-directriz)
  - [6.4 Ratificación de Sustentaciones y Cierre de Expediente](#64-ratificación-de-sustentaciones-y-cierre-de-expediente)
  - [6.5 Causales de Rechazo y Procedimiento Notificatorio](#65-causales-de-rechazo-y-procedimiento-notificatorio)
- [7. Módulo del Administrador: Control y Analítica](#7-módulo-del-administrador-control-y-analítica)
  - [7.1 Gestión de Cuentas Pendientes](#71-gestión-de-cuentas-pendientes)
  - [7.2 Tablero Analítico Institucional (Dashboard)](#72-tablero-analítico-institucional-dashboard)
  - [7.3 Auditoría Forense (`HistorialEstado`)](#73-auditoría-forense-historialestado)
- [8. Máquina de Estados y Matriz de Transiciones](#8-máquina-de-estados-y-matriz-de-transiciones)
- [9. Casos Prácticos de Extremo a Extremo (Walkthrough)](#9-casos-prácticos-de-extremo-a-extremo-walkthrough)
  - [9.1 Caso A: Flujo Regular Aprobado (Trabajo de Grado)](#91-caso-a-flujo-regular-aprobado-trabajo-de-grado)
  - [9.2 Caso B: Flujo con Corrección y Subsanación](#92-caso-b-flujo-con-corrección-y-subsanación)
- [10. Preguntas Frecuentes y Solución de Problemas (Troubleshooting)](#10-preguntas-frecuentes-y-solución-de-problemas-troubleshooting)

---

## 1. Introducción y Marco Normativo

### 1.1 Propósito y Alcance

El **Sistema Integral de Gestión de Modalidades de Grado (SIGMA ITM)** es la plataforma oficial de la Facultad de Ingenierías del ITM diseñada para centralizar, digitalizar, controlar y auditar todo el ciclo de vida de los trabajos de grado y opciones formativas de culminación académica.

El sistema erradica de forma definitiva:
- La dispersión de documentos en correos personales de coordinadores o docentes.
- La incertidumbre del estudiante sobre el estado de su radicación.
- La falta de registros formales sobre observaciones, devoluciones y versiones de archivos.
- Las demoras en la emisión de paz y salvos y certificados de grado.

---

### 1.2 Marco Normativo Institucional

SIGMA ITM opera bajo los lineamientos del **Reglamento Estudiantil de la Facultad de Ingenierías del ITM**, rigiéndose por principios de:
1. **Unicidad del Trámite:** Ningún estudiante puede tener más de una postulación activa en el sistema.
2. **Inmutabilidad del Historial:** Toda acción (revisión, corrección, asignación o cambio de estado) genera un registro inalterable en base de datos.
3. **Validez Documental:** La documentación aportada debe corresponder a los formatos institucionales aprobados y no tener tachaduras o inconsistencias en los sellos y firmas.

---

### 1.3 Requisitos Técnicos y Entorno de Acceso

| Parámetro | Requerimiento Técnico |
| :--- | :--- |
| **Navegadores Soportados** | Google Chrome v100+, Mozilla Firefox v100+, Microsoft Edge v100+, Safari v15+. |
| **Resolución de Pantalla** | Mínima: 1280 × 720 px. Recomendada: 1920 × 1080 px (Totalmente responsivo en tablets y laptops). |
| **Conectividad** | Conexión a Internet o Red Institucional ITM con acceso a puertos HTTP (5173 / 80) y API (8000). |
| **Tipos de Archivos Aceptados** | `.pdf` (Portable Document Format), `.docx` (Microsoft Word), `.zip` (archivos comprimidos). |
| **Tamaño Máximo por Archivo** | 10.0 MB (MegaBytes). |

---

## 2. Arquitectura de Seguridad y Roles (RBAC)

### 2.1 Matriz de Competencias y Privilegios

SIGMA ITM aplica un esquema estricto de **Control de Acceso Basado en Roles (RBAC)** tanto en la interfaz React como en la API Django REST:

```
[ESTUDIANTE]  --> Radica, Consulta su trámite, Subsana, Descarga Certificado.
[ASESOR]      --> Supervisa EN_PROCESO, Emite Directrices, Califica SUSTENTACION.
[COMITE]      --> Revisa POSTULACION / REVISION_DOCUMENTAL, Asigna Asesor, Ratifica REVISION_COMITE.
[ADMIN]       --> Activa Cuentas, Parametriza Modalidades, Visualiza Métricas y Audita Todo.
```

| Funcionalidad / Acción | Estudiante | Docente Asesor | Comité de Grados | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| **Crear cuenta de usuario** | Público | Público | ❌ (Solo Admin) | Admin |
| **Radicar nueva postulación** | ✅ (Propia) | ❌ | ❌ | ✅ |
| **Consultar expediente propio** | ✅ | ❌ | ❌ | ✅ |
| **Subir archivos anexos** | ✅ | ❌ | ❌ | ✅ |
| **Subsanar observaciones** | ✅ | ❌ | ❌ | ❌ |
| **Descargar certificado oficial PDF** | ✅ (Al finalizar) | ✅ | ✅ | ✅ |
| **Iniciar Revisión Documental** | ❌ | ❌ | ✅ | ✅ |
| **Aprobar / Devolver requisitos documentales** | ❌ | ❌ | ✅ | ✅ |
| **Asignar docente asesor con directriz** | ❌ | ❌ | ✅ | ✅ |
| **Gestionar etapa `EN_PROCESO`** | ❌ | ✅ (Solo asignado) | ❌ | ✅ |
| **Programar y calificar `SUSTENTACION`** | ❌ | ✅ (Solo asignado) | ❌ | ✅ |
| **Ratificar acta en `REVISION_COMITE`** | ❌ | ❌ | ✅ | ✅ |
| **Aprobar / Activar cuentas de usuario** | ❌ | ❌ | ❌ | ✅ |
| **Acceso a Dashboard de Analítica Global** | ❌ | ✅ (Solo asignados) | ✅ (Completo) | ✅ (Completo) |

---

### 2.2 Políticas de Sesión y Tokens JWT

- **Access Token:** Vida útil de **20 minutos**. Se transmite en el header `Authorization: Bearer <token>`.
- **Refresh Token:** Vida útil de **7 días**. Permite la renovación silenciosa en segundo plano mediante interceptores de Axios.
- **Lista Negra (`Blacklist`):** Al cerrar sesión o renovar un token expirado, el token previo queda invalidado inmediatamente, previniendo ataques de reutilización.
- **Protección contra Fuerza Bruta:** El endpoint `/api/token/` bloquea temporalmente las solicitudes que superen los 5 intentos fallidos consecutivos por dirección IP.

---

### 2.3 Reglas de Validación de Archivos (Magic Bytes)

> [!CAUTION]
> **Inspección de Firmas Binarias:** El sistema **no confía** en la extensión del archivo (`.pdf` o `.docx`). Cada archivo subido pasa por una verificación de encabezados binarios mediante la librería `python-magic`. Si un usuario intenta subir un archivo ejecutable (`.exe`, `.bat`, `.sh`) o un script malicioso renombrado a `.pdf`, el servidor rechazará la subida arrojando un error `400 Bad Request`.

---

## 3. Módulo de Autenticación y Registro

### 3.1 Portal de Bienvenida (Landing Page)

Al abrir la dirección del sistema, se presenta el portal de bienvenida institucional:

<p align="center">
  <img src="img/screenshot_landing.png" alt="Portal de Bienvenida SIGMA ITM" width="90%" />
</p>

#### Elementos del Portal:
1. **Barra de Navegación Superior:**
   - Logotipo oficial del Instituto Tecnológico Metropolitano (ITM).
   - Enlace directo a la guía de modalidades de grado.
   - Botón **"Iniciar Sesión"** (para usuarios ya registrados).
   - Botón **"Registrarse"** (para nuevos integrantes).
2. **Banner Principal (Hero Section):**
   - Título formal y resumen de la misión de la plataforma.
   - Indicador de estado del periodo académico actual.
3. **Catálogo Resumido de Modalidades:**
   - Tarjetas informativas con los requisitos básicos de las 10 opciones de grado.

---

### 3.2 Formulario de Registro Multietapa

Para registrarse por primera vez, haga clic en el botón **"Registrarse"** o diríjase a `/crear-usuario`:

#### Paso 1: Datos Personales e Identidad Académica
- **Nombre:** Nombre(s) tal como aparecen en el documento de identidad.
- **Apellido:** Apellidos completos.
- **Correo Electrónico:** Correo institucional `@itm.edu.co` (requerido para validación y notificaciones).
- **Cédula de Ciudadanía:** Número de documento sin puntos ni comas.
- **Programa Académico:** Menú desplegable con las carreras oficiales:
  - *Ingeniería de Sistemas*
  - *Ingeniería Electrónica*
  - *Ingeniería Biomédica*
  - *Tecnología en Sistemas de Información*
  - *Tecnología en Electrónica*
  - *Administración Tecnológica*
- **Rol Solicitado:** Selección entre **Estudiante** (🎓) o **Docente Asesor** (👨‍🏫).

#### Paso 2: Credenciales de Acceso
- **Nombre de Usuario:** Identificador único institucional (ej. `jorge.perez`).
- **Contraseña:** Mínimo 8 caracteres, con al menos una mayúscula, un número y un carácter especial.
- **Indicador de Fortaleza:** Barra visual interactiva que evalúa la robustez de la contraseña (*Muy débil, Débil, Regular, Buena, Fuerte, Excelente*).
- **Confirmación de Contraseña:** Verificación de coincidencia exacta.

---

### 3.3 Flujo de Activación Administrativa de Cuentas

> [!IMPORTANT]
> **Aprobación Obligatoria:** Una vez enviado el formulario de registro, la cuenta **NO se activa de inmediato**.  
> Por motivos de control y seguridad institucional, el usuario verá un mensaje confirmando que su solicitud quedó en estado `Pendiente de Aprobación`. El Administrador del ITM debe verificar la matrícula activa del estudiante o la vinculación del docente antes de habilitar el acceso.

---

### 3.4 Inicio de Sesión y Manejo de Errores

<p align="center">
  <img src="img/screenshot_login.png" alt="Formulario de Inicio de Sesión" width="70%" />
</p>

1. Ingrese su **Nombre de Usuario**.
2. Digite su **Contraseña**.
3. Haga clic en **"Iniciar Sesión"**.

#### Posibles Respuestas del Sistema:
- ✅ **Acceso Concedido:** Redirección automática al panel correspondiente a su rol (`/estudiante`, `/aprobacion` o `/dashboard`).
- ❌ **"No active account found with the given credentials":** Usuario o contraseña incorrectos.
- ⚠️ **"Tu cuenta está pendiente de aprobación por el Administrador":** El registro fue exitoso pero el administrador aún no ha verificado la cuenta.
- 🛑 **"Demasiados intentos fallidos. Intente nuevamente en unos minutos":** Bloqueo por activación de la política de rate limiting.

---

## 4. Módulo del Estudiante: Radicación y Seguimiento

### 4.1 Estructura del Panel del Estudiante

Al iniciar sesión como estudiante, accederá a su panel operativo:

<p align="center">
  <img src="img/screenshot_panel_estudiante.png" alt="Panel del Estudiante SIGMA ITM" width="90%" />
</p>

El panel se compone de:
1. **Encabezado Informativo:**
   - Nombre completo del estudiante, cédula y programa académico.
   - Insignia con el estado actual del trámite (`POSTULACION`, `EN_PROCESO`, `SUSTENTACION`, etc.).
2. **Línea de Tiempo Interactiva (Stepper):**
   - Barra de progreso cronológica de 7 etapas que se ilumina a medida que el proceso avanza.
3. **Cuerpo del Expediente:**
   - Título oficial del proyecto y modalidad convalidada.
   - Ficha del Docente Asesor asignado (nombre, correo y directriz inicial).
   - Datos de la sustentación (fecha, hora y salón cuando esté programada).
   - Zona de carga de documentos y expedientes adjuntos.
   - Bitácora de observaciones y revisiones históricas.

---

### 4.2 Guía de Radicación: Las 10 Modalidades de Grado

Si el estudiante no tiene ningún trámite activo, verá el botón azul **"Radicar Nueva Postulación"**. Al presionarlo se despliega el formulario integral:

#### Campos Generales Obligatorios:
- **Título del Proyecto:** Título definitivo de la propuesta (máximo 250 caracteres).
- **Modalidad:** Selección entre las 10 alternativas vigentes.

#### Campos Específicos según la Modalidad Seleccionada:

| Modalidad | Campos Específicos Requeridos | Documentos que debe adjuntar |
| :--- | :--- | :--- |
| **1. Trabajo de Grado** (`TRABAJO_GRADO`) | Línea de investigación, planteamiento del problema, objetivos generales y específicos. | Anteproyecto formal firmado + Paz y salvo académico. |
| **2. Prácticas Profesionales** (`PRACTICAS_PROFESIONALES`) | Razón social de la empresa, NIT, nombre del jefe inmediato, teléfono, cargo a desempeñar. | Carta de aceptación empresarial + Certificado afiliación ARL + Plan de práctica. |
| **3. Pasantía de Investigación** (`PASANTIA`) | Institución o laboratorio receptor, investigador principal anfitrión, país/ciudad, cronograma. | Carta de invitación oficial + Convenio interinstitucional + Plan de pasantía. |
| **4. Emprendimiento** (`EMPRENDIMIENTO`) | Nombre de la iniciativa/empresa, sector económico, estado del modelo Canvas, incubadora. | Plan de negocio formal + Aval de Parque E o Centro de Emprendimiento ITM. |
| **5. Producto en Laboratorio** (`PRODUCTO_LABORATORIO`) | Laboratorio sede del ITM, nombre del prototipo, ficha técnica, insumos requeridos. | Aval firmado por Jefatura de Laboratorios + Memoria técnica del prototipo. |
| **6. Producto de Investigación** (`PRODUCTO_INVESTIGACION`) | Grupo de investigación ITM, código MinCiencias, título del paper/patente, revista o congreso. | Constancia emitida por el Líder del Grupo MinCiencias + Borrador del artículo. |
| **7. Reconocimiento Laboral** (`RECONOCIMIENTO_LABORAL`) | Empresa actual, tiempo laborado (mínimo 1 año afín), funciones desempeñadas, cargo. | Certificado laboral reciente con funciones + Memoria técnica de labores ejecutadas. |
| **8. Certificación Internacional** (`CERTIFICACION`) | Casa certificadora (AWS, Cisco, Microsoft, etc.), código del examen, vigencia, puntaje. | Voucher o certificado digital oficial + Ficha técnica de competencias evaluadas. |
| **9. Cursos de Posgrado** (`CURSOS_POSGRADO`) | Maestría o especialización ITM receptora, asignaturas matriculadas, créditos acumulados. | Constancia de matrícula de posgrado + Certificado de calificaciones expedido. |
| **10. Ingeniería para la Gente** (`INGENIERIA_GENTE`) | Comunidad u organización social beneficiaria, diagnóstico comunitario, población atendida. | Carta de aval comunitario + Diagnóstico del problema + Plan de intervención social. |

---

### 4.3 Carga y Gestión de Documentos Anexos

Dentro del expediente, el estudiante dispone del módulo **"Documentos del Proyecto"**:

1. Ingrese el **Nombre Descriptivo** del documento (ej. `Anteproyecto_Final_V2`, `Certificado_ARL`).
2. Haga clic en **"Examinar..."** y elija el archivo de su computador.
3. El sistema verificará de inmediato en el navegador que el archivo sea menor a 10 MB y tenga extensión válida.
4. Presione **"Subir Archivo"**.
5. El documento aparecerá listado en la tabla de anexos con su fecha de subida, tamaño en KB/MB y un botón para **Visualizar / Descargar**.

---

### 4.4 Interpretación del Stepper / Línea de Tiempo

La línea de tiempo visual comunica claramente el avance y las responsabilidades del trámite:

```
[1. Radicación] -> [2. Revisión Doc.] -> [3. Aprobación] -> [4. En Proceso] -> [5. Sustentación] -> [6. Rev. Comité] -> [7. Finalizado]
     (Estudiante)         (Comité)            (Comité)          (Asesor)           (Asesor)           (Comité)          (Graduación)
```

- **Círculo Azul / Verde:** Etapas ya cursadas y aprobadas.
- **Círculo Pulsante con Borde Resaltado:** Etapa actual activa.
- **Círculo Gris:** Etapas futuras aún no habilitadas.
- **Rojo:** Trámite rechazado definitivamente.

---

### 4.5 Protocolo de Subsanación de Correcciones

Cuando el Comité o el Asesor devuelven el trámite para ajustes:

1. El estado del expediente mostrará un aviso destacado en color ámbar:  
   **"Trámite Pausado: Requiere Corrección"**.
2. Debajo aparecerá el cuadro **Observación del Evaluador**, donde se detalla con exactitud qué debe ser corregido (ej. *"Ajustar el cronograma del anteproyecto y adjuntar el paz y salvo actualizado"*).
3. **Formulario de Subsanación:**
   - Escriba en el campo de texto el **Mensaje de Subsanación**, explicando punto por punto las correcciones efectuadas.
   - Adjunte en el campo de archivo el **Documento Corregido**.
4. Presione **"Enviar Subsanación"**.
5. Al enviar, la bandera `requiere_correccion` se desactiva, el evaluador recibe la notificación y el trámite se descongela para que continúe su curso.

---

### 4.6 Descarga del Certificado Oficial de Finalización (PDF)

Una vez que el trámite alcanza el estado **`FINALIZADO`**:
1. Se habilitará el botón verde institucional **"Descargar Certificado Oficial (PDF)"**.
2. El documento se descarga al instante con el siguiente contenido oficial:
   - Membrete y escudo oficial del ITM.
   - Nombre completo y documento del graduando.
   - Modalidad de grado convalidada y título del proyecto.
   - Fecha de sustentación y calificación obtenida.
   - Número de Acta de Grado y registro del Comité.
   - **Firma digital e identificador criptográfico Hash SHA-256** para verificación de autenticidad en secretaría.

---

## 5. Módulo del Docente Asesor: Supervisión y Aval

### 5.1 Acceso y Filtrado de Estudiantes Asignados

Al ingresar con el rol **Docente Asesor**, el sistema abre el panel de evaluación:

<p align="center">
  <img src="img/screenshot_panel_aprobacion.png" alt="Panel de Asesoría y Aprobación" width="90%" />
</p>

- Por defecto, el docente solo visualiza las postulaciones **donde fue formalmente asignado por el Comité**.
- Dispone de una pestaña rápida **"Mis Asignadas"** y un buscador en tiempo real para localizar estudiantes por nombre, cédula o título.

---

### 5.2 Gestión de la Etapa de Desarrollo (`EN_PROCESO`)

Una vez que el Comité aprueba la propuesta y asigna al asesor, el trámite entra en `EN_PROCESO`:

1. El docente abre el expediente del estudiante haciendo clic en **"Ver Detalle / Gestionar"**.
2. Revisa la **Directriz del Comité** recibida al momento de la asignación.
3. Descarga el anteproyecto y los archivos de trabajo entregados por el estudiante.
4. Puede registrar **Notas de Asesoría** periódicas para dejar constancia de reuniones y compromisos de avance.

---

### 5.3 Devolución Formativa vs. Visto Bueno

El asesor tiene dos caminos según el desempeño del estudiante:

#### Opción A: Solicitar Corrección de Avance
Si el informe técnico o prototipo presenta inconsistencias:
1. Haga clic en **"Solicitar Corrección"**.
2. Escriba las observaciones metodológicas detalladas.
3. Opcionalmente, adjunte un archivo con notas o correcciones en formato Word/PDF (`archivo_asesor`).
4. Confirme la solicitud. El estudiante quedará bloqueado hasta que entregue la subsanación correspondiente.

#### Opción B: Otorgar Visto Bueno y Avanzar a Sustentación
Cuando el estudiante ha cumplido con el 100% de los objetivos del proyecto:
1. Haga clic en el botón verde **"Dar Visto Bueno (Avanzar a Sustentación)"**.
2. El sistema abrirá el modal de programación de la defensa pública.

---

### 5.4 Programación y Calificación de la Sustentación

En la etapa `SUSTENTACION`:

#### 1. Programar Fecha y Lugar:
- Seleccione la **Fecha y Hora** convenidas para la sustentación.
- Ingrese el **Lugar**: Puede ser un aula física del campus (ej. *Campus Robledo - Bloque E, Aula 302*) o un enlace de reunión virtual institucional (ej. *Enlace Microsoft Teams*).
- El sistema notificará de inmediato al estudiante.

#### 2. Calificar la Sustentación:
Tras llevarse a cabo la presentación:
1. El docente o jurado hace clic en **"Calificar Sustentación"**.
2. Digita la **Calificación Numérica** (escala de `0.0` a `5.0`).
3. Registra el **Concepto del Jurado** (observaciones, fortalezas del proyecto y recomendaciones).
4. Si la nota es igual o superior a `3.0`, el sistema aprueba y transiciona a **`REVISION_COMITE`** para el cierre formal.
5. Si la nota es inferior a `3.0`, el trámite puede ser reprobado hacia `RECHAZADO`.

---

## 6. Módulo del Comité de Grados: Dictamen y Gobierno

### 6.1 Bandeja de Entrada General y Filtros de Búsqueda

Los miembros del Comité de Trabajos de Grado tienen visibilidad sobre **todas las postulaciones de la facultad**:

- **Filtro por Estado:** Permite aislar rápidamente las postulaciones nuevas en `POSTULACION`, las que están en `REVISION_DOCUMENTAL` o las sustentaciones listas para ratificar en `REVISION_COMITE`.
- **Filtro por Modalidad:** Segmentación por Trabajo de Grado, Prácticas, Emprendimiento, etc.
- **Búsqueda Dinámica:** Búsqueda instantánea sin recargar la página.

---

### 6.2 Revisión Documental y Requisitos Mínimos

Al ingresar una nueva solicitud:

1. El miembro del Comité hace clic en **"Iniciar Revisión Documental"**, pasando el estado a `REVISION_DOCUMENTAL`.
2. Revisa pestaña por pestaña los anexos cargados.
3. **Cotejo de Requisitos:**
   - ¿Cumple con el número mínimo de créditos aprobados en el programa?
   - ¿El anteproyecto cuenta con planteamiento, objetivos y metodología clara?
   - ¿Las cartas empresariales o de laboratorio están debidamente firmadas y selladas?
4. Si todo es correcto, presiona **"Aprobar Requisitos Documentales"**, avanzando a `APROBACION`.

---

### 6.3 Asignación de Docente Asesor y Emisión de Directriz

En la etapa `APROBACION`:

1. El Comité abre el expediente y presiona **"Asignar Docente Asesor"**.
2. Selecciona un profesor del listado oficial de **Docentes Asesores Activos**.
3. **Redacción de la Directriz Técnica:**  
   Es obligatorio registrar una directriz institucional (ej. *"El estudiante debe profundizar en el diseño del circuito de potencia según observaciones del comité de fecha 28/09/2026"*).
4. Al confirmar, el sistema asocia al asesor, cambia el estado a **`EN_PROCESO`** y remite el expediente a la bandeja del docente.

---

### 6.4 Ratificación de Sustentaciones y Cierre de Expediente

Cuando la sustentación ha sido aprobada por el asesor y jurados:

1. El trámite llega a la bandeja del Comité en estado **`REVISION_COMITE`**.
2. El Comité verifica el acta de sustentación y la calificación registrada.
3. Abre el modal **"Ratificar y Finalizar Proceso de Grado"**.
4. Ingrese el **Número Oficial de Acta de Grado** emitido por el consejo de facultad.
5. Al hacer clic en **"Finalizar Proyecto"**:
   - El estado pasa definitivamente a **`FINALIZADO`**.
   - Se sella el expediente.
   - El motor de ReportLab compila el Certificado Oficial de Grado con firma criptográfica.

---

### 6.5 Causales de Rechazo y Procedimiento Notificatorio

Si una postulación no cumple con el reglamento institucional (ej. fraude, documentación falsa, retiro voluntario o vencimiento improrrogable de términos):

1. El Comité presiona el botón **"Rechazar Definitivamente"**.
2. Debe seleccionar la causal reglamentaria y redactar la justificación jurídica/académica obligatoria.
3. El sistema marca el trámite como **`RECHAZADO`**, congela el proceso y remite la notificación oficial al estudiante.

---

## 7. Módulo del Administrador: Control y Analítica

### 7.1 Gestión de Cuentas Pendientes

El Administrador tiene el control de la seguridad y el gobierno de usuarios:

1. En la barra superior, seleccione **"Usuarios Pendientes"** (`/usuarios/pendientes`).
2. Se muestra la lista de todos los registros que esperan verificación.
3. Opciones por cada registro:
   - 🟢 **Aprobar:** Activa la cuenta de inmediato (`is_active = True`). El usuario puede iniciar sesión en ese mismo segundo.
   - 🔴 **Rechazar:** Elimina la solicitud de la base de datos e impide el acceso al sistema.

---

### 7.2 Tablero Analítico Institucional (Dashboard)

El Dashboard analítico (`/dashboard`) proporciona métricas estratégicas para la toma de decisiones:

<p align="center">
  <img src="img/screenshot_dashboard.png" alt="Dashboard Analítico SIGMA ITM" width="90%" />
</p>

#### Indicadores Clave (KPIs):
- **Total de Postulaciones Radicadas:** Conteo histórico acumulado.
- **Trámites en Curso Activos:** Volumen actual de trabajo de la facultad.
- **Gráfico de Barras por Estado:** Cuántos procesos están radicados, en revisión, en asesoría, sustentando o finalizados.
- **Gráfico de Torta (Pie Chart) por Modalidad:** Distribución porcentual entre las 10 modalidades para identificar las más demandadas.
- **Métricas de Rendimiento:** Tiempos promedio de atención y balance de carga por docente asesor.

---

### 7.3 Auditoría Forense (`HistorialEstado`)

Toda acción en SIGMA ITM genera un registro inmutable en la tabla `HistorialEstado`:
- **ID de la Postulación.**
- **Usuario que ejecutó la acción** (con su rol en ese momento).
- **Estado Anterior y Estado Nuevo.**
- **Observación completa ingresada.**
- **Marca booleana de corrección (`fue_correccion`).**
- **Marca de tiempo con precisión de segundos (Timestamp UTC/Colombia).**

Esta bitácora puede consultarse en cualquier momento desde el expediente de la postulación para dirimir reclamos académicos o auditorías de acreditación de alta calidad.

---

## 8. Máquina de Estados y Matriz de Transiciones

El siguiente diagrama representa de forma exhaustiva la máquina de estados finita que gobierna el sistema:

<p align="center">
  <img src="img/diagrama_estados.svg" alt="Diagrama de Máquina de Estados SIGMA ITM" width="100%" />
</p>

### Matriz Detallada de Transiciones de Estado:

| Estado Origen | Estado Destino | Actor Responsable | Condición Previa Requerida | Efecto en el Sistema |
| :--- | :--- | :--- | :--- | :--- |
| `[*]` (Inicio) | `POSTULACION` | Estudiante | Formulario completo + Anexo obligatorio de la modalidad. | Trámite creado en base de datos. Notifica a Coordinación. |
| `POSTULACION` | `REVISION_DOCUMENTAL` | Comité | Documentos subidos y legibles. | Apertura formal del expediente para estudio. |
| `POSTULACION` | `RECHAZADO` | Comité | Falsedad documental o modalidad no aplicable. | Trámite finalizado negativamente. |
| `REVISION_DOCUMENTAL` | `APROBACION` | Comité | Anexos completos y conformes al reglamento. | Trámite avalado para asignación docente. |
| `REVISION_DOCUMENTAL` | `REVISION_DOCUMENTAL` | Comité | Documentación incompleta o con errores. | Activa `requiere_correccion = True`. Pausa el trámite. |
| `REVISION_DOCUMENTAL` | `RECHAZADO` | Comité | No subsanación en plazo o inviabilidad técnica. | Trámite archivado con rechazo formal. |
| `APROBACION` | `EN_PROCESO` | Comité | Selección de Asesor + Redacción de Directriz. | Asesor asignado. Inicia el periodo de trabajo de grado. |
| `APROBACION` | `RECHAZADO` | Comité | Incompatibilidad de líneas o cupos docentes agotados. | Trámite rechazado por disponibilidad de facultad. |
| `EN_PROCESO` | `EN_PROCESO` | Docente Asesor | Avances parciales con observaciones formativas. | Notificación de notas formativas al estudiante. |
| `EN_PROCESO` | `SUSTENTACION` | Docente Asesor | Objetivos al 100% + Visto Bueno del Asesor. | Habilita calendario de sustentación pública. |
| `EN_PROCESO` | `RECHAZADO` | Docente Asesor | Abandono injustificado del proyecto o plagio. | Cierre disciplinario/académico. |
| `SUSTENTACION` | `REVISION_COMITE` | Docente Asesor | Sustentación celebrada con calificación ≥ 3.0. | Envío de acta de sustentación al Comité. |
| `SUSTENTACION` | `RECHAZADO` | Docente Asesor | Calificación reprobatoria (< 3.0) sin opción de ajuste. | Reprobación formal de la opción de grado. |
| `REVISION_COMITE` | `FINALIZADO` | Comité | Acta de Grado aprobada por consejo de facultad. | Expedición del Certificado Oficial con Hash SHA-256. |
| `REVISION_COMITE` | `RECHAZADO` | Comité | Inconsistencias insubsanables en acta de jurados. | No ratificación del grado. |

---

## 9. Casos Prácticos de Extremo a Extremo (Walkthrough)

### 9.1 Caso A: Flujo Regular Aprobado (Trabajo de Grado)

1. **Día 1 (Registro):** La estudiante *Valentina Ríos* se registra en el sistema. El Administrador verifica su matrícula activa y aprueba su cuenta.
2. **Día 2 (Radicación):** Valentina ingresa a su panel y radica la modalidad **Trabajo de Grado**, con el proyecto *"Sistema IoT para Monitoreo de Calidad de Aire en Campus ITM"*. Adjunta su anteproyecto en formato PDF. El trámite queda en `POSTULACION`.
3. **Día 3 (Revisión):** El Comité revisa los documentos, los encuentra conformes y avanza a `REVISION_DOCUMENTAL` y posteriormente a `APROBACION`.
4. **Día 4 (Asignación):** El Comité asigna al docente *Carlos Mario Pérez* como asesor, emitiendo la directriz: *"Enfocar el prototipo en sensores MQ-135 calibrados con norma nacional"*. El trámite pasa a `EN_PROCESO`.
5. **Meses 1 al 4 (Asesorías):** Valentina sube entregas periódicas. El docente registra notas de acompañamiento en el panel.
6. **Mes 5 (Aval):** El asesor otorga el **Visto Bueno** y programa la sustentación para el *15 de noviembre a las 10:00 AM en el Aula E-204*. El estado pasa a `SUSTENTACION`.
7. **Día de la Sustentación:** Valentina defiende su proyecto. El jurado califica con `4.8 (Aprobado con honores)` y el asesor envía el resultado a `REVISION_COMITE`.
8. **Día siguiente (Cierre):** El Comité ratifica el resultado, asigna el Acta de Grado N° `ITM-FI-2026-089` y finaliza el proceso (`FINALIZADO`). Valentina descarga su Certificado Oficial en PDF directamente desde su portal.

---

### 9.2 Caso B: Flujo con Corrección y Subsanación

1. El estudiante *Andrés Mejía* radica la modalidad **Prácticas Profesionales**.
2. En la etapa `REVISION_DOCUMENTAL`, el Comité detecta que la carta de la empresa no especifica la afiliación a la ARL.
3. El evaluador presiona **"Solicitar Corrección"** e ingresa: *"Falta adjuntar el certificado de afiliación a riesgos laborales (ARL) emitido por la empresa"*.
4. El trámite se pausa automáticamente con la bandera `requiere_correccion = True`.
5. Andrés ingresa a su panel, lee la observación y solicita la carta a Recursos Humanos de la empresa.
6. Andrés redacta su mensaje de subsanación y adjunta el certificado de la ARL en PDF.
7. Al enviar, el trámite se descongela. El Comité verifica el nuevo anexo, aprueba la documentación y el proceso continúa normalmente sin demoras ni trámites físicos.

---

## 10. Preguntas Frecuentes y Solución de Problemas (Troubleshooting)

### P1: Olvidé mi contraseña, ¿cómo la restablezco?
> **R:** Por seguridad institucional, contacte al Administrador del sistema o a la Coordinación de Grados de su facultad aportando su cédula y correo institucional para generar un enlace seguro de restablecimiento.

### P2: ¿Por qué no puedo subir un archivo si es menor de 10 MB?
> **R:** El sistema analiza la firma binaria del archivo. Asegúrese de que el archivo no esté corrupto, dañado o con extensiones manipuladas. Si está en formato Word antiguo (`.doc`), guárdelo como Word moderno (`.docx`) o expórtelo como PDF estándar.

### P3: ¿Por qué los botones de aprobación están deshabilitados para el docente asesor?
> **R:** Los botones solo se activan si:
> 1. El usuario actual es el docente nombrado formalmente para ese proyecto.
> 2. El trámite está en una etapa bajo competencia del asesor (`EN_PROCESO` o `SUSTENTACION`).
> 3. El trámite no está pausado por una corrección pendiente del estudiante.

### P4: ¿Qué validez tiene el código Hash SHA-256 del certificado PDF?
> **R:** El hash SHA-256 es una huella digital matemática única e irrepetible generada con los datos del acta, fecha, estudiante y calificación. Cualquier alteración de un solo carácter en el documento invalidará el código, permitiendo a la Secretaría General verificar de forma instantánea la legitimidad del paz y salvo.

---

<div align="center">

**Instituto Tecnológico Metropolitano (ITM)**  
*Institución Universitaria acreditada en Alta Calidad*  
Facultad de Ingenierías — Medellín, Colombia  
**SIGMA ITM — Versión 1.0 (2026)**

</div>
