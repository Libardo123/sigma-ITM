"""
signals.py — SIGMA ITM
Notificaciones automáticas por correo basadas en señales de Django (patrón Observer).

Casos de disparo:
  (a) Cambio de estado real en una Postulacion (post_save cuando estado cambia).
  (b) Solicitud de corrección de etapa (es_correccion=True en HistorialEstado).
  (c) Asignación de asesor: notificación al asesor recién asignado con el mensaje
      e indicación del documento adjunto si el Admin/Comité lo incluyó.

Criterio de fallo: si el envío de correo falla, el cambio de estado NO se revierte.
El error se registra en el log técnico de Django, no en el HistorialEstado
(que es auditoría de negocio, no de infraestructura).
"""

from __future__ import annotations

import logging

from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import HistorialEstado

logger = logging.getLogger(__name__)

# Asunto de correo según el tipo de evento.
_ASUNTO_AVANCE = "SIGMA ITM — Tu proceso avanzó a: {estado_nuevo}"
_ASUNTO_CORRECCION = "SIGMA ITM — Tienes una observación pendiente en tu etapa actual"

_CUERPO_AVANCE = """
Hola {nombre_estudiante},

Tu proceso de opción de grado ha avanzado al estado: {estado_nuevo_display}.

{observacion_texto}

Ingresa a SIGMA ITM para ver el detalle y los próximos pasos.

— Sistema SIGMA ITM
""".strip()

_CUERPO_CORRECCION = """
Hola {nombre_estudiante},

Tienes una observación pendiente en tu etapa "{estado_actual_display}":

"{observacion}"

Por favor, revisa las instrucciones y sube los documentos o ajustes necesarios.
Después de corregir, el asesor volverá a evaluar tu postulación en la misma etapa.

Ingresa a SIGMA ITM para ver el detalle completo.

— Sistema SIGMA ITM
""".strip()

# ── Plantillas para notificación al ASESOR ──────────────────────────────────

_ASUNTO_ASESOR_ASIGNADO = "SIGMA ITM — Se te ha asignado un nuevo proyecto para asesorar"

_CUERPO_ASESOR_ASIGNADO = """
Hola {nombre_asesor},

El Administrador / Comité de Trabajos de Grado del ITM te ha asignado formalmente
como asesor del siguiente proyecto de opción de grado:

  Estudiante   : {nombre_estudiante}
  Modalidad    : {modalidad}
  Proyecto     : {titulo_proyecto}
  Estado actual: {estado_display}

{mensaje_admin_texto}
{archivo_texto}

Por favor, ingresa a SIGMA ITM para revisar el expediente completo del estudiante,
consultar los documentos adjuntos y gestionar el seguimiento de su proceso.

— Sistema SIGMA ITM
""".strip()

_ASUNTO_ASESOR_FINALIZADO = "SIGMA ITM — Proyecto de grado finalizado y aprobado por el Comité"

_CUERPO_ASESOR_FINALIZADO = """
Hola {nombre_asesor},

Te informamos que el Comité de Trabajos de Grado ha aprobado y finalizado satisfactoriamente el proyecto de grado que asesoraste:

  Estudiante   : {nombre_estudiante}
  Modalidad    : {modalidad}
  Proyecto     : {titulo_proyecto}
  Estado       : Finalizado

{observacion_texto}

El estudiante ya puede descargar su Certificado Oficial de Aprobación desde la plataforma SIGMA ITM.
Agradecemos tu compromiso y acompañamiento durante todo el desarrollo de esta opción de grado.

— Sistema SIGMA ITM
""".strip()


