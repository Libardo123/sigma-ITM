from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Documento, HistorialEstado, Modalidad, Postulacion, Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    fieldsets = list(UserAdmin.fieldsets or []) + [
        ("SIGMA ITM", {"fields": ("rol", "cedula", "programa_academico", "es_auxiliar")}),
    ]
    list_display = ("username", "first_name", "last_name", "rol", "cedula", "es_auxiliar", "is_staff")
    list_filter = ("rol", "es_auxiliar", "is_staff", "is_active")
    search_fields = ("username", "first_name", "last_name", "email", "cedula")


class DocumentoInline(admin.TabularInline):
    model = Documento
    extra = 0


class HistorialInline(admin.TabularInline):
    model = HistorialEstado
    extra = 0
    readonly_fields = ("estado_anterior", "estado_nuevo", "realizado_por", "observacion", "fecha", "es_correccion")
    can_delete = False


@admin.register(Postulacion)
class PostulacionAdmin(admin.ModelAdmin):
    list_display = ("id", "estudiante", "get_cedula", "modalidad", "asesor", "estado", "requiere_correccion", "creada_en")
    list_filter = ("estado", "modalidad", "requiere_correccion")
    search_fields = ("estudiante__cedula", "estudiante__username", "estudiante__first_name", "estudiante__last_name", "titulo_proyecto")
    readonly_fields = ("requiere_correccion", "observacion_correccion")
    inlines = [DocumentoInline, HistorialInline]

    @admin.display(description="Cédula", ordering="estudiante__cedula")
    def get_cedula(self, obj):
        return obj.estudiante.cedula or "-"


@admin.register(Modalidad)
class ModalidadAdmin(admin.ModelAdmin):
    list_display = ("nombre", "activa", "creada_en")
    list_filter = ("activa",)


@admin.register(HistorialEstado)
class HistorialEstadoAdmin(admin.ModelAdmin):
    list_display = ("postulacion", "estado_anterior", "estado_nuevo", "realizado_por", "es_correccion", "fecha")
    list_filter = ("estado_nuevo", "es_correccion")
    readonly_fields = [f.name for f in HistorialEstado._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
