"""
serializers.py — SIGMA ITM
Serializadores DRF para todos los modelos de la aplicación core.
"""
from __future__ import annotations

from rest_framework import serializers

from .models import Documento, HistorialEstado, Modalidad, Postulacion, Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    semestre = serializers.SerializerMethodField()

    class Meta:  # type: ignore
        model = Usuario
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "rol", "cedula", "programa_academico", "semestre",
            "is_active", "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]

    def get_semestre(self, usuario: Usuario) -> str:
        return getattr(usuario, "semestre", "6° Semestre") or "6° Semestre"


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    """Serializador para el registro público de nuevos usuarios en SIGMA ITM.

    Permite crear cuentas con rol ESTUDIANTE, ASESOR o COMITE.
    Por seguridad institucional, las cuentas se crean con is_active=False
    y requieren aprobación del Administrador antes de permitir inicio de sesión.
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={
            "min_length": "La contraseña debe tener al menos 8 caracteres.",
            "blank": "La contraseña no puede estar vacía.",
        },
    )
    confirmar_password = serializers.CharField(write_only=True)

    class Meta:  # type: ignore
        model = Usuario
        fields = [
            "username", "first_name", "last_name", "email",
            "rol", "cedula", "programa_academico",
            "password", "confirmar_password",
        ]

    def validate_username(self, value: str) -> str:
        if Usuario.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value

    def validate_cedula(self, value: str) -> str:
        if value and Usuario.objects.filter(cedula=value).exists():
            raise serializers.ValidationError("Ya existe un usuario registrado con esta cédula.")
        return value

    def validate_rol(self, value: str) -> str:
        from .models import Rol
        roles_permitidos = [Rol.ESTUDIANTE, Rol.ASESOR, Rol.COMITE]
        if value not in roles_permitidos:
            raise serializers.ValidationError(
                "Solo se permite registrar usuarios con rol Estudiante, Asesor o Comité."
            )
        return value

    def validate(self, data: dict) -> dict:
        if data.get("password") != data.get("confirmar_password"):
            raise serializers.ValidationError({"confirmar_password": "Las contraseñas no coinciden."})
        return data

    def create(self, validated_data: dict) -> Usuario:
        validated_data.pop("confirmar_password")
        password = validated_data.pop("password")
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.is_active = False  # Requiere aprobación del Administrador
        usuario.save()
        return usuario



class ModalidadSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore
        model = Modalidad
        fields = ["id", "nombre", "descripcion", "requisitos", "activa", "creada_en"]
        read_only_fields = ["id", "creada_en"]


class DocumentoSerializer(serializers.ModelSerializer):
    """Serializador para documentos adjuntos a postulaciones.

    Incluye validación de tipo y tamaño de archivo (Bloque 7):
    - Solo se permiten PDF, DOCX, JPG y PNG.
    - Tamaño máximo: 10 MB.
    - La verificación usa el tipo MIME real del archivo (magic bytes),
      no la extensión del nombre, para prevenir bypass por renombrado.
    """

    # Tipos MIME permitidos y su descripción legible para el mensaje de error.
    _TIPOS_PERMITIDOS: dict[str, str] = {
        "application/pdf": "PDF",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
        "image/jpeg": "JPG/JPEG",
        "image/png": "PNG",
    }
    _TAMANO_MAXIMO_BYTES: int = 10 * 1024 * 1024  # 10 MB

    class Meta:  # type: ignore
        model = Documento
        fields = ["id", "postulacion", "nombre", "descripcion", "archivo", "subido_en"]
        read_only_fields = ["id", "subido_en"]

    def validate_archivo(self, archivo):
        """Valida tamaño y tipo MIME real del archivo subido.

        Args:
            archivo: InMemoryUploadedFile o TemporaryUploadedFile de Django.

        Returns:
            El mismo archivo si pasa la validación.

        Raises:
            serializers.ValidationError: Si el archivo excede 10 MB o no es
                un tipo permitido (PDF, DOCX, JPG, PNG).
        """
        # 1. Validar tamaño
        if archivo.size > self._TAMANO_MAXIMO_BYTES:
            tamano_mb = archivo.size / (1024 * 1024)
            raise serializers.ValidationError(
                f"El archivo pesa {tamano_mb:.1f} MB. El tamaño máximo permitido es 10 MB."
            )

        # 2. Validar tipo real por magic bytes
        try:
            import magic  # python-magic (requerido en requirements.txt)
            encabezado = archivo.read(2048)
            archivo.seek(0)  # Rebobinar para que Django pueda guardarlo
            mime_tipo = magic.from_buffer(encabezado, mime=True)
        except ImportError:
            # Si python-magic no está disponible (entorno de CI sin libmagic),
            # caer sobre la extensión del nombre como fallback de emergencia.
            import mimetypes
            mime_tipo, _ = mimetypes.guess_type(archivo.name)
            if not mime_tipo:
                mime_tipo = "application/octet-stream"

        if mime_tipo not in self._TIPOS_PERMITIDOS:
            tipos_legibles = ", ".join(self._TIPOS_PERMITIDOS.values())
            raise serializers.ValidationError(
                f"Tipo de archivo no permitido (detectado: '{mime_tipo}'). "
                f"Solo se aceptan: {tipos_legibles}."
            )

        return archivo


class HistorialEstadoSerializer(serializers.ModelSerializer):
    realizado_por = serializers.StringRelatedField()
    estado_anterior_display = serializers.CharField(source="get_estado_anterior_display", read_only=True)
    estado_nuevo_display = serializers.CharField(source="get_estado_nuevo_display", read_only=True)

    class Meta:  # type: ignore
        model = HistorialEstado
        fields = [
            "id", "estado_anterior", "estado_anterior_display",
            "estado_nuevo", "estado_nuevo_display",
            "realizado_por", "observacion", "fecha", "es_correccion",
        ]


class PostulacionSerializer(serializers.ModelSerializer):
    """Serializador completo de Postulacion.

    Incluye `transiciones_disponibles` para que el frontend nunca tenga que
    hardcodear el mapa de transiciones (bloque 13: fuente de verdad única).
    """

    estudiante_nombre = serializers.CharField(source="estudiante.get_full_name", read_only=True)
    estudiante_email = serializers.EmailField(source="estudiante.email", read_only=True)
    estudiante_programa = serializers.CharField(source="estudiante.programa_academico", read_only=True)
    estudiante_cedula = serializers.CharField(source="estudiante.cedula", read_only=True)
    estudiante_semestre = serializers.SerializerMethodField()
    modalidad_nombre = serializers.CharField(source="modalidad.nombre", read_only=True)
    modalidad_descripcion = serializers.CharField(source="modalidad.descripcion", read_only=True)
    asesor_nombre = serializers.CharField(source="asesor.get_full_name", read_only=True)
    asesor_email = serializers.EmailField(source="asesor.email", read_only=True)
    estado_display = serializers.CharField(source="get_estado_display", read_only=True)
    documentos = DocumentoSerializer(many=True, read_only=True)

    # Bloque 13: lista de estados válidos siguientes para esta postulación.
    transiciones_disponibles = serializers.SerializerMethodField()
    documentos_requeridos = serializers.SerializerMethodField()

    class Meta:  # type: ignore
        model = Postulacion
        fields = [
            "id", "estudiante", "estudiante_nombre", "estudiante_email",
            "estudiante_programa", "estudiante_cedula", "estudiante_semestre",
            "modalidad", "modalidad_nombre", "modalidad_descripcion",
            "asesor", "asesor_nombre", "asesor_email", "mensaje_asesor",
            "estado", "estado_display",
            "titulo_proyecto", "creada_en", "actualizada_en",
            "requiere_correccion", "observacion_correccion", "archivo_correccion",
            "mensaje_subsanacion", "subsanado_en",
            "mensaje_sustentacion", "archivo_sustentacion",
            "mensaje_asesor", "archivo_asesor",
            "transiciones_disponibles", "documentos_requeridos", "documentos",
        ]
        read_only_fields = ["id", "estado", "creada_en", "actualizada_en", "estudiante"]

    def get_estudiante_semestre(self, postulacion: Postulacion) -> str:
        return getattr(postulacion.estudiante, "semestre", "6° Semestre") or "6° Semestre"

    def get_transiciones_disponibles(self, postulacion: Postulacion) -> list[str]:
        """Devuelve los estados válidos siguientes según el motor de estados."""
        return postulacion.transiciones_disponibles

    def get_documentos_requeridos(self, postulacion: Postulacion) -> list[str]:
        """Devuelve los documentos obligatorios requeridos por la modalidad."""
        return postulacion.documentos_requeridos


class TransicionEstadoSerializer(serializers.Serializer):
    """Payload para POST /postulaciones/{id}/transicionar/"""

    nuevo_estado = serializers.CharField()
    observacion = serializers.CharField(required=False, allow_blank=True, default="")


class SolicitudCorreccionSerializer(serializers.Serializer):
    """Payload para POST /postulaciones/{id}/solicitar_correccion/

    La observación es obligatoria: sin ella el estudiante no sabe qué corregir.
    """

    observacion = serializers.CharField(
        min_length=10,
        error_messages={
            "min_length": "La observación debe tener al menos 10 caracteres para ser útil al estudiante.",
            "blank": "La observación no puede estar vacía.",
        },
    )


class SolicitudSustentacionSerializer(serializers.Serializer):
    """Payload para POST /postulaciones/{id}/notificar_sustentacion/

    El mensaje es obligatorio; el archivo es opcional.
    """

    mensaje = serializers.CharField(
        min_length=10,
        error_messages={
            "min_length": "El mensaje debe tener al menos 10 caracteres.",
            "blank": "El mensaje no puede estar vacío.",
        },
    )
