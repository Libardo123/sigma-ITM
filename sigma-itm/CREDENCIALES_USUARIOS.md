# 🔐 Credenciales de Acceso al Sistema - SIGMA ITM

Este documento registra los usuarios registrados en el sistema, sus roles, correos institucionales, documentos de identidad y contraseñas vigentes para el acceso manual y el autoservicio de recuperación de credenciales.

---

## 👥 1. Perfiles Principales del Sistema

| Rol | Nombre Completo | Usuario (`username`) | Documento / Cédula | Correo Institucional / Acceso | Contraseña | Descripción / Potestad |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **🎓 Estudiante** | Jorge Bernal | `estudiante1` | `1037654321` | `jorge.bernal@correo.itm.edu.co` | `sigma2026` | Radica propuestas de grado, adjunta anteproyectos, consulta avance y descarga certificado. |
| **👨‍🏫 Docente Asesor** | Miguel Antonio Ojeda Enríquez | `asesor1` | `1000000002` | `miguel.ojeda@itm.edu.co` | `sigma2026` | Revisa y supervisa proyectos asignados en etapa `EN_PROCESO`, emite correcciones y aprueba informe final. |
| **🏛️ Comité de Grados** | Jorge Iván Bedoya Restrepo | `comite1` | `1000000003` | `comite.grados@itm.edu.co` | `sigma2026` | Evalúa solicitudes, asigna asesores, aprueba y expide actas y avales oficiales. |
| **⚙️ Administrador General** | Administrador SIGMA | `admin1` | `1000000001` | `admin@itm.edu.co` | `sigma2026` | Gestión integral, administración y aprobación de usuarios, auditoría y métricas globales. |

---

## 🎓 2. Estudiantes Registrados en el Sistema

| Nombre Completo | Usuario (`username`) | Documento / Cédula | Correo Electrónico | Programa Académico | Contraseña | Estado / Trámite Actual |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Libardo Bedoya** | `libardobedoya` | `1128708998` | `liba-15@hotmail.com` | Ingeniería de Sistemas | `sigma2026` | Estudiante registrado |
| **Diana Cuervo** | `dianacuervo` | `1017160720` | `dianacuervo68082@correo.itm.edu.co` | Ingeniería de Sistemas | `sigma2026` | En etapa de `APROBACION` |
| **Libardo Bedoya** | `andresbedoya` | `1128708999` | `libardobedoya282159@correo.imt.edu.co` | Ingeniería de Sistemas | `sigma2026` | En etapa de `SUSTENTACION` |

---

## 🧪 3. Usuarios de Pruebas Automatizadas y Simulación

Usuarios utilizados por los scripts de integración y pruebas end-to-end (`simulacion_flujo_completo.py`):

| Rol | Nombre Completo | Usuario (`username`) | Documento / Cédula | Correo Electrónico | Contraseña |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Estudiante** | Carlos Gómez | `alumno_prueba` | `1002345678` | `carlos.gomez@correo.itm.edu.co` | `password123` |
| **Docente Asesor** | Jorge Ramírez | `asesor_prueba` | `1000000005` | `jorge.ramirez@itm.edu.co` | `password123` |
| **Comité de Grados** | Beatriz Restrepo | `comite_prueba` | `1000000006` | `beatriz.restrepo@itm.edu.co` | `password123` |
| **Administrador** | Marta López | `admin_prueba` | `1000000004` | `marta.lopez@itm.edu.co` | `password123` |

---

## 🔄 Diferencia entre Flujos de Acceso y Gestión de Cuentas

1. **Creación de Usuario por Primera Vez (Aprobación Administrativa):**
   - Cuando un nuevo estudiante o docente se registra mediante el formulario de `/registro`, la cuenta se crea inactiva (`is_active = False`).
   - El **Administrador General** (`admin1`) es quien revisa la solicitud en la bandeja de cuentas pendientes y otorga la aprobación y activación oficial.

2. **Recuperación Autónoma de Contraseña:**
   - Si un usuario ya tiene una cuenta activa y olvida su clave, el sistema le permite **restablecer su contraseña de forma autónoma e inmediata** desde el login (`¿Olvidaste tu contraseña?`).
   - El usuario solo debe ingresar su usuario/correo institucional y su número de **Cédula / Documento de Identidad** registrado como factor de seguridad.
   - Si los datos coinciden y la cuenta está activa, la contraseña se actualiza en el momento sin necesidad de esperar a que un administrador intervenga.
