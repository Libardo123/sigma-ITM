# Plan de Refactorización de Flujos y Lógicas de Negocio - SIGMA ITM

Este documento consolida el estado actual de la plataforma a nivel lógico, los problemas detectados en el código y el plan de acción (paso a paso) para implementar el flujo correcto y seguro que requiere el Instituto Tecnológico Metropolitano (ITM).

## 1. Problemas y Carencias Encontradas (Lo que está mal o falta)

Tras realizar una auditoría de la lógica en el Backend (`models.py`) y el Frontend (`PanelAprobacion.jsx`), se encontraron las siguientes fallas críticas:

*   **Evaluación a Ciegas (Falta UI):** El estudiante sube correctamente sus documentos a la base de datos, pero el Panel del evaluador (Asesor/Comité) **no tiene código para mostrar o descargar esos archivos**. No pueden revisar nada.
*   **Permisos de Transición Globales (Roles cruzados):** El backend verifica si el usuario es `Asesor` o `Comité`, pero le da permiso a ambos para ejecutar **todas** las transiciones posibles. El Comité puede meterse en etapas del Asesor y viceversa.
*   **Cortocircuito de Correcciones (Saltos de seguridad):** Cuando un evaluador hace clic en "Pedir Corrección", el sistema crea la alerta, pero **no bloquea** el botón de avanzar a la siguiente etapa. Un evaluador (por accidente o desconocimiento) podría avanzar el estado sin esperar a que el estudiante suba el documento corregido.
*   **Falta mecanismo de "Desbloqueo":** El estudiante no tiene un botón o endpoint para decirle al evaluador: "Ya hice la corrección, por favor vuelve a revisar". El proceso queda atascado si dependemos de la plataforma actual.

---

## 2. La Lógica a Aplicar (El Flujo Correcto)

Para blindar el sistema y que responda a la realidad académica, aplicaremos el siguiente flujo estricto y secuencial:

### Matriz de Permisos por Etapa (Role-Based Access Control)

| Etapa Actual | Transiciones Posibles | Rol Exclusivo Autorizado | Descripción de la Acción |
| :--- | :--- | :--- | :--- |
| **1. POSTULACIÓN** | -> *Revisión Documental* | **COMITÉ** | El Comité recibe la solicitud y verifica que la documentación básica esté completa. |
| **2. REVISIÓN DOCUMENTAL** | -> *Aprobación*<br>-> *Postulación* (Devolver) | **COMITÉ** | El Comité verifica a fondo, asigna al Asesor y aprueba el inicio del trabajo. |
| **3. APROBACIÓN** | -> *En Proceso* | **COMITÉ** | Oficialización de la matrícula del proyecto. |
| **4. EN PROCESO** | -> *Sustentación*<br>-> *Rechazado* | **ASESOR** | El estudiante desarrolla el proyecto bajo la única tutoría del Asesor asignado. Solo el Asesor da el "Visto Bueno" para la sustentación. |
| **5. SUSTENTACIÓN** | -> *Finalizado*<br>-> *En Proceso* (Devolver)<br>-> *Rechazado* | **COMITÉ** | El Comité/Jurado recibe el acta de sustentación y da el fallo definitivo. |

### Regla de Oro para las Correcciones (Bloqueo Duro)
Si un evaluador registra una observación (`requiere_correccion = True`), el motor de estados **bloqueará inmediatamente** todas las transiciones. La única forma de que los botones de avanzar vuelvan a aparecer en el panel del evaluador será cuando el estudiante presione un botón llamado **"Enviar Corrección Subsanada"**.

---

## 3. Paso a Paso de Implementación Técnica (El RoadMap)

Ejecutaremos el trabajo en el siguiente orden estricto:

