"""
views.py — SIGMA ITM
ViewSets de la API REST.

Principio de diseño:
- La lógica de negocio vive en los modelos y en validadores_modalidad.py.
- Las vistas solo orquestan: deserializan input, invocan dominio, devuelven respuesta.
- Los permisos se declaran en permissions.py.
"""

from __future__ import annotations

import logging

from django.db.models import Count
from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import (
    Documento,
    EstadoProceso,
    Modalidad,
    Postulacion,
    Rol,
    TransicionInvalida,
    Usuario,
)
from .permissions import (
    EsAdmin,
    EsAsesorOComite,
    EsComiteOAdmin,
    EsEstudiante,
    PuedeGestionarEtapaActual,
    SoloLecturaOAdmin,
    es_administrador_pleno,
)
from rest_framework.exceptions import PermissionDenied
from .serializers import (
    DocumentoSerializer,
    HistorialEstadoSerializer,
    ModalidadSerializer,
    PostulacionSerializer,
    RegistroUsuarioSerializer,
    SolicitudCorreccionSerializer,
    SolicitudSustentacionSerializer,
    TransicionEstadoSerializer,
    UsuarioSerializer,
)
from .pdf_utils import generar_certificado_finalizacion
from .validadores_modalidad import obtener_validador

logger = logging.getLogger(__name__)


