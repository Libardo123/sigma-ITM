"""
models.py — SIGMA ITM
Capa de datos del sistema de seguimiento de opciones de grado.

Motor de estados implementado con el patrón State (GoF) para cumplir
el principio Open/Closed: agregar un nuevo estado solo requiere crear
una subclase de EstadoBase y registrarla en _REGISTRO_ESTADOS, sin
tocar lógica existente.
"""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

if TYPE_CHECKING:
    pass  # Importaciones solo para type checking si fueran necesarias


# ---------------------------------------------------------------------------
# Enumeraciones de roles y estados
# ---------------------------------------------------------------------------


class Rol(models.TextChoices):
    ESTUDIANTE = "ESTUDIANTE", "Estudiante"
    ASESOR = "ASESOR", "Asesor"
    COMITE = "COMITE", "Comité de Trabajos de Grado"
    ADMIN = "ADMIN", "Administrador"


class EstadoProceso(models.TextChoices):
    POSTULACION = "POSTULACION", "Postulación"
    REVISION_DOCUMENTAL = "REVISION_DOCUMENTAL", "Revisión Documental"
    APROBACION = "APROBACION", "Aprobación"
    EN_PROCESO = "EN_PROCESO", "En Proceso"
    SUSTENTACION = "SUSTENTACION", "Sustentación"
    REVISION_COMITE = "REVISION_COMITE", "Revisión Comité"
    FINALIZADO = "FINALIZADO", "Finalizado"
    RECHAZADO = "RECHAZADO", "Rechazado"


# ---------------------------------------------------------------------------
# Excepciones de dominio
# ---------------------------------------------------------------------------


class TransicionInvalida(Exception):
    """Se lanza cuando se intenta una transición de estado no permitida
    según las reglas del motor de estados de SIGMA ITM."""


# ---------------------------------------------------------------------------
# Motor de estados — Patrón State (GoF)
#
# Cada clase de estado encapsula sus transiciones válidas.
# Para agregar un estado nuevo: crear subclase + registrar en _REGISTRO_ESTADOS.
# NO modificar ninguna clase existente (Open/Closed Principle).
# ---------------------------------------------------------------------------


class EstadoBase:
    """Clase base del patrón State. Devuelve las transiciones disponibles
    desde el estado que representa y rechaza todas las transiciones por defecto."""

    #: Lista de estados válidos a los que se puede avanzar desde este estado.
    transiciones_permitidas: list[str] = []

    @classmethod
    def puede_transicionar_a(cls, nuevo_estado: str) -> bool:
        """Devuelve True si la transición al estado indicado está permitida."""
        return nuevo_estado in cls.transiciones_permitidas

    @classmethod
    def es_terminal(cls) -> bool:
        """Devuelve True si este estado no tiene transiciones de salida."""
        return len(cls.transiciones_permitidas) == 0


class EstadoPostulacion(EstadoBase):
    """Estado inicial del proceso. Solo puede avanzar a Revisión Documental."""

    transiciones_permitidas = [EstadoProceso.REVISION_DOCUMENTAL]


class EstadoRevisionDocumental(EstadoBase):
    """El comité revisa los documentos. Puede aprobar o devolver al estudiante."""

    transiciones_permitidas = [EstadoProceso.APROBACION, EstadoProceso.POSTULACION]


class EstadoAprobacion(EstadoBase):
    """Documentación aprobada. Solo puede avanzar a En Proceso."""

    transiciones_permitidas = [EstadoProceso.EN_PROCESO]


class EstadoEnProceso(EstadoBase):
    """El estudiante está ejecutando su opción de grado.
    Puede pasar a Sustentación o ser rechazado definitivamente."""

    transiciones_permitidas = [EstadoProceso.SUSTENTACION, EstadoProceso.RECHAZADO]


class EstadoSustentacion(EstadoBase):
    """El proceso está en etapa de sustentación.
    Puede finalizar exitosamente, regresar a En Proceso (corrección mayor),
    o ser rechazado definitivamente."""

    transiciones_permitidas = [
        EstadoProceso.REVISION_COMITE,
        EstadoProceso.EN_PROCESO,
        EstadoProceso.RECHAZADO,
    ]