### Fase 1: Blindaje del Backend (Lógica Fuerte)
1.  **Modificar `models.py`:** Añadir la propiedad `roles_autorizados` a cada clase del patrón de estados (`EstadoBase`).
2.  **Validar Permisos en Views:** Actualizar el endpoint `transicionar` en `views.py` para que lance un error 403 si el rol del usuario no coincide con el rol autorizado para esa etapa en específico.
3.  **Endpoint de Subsanación:** Crear un nuevo endpoint `/api/postulaciones/<id>/subsanar_correccion/` que solo pueda usar el estudiante, el cual cambiará `requiere_correccion` a `False`.
4.  **Bloqueo de Estado:** Modificar `transiciones_disponibles` para que retorne una lista vacía `[]` si `requiere_correccion` es `True`.

### Fase 2: Interfaz del Estudiante (Poder responder)
1.  **Actualizar `PanelEstudiante.jsx`:** Añadir un botón visible únicamente cuando tenga el tag de "Corrección Requerida". Este botón consumirá el nuevo endpoint para informarle al evaluador que ya arregló el problema.

### Fase 3: Interfaz del Evaluador (Panel Aprobación Real)
1.  **Ver Documentos:** Integrar peticiones al backend para traer la lista de documentos (`DocumentoViewSet`) e inyectarlos en `PanelAprobacion.jsx` con botones directos de descarga.
2.  **Validación visual de Roles:** Ocultar los botones de "Aprobar" / "Pedir Corrección" en el frontend si el rol del usuario actual no es el autorizado para esa tarjeta específica.
3.  **Estado de Bloqueo UI:** Mostrar un mensaje claro de "Esperando respuesta del estudiante..." cuando el evaluador le haya pedido una corrección, desapareciendo sus botones de acción para prevenir errores humanos.

---

## 4. Flujo de Registro, Control de Roles y Aprobación de Cuentas por el Administrador

Este flujo define de forma explícita cómo un usuario ingresa a SIGMA ITM, cómo se controla su rol para evitar accesos no autorizados y cómo se realiza la notificación por correo electrónico de manera efectiva y sin fricciones técnicas (sin depender de APIs de terceros ni configuraciones SMTP complejas).

### 4.1. Principio de Seguridad y Gobierno de Perfiles
*   Cualquier persona puede diligenciar el formulario de registro (`/registro`) indicando sus datos personales (nombre, cédula, correo institucional, programa académico) y seleccionando el rol que solicita dentro del sistema:
    *   `ESTUDIANTE`: Para postular y seguir su opción de grado.
    *   `ASESOR`: Para docentes tutores de proyectos.
    *   `COMITE`: Para miembros del Comité de Trabajos de Grado.
*   **Regla de Oro:** La cuenta se crea con `is_active = False` (inactiva / pendiente de validación). **Nadie puede iniciar sesión de forma automática con roles docentes o directivos.**
*   Si el usuario intenta hacer login antes de ser aprobado, el sistema bloquea el acceso con un mensaje explicativo: *"Tu cuenta se encuentra en proceso de revisión y aprobación por el Administrador del ITM."*

### 4.2. Notificación y Envío de Correo sin APIs Externas (Protocolo `mailto:` y Webmail Prellenado)
Para evitar los fallos recurrentes de configuración SMTP (contraseñas de aplicación de Google, puertos bloqueados 587/465 en redes universitarias o domésticas, límites de envío y caídas de servidores externos), se adopta una solución híbrida:

1.  **En el Backend (Garantía contra caídas):**
    *   Django mantiene configurado `console.EmailBackend`. Esto garantiza que el servidor jamás se bloquee ni arroje errores 500 por fallos de red hacia un servidor SMTP.
2.  **En el Frontend (Envío Real y Efectivo):**
    *   La plataforma genera enlaces y botones interactivos que invocan el protocolo estándar `mailto:` o abren directamente la pestaña de redacción de **Outlook ITM / Office 365 / Gmail**.
    *   El enlace viaja con los parámetros `to`, `subject` y `body` **completamente prellenados y formateados** según el rol y la acción.
    *   El usuario o administrador solo debe hacer **un clic en "Enviar"** desde su cliente de correo habitual para que el mensaje salga efectivamente desde su cuenta real.

