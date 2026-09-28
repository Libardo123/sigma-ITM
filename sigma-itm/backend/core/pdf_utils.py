"""
pdf_utils.py — SIGMA ITM
Generación de documentos PDF con ReportLab.

Separado de views.py para respetar el Principio de Responsabilidad Única:
la vista solo orquesta, este módulo construye el PDF.
"""

from __future__ import annotations

import io
from typing import TYPE_CHECKING

from reportlab.lib import colors  # type: ignore
from reportlab.lib.pagesizes import A4  # type: ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore
from reportlab.lib.units import cm  # type: ignore
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle  # type: ignore

if TYPE_CHECKING:
    from core.models import Postulacion


def generar_certificado_finalizacion(postulacion: "Postulacion") -> bytes:
    """Genera el certificado de finalización del proceso de opción de grado en PDF.

    Solo debe llamarse cuando `postulacion.estado == EstadoProceso.FINALIZADO`.
    El contenido incluye datos del estudiante, modalidad, fechas clave y asesor.

    Args:
        postulacion: Instancia de Postulacion en estado FINALIZADO.

    Returns:
        Bytes del archivo PDF generado.

    Raises:
        ValueError: Si la postulación no está en estado FINALIZADO.
    """
    from core.models import EstadoProceso, HistorialEstado  # Import local para evitar circularidad

    if postulacion.estado != EstadoProceso.FINALIZADO:
        raise ValueError(
            f"El certificado solo puede generarse para procesos en estado FINALIZADO. "
            f"Estado actual: '{postulacion.estado}'."
        )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2.5 * cm,
        leftMargin=2.5 * cm,
        topMargin=3 * cm,
        bottomMargin=2.5 * cm,
    )

    styles = getSampleStyleSheet()
    estilo_titulo = ParagraphStyle(
        "Titulo",
        parent=styles["Heading1"],
        fontSize=18,
        textColor=colors.HexColor("#1e3a5f"),
        spaceAfter=6,
        alignment=1,  # Centrado
    )
    estilo_subtitulo = ParagraphStyle(
        "Subtitulo",
        parent=styles["Normal"],
        fontSize=12,
        textColor=colors.HexColor("#4a5568"),
        spaceAfter=20,
        alignment=1,
    )
    estilo_normal = styles["Normal"]
    estilo_normal.fontSize = 11
    estilo_normal.leading = 16

    nombre_estudiante = postulacion.estudiante.get_full_name() or postulacion.estudiante.username
    nombre_asesor = (
        postulacion.asesor.get_full_name()
        if postulacion.asesor
        else "Sin asesor asignado"
    )

    # Obtener fecha de finalización desde el historial
    entrada_finalizacion = (
        HistorialEstado.objects.filter(postulacion=postulacion, estado_nuevo="FINALIZADO")
        .order_by("fecha")
        .first()
    )
    fecha_finalizacion = (
        entrada_finalizacion.fecha.strftime("%d de %B de %Y")
        if entrada_finalizacion
        else postulacion.actualizada_en.strftime("%d de %B de %Y")
    )

    elementos: list = [
        Spacer(1, 0.5 * cm),
        Paragraph("Instituto Tecnológico Metropolitano", estilo_titulo),
        Paragraph(
            "Facultad de Ingenierías — SIGMA ITM", estilo_subtitulo
        ),
        Spacer(1, 0.5 * cm),
        Paragraph(
            "<b>CERTIFICADO DE FINALIZACIÓN DE OPCIÓN DE GRADO</b>",
            ParagraphStyle(
                "CertTitulo",
                parent=estilo_titulo,
                fontSize=14,
                spaceAfter=24,
            ),
        ),
        Spacer(1, 0.5 * cm),
        Paragraph(
            f"El Instituto Tecnológico Metropolitano certifica que el/la estudiante:",
            estilo_normal,
        ),
        Spacer(1, 0.3 * cm),
    ]

    # Tabla de datos
    datos_tabla = [
        ["Estudiante", nombre_estudiante],
        ["Cédula", postulacion.estudiante.cedula or "No registrada"],
        ["Programa académico", postulacion.estudiante.programa_academico or "No registrado"],
        ["Modalidad de grado", postulacion.modalidad.nombre],
        ["Título del proyecto", postulacion.titulo_proyecto or "No especificado"],
        ["Asesor", nombre_asesor],
        ["Fecha de inicio", postulacion.creada_en.strftime("%d de %B de %Y")],
        ["Fecha de finalización", fecha_finalizacion],
    ]

    tabla = Table(datos_tabla, colWidths=[5 * cm, 11 * cm])
    tabla.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#edf2f7")),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#1e3a5f")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f7fafc")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )

    elementos.extend([
        tabla,
        Spacer(1, 1 * cm),
        Paragraph(
            "ha culminado satisfactoriamente su proceso de opción de grado en la "
            f"modalidad <b>{postulacion.modalidad.nombre}</b>, cumpliendo con todos "
            "los requisitos establecidos por el reglamento académico del ITM.",
            estilo_normal,
        ),
        Spacer(1, 2 * cm),
        Paragraph(
            "___________________________",
            ParagraphStyle("Firma", parent=estilo_normal, alignment=1),
        ),
        Paragraph(
            "Firma del Comité de Trabajos de Grado",
            ParagraphStyle("FirmaLabel", parent=estilo_normal, alignment=1, fontSize=9),
        ),
        Spacer(1, 0.5 * cm),
        Paragraph(
            f"Fecha de emisión: {fecha_finalizacion}",
            ParagraphStyle("FechaEmision", parent=estilo_normal, alignment=2, fontSize=9),
        ),
    ])

    doc.build(elementos)
    return buffer.getvalue()