@receiver(post_save, sender=HistorialEstado)
def notificar_cambio_estado(
    sender, instance: HistorialEstado, created: bool, **kwargs
) -> None:
    """Envía correo al estudiante (y opcionalmente al asesor) cuando se crea
    un nuevo registro en el historial.

    Se conecta a HistorialEstado.post_save en lugar de Postulacion.post_save
    para aprovechar que el historial ya incluye toda la información necesaria
    (estado anterior, nuevo, observación, si es corrección) en un solo lugar.

    Solo dispara en creación (`created=True`), nunca en actualizaciones del
    registro (el historial es inmutable — no debería actualizarse, pero por
    seguridad se verifica).

    Adicionalmente, si el evento corresponde a una asignación de asesor
    (detectado por el prefijo "Asesor asignado:" en la observación),
    envía también un correo de notificación al asesor recién asignado
    incluyendo el mensaje personalizado del Admin y la mención al documento
    adjunto si existe.

    Args:
        sender: Clase HistorialEstado.
        instance: Registro de historial recién creado.
        created: True si es un registro nuevo.
        **kwargs: Argumentos adicionales de Django signals.
    """
    if not created:
        return

    postulacion = instance.postulacion
    estudiante = postulacion.estudiante

    # ── Notificación al ESTUDIANTE ───────────────────────────────────────────
    if not estudiante.email:
        logger.warning(
            "No se puede enviar notificación al estudiante %s (postulacion=%s): sin email.",
            estudiante.username,
            postulacion.id,
        )
    else:
        nombre_estudiante = estudiante.get_full_name() or estudiante.username
        try:
            if instance.es_correccion:
                # Caso (b): solicitud de corrección de etapa.
                _enviar_notificacion_correccion(
                    email_destino=estudiante.email,
                    nombre_estudiante=nombre_estudiante,
                    estado_actual_display=postulacion.get_estado_display(),
                    observacion=instance.observacion,
                )
            else:
                # Caso (a): avance de estado real.
                _enviar_notificacion_avance(
                    email_destino=estudiante.email,
                    nombre_estudiante=nombre_estudiante,
                    estado_nuevo=instance.estado_nuevo,
                    estado_nuevo_display=postulacion.get_estado_display(),
                    observacion=instance.observacion,
                )
        except Exception as exc:  # noqa: BLE001 — captura genérica intencional
            logger.exception(
                "Error al enviar notificación de email al estudiante para postulacion=%s, historial=%s: %s",
                postulacion.id,
                instance.id,
                exc,
            )

    # ── Notificación al ASESOR (caso c: asignación) ─────────────────────────
    # La vista asignar_asesor siempre registra la observación con el prefijo
    # "Asesor asignado:" — es la señal inequívoca de este evento.
    es_asignacion_asesor = (
        not instance.es_correccion
        and instance.observacion.startswith("Asesor asignado:")
    )

    if es_asignacion_asesor:
        asesor = postulacion.asesor
        if asesor and asesor.email:
            try:
                _enviar_notificacion_asesor(
                    postulacion=postulacion,
                    asesor=asesor,
                    observacion_completa=instance.observacion,
                )
            except Exception as exc:  # noqa: BLE001
                logger.exception(
                    "Error al enviar notificación de email al asesor %s para postulacion=%s: %s",
                    asesor.username,
                    postulacion.id,
                    exc,
                )
        elif asesor and not asesor.email:
            logger.warning(
                "No se puede notificar al asesor %s (postulacion=%s): sin email registrado.",
                asesor.username,
                postulacion.id,
            )

    # ── Notificación al COMITÉ (caso d: asesor envía tras sustentación) ──────
    # Detectamos el avance desde SUSTENTACION hacia el siguiente estado.
    es_envio_a_comite = (
        not instance.es_correccion
        and instance.estado_anterior == "SUSTENTACION"
        and instance.estado_nuevo not in ("SUSTENTACION", "RECHAZADO")
    )

    if es_envio_a_comite:
        try:
            _enviar_notificacion_comite(postulacion=postulacion, observacion=instance.observacion)
        except Exception as exc:  # noqa: BLE001
            logger.exception(
                "Error al enviar notificación al Comité para postulacion=%s: %s",
                postulacion.id,
                exc,
            )

    # ── Notificación al ASESOR (caso e: comite aprueba/finaliza el proyecto) ──
    es_finalizado = (
        not instance.es_correccion
        and instance.estado_nuevo == "FINALIZADO"
    )

    if es_finalizado and postulacion.asesor and postulacion.asesor.email:
        try:
            _enviar_notificacion_finalizacion_asesor(
                postulacion=postulacion,
                asesor=postulacion.asesor,
                observacion=instance.observacion,
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception(
                "Error al notificar al asesor %s de la finalización para postulacion=%s: %s",
                postulacion.asesor.username,
                postulacion.id,
                exc,
            )


def _enviar_notificacion_avance(
    email_destino: str,
    nombre_estudiante: str,
    estado_nuevo: str,
    estado_nuevo_display: str,
    observacion: str,
) -> None:
    """Envía el correo de avance de estado al estudiante.

    Args:
        email_destino: Dirección de correo del estudiante.
        nombre_estudiante: Nombre completo o username del estudiante.
        estado_nuevo: Valor interno del nuevo estado (para el asunto).
        estado_nuevo_display: Nombre legible del nuevo estado.
        observacion: Comentario del asesor/comité (puede estar vacío).
    """
    observacion_texto = (
        f"Observación del evaluador: \"{observacion}\""
        if observacion.strip()
        else ""
    )

    send_mail(
        subject=_ASUNTO_AVANCE.format(estado_nuevo=estado_nuevo_display),
        message=_CUERPO_AVANCE.format(
            nombre_estudiante=nombre_estudiante,
            estado_nuevo_display=estado_nuevo_display,
            observacion_texto=observacion_texto,
        ),
        from_email=None,  # Usa DEFAULT_FROM_EMAIL de settings.py
        recipient_list=[email_destino],
        fail_silently=False,  # Que lance excepción para que el logger la capture.
    )
    logger.info(
        "Notificación de avance enviada a %s (nuevo estado: %s).",
        email_destino,
        estado_nuevo,
    )


def _enviar_notificacion_asesor(postulacion, asesor, observacion_completa: str) -> None:
    """Envía correo al asesor notificándole que le fue asignado un proyecto.

    Extrae el mensaje personalizado del administrador de la observación
    registrada en el historial por asignar_asesor() en views.py:
      "Asesor asignado: <nombre> — Directriz: <msg> [Documento adjunto para el asesor]"

    Si el admin adjuntó un documento (archivo_asesor), también se indica
    en el cuerpo del correo para que el asesor sepa que debe descargarlo
    desde SIGMA ITM.

    Args:
        postulacion: Instancia de Postulacion con el contexto completo.
        asesor: Instancia del Usuario asesor recién asignado.
        observacion_completa: Texto de observación registrado en HistorialEstado.
    """
    nombre_asesor = asesor.get_full_name() or asesor.username
    nombre_estudiante = (
        postulacion.estudiante.get_full_name() or postulacion.estudiante.username
    )

    # Extraer directriz/mensaje del admin desde la observación del historial.
    # Formato de views.py: "Asesor asignado: <nombre> — Directriz: <msg>"
    mensaje_admin_texto = ""
    if "— Directriz:" in observacion_completa:
        directriz = observacion_completa.split("— Directriz:", 1)[1].strip()
        # Quitar el sufijo "[Documento adjunto para el asesor]" si existe
        if " [Documento" in directriz:
            directriz = directriz.split(" [Documento", 1)[0].strip()
        if directriz:
            mensaje_admin_texto = (
                f"Mensaje del Administrador / Comité para ti:\n"
                f"  \"{directriz}\""
            )

    # Informar si el admin adjuntó un documento de contexto
    archivo_texto = ""
    if postulacion.archivo_asesor:
        archivo_texto = (
            "📎 El Administrador adjuntó un documento de contexto para este proyecto.\n"
            "   Puedes descargarlo desde tu panel en SIGMA ITM al ingresar al expediente."
        )

    send_mail(
        subject=_ASUNTO_ASESOR_ASIGNADO,
        message=_CUERPO_ASESOR_ASIGNADO.format(
            nombre_asesor=nombre_asesor,
            nombre_estudiante=nombre_estudiante,
            modalidad=postulacion.modalidad.nombre,
            titulo_proyecto=postulacion.titulo_proyecto or "Sin título registrado",
            estado_display=postulacion.get_estado_display(),
            mensaje_admin_texto=mensaje_admin_texto,
            archivo_texto=archivo_texto,
        ),
        from_email=None,
        recipient_list=[asesor.email],
        fail_silently=False,
    )
    logger.info(
        "Notificación de asignación enviada al asesor %s (postulacion=%s).",
        asesor.email,
        postulacion.id,
    )


def _enviar_notificacion_correccion(
    email_destino: str,
    nombre_estudiante: str,
    estado_actual_display: str,
    observacion: str,
) -> None:
    """Envía el correo de solicitud de corrección al estudiante.

    Args:
        email_destino: Dirección de correo del estudiante.
        nombre_estudiante: Nombre completo o username del estudiante.
        estado_actual_display: Nombre legible del estado actual (no cambia).
        observacion: Descripción de lo que el estudiante debe corregir.
    """
    send_mail(
        subject=_ASUNTO_CORRECCION,
        message=_CUERPO_CORRECCION.format(
            nombre_estudiante=nombre_estudiante,
            estado_actual_display=estado_actual_display,
            observacion=observacion,
        ),
        from_email=None,
        recipient_list=[email_destino],
        fail_silently=False,
    )
    logger.info(
        "Notificación de corrección enviada a %s (etapa: %s).",
        email_destino,
        estado_actual_display,
    )


# ── Plantillas para notificación al COMITÉ ──────────────────────────────────

_ASUNTO_COMITE = "SIGMA ITM — Proyecto listo para revisión final del Comité"

_CUERPO_COMITE = """
Hola {nombre_comite},

El asesor del siguiente proyecto de opción de grado ha completado la etapa de
Sustentación y remite el expediente al Comité de Trabajos de Grado para su
revisión y cierre formal:

  Estudiante   : {nombre_estudiante}
  Modalidad    : {modalidad}
  Proyecto     : {titulo_proyecto}
  Asesor       : {nombre_asesor}

{observacion_texto}

Por favor, ingresa a SIGMA ITM para revisar el expediente completo y tomar
la decisión final del proceso.

— Sistema SIGMA ITM
""".strip()


def _enviar_notificacion_comite(postulacion, observacion: str) -> None:
    """Envía correo a todos los usuarios con rol COMITE cuando un asesor
    avanza un proyecto desde SUSTENTACIÓN para revisión final.

    Args:
        postulacion: Instancia de Postulacion con el contexto completo.
        observacion: Texto de observación/mensaje del asesor (puede estar vacío).
    """
    from .models import Usuario  # Importación local para evitar circulares

    miembros_comite = Usuario.objects.filter(rol="COMITE", is_active=True).exclude(email="")
    if not miembros_comite.exists():
        logger.warning(
            "No hay miembros del Comité con email registrado para notificar (postulacion=%s).",
            postulacion.id,
        )
        return

    nombre_estudiante = (
        postulacion.estudiante.get_full_name() or postulacion.estudiante.username
    )
    nombre_asesor = (
        postulacion.asesor.get_full_name() or postulacion.asesor.username
        if postulacion.asesor
        else "Sin asesor registrado"
    )
    observacion_texto = (
        f'Observaciones del asesor:\n  "{observacion}"'
        if observacion and observacion.strip()
        else ""
    )

    emails_enviados = 0
    for miembro in miembros_comite:
        nombre_comite = miembro.get_full_name() or miembro.username
        try:
            send_mail(
                subject=_ASUNTO_COMITE,
                message=_CUERPO_COMITE.format(
                    nombre_comite=nombre_comite,
                    nombre_estudiante=nombre_estudiante,
                    modalidad=postulacion.modalidad.nombre,
                    titulo_proyecto=postulacion.titulo_proyecto or "Sin título registrado",
                    nombre_asesor=nombre_asesor,
                    observacion_texto=observacion_texto,
                ),
                from_email=None,
                recipient_list=[miembro.email],
                fail_silently=False,
            )
            emails_enviados += 1
        except Exception as exc:  # noqa: BLE001
            logger.exception(
                "Error al notificar al miembro del Comité %s (postulacion=%s): %s",
                miembro.email,
                postulacion.id,
                exc,
            )

    logger.info(
        "Notificación al Comité enviada a %d miembro(s) (postulacion=%s).",
        emails_enviados,
        postulacion.id,
    )


def _enviar_notificacion_finalizacion_asesor(postulacion, asesor, observacion: str) -> None:
    """Envía correo al asesor cuando el Comité aprueba y finaliza formalmente el proyecto.

    Args:
        postulacion: Instancia de Postulacion.
        asesor: Usuario asesor a notificar.
        observacion: Observaciones o decisión final del Comité.
    """
    nombre_asesor = asesor.get_full_name() or asesor.username
    nombre_estudiante = (
        postulacion.estudiante.get_full_name() or postulacion.estudiante.username
    )
    observacion_texto = (
        f'Observación del Comité de Trabajos de Grado:\n  "{observacion}"'
        if observacion and observacion.strip()
        else ""
    )

    send_mail(
        subject=_ASUNTO_ASESOR_FINALIZADO,
        message=_CUERPO_ASESOR_FINALIZADO.format(
            nombre_asesor=nombre_asesor,
            nombre_estudiante=nombre_estudiante,
            modalidad=postulacion.modalidad.nombre,
            titulo_proyecto=postulacion.titulo_proyecto or "Sin título registrado",
            observacion_texto=observacion_texto,
        ),
        from_email=None,
        recipient_list=[asesor.email],
        fail_silently=False,
    )
    logger.info(
        "Notificación de finalización enviada al asesor %s (postulacion=%s).",
        asesor.email,
        postulacion.id,
    )