### 4.3. Paso a Paso del Flujo con Dos Correos Reales (Entorno de Pruebas y Demostración)

Para validar este flujo en prácticas o sustentaciones, se utilizan dos correos reales:
*   **Correo A (Administrador):** Correo del administrador o evaluador del sistema.
*   **Correo B (Estudiante / Asesor solicitante):** Correo de la persona que se registra.

#### Escenario A: Solicitud de Registro (Estudiante / Asesor -> Administrador)
1.  La persona ingresa a `/registro` con su **Correo B**, llena sus datos y selecciona su rol (`ESTUDIANTE`, `ASESOR` o `COMITE`).
2.  Al hacer clic en "Registrarse":
    *   La cuenta se almacena en la base de datos con `is_active = False`.
    *   La pantalla de éxito le muestra: *"¡Registro recibido! Tu perfil está pendiente de aprobación por el Administrador."*
    *   Se habilita el botón: **"📩 Notificar al Administrador de mi solicitud"**.
3.  Al presionar dicho botón:
    *   Se abre el gestor de correo listo para enviar hacia el **Correo A (Admin)** con la plantilla prellenada:
        *   **Para:** `admin@itm.edu.co` (o Correo A de prueba).
        *   **Asunto:** `SIGMA ITM — Solicitud de activación de cuenta: [Nombre] ([ROL])`
        *   **Cuerpo:**
            > *Estimado Administrador del ITM:*  
            > *El usuario [Nombre Completo], identificado con cédula [Cédula], correo [Correo B] y programa académico [Programa], ha solicitado la creación de un perfil con rol [ESTUDIANTE / ASESOR / COMITÉ] en la plataforma SIGMA ITM.*  
            > *Por favor ingrese al panel de administración para validar y autorizar su acceso.*

#### Escenario B: Aprobación o Rechazo por el Administrador (Admin -> Estudiante)
1.  El Administrador inicia sesión con su cuenta institucional.
2.  En el panel administrativo, accede a la sección **"Solicitudes de Registro Pendientes"**:
    *   Visualiza la lista de usuarios inactivos con su nombre, cédula, correo, programa, rol solicitado y fecha de registro.
3.  **Si el Administrador presiona "Aprobar":**
    *   El sistema actualiza la cuenta en base de datos: `is_active = True`.
    *   Se despliega el botón: **"✉️ Notificar Aprobación al Usuario"**.
    *   Al hacer clic, se abre el correo con destino al **Correo B** con la plantilla prellenada:
        *   **Para:** `[Correo B del usuario]`
        *   **Asunto:** `SIGMA ITM — ¡Tu cuenta ha sido aprobada exitosamente!`
        *   **Cuerpo:**
            > *Hola [Nombre Completo]:*  
            > *Te informamos que tu solicitud de registro en SIGMA ITM ha sido aprobada por la Administración con el rol de [ROL].*  
            > *Ya puedes ingresar a la plataforma con tu usuario y contraseña en: http://localhost:5173/login*  
            > *Bienvenido al Sistema de Modalidades de Grado de la Facultad de Ingenierías.*
4.  El usuario ahora ingresa normalmente al Login y accede a su panel con todas las funcionalidades habilitadas de su rol.
5.  **Si el Administrador presiona "Rechazar":**
    *   Se solicita el motivo del rechazo (ej. *"Cédula no registrada en el sistema académico"*).
    *   El sistema elimina o inactiva la solicitud.
    *   Se ofrece el botón para abrir el correo informando al solicitante el motivo por el cual no fue autorizada su cuenta.

### 4.4. Garantía de Integridad del Código Existente
*   Este flujo se integra exclusivamente a nivel de **gestión de usuarios y autenticación**.
*   **No altera ni modifica:** el motor de estados de las opciones de grado, las validaciones de documentos de las 10 modalidades, el gestor de archivos, el historial inmutable de auditoría, las etapas del Comité ni la generación del PDF de certificación.