class EstadoRevisionComite(EstadoBase):
    """El Comité de Trabajos de Grado revisa el proyecto tras la sustentación.
    Aquí el Comité decide si Finalizarlo (aprobado y cerrado) o Rechazarlo."""

    transiciones_permitidas = [
        EstadoProceso.FINALIZADO,
        EstadoProceso.RECHAZADO,
    ]


class EstadoFinalizado(EstadoBase):
    """Estado terminal positivo. El proceso ha sido completado exitosamente."""

    transiciones_permitidas = []


class EstadoRechazado(EstadoBase):
    """Estado terminal negativo. El proceso ha sido cerrado definitivamente.
    Solo alcanzable desde EN_PROCESO o SUSTENTACION — no desde etapas iniciales."""

    transiciones_permitidas = []


# Registro único: valor de BD → clase de estado.
# Es la ÚNICA fuente de verdad para las reglas de transición.
_REGISTRO_ESTADOS: dict[str, type[EstadoBase]] = {
    EstadoProceso.POSTULACION: EstadoPostulacion,
    EstadoProceso.REVISION_DOCUMENTAL: EstadoRevisionDocumental,
    EstadoProceso.APROBACION: EstadoAprobacion,
    EstadoProceso.EN_PROCESO: EstadoEnProceso,
    EstadoProceso.SUSTENTACION: EstadoSustentacion,
    EstadoProceso.REVISION_COMITE: EstadoRevisionComite,
    EstadoProceso.FINALIZADO: EstadoFinalizado,
    EstadoProceso.RECHAZADO: EstadoRechazado,
}

# Diccionario de backward-compatibility y consumo externo (serializer, bloque 13).
TRANSICIONES_VALIDAS: dict[str, list[str]] = {
    estado: clase.transiciones_permitidas for estado, clase in _REGISTRO_ESTADOS.items()
}


def obtener_clase_estado(estado: str) -> type[EstadoBase]:
    """Fábrica que devuelve la clase EstadoBase correspondiente al valor dado.

    Args:
        estado: Valor de EstadoProceso (ej. "EN_PROCESO").

    Returns:
        La clase de estado correspondiente.

    Raises:
        TransicionInvalida: Si el valor no corresponde a ningún estado conocido.
    """
    try:
        return _REGISTRO_ESTADOS[estado]
    except KeyError:
        raise TransicionInvalida(f"Estado desconocido en el registro: '{estado}'.")


# ---------------------------------------------------------------------------
# Modelos de dominio
# ---------------------------------------------------------------------------


class Usuario(AbstractUser):
    """Usuario institucional del ITM. Extiende el modelo base de Django
    agregando el rol dentro de SIGMA ITM, la cédula y el programa académico.

    El campo `es_auxiliar` (solo aplica si rol == ADMIN) limita las acciones
    del usuario a consulta y gestión de notificaciones, sin poder aprobar
    transiciones de estado ni gestionar usuarios.
    """

    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.ESTUDIANTE)
    cedula = models.CharField(max_length=20, unique=True, null=True, blank=True)
    programa_academico = models.CharField(max_length=150, blank=True)
    es_auxiliar = models.BooleanField(
        default=False,
        help_text=(
            "Solo aplica si rol == ADMIN. Con este flag activo el usuario puede consultar "
            "procesos y gestionar notificaciones, pero NO puede aprobar etapas ni "
            "administrar usuarios."
        ),
    )

    def __str__(self) -> str:
        return f"{self.get_full_name() or self.username} ({self.get_rol_display()})"

    @property
    def es_estudiante(self) -> bool:
        return self.rol == Rol.ESTUDIANTE

    @property
    def es_asesor(self) -> bool:
        return self.rol == Rol.ASESOR

    @property
    def es_comite(self) -> bool:
        return self.rol == Rol.COMITE

    @property
    def es_admin(self) -> bool:
        return self.rol == Rol.ADMIN or self.is_superuser

    @property
    def es_administrador_pleno(self) -> bool:
        """True si el usuario es Admin SIN restricción de auxiliar.
        Usada por los permisos que requieren acceso completo de administración.
        """
        return self.es_admin and not self.es_auxiliar


class Modalidad(models.Model):
    """Catálogo administrable de las modalidades de opción de grado."""

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    requisitos = models.TextField(
        blank=True, help_text="Requisitos y documentos exigidos para esta modalidad."
    )
    activa = models.BooleanField(default=True)
    creada_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name_plural = "Modalidades"

    def __str__(self) -> str:
        return self.nombre


