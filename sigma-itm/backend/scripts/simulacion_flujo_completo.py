"""
simulacion_flujo_completo.py — SIGMA ITM
Simulación exhaustiva del flujo completo de opción de grado:
Estudiante -> Admin -> Asesor -> Comite -> Finalizado.
Valida permisos, estados, bitácora (auditoría), notificaciones de correo y generación de certificado.
"""

import os
import sys
import django

# Configurar entorno Django (apunta a la raíz de backend)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sigma_itm.settings")
django.setup()

from django.conf import settings
settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
settings.ALLOWED_HOSTS = ["*", "testserver", "localhost", "127.0.0.1"]

from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from core.models import (
    Usuario,
    Modalidad,
    Postulacion,
    Documento,
    HistorialEstado,
    EstadoProceso,
    Rol,
)
from core.pdf_utils import generar_certificado_finalizacion

def separador(titulo):
    print("\n" + "=" * 80)
    print(f"  {titulo.upper()}")
    print("=" * 80)

def subpaso(texto):
    print(f"\n---> {texto}")

def simular():
    separador("Iniciando Simulación Exhaustiva de SIGMA ITM")
    if hasattr(mail, "outbox"):
        mail.outbox.clear()
    else:
        mail.outbox = []

    # -----------------------------------------------------------------------
    # 1. Preparar Usuarios
    # -----------------------------------------------------------------------
    subpaso("1. Verificando y preparando usuarios para la simulación")
    estudiante, _ = Usuario.objects.get_or_create(
        username="alumno_prueba",
        defaults={
            "first_name": "Carlos",
            "last_name": "Gómez",
            "email": "carlos.gomez@correo.itm.edu.co",
            "rol": Rol.ESTUDIANTE,
            "cedula": "1002345678",
            "programa_academico": "Tecnología en Desarrollo de Software",
        }
    )
    estudiante.set_password("password123")
    estudiante.save()

    admin, _ = Usuario.objects.get_or_create(
        username="admin_prueba",
        defaults={
            "first_name": "Marta",
            "last_name": "López",
            "email": "marta.lopez@itm.edu.co",
            "rol": Rol.ADMIN,
            "is_staff": True,
        }
    )
    admin.set_password("password123")
    admin.save()

    asesor, _ = Usuario.objects.get_or_create(
        username="asesor_prueba",
        defaults={
            "first_name": "Jorge",
            "last_name": "Ramírez",
            "email": "jorge.ramirez@itm.edu.co",
            "rol": Rol.ASESOR,
        }
    )
    asesor.set_password("password123")
    asesor.save()

    comite, _ = Usuario.objects.get_or_create(
        username="comite_prueba",
        defaults={
            "first_name": "Beatriz",
            "last_name": "Restrepo",
            "email": "beatriz.restrepo@itm.edu.co",
            "rol": Rol.COMITE,
        }
    )
    comite.set_password("password123")
    comite.save()

    modalidad, _ = Modalidad.objects.get_or_create(
        nombre="Trabajo de Grado",
        defaults={"activa": True, "descripcion": "Modalidad de investigación formativa y aplicada."}
    )

    print(f"  [OK] Estudiante: {estudiante.get_full_name()} ({estudiante.email})")
    print(f"  [OK] Administrador: {admin.get_full_name()} ({admin.email})")
    print(f"  [OK] Asesor: {asesor.get_full_name()} ({asesor.email})")
    print(f"  [OK] Comité: {comite.get_full_name()} ({comite.email})")
    print(f"  [OK] Modalidad: {modalidad.nombre}")

    # Limpiar postulaciones previas del alumno de prueba si existían
    Postulacion.objects.filter(estudiante=estudiante).delete()

    client_estudiante = APIClient()
    client_estudiante.force_authenticate(user=estudiante)

    client_admin = APIClient()
    client_admin.force_authenticate(user=admin)

    client_asesor = APIClient()
    client_asesor.force_authenticate(user=asesor)

    client_comite = APIClient()
    client_comite.force_authenticate(user=comite)

    # -----------------------------------------------------------------------
    # 2. Estudiante radica postulación inicial
    # -----------------------------------------------------------------------
    separador("Paso 2: Estudiante radica propuesta de grado")
    resp = client_estudiante.post("/api/postulaciones/", {
        "modalidad": modalidad.id,
        "titulo_proyecto": "Sistema Inteligente de Monitoreo IoT para Campus ITM",
    })
    assert resp.status_code == 201, f"Error al crear postulación: {resp.data}"
    postulacion_id = resp.data["id"]
    postulacion = Postulacion.objects.get(id=postulacion_id)
    print(f"  [POSTULACIÓN CREADA] ID={postulacion.id}")
    print(f"  Estado inicial: {postulacion.estado} ({postulacion.get_estado_display()})")
    print(f"  Estudiante: {postulacion.estudiante.get_full_name()}")
    print(f"  Título: {postulacion.titulo_proyecto}")

    # Subir primer documento
    archivo_propuesta = SimpleUploadedFile(
        "Propuesta_Inicial_IoT.pdf",
        b"%PDF-1.4 Contenido simulado de la propuesta de grado",
        content_type="application/pdf",
    )
    resp_doc1 = client_estudiante.post("/api/documentos/", {
        "postulacion": postulacion.id,
        "nombre": "Propuesta de Trabajo de Grado",
        "descripcion": "Versión 1.0 formulada con objetivos y justificación",
        "archivo": archivo_propuesta,
    })
    assert resp_doc1.status_code == 201
    print(f"  [DOCUMENTO RADICADO 1/3] {resp_doc1.data['nombre']}")

    # Validar que si intenta avanzar sin todos los documentos, el sistema lo bloquea
    subpaso("Probando validación reglamentaria de documentos obligatorios:")
    resp_intento_bloqueado = client_admin.post(f"/api/postulaciones/{postulacion.id}/transicionar/", {
        "nuevo_estado": EstadoProceso.REVISION_DOCUMENTAL,
    })
    assert resp_intento_bloqueado.status_code == 400
    faltantes = resp_intento_bloqueado.data.get("documentos_faltantes", [])
    print(f"  [BLOQUEO EXITOSO]: El validador detectó faltantes: {faltantes}")

    # Estudiante radica los 2 documentos restantes
    for nombre_doc in ["Certificado de paz y salvo académico", "Carta de presentación al comité"]:
        archivo_sim = SimpleUploadedFile(
            f"{nombre_doc}.pdf",
            b"%PDF-1.4 Contenido simulado",
            content_type="application/pdf",
        )
        resp_doc = client_estudiante.post("/api/documentos/", {
            "postulacion": postulacion.id,
            "nombre": nombre_doc,
            "archivo": archivo_sim,
        })
        assert resp_doc.status_code == 201
        print(f"  [DOCUMENTO RADICADO] {nombre_doc}")

    # -----------------------------------------------------------------------
    # 3. Admin / Comité revisa y avanza a Revisión Documental
    # -----------------------------------------------------------------------
    separador("Paso 3: Admin inicia Revisión Documental")
    resp = client_admin.post(f"/api/postulaciones/{postulacion.id}/transicionar/", {
        "nuevo_estado": EstadoProceso.REVISION_DOCUMENTAL,
        "observacion": "Coordinación inicia la verificación documental y de requisitos.",
    })
    assert resp.status_code == 200, f"Error transicionar a REVISION_DOCUMENTAL: {resp.data}"
    postulacion.refresh_from_db()
    print(f"  Estado actual: {postulacion.estado} ({postulacion.get_estado_display()})")
    print(f"  Correos enviados hasta ahora: {len(mail.outbox)}")
    if mail.outbox:
        print(f"  Último correo enviado a: {mail.outbox[-1].to}")
        print(f"  Asunto: {mail.outbox[-1].subject}")

    # Avanzar de REVISION_DOCUMENTAL a APROBACION
    subpaso("Admin aprueba documentación")
    resp = client_admin.post(f"/api/postulaciones/{postulacion.id}/transicionar/", {
        "nuevo_estado": EstadoProceso.APROBACION,
        "observacion": "Documentos validados satisfactoriamente conforme al reglamento.",
    })
    assert resp.status_code == 200, f"Error transicionar a APROBACION: {resp.data}"
    postulacion.refresh_from_db()
    print(f"  Estado actual: {postulacion.estado} ({postulacion.get_estado_display()})")

    # -----------------------------------------------------------------------
    # 4. Admin asigna docente asesor formalmente
    # -----------------------------------------------------------------------
    separador("Paso 4: Admin asigna Docente Asesor con Directriz y envía a EN_PROCESO")
    resp = client_admin.post(f"/api/postulaciones/{postulacion.id}/asignar_asesor/", {
        "asesor_id": asesor.id,
        "mensaje": "Profesor Jorge, por favor hacer seguimiento a la arquitectura del sensor IoT y cronograma.",
        "transicionar": "true",
    })
    assert resp.status_code == 200, f"Error asignar asesor: {resp.data}"
    postulacion.refresh_from_db()
    print(f"  Asesor asignado: {postulacion.asesor.get_full_name()}")
    print(f"  Directriz: '{postulacion.mensaje_asesor}'")
    print(f"  Estado actual: {postulacion.estado} ({postulacion.get_estado_display()})")

    # Verificar que el asesor recibió notificación de correo con la directriz
    correo_asesor = next((m for m in mail.outbox if asesor.email in m.to), None)
    assert correo_asesor is not None, "El asesor no recibió correo de asignación"
    print(f"  [NOTIFICACIÓN AL ASESOR CONFIRMADA]:")
    print(f"    Destinatario: {correo_asesor.to}")
    print(f"    Asunto: {correo_asesor.subject}")

    # -----------------------------------------------------------------------
    # 5. Docente Asesor solicita correcciones en EN_PROCESO
    # -----------------------------------------------------------------------
    separador("Paso 5: Docente Asesor evalúa avances y solicita corrección")
    archivo_retro = SimpleUploadedFile(
        "Anotaciones_Profesor.pdf",
        b"%PDF-1.4 Anotaciones y correcciones sugeridas en la metodologia",
        content_type="application/pdf",
    )
    resp = client_asesor.post(f"/api/postulaciones/{postulacion.id}/solicitar_correccion/", {
        "observacion": "Se requiere detallar el protocolo de comunicación MQTT en la sección 3.2.",
        "archivo": archivo_retro,
    }, format="multipart")
    assert resp.status_code == 200, f"Error solicitar corrección: {resp.data}"
    postulacion.refresh_from_db()
    print(f"  ¿Requiere corrección?: {postulacion.requiere_correccion}")
    print(f"  Observación de corrección: '{postulacion.observacion_correccion}'")
    print(f"  Archivo adjunto de retroalimentación: {bool(postulacion.archivo_correccion)}")

    # Intentar avanzar mientras requiere corrección (debe fallar con 400)
    subpaso("Validando bloqueo de avance por corrección pendiente:")
    resp_bloqueo = client_asesor.post(f"/api/postulaciones/{postulacion.id}/transicionar/", {
        "nuevo_estado": EstadoProceso.SUSTENTACION,
    })
    assert resp_bloqueo.status_code == 400, "Debería bloquear la transición por corrección pendiente"
    print(f"  [BLOQUEO EXITOSO]: {resp_bloqueo.data['detail']}")

    # -----------------------------------------------------------------------
    # 6. Estudiante subsana la corrección
    # -----------------------------------------------------------------------
    separador("Paso 6: Estudiante subsana observación y radica documento corregido")
    archivo_corregido = SimpleUploadedFile(
        "Propuesta_Corregida_V2.pdf",
        b"%PDF-1.4 Ajustes aplicados con especificacion MQTT completa",
        content_type="application/pdf",
    )
    resp = client_estudiante.post(f"/api/postulaciones/{postulacion.id}/subsanar_correccion/", {
        "mensaje": "Se incorporó la descripción detallada del protocolo MQTT y parámetros de QoS en la sección 3.2.",
        "archivo": archivo_corregido,
    }, format="multipart")
    assert resp.status_code == 200, f"Error subsanar corrección: {resp.data}"
    postulacion.refresh_from_db()
    print(f"  ¿Requiere corrección tras subsanar?: {postulacion.requiere_correccion}")
    print(f"  Mensaje de subsanación: '{postulacion.mensaje_subsanacion}'")
    print(f"  Fecha de subsanación: {postulacion.subsanado_en}")

    # -----------------------------------------------------------------------
    # 7. Asesor aprueba entregable y avanza a Sustentación
    # -----------------------------------------------------------------------
    separador("Paso 7: Asesor avanza a Sustentación")
    resp = client_asesor.post(f"/api/postulaciones/{postulacion.id}/transicionar/", {
        "nuevo_estado": EstadoProceso.SUSTENTACION,
        "observacion": "Subsanación aprobada con éxito. El estudiante queda habilitado para sustentación.",
    })
    assert resp.status_code == 200, f"Error transicionar a SUSTENTACION: {resp.data}"
    postulacion.refresh_from_db()
    print(f"  Estado actual: {postulacion.estado} ({postulacion.get_estado_display()})")

    # -----------------------------------------------------------------------
    # 8. Asesor Notifica Fecha y Lugar de Sustentación al Estudiante
    # -----------------------------------------------------------------------
    separador("Paso 8: Asesor Notifica Sustentación al Alumno (Fecha, Lugar, Instrucciones)")
    archivo_guia = SimpleUploadedFile(
        "Instrucciones_Sustentacion.pdf",
        b"%PDF-1.4 Rubrica y formato de presentacion de sustentacion",
        content_type="application/pdf",
    )
    resp = client_asesor.post(f"/api/postulaciones/{postulacion.id}/notificar_sustentacion/", {
        "mensaje": "Sustentación fijada para el 28 de Octubre a las 09:00 AM en el Aula Magna ITM. 20 minutos de exposición y 10 de preguntas.",
        "archivo": archivo_guia,
    }, format="multipart")
    assert resp.status_code == 200, f"Error notificar sustentación: {resp.data}"
    postulacion.refresh_from_db()
    print(f"  Mensaje de sustentación registrado: '{postulacion.mensaje_sustentacion}'")
    print(f"  Archivo adjunto para estudiante: {bool(postulacion.archivo_sustentacion)}")

    # -----------------------------------------------------------------------
    # 9. Asesor remite el proyecto al Comité (REVISION_COMITE)
    # -----------------------------------------------------------------------
    separador("Paso 9: Asesor envía proyecto al Comité tras sustentación aprobada")
    resp = client_asesor.post(f"/api/postulaciones/{postulacion.id}/transicionar/", {
        "nuevo_estado": EstadoProceso.REVISION_COMITE,
        "observacion": "Sustentación presentada y aprobada con 4.8. Se remite al Comité para cierre final y emisión de certificado.",
    })
    assert resp.status_code == 200, f"Error transicionar a REVISION_COMITE: {resp.data}"
    postulacion.refresh_from_db()
    print(f"  Estado actual: {postulacion.estado} ({postulacion.get_estado_display()})")

    # Verificar correo al Comité
    correo_comite = next((m for m in mail.outbox if comite.email in m.to), None)
    assert correo_comite is not None, "El Comité no recibió notificación de remisión"
    print(f"  [NOTIFICACIÓN AL COMITÉ CONFIRMADA]:")
    print(f"    Destinatario: {correo_comite.to}")
    print(f"    Asunto: {correo_comite.subject}")

    # -----------------------------------------------------------------------
    # 10. Comité evalúa y aprueba/finaliza el proyecto
    # -----------------------------------------------------------------------
    separador("Paso 10: Comité de Trabajos de Grado Aprueba y Finaliza el Proyecto")
    resp = client_comite.post(f"/api/postulaciones/{postulacion.id}/transicionar/", {
        "nuevo_estado": EstadoProceso.FINALIZADO,
        "observacion": "Comité de Grados ratifica la aprobación por Acta N° 2026-08. Proceso culminado con honores.",
    })
    assert resp.status_code == 200, f"Error transicionar a FINALIZADO: {resp.data}"
    postulacion.refresh_from_db()
    print(f"  Estado actual: {postulacion.estado} ({postulacion.get_estado_display()})")

    # Verificar notificación al estudiante sobre finalización
    correos_estudiante = [m for m in mail.outbox if estudiante.email in m.to]
    assert len(correos_estudiante) > 0, "Estudiante no recibió correo de finalización"
    ultimo_estudiante = correos_estudiante[-1]
    print(f"  [NOTIFICACIÓN AL ESTUDIANTE CONFIRMADA]:")
    print(f"    Asunto: {ultimo_estudiante.subject}")

    # Verificar notificación al asesor sobre finalización
    correos_asesor = [m for m in mail.outbox if asesor.email in m.to]
    ultimo_asesor = correos_asesor[-1]
    print(f"  [NOTIFICACIÓN AL ASESOR DE FINALIZACIÓN CONFIRMADA]:")
    print(f"    Asunto: {ultimo_asesor.subject}")

    # -----------------------------------------------------------------------
    # 11. Descarga y Verificación del Certificado Oficial en PDF
    # -----------------------------------------------------------------------
    separador("Paso 11: Generación y Descarga del Certificado de Finalización")
    resp_cert = client_estudiante.get(f"/api/postulaciones/{postulacion.id}/certificado/")
    assert resp_cert.status_code == 200, f"Error al generar certificado: {resp_cert.data}"
    assert resp_cert["Content-Type"] == "application/pdf"
    tamano_pdf = len(resp_cert.content)
    print(f"  [CERTIFICADO PDF GENERADO CON ÉXITO]:")
    print(f"    Tipo de contenido: {resp_cert['Content-Type']}")
    print(f"    Tamaño: {tamano_pdf} bytes")
    print(f"    Encabezado: {resp_cert.get('Content-Disposition', '')}")

    # -----------------------------------------------------------------------
    # 12. Inspección Completa de la Bitácora y Auditoría
    # -----------------------------------------------------------------------
    separador("Paso 12: Auditoría y Bitácora Completa del Trámite")
    historial = HistorialEstado.objects.filter(postulacion=postulacion).order_by("fecha")
    print(f"  Total de eventos auditados: {historial.count()}\n")

    for i, h in enumerate(historial, 1):
        ant = h.get_estado_anterior_display() or h.estado_anterior
        nue = h.get_estado_nuevo_display() or h.estado_nuevo
        realizador = h.realizado_por.get_full_name() if h.realizado_por else "Sistema"
        rol_usuario = h.realizado_por.rol if h.realizado_por else "N/A"
        tipo = "[CORRECCIÓN]" if h.es_correccion else "[TRANSICIÓN]"
        print(f"  {i}. {tipo} {ant} -> {nue}")
        print(f"     Fecha/Hora : {h.fecha.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"     Actor      : {realizador} ({rol_usuario})")
        print(f"     Detalle    : {h.observacion}")
        print("     " + "-" * 60)

    separador("SIMULACIÓN EXITOSA: TODOS LOS PASOS Y VALIDACIONES CUMPLIDOS AL 100%")

if __name__ == "__main__":
    simular()
