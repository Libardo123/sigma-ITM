"""
permissions.py — SIGMA ITM
Clases de permiso por rol para la API REST.

Principio DRY: la función `es_administrador_pleno` centraliza la condición
de "Admin sin restricción de auxiliar", evitando duplicar el chequeo en cada
clase de permiso.
"""

from __future__ import annotations

from rest_framework.permissions import SAFE_METHODS, BasePermission


# ---------------------------------------------------------------------------
# Función auxiliar reutilizable (DRY)
# ---------------------------------------------------------------------------

def es_administrador_pleno(user) -> bool:
    """Devuelve True si el usuario es administrador completo (sin restricción auxiliar).

    Un administrador auxiliar puede consultar datos pero NO puede aprobar
    transiciones de estado ni gestionar usuarios.
    """
    return bool(
        user
        and user.is_authenticated
        and user.es_admin
        and not user.es_auxiliar
    )


# ---------------------------------------------------------------------------
# Clases de permiso
# ---------------------------------------------------------------------------

class EsEstudiante(BasePermission):
    """Permite acceso solo a usuarios con rol ESTUDIANTE."""

    def has_permission(self, request, view) -> bool:
        u = request.user
        return bool(u and u.is_authenticated and u.es_estudiante)


class EsAsesorOComite(BasePermission):
    """Permite acceso a Asesores, Comité y Administradores plenos.
    Los Auxiliares quedan excluidos de este permiso.
    """

    def has_permission(self, request, view) -> bool:
        u = request.user
        if not (u and u.is_authenticated):
            return False
        return u.es_asesor or u.es_comite or es_administrador_pleno(u)


class EsComiteOAdmin(BasePermission):
    """Permite acceso a Comité y Administradores plenos (sin Auxiliares)."""

    def has_permission(self, request, view) -> bool:
        u = request.user
        if not (u and u.is_authenticated):
            return False
        return u.es_comite or es_administrador_pleno(u)


class EsAdmin(BasePermission):
    """Permite acceso solo a Administradores plenos (es_admin y NO es_auxiliar)."""

    def has_permission(self, request, view) -> bool:
        return es_administrador_pleno(request.user)


class EsAuxiliarOAdmin(BasePermission):
    """Permite acceso de lectura extendida a cualquier Admin (pleno o auxiliar).
    Los Auxiliares pueden consultar y filtrar procesos pero no modificarlos.
    """

    def has_permission(self, request, view) -> bool:
        u = request.user
        return bool(u and u.is_authenticated and u.es_admin)


class SoloLecturaOAdmin(BasePermission):
    """Cualquier usuario autenticado puede leer (GET/HEAD/OPTIONS).
    Solo el Administrador pleno puede escribir (POST/PUT/PATCH/DELETE).
    """

    def has_permission(self, request, view) -> bool:
        u = request.user
        if not (u and u.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return es_administrador_pleno(u)


class PuedeGestionarEtapaActual(BasePermission):
    """Permiso RBAC granular por etapa sobre objetos Postulacion (Bloque 16).

    Reglas de negocio:
    - POSTULACION, REVISION_DOCUMENTAL, APROBACION, SUSTENTACION:
      Solo el Comité de Trabajos de Grado o un Administrador pleno pueden actuar.
    - EN_PROCESO:
      Solo el Asesor asignado a esa postulación específica (postulacion.asesor == request.user)
      o un Administrador pleno pueden actuar.
    - Cualquier otro rol, o administradores auxiliares: 403 con mensaje explicativo.
    """

    message: str = "No tienes autorización para gestionar el proceso en esta etapa."

    def has_permission(self, request, view) -> bool:
        """Filtro inicial a nivel de vista antes de recuperar la instancia."""
        u = request.user
        if not (u and u.is_authenticated):
            return False
        # Requiere al menos ser Asesor, Comité o Administrador pleno (no auxiliar ni estudiante)
        return bool(u.es_asesor or u.es_comite or es_administrador_pleno(u))

    def has_object_permission(self, request, view, obj) -> bool:
        """Valida si el usuario actual tiene potestad sobre la etapa de obj (Postulacion)."""
        u = request.user
        if not (u and u.is_authenticated):
            return False

        # El Administrador pleno tiene superacceso sobre todas las etapas
        if es_administrador_pleno(u):
            return True

        # Administrador auxiliar no puede operar transiciones
        if getattr(u, "es_auxiliar", False):
            self.message = "Los administradores auxiliares no tienen permisos para gestionar etapas."
            return False

        from .models import EstadoProceso

        estados_comite = {
            EstadoProceso.POSTULACION,
            EstadoProceso.REVISION_DOCUMENTAL,
            EstadoProceso.APROBACION,
            EstadoProceso.REVISION_COMITE,
        }

        if obj.estado in estados_comite:
            if u.es_comite:
                return True
            self.message = (
                f"La gestión y aprobación de la etapa '{obj.get_estado_display()}' "
                f"corresponde al Comité de Trabajos de Grado."
            )
            return False

        if obj.estado in {EstadoProceso.EN_PROCESO, EstadoProceso.SUSTENTACION}:
            if u.es_asesor and obj.asesor_id == u.id:
                return True
            if u.es_asesor:
                self.message = (
                    f"Solo el docente asesor asignado formalmente a este proyecto puede "
                    f"gestionar la etapa '{obj.get_estado_display()}'."
                )
            else:
                self.message = f"Solo el docente asesor asignado puede gestionar la etapa '{obj.get_estado_display()}'."
            return False

        self.message = (
            f"El estado '{obj.get_estado_display()}' no admite modificaciones directas."
        )
        return False