class Postulacion(models.Model):
    """El proceso de opción de grado de un estudiante para una modalidad.

    El ciclo de vida se gestiona a través del motor de estados (patrón State).

    Correcciones intermedias:
        Cuando el asesor/Comité devuelve observaciones sin avanzar el proceso,
        se usa `solicitar_correccion()`. El proceso permanece en el mismo estado
        con `requiere_correccion=True`, y el historial registra el evento.

    Rechazo definitivo:
        `RECHAZADO` es un estado terminal. Solo alcanzable desde EN_PROCESO
        o SUSTENTACION. No tiene transiciones de salida.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    estudiante = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="postulaciones", on_delete=models.CASCADE
    )
    modalidad = models.ForeignKey(
        Modalidad, related_name="postulaciones", on_delete=models.PROTECT
    )
    asesor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="postulaciones_asesoradas",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    estado = models.CharField(
        max_length=30, choices=EstadoProceso.choices, default=EstadoProceso.POSTULACION
    )
    titulo_proyecto = models.CharField(max_length=255, blank=True)
    creada_en = models.DateTimeField(auto_now_add=True)
    actualizada_en = models.DateTimeField(auto_now=True)

    # Mecanismo de corrección de etapa (sin cambio de estado).
    requiere_correccion = models.BooleanField(
        default=False,
        help_text="True si el estudiante tiene una observación pendiente en la etapa actual.",
    )
    observacion_correccion = models.TextField(
        blank=True,
        help_text="Descripción de lo que el estudiante debe corregir en la etapa actual.",
    )
    mensaje_asesor = models.TextField(
        blank=True,
        default="",
        help_text="Instrucciones o directriz del Admin/Comité para el Asesor asignado.",
    )
    archivo_correccion = models.FileField(
        upload_to="correcciones/%Y/%m/",
        null=True,
        blank=True,
        help_text="Archivo de retroalimentación o documento comentado por el evaluador/asesor.",
    )
    mensaje_subsanacion = models.TextField(
        blank=True,
        default="",
        help_text="Explicación del estudiante al subsanar las observaciones de corrección.",
    )
    subsanado_en = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora de la última subsanación enviada por el estudiante.",
    )

    # Notificación de sustentación enviada por el asesor al estudiante.
    mensaje_sustentacion = models.TextField(
        blank=True,
        default="",
        help_text="Mensaje del asesor al estudiante con detalles de la sustentación (fecha, hora, etc.).",
    )
    archivo_sustentacion = models.FileField(
        upload_to="sustentaciones/%Y/%m/",
        null=True,
        blank=True,
        help_text="Documento opcional adjunto por el asesor sobre la sustentación.",
    )

    # Documento adjunto por el Admin/Comité al enviar el proyecto al asesor.
    archivo_asesor = models.FileField(
        upload_to="mensajes_asesor/%Y/%m/",
        null=True,
        blank=True,
        help_text="Documento opcional adjunto por Admin/Comité al asignar/enviar al asesor.",
    )

    class Meta:
        ordering = ["-creada_en"]

    def __str__(self) -> str:
        return f"{self.estudiante} - {self.modalidad} [{self.get_estado_display()}]"

    @property
    def transiciones_disponibles(self) -> list[str]:
        """Devuelve los estados a los que puede transicionar desde el estado actual.

        Esta propiedad es la fuente de verdad para el serializer (bloque 13).
        Si el proceso tiene una corrección pendiente (`requiere_correccion=True`),
        se bloquean todas las transiciones devolviendo una lista vacía `[]` (Bloque 17).
        """
        if self.requiere_correccion:
            return []
        return obtener_clase_estado(self.estado).transiciones_permitidas

    def solicitar_correccion(
        self, usuario: "Usuario", observacion: str, archivo=None
    ) -> "Postulacion":
        """Registra una observación de corrección en la etapa actual sin avanzar
        ni cerrar el proceso. El estudiante debe subsanar los puntos indicados.

        El historial registra el evento con `es_correccion=True` para distinguirlo
        de un avance de estado real.

        Args:
            usuario: Usuario (asesor o comité) que solicita la corrección.
            observacion: Descripción no vacía de lo que debe corregir el estudiante.

        Returns:
            La misma instancia de Postulacion actualizada.

        Raises:
            ValueError: Si la observación está vacía.
        """
        if self.estado in (EstadoProceso.FINALIZADO, EstadoProceso.RECHAZADO):
            raise ValueError(
                f"No se pueden solicitar correcciones en un proceso en estado terminal '{self.get_estado_display()}'."
            )

        if not observacion.strip():
            raise ValueError(
                "La observación no puede estar vacía al solicitar una corrección de etapa."
            )

        self.requiere_correccion = True
        self.observacion_correccion = observacion
        campos_update = [
            "requiere_correccion",
            "observacion_correccion",
            "actualizada_en",
        ]
        if archivo:
            self.archivo_correccion = archivo
            campos_update.append("archivo_correccion")
        self.save(update_fields=campos_update)

        obs_historial = observacion
        if archivo:
            obs_historial += " [Archivo adjunto de retroalimentación provisto por el evaluador]"

        # El historial registra estado_anterior == estado_nuevo para trazabilidad completa.
        HistorialEstado.objects.create(
            postulacion=self,
            estado_anterior=self.estado,
            estado_nuevo=self.estado,
            realizado_por=usuario,
            observacion=obs_historial,
            es_correccion=True,
        )
        return self

    def modificar_correccion(
        self, usuario: "Usuario", observacion: str = "", archivo=None, eliminar_archivo: bool = False
    ) -> "Postulacion":
        """Permite al evaluador editar la observación o actualizar el archivo antes de que el estudiante subsane."""
        if not self.requiere_correccion:
            raise ValueError("El trámite no tiene correcciones pendientes para modificar.")

        campos_update = ["actualizada_en"]
        if observacion.strip():
            self.observacion_correccion = observacion.strip()
            campos_update.append("observacion_correccion")
        if archivo:
            self.archivo_correccion = archivo
            campos_update.append("archivo_correccion")
        elif eliminar_archivo:
            self.archivo_correccion = None
            campos_update.append("archivo_correccion")

        self.save(update_fields=campos_update)
        HistorialEstado.objects.create(
            postulacion=self,
            estado_anterior=self.estado,
            estado_nuevo=self.estado,
            realizado_por=usuario,
            observacion=f"Observación de corrección actualizada por el evaluador: {self.observacion_correccion}",
            es_correccion=True,
        )
        return self

    def cancelar_correccion(self, usuario: "Usuario") -> "Postulacion":
        """Permite al evaluador retirar la solicitud de corrección y reanudar el trámite."""
        if not self.requiere_correccion:
            raise ValueError("El trámite no tiene correcciones pendientes para cancelar.")

        self.requiere_correccion = False
        self.observacion_correccion = ""
        self.archivo_correccion = None
        self.save(
            update_fields=[
                "requiere_correccion",
                "observacion_correccion",
                "archivo_correccion",
                "actualizada_en",
            ]
        )
        HistorialEstado.objects.create(
            postulacion=self,
            estado_anterior=self.estado,
            estado_nuevo=self.estado,
            realizado_por=usuario,
            observacion="Solicitud de corrección cancelada por el evaluador.",
            es_correccion=True,
        )
        return self

    def _limpiar_correccion_pendiente(self) -> None:
        """Limpia el flag de corrección al avanzar de estado.
        Solo debe llamarse desde `transicionar()`, justo antes del save().
        """
        self.requiere_correccion = False
        self.observacion_correccion = ""
        self.archivo_correccion = None
        self.mensaje_subsanacion = ""

    def subsanar_correccion(
        self, usuario: "Usuario", mensaje: str = "", archivo=None
    ) -> "Postulacion":
        """Permite que el estudiante marque las observaciones de la etapa como subsanadas.

        Limpia `requiere_correccion` y `observacion_correccion`, registra el mensaje explicativo
        y el archivo corregido, y genera un evento en el `HistorialEstado`.
        Esto desbloquea las transiciones disponibles para el evaluador (Bloque 18).
        """
        if not self.requiere_correccion:
            raise ValueError(
                "La postulación no tiene observaciones ni correcciones pendientes por subsanar."
            )

        from django.utils import timezone
        self.requiere_correccion = False
        self.observacion_correccion = ""
        self.mensaje_subsanacion = mensaje.strip()
        self.subsanado_en = timezone.now()
        self.save(
            update_fields=[
                "requiere_correccion",
                "observacion_correccion",
                "mensaje_subsanacion",
                "subsanado_en",
                "actualizada_en",
            ]
        )

        obs_historial = "Corrección subsanada por el estudiante"
        if mensaje.strip():
            obs_historial += f": \"{mensaje.strip()}\""
        if archivo:
            obs_historial += " [Documento corregido adjuntado en expediente]"

        HistorialEstado.objects.create(
            postulacion=self,
            estado_anterior=self.estado,
            estado_nuevo=self.estado,
            realizado_por=usuario,
            observacion=obs_historial,
            es_correccion=True,
        )
        return self

    def transicionar(
        self, nuevo_estado: str, usuario: "Usuario", observacion: str = ""
    ) -> "Postulacion":
        """Aplica el motor de estados (patrón State): valida la transición usando
        la clase de estado correspondiente, ejecuta el cambio y deja registro
        inmutable en el histórico de auditoría.

        Args:
            nuevo_estado: Valor de EstadoProceso al que se quiere avanzar.
            usuario: Usuario que realiza la acción (asesor, comité o admin pleno).
            observacion: Comentario opcional para el historial de auditoría.

        Returns:
            La misma instancia con el estado actualizado.

        Raises:
            TransicionInvalida: Si la transición no está permitida desde el estado actual.
        """
        estado_anterior = self.estado
        clase_estado_actual = obtener_clase_estado(estado_anterior)

        if self.requiere_correccion:
            raise TransicionInvalida(
                f"No se puede avanzar el proceso desde '{estado_anterior}' porque "
                "tiene una observación de corrección pendiente por subsanar."
            )

        if not clase_estado_actual.puede_transicionar_a(nuevo_estado):
            raise TransicionInvalida(
                f"No se puede pasar de '{estado_anterior}' a '{nuevo_estado}'. "
                f"Transiciones permitidas: {clase_estado_actual.transiciones_permitidas}."
            )

        # Limpiar corrección pendiente antes de guardar el nuevo estado.
        self._limpiar_correccion_pendiente()
        self.estado = nuevo_estado
        self.save(
            update_fields=[
                "estado",
                "requiere_correccion",
                "observacion_correccion",
                "actualizada_en",
            ]
        )
        HistorialEstado.objects.create(
            postulacion=self,
            estado_anterior=estado_anterior,
            estado_nuevo=nuevo_estado,
            realizado_por=usuario,
            observacion=observacion,
        )
        return self


    @property
    def documentos_requeridos(self) -> list[str]:
        """Lista de nombres de documentos obligatorios según la modalidad del proceso."""
        try:
            from .validadores_modalidad import obtener_validador
            validador = obtener_validador(self.modalidad.nombre)
            return validador.documentos_obligatorios
        except Exception:
            return []


class Documento(models.Model):
    """Documento radicado por el estudiante como parte de su postulación."""

    postulacion = models.ForeignKey(
        Postulacion, related_name="documentos", on_delete=models.CASCADE
    )
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(
        blank=True,
        default="",
        help_text="Descripción o notas del documento adjunto.",
    )
    archivo = models.FileField(upload_to="documentos/%Y/%m/")
    subido_en = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.nombre} ({self.postulacion_id})"


class HistorialEstado(models.Model):
    """Registro inmutable de auditoría: cada evento relevante en el ciclo
    de vida de una Postulación queda registrado aquí.

    Incluye tanto los avances de estado reales (estado_anterior != estado_nuevo)
    como las solicitudes de corrección de etapa (es_correccion=True, donde
    estado_anterior == estado_nuevo).
    """

    postulacion = models.ForeignKey(
        Postulacion, related_name="historial", on_delete=models.CASCADE
    )
    estado_anterior = models.CharField(max_length=30, choices=EstadoProceso.choices)
    estado_nuevo = models.CharField(max_length=30, choices=EstadoProceso.choices)
    realizado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    observacion = models.TextField(blank=True)
    fecha = models.DateTimeField(default=timezone.now)
    es_correccion = models.BooleanField(
        default=False,
        help_text=(
            "True si el registro corresponde a una solicitud de corrección "
            "(el estado no cambia, solo se registra la observación)."
        ),
    )

    class Meta:
        ordering = ["-fecha"]
        verbose_name_plural = "Historial de estados"

    def __str__(self) -> str:
        sufijo = " [corrección]" if self.es_correccion else ""
        return f"{self.postulacion_id}: {self.estado_anterior} -> {self.estado_nuevo}{sufijo}"