class UsuarioViewSet(viewsets.ModelViewSet):
    """CRUD de usuarios — solo para Administradores plenos."""

    queryset = Usuario.objects.all().order_by("first_name")
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdmin]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request) -> Response:
        """Devuelve el perfil del usuario autenticado actualmente."""
        return Response(UsuarioSerializer(request.user).data)

    @action(detail=False, methods=["get"], permission_classes=[EsAsesorOComite])
    def asesores(self, request) -> Response:
        """Devuelve la lista de profesores con rol ASESOR activos disponibles para asignación."""
        asesores = Usuario.objects.filter(rol=Rol.ASESOR, is_active=True).order_by("first_name", "last_name")
        return Response(UsuarioSerializer(asesores, many=True).data)

    @action(detail=False, methods=["get"], permission_classes=[EsAdmin])
    def pendientes(self, request) -> Response:
        """Devuelve la lista de usuarios inactivos pendientes de aprobación."""
        usuarios = Usuario.objects.filter(is_active=False).order_by("-date_joined")
        return Response(UsuarioSerializer(usuarios, many=True).data)

    @action(detail=True, methods=["post"], permission_classes=[EsAdmin])
    def aprobar(self, request, pk=None) -> Response:
        """Aprueba y activa la cuenta de un usuario."""
        usuario = self.get_object()
        if usuario.is_active:
            return Response(
                {"detail": "Este usuario ya se encuentra activo."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        usuario.is_active = True
        usuario.save(update_fields=["is_active"])
        logger.info(
            "Usuario %s (rol=%s) aprobado y activado por el administrador %s",
            usuario.username,
            usuario.rol,
            request.user.username,
        )
        return Response({
            "mensaje": f"Usuario '{usuario.username}' aprobado y activado exitosamente.",
            "usuario": UsuarioSerializer(usuario).data,
        })

    @action(detail=True, methods=["post"], permission_classes=[EsAdmin])
    def rechazar(self, request, pk=None) -> Response:
        """Rechaza y elimina la solicitud de registro del usuario."""
        usuario = self.get_object()
        if usuario.is_active:
            return Response(
                {"detail": "No se puede rechazar una cuenta que ya está activa."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        username = usuario.username
        email = usuario.email
        rol = usuario.rol
        motivo = request.data.get("motivo", "").strip()
        usuario.delete()
        logger.info(
            "Solicitud de usuario %s (rol=%s) rechazada por %s. Motivo: %s",
            username,
            rol,
            request.user.username,
            motivo,
        )
        return Response({
            "mensaje": f"Solicitud del usuario '{username}' rechazada exitosamente.",
            "username": username,
            "email": email,
            "motivo": motivo,
        })

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def registrar(self, request) -> Response:
        """Crea un nuevo usuario en SIGMA ITM (registro público, sin autenticación).

        Permite registrar usuarios con rol ESTUDIANTE, ASESOR o COMITE.
        El rol ADMIN no puede crearse por este endpoint por seguridad.
        La cuenta se crea inactiva (is_active=False) en espera de aprobación.
        """
        serializer = RegistroUsuarioSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            logger.info("Nuevo usuario registrado: %s (rol=%s, activo=%s)", usuario.username, usuario.rol, usuario.is_active)
            return Response(
                {
                    "mensaje": (
                        f"Solicitud de registro para '{usuario.username}' recibida exitosamente. "
                        "Tu cuenta se encuentra en estado pendiente de aprobación por el Administrador del ITM."
                    ),
                    "username": usuario.username,
                    "rol": usuario.rol,
                    "email": usuario.email,
                    "first_name": usuario.first_name,
                    "last_name": usuario.last_name,
                    "cedula": usuario.cedula,
                    "programa_academico": usuario.programa_academico,
                    "is_active": usuario.is_active,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModalidadViewSet(viewsets.ModelViewSet):
    """Catálogo de modalidades de opción de grado.

    Lectura disponible para todos los usuarios autenticados.
    Escritura (crear/editar/desactivar) solo para Administrador pleno.
    """

    queryset = Modalidad.objects.all()
    serializer_class = ModalidadSerializer
    permission_classes = [SoloLecturaOAdmin]


class PostulacionViewSet(viewsets.ModelViewSet):
    """ViewSet completo para el ciclo de vida de Postulaciones.

    Control de acceso a nivel de queryset:
    - Estudiante: solo ve sus propias postulaciones.
    - Asesor: solo ve las postulaciones que tiene asignadas.
    - Comité / Admin: ven todas las postulaciones, con filtros opcionales.
    """

    serializer_class = PostulacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtra el queryset según el rol del usuario autenticado.

        El select_related evita consultas N+1 al serializar estudiante,
        modalidad y asesor de cada postulación.
        """
        usuario: Usuario = self.request.user  # type: ignore
        qs = Postulacion.objects.select_related("estudiante", "modalidad", "asesor")

        if usuario.es_estudiante:
            return qs.filter(estudiante=usuario)

        if usuario.es_asesor:
            qs = qs.filter(asesor=usuario)

        # Filtros opcionales por estado y modalidad para Asesor, Comité y Admin
        estado_filtro = self.request.query_params.get("estado")
        modalidad_filtro = self.request.query_params.get("modalidad")

        if estado_filtro:
            qs = qs.filter(estado=estado_filtro)
        if modalidad_filtro:
            qs = qs.filter(modalidad_id=modalidad_filtro)

        return qs

    def perform_create(self, serializer) -> None:
        """El estudiante solo puede postular por sí mismo.

        Después de crear la postulación, ejecuta la validación de documentos
        según la modalidad (patrón Strategy, bloque 4). Si hay documentos
        faltantes, los incluye en la respuesta como advertencia sin bloquear
        la creación (el proceso puede iniciarse y los documentos subirse después).
        """
        serializer.save(estudiante=self.request.user)

    def create(self, request, *args, **kwargs):
        """Crea una nueva postulación y adjunta advertencias de documentos faltantes."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        postulacion: Postulacion = serializer.instance  # type: ignore
        validador = obtener_validador(postulacion.modalidad.nombre)
        resultado = validador.validar_documentos(postulacion)

        respuesta_data = serializer.data
        if not resultado.es_valido:
            respuesta_data = dict(respuesta_data)
            respuesta_data["advertencias_documentos"] = {
                "mensaje": (
                    f"La modalidad '{postulacion.modalidad.nombre}' requiere los "
                    "siguientes documentos. Puedes subirlos desde tu panel."
                ),
                "documentos_faltantes": resultado.documentos_faltantes,
            }

        headers = self.get_success_headers(serializer.data)
        return Response(respuesta_data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["post"], permission_classes=[PuedeGestionarEtapaActual])
    def transicionar(self, request, pk=None) -> Response:
        """Motor de estados: avanza la etapa del proceso de opción de grado.

        Aplica RBAC por etapa vía PuedeGestionarEtapaActual.
        Ejecuta validación de documentos antes de avanzar a REVISION_DOCUMENTAL.
        """
        postulacion: Postulacion = self.get_object()
        serializer = TransicionEstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        nuevo_estado: str = serializer.validated_data["nuevo_estado"]
        observacion: str = serializer.validated_data.get("observacion", "")

        if nuevo_estado not in EstadoProceso.values:
            return Response(
                {"detail": f"Estado '{nuevo_estado}' no reconocido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Bloque 17: Bloqueo duro cuando hay corrección pendiente.
        if postulacion.requiere_correccion:
            return Response(
                {
                    "detail": (
                        "No se puede avanzar de etapa mientras existan observaciones "
                        "o correcciones pendientes por subsanar."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Bloque 4: validar documentos al avanzar a Revisión Documental.
        if nuevo_estado == EstadoProceso.REVISION_DOCUMENTAL:
            validador = obtener_validador(postulacion.modalidad.nombre)
            resultado = validador.validar_documentos(postulacion)
            if not resultado.es_valido:
                return Response(
                    {
                        "detail": "La postulación no puede avanzar: faltan documentos obligatorios.",
                        "documentos_faltantes": resultado.documentos_faltantes,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            postulacion.transicionar(
                nuevo_estado=nuevo_estado,
                usuario=request.user,  # type: ignore
                observacion=observacion,
            )
        except TransicionInvalida as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["post"], permission_classes=[PuedeGestionarEtapaActual])
    def solicitar_correccion(self, request, pk=None) -> Response:
        """Registra una observación de corrección en la etapa actual sin avanzar.

        El proceso permanece en el mismo estado. El estudiante recibe una
        notificación (vía signal) con la observación pendiente y el archivo adjunto si existe.
        Aplica RBAC por etapa vía PuedeGestionarEtapaActual.
        """
        postulacion: Postulacion = self.get_object()
        serializer = SolicitudCorreccionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        observacion: str = serializer.validated_data["observacion"]
        archivo = request.FILES.get("archivo")

        try:
            postulacion.solicitar_correccion(
                usuario=request.user,  # type: ignore
                observacion=observacion,
                archivo=archivo,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["post", "patch"], permission_classes=[PuedeGestionarEtapaActual])
    def modificar_correccion(self, request, pk=None) -> Response:
        """Permite al evaluador editar la observación o actualizar el archivo adjunto de retroalimentación."""
        postulacion: Postulacion = self.get_object()
        observacion = request.data.get("observacion", "")
        archivo = request.FILES.get("archivo")
        eliminar_archivo = str(request.data.get("eliminar_archivo", "")).lower() in ("true", "1")

        try:
            postulacion.modificar_correccion(
                usuario=request.user,  # type: ignore
                observacion=observacion,
                archivo=archivo,
                eliminar_archivo=eliminar_archivo,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["post"], permission_classes=[PuedeGestionarEtapaActual])
    def cancelar_correccion(self, request, pk=None) -> Response:
        """Permite al evaluador cancelar o retirar la solicitud de corrección y reanudar el trámite."""
        postulacion: Postulacion = self.get_object()
        try:
            postulacion.cancelar_correccion(usuario=request.user)  # type: ignore
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["post"], permission_classes=[PuedeGestionarEtapaActual])
    def notificar_sustentacion(self, request, pk=None) -> Response:
        """Permite al asesor enviar un mensaje al estudiante sobre la sustentación
        (fecha, hora, lugar, instrucciones). El archivo es opcional.
        No cambia el estado del proceso.
        """
        postulacion: Postulacion = self.get_object()
        serializer = SolicitudSustentacionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        mensaje: str = serializer.validated_data["mensaje"]
        archivo = request.FILES.get("archivo")

        campos_update = ["mensaje_sustentacion", "actualizada_en"]
        postulacion.mensaje_sustentacion = mensaje
        if archivo:
            postulacion.archivo_sustentacion = archivo
            campos_update.append("archivo_sustentacion")
        postulacion.save(update_fields=campos_update)

        from core.models import HistorialEstado
        obs = f"Notificación de sustentación enviada al estudiante: {mensaje[:120]}"
        if archivo:
            obs += " [Documento adjunto]"
        HistorialEstado.objects.create(
            postulacion=postulacion,
            estado_anterior=postulacion.estado,
            estado_nuevo=postulacion.estado,
            realizado_por=request.user,  # type: ignore
            observacion=obs,
        )

        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["post", "patch"], permission_classes=[PuedeGestionarEtapaActual])
    def modificar_sustentacion(self, request, pk=None) -> Response:
        """Modifica el mensaje o archivo de sustentación enviado."""
        postulacion: Postulacion = self.get_object()
        
        mensaje = request.data.get("mensaje", "").strip()
        archivo = request.FILES.get("archivo")
        eliminar_archivo = str(request.data.get("eliminar_archivo", "")).lower() in ("true", "1")

        campos_update = ["actualizada_en"]
        if mensaje:
            postulacion.mensaje_sustentacion = mensaje
            campos_update.append("mensaje_sustentacion")
            
        if archivo:
            postulacion.archivo_sustentacion = archivo
            campos_update.append("archivo_sustentacion")
        elif eliminar_archivo:
            postulacion.archivo_sustentacion = None
            campos_update.append("archivo_sustentacion")
            
        postulacion.save(update_fields=campos_update)
        
        from core.models import HistorialEstado
        HistorialEstado.objects.create(
            postulacion=postulacion,
            estado_anterior=postulacion.estado,
            estado_nuevo=postulacion.estado,
            realizado_por=request.user,  # type: ignore
            observacion="Notificación de sustentación actualizada por el asesor.",
        )
        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["delete"], permission_classes=[PuedeGestionarEtapaActual])
    def eliminar_sustentacion(self, request, pk=None) -> Response:
        """Elimina el mensaje y archivo de sustentación."""
        postulacion: Postulacion = self.get_object()
        
        postulacion.mensaje_sustentacion = ""
        postulacion.archivo_sustentacion = None
        postulacion.save(update_fields=["mensaje_sustentacion", "archivo_sustentacion", "actualizada_en"])
        
        from core.models import HistorialEstado
        HistorialEstado.objects.create(
            postulacion=postulacion,
            estado_anterior=postulacion.estado,
            estado_nuevo=postulacion.estado,
            realizado_por=request.user,  # type: ignore
            observacion="Notificación de sustentación eliminada por el asesor.",
        )
        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["post"], permission_classes=[EsEstudiante])
    def subsanar_correccion(self, request, pk=None) -> Response:
        """Permite que el estudiante marque las observaciones pendientes como subsanadas.

        Requiere obligatoriamente un mensaje explicativo (mín. 10 caracteres) y
        el documento corregido adjunto. Registra el documento en el expediente,
        actualiza el estado de la postulación y registra el evento en auditoría.
        """
        postulacion: Postulacion = self.get_object()

        if postulacion.estudiante_id != request.user.id:
            return Response(
                {"detail": "Solo el estudiante titular puede subsanar observaciones de este trámite."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not postulacion.requiere_correccion:
            return Response(
                {"detail": "La postulación no tiene observaciones ni correcciones pendientes por subsanar."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mensaje = (request.data.get("mensaje") or request.data.get("observacion") or "").strip()
        archivo = request.FILES.get("archivo")

        if len(mensaje) < 10:
            return Response(
                {
                    "detail": "Debes ingresar una explicación de al menos 10 caracteres detallando los ajustes realizados."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not archivo:
            return Response(
                {
                    "detail": "Es obligatorio adjuntar el documento con las correcciones aplicadas para poder subsanar."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Crear y anexar documento corregido al expediente digital del estudiante
        Documento.objects.create(
            postulacion=postulacion,
            nombre=f"Subsanación - {archivo.name}",
            descripcion=mensaje,
            archivo=archivo,
        )

        try:
            postulacion.subsanar_correccion(
                usuario=request.user,  # type: ignore
                mensaje=mensaje,
                archivo=archivo,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["post", "patch"], permission_classes=[EsComiteOAdmin])
    def asignar_asesor(self, request, pk=None) -> Response:
        """Asigna o actualiza formalmente el asesor asignado a una postulación (Comité o Admin).

        Permite además enviar una directriz o instrucción ('mensaje' o 'instruccion')
        para que el docente asesor conozca el contexto de su asignación.
        Si se recibe `transicionar=true`, avanza automáticamente al siguiente estado válido.
        """
        postulacion: Postulacion = self.get_object()
        asesor_id = request.data.get("asesor_id") or request.data.get("asesor")
        mensaje = (request.data.get("mensaje") or request.data.get("instruccion") or "").strip()
        archivo = request.FILES.get("archivo")
        hacer_transicion = str(request.data.get("transicionar", "")).lower() in ("true", "1")

        if not asesor_id:
            return Response(
                {"detail": "Debe proporcionar el ID del asesor a asignar."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            asesor = Usuario.objects.get(id=asesor_id, rol=Rol.ASESOR)
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "El asesor seleccionado no existe o no tiene rol de ASESOR."},
                status=status.HTTP_404_NOT_FOUND,
            )

        postulacion.asesor = asesor
        campos_actualizar = ["asesor", "actualizada_en"]
        if mensaje:
            postulacion.mensaje_asesor = mensaje
            campos_actualizar.append("mensaje_asesor")
        if archivo:
            postulacion.archivo_asesor = archivo
            campos_actualizar.append("archivo_asesor")
        postulacion.save(update_fields=campos_actualizar)

        from core.models import HistorialEstado
        nombre_asesor = asesor.get_full_name() or asesor.username
        obs = f"Asesor asignado: {nombre_asesor}"
        if mensaje:
            obs += f" — Directriz: {mensaje}"
        if archivo:
            obs += " [Documento adjunto para el asesor]"
        HistorialEstado.objects.create(
            postulacion=postulacion,
            estado_anterior=postulacion.estado,
            estado_nuevo=postulacion.estado,
            realizado_por=request.user,
            observacion=obs,
        )

        # Transición automática al siguiente estado si se solicita
        if hacer_transicion:
            transiciones = postulacion.transiciones_disponibles
            dest = next((t for t in transiciones if t != "RECHAZADO"), None)
            if dest:
                try:
                    postulacion.transicionar(
                        nuevo_estado=dest,
                        usuario=request.user,  # type: ignore
                        observacion=f"Enviado al asesor {nombre_asesor}.",
                    )
                except TransicionInvalida:
                    pass  # Si no es posible transicionar, se ignora silenciosamente

        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["post", "patch"], permission_classes=[EsComiteOAdmin])
    def modificar_directriz(self, request, pk=None) -> Response:
        """Modifica la directriz (mensaje) enviada al asesor."""
        postulacion: Postulacion = self.get_object()
        
        mensaje = (request.data.get("mensaje") or request.data.get("instruccion") or "").strip()
        archivo = request.FILES.get("archivo")
        eliminar_archivo = str(request.data.get("eliminar_archivo", "")).lower() in ("true", "1")

        campos_update = ["actualizada_en"]
        if mensaje:
            postulacion.mensaje_asesor = mensaje
            campos_update.append("mensaje_asesor")
            
        if archivo:
            postulacion.archivo_asesor = archivo
            campos_update.append("archivo_asesor")
        elif eliminar_archivo:
            postulacion.archivo_asesor = None
            campos_update.append("archivo_asesor")
            
        postulacion.save(update_fields=campos_update)
        
        from core.models import HistorialEstado
        HistorialEstado.objects.create(
            postulacion=postulacion,
            estado_anterior=postulacion.estado,
            estado_nuevo=postulacion.estado,
            realizado_por=request.user,  # type: ignore
            observacion="Directriz al asesor actualizada.",
        )
        return Response(PostulacionSerializer(postulacion).data)

    @action(detail=True, methods=["delete"], permission_classes=[EsComiteOAdmin])
    def eliminar_directriz(self, request, pk=None) -> Response:
        """Elimina la directriz (mensaje y archivo) enviada al asesor."""
        postulacion: Postulacion = self.get_object()
        
        postulacion.mensaje_asesor = ""
        postulacion.archivo_asesor = None
        postulacion.save(update_fields=["mensaje_asesor", "archivo_asesor", "actualizada_en"])
        
        from core.models import HistorialEstado
        HistorialEstado.objects.create(
            postulacion=postulacion,
            estado_anterior=postulacion.estado,
            estado_nuevo=postulacion.estado,
            realizado_por=request.user,  # type: ignore
            observacion="Directriz al asesor eliminada.",
        )
        return Response(PostulacionSerializer(postulacion).data)

    def destroy(self, request, *args, **kwargs):
        """Permite cancelar o eliminar una postulación.

        Reglas de integridad y seguridad:
        - Solo se permite si la postulación está en estado POSTULACION.
        - Solo puede eliminarla el propio estudiante dueño de la postulación
          o un Administrador pleno.
        """
        postulacion: Postulacion = self.get_object()
        usuario: Usuario = request.user  # type: ignore

        if postulacion.estado != EstadoProceso.POSTULACION:
            return Response(
                {
                    "detail": (
                        f"No se puede eliminar una postulación en estado '{postulacion.get_estado_display()}'. "
                        "Solo se pueden cancelar solicitudes en etapa inicial de Postulación."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        es_dueno = usuario.es_estudiante and postulacion.estudiante_id == usuario.id
        es_admin = es_administrador_pleno(usuario)

        if not (es_dueno or es_admin):
            return Response(
                {"detail": "No tienes autorización para eliminar esta postulación."},
                status=status.HTTP_403_FORBIDDEN,
            )

        postulacion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"])
    def historial(self, request, pk=None) -> Response:
        """Devuelve el historial completo de eventos de auditoría de la postulación."""
        postulacion: Postulacion = self.get_object()
        from core.models import HistorialEstado
        historial = HistorialEstado.objects.filter(postulacion=postulacion)
        data = HistorialEstadoSerializer(historial, many=True).data
        return Response(data)

    @action(detail=True, methods=["get"])
    def certificado(self, request, pk=None) -> HttpResponse:
        """Genera y devuelve el certificado de finalización en PDF.

        Solo disponible cuando el proceso está en estado FINALIZADO.
        El PDF se entrega como descarga directa (Content-Disposition: attachment).
        El estudiante solo puede descargar su propio certificado;
        el asesor/comité/admin puede descargarlo para cualquier postulación.
        """
        postulacion: Postulacion = self.get_object()

        if postulacion.estado != EstadoProceso.FINALIZADO:
            return Response(
                {
                    "detail": (
                        "El certificado solo está disponible cuando el proceso "
                        f"está en estado FINALIZADO. Estado actual: '{postulacion.get_estado_display()}'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            pdf_bytes = generar_certificado_finalizacion(postulacion)
        except Exception as exc:
            logger.exception(
                "Error al generar certificado PDF para postulacion=%s: %s",
                postulacion.id,
                exc,
            )
            return Response(
                {"detail": "No se pudo generar el certificado. Por favor, contacta al administrador."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        nombre_archivo = (
            f"certificado_{postulacion.estudiante.username}_"
            f"{postulacion.modalidad.nombre.replace(' ', '_')}.pdf"
        )
        respuesta = HttpResponse(pdf_bytes, content_type="application/pdf")
        respuesta["Content-Disposition"] = f'attachment; filename="{nombre_archivo}"'
        return respuesta

    @action(detail=True, methods=["get"])
    def validar_documentos(self, request, pk=None) -> Response:
        """Ejecuta la validación de documentos para la postulación y devuelve
        el resultado con la lista de faltantes (si los hay).

        Útil para que el frontend muestre al estudiante qué documentos faltan
        antes de que el asesor intente avanzar de etapa.
        """
        postulacion: Postulacion = self.get_object()
        validador = obtener_validador(postulacion.modalidad.nombre)
        resultado = validador.validar_documentos(postulacion)

        return Response(
            {
                "es_valido": resultado.es_valido,
                "documentos_faltantes": resultado.documentos_faltantes,
                "modalidad": postulacion.modalidad.nombre,
            }
        )


class DocumentoViewSet(viewsets.ModelViewSet):
    """CRUD de documentos adjuntos a postulaciones.

    El control de acceso replica el patrón de PostulacionViewSet:
    el estudiante solo ve documentos de sus propias postulaciones,
    el asesor los de sus postulaciones asignadas.
    """

    serializer_class = DocumentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario: Usuario = self.request.user  # type: ignore
        qs = Documento.objects.select_related("postulacion")

        if usuario.es_estudiante:
            return qs.filter(postulacion__estudiante=usuario)
        if usuario.es_asesor:
            return qs.filter(postulacion__asesor=usuario)

        return qs

    def perform_create(self, serializer):
        postulacion = serializer.validated_data.get("postulacion")
        usuario: Usuario = self.request.user  # type: ignore
        if usuario.es_estudiante and postulacion.estudiante_id != usuario.id:
            raise PermissionDenied("Solo puedes adjuntar documentos a tus propias postulaciones.")
        serializer.save()

    def perform_destroy(self, instance: Documento):
        usuario: Usuario = self.request.user  # type: ignore
        if (
            usuario.es_estudiante
            and instance.postulacion.estado != EstadoProceso.POSTULACION
            and not instance.postulacion.requiere_correccion
        ):
            raise PermissionDenied(
                "Solo puedes eliminar documentos mientras el proceso esté en etapa de Postulación o subsanando corrección."
            )
        instance.delete()


class AnaliticaView(viewsets.ViewSet):
    """GET /api/analitica/ — métricas para Asesores, Comité y Decanatura.

    Segregación de datos por rol (Principio de Menor Privilegio):
    - Asesor: consulta únicamente las métricas de los proyectos a su cargo.
    - Comité / Administrador: consulta las métricas institucionales consolidadas.
    """

    permission_classes = [EsAsesorOComite]

    def list(self, request) -> Response:
        """Devuelve conteos de procesos agrupados por estado y por modalidad."""
        qs = Postulacion.objects.all()
        usuario: Usuario = request.user  # type: ignore

        # Si el usuario es asesor, acotar las estadísticas exclusivamente a sus proyectos
        if usuario.es_asesor:
            qs = qs.filter(asesor=usuario)

        por_estado = list(
            qs.values("estado")
            .annotate(total=Count("id"))
            .order_by("estado")
        )
        por_modalidad = list(
            qs.values("modalidad__nombre")
            .annotate(total=Count("id"))
            .order_by("-total")
        )
        return Response({
            "por_estado": por_estado,
            "por_modalidad": por_modalidad,
            "es_asesor": usuario.es_asesor,
            "total_procesos": qs.count(),
        })

