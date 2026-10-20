from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html

from .models import Documento, HistorialEstado, Modalidad, Postulacion, Usuario, VersionDocumento


# ==============================================================================
# 1. USUARIOS CON ACCIONES MASIVAS
# ==============================================================================
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    fieldsets = list(UserAdmin.fieldsets or []) + [
        ("Información Institucional SIGMA ITM", {
            "fields": ("rol", "cedula", "programa_academico", "es_auxiliar")
        }),
    ]
    list_display = (
        "username",
        "first_name",
        "last_name",
        "rol",
        "cedula",
        "programa_academico",
        "is_active",
        "is_staff",
    )
    list_filter = ("rol", "is_active", "programa_academico", "es_auxiliar", "is_staff")
    search_fields = ("username", "first_name", "last_name", "email", "cedula")
    actions = ["activar_usuarios", "desactivar_usuarios"]

    @admin.action(description="✅ Aprobar y activar cuentas seleccionadas")
    def activar_usuarios(self, request, queryset):
        actualizados = queryset.update(is_active=True)
        self.message_user(request, f"Se han activado {actualizados} cuenta(s) institucional(es) exitosamente.")

    @admin.action(description="⛔ Desactivar cuentas seleccionadas")
    def desactivar_usuarios(self, request, queryset):
        actualizados = queryset.update(is_active=False)
        self.message_user(request, f"Se han desactivado {actualizados} cuenta(s).")


# ==============================================================================
# 2. INLINES PARA POSTULACIÓN
# ==============================================================================
class VersionDocumentoInline(admin.TabularInline):
    model = VersionDocumento
    extra = 0
    fields = ("numero_version", "archivo_link", "motivo", "creado_en", "creado_por")
    readonly_fields = ("numero_version", "archivo_link", "motivo", "creado_en", "creado_por")
    can_delete = False

    @admin.display(description="Archivo / Enlace")
    def archivo_link(self, obj):
        if obj.archivo:
            return format_html(
                '<a href="{}" target="_blank" style="font-weight: bold; color: #011C5B;">📄 Ver v{}</a>',
                obj.archivo.url,
                obj.numero_version,
            )
        return "-"


class DocumentoInline(admin.TabularInline):
    model = Documento
    extra = 0
    fields = ("nombre", "archivo_descarga", "subido_en")
    readonly_fields = ("nombre", "archivo_descarga", "subido_en")

    @admin.display(description="Archivo Vigente")
    def archivo_descarga(self, obj):
        if obj.archivo:
            return format_html(
                '<a href="{}" target="_blank" style="font-weight: bold; color: #011C5B;">⬇️ Descargar</a>',
                obj.archivo.url,
            )
        return "-"


class HistorialInline(admin.TabularInline):
    model = HistorialEstado
    extra = 0
    readonly_fields = ("estado_anterior", "estado_nuevo", "realizado_por", "observacion", "fecha", "es_correccion")
    can_delete = False


# ==============================================================================
# 3. POSTULACIONES CON DATE_HIERARCHY Y FILTROS AVANZADOS
# ==============================================================================
@admin.register(Postulacion)
class PostulacionAdmin(admin.ModelAdmin):
    date_hierarchy = "creada_en"
    list_display = (
        "id",
        "estudiante",
        "get_cedula",
        "get_programa",
        "modalidad",
        "asesor",
        "estado",
        "requiere_correccion",
        "creada_en",
    )
    list_filter = (
        "estado",
        "modalidad",
        "requiere_correccion",
        "estudiante__programa_academico",
        "asesor",
        "creada_en",
    )
    search_fields = (
        "estudiante__cedula",
        "estudiante__username",
        "estudiante__first_name",
        "estudiante__last_name",
        "estudiante__email",
        "titulo_proyecto",
        "id",
    )
    readonly_fields = ("creada_en", "actualizada_en", "requiere_correccion", "observacion_correccion")
    inlines = [DocumentoInline, HistorialInline]

    @admin.display(description="Cédula", ordering="estudiante__cedula")
    def get_cedula(self, obj):
        return obj.estudiante.cedula or "-"

    @admin.display(description="Programa Académico", ordering="estudiante__programa_academico")
    def get_programa(self, obj):
        return obj.estudiante.programa_academico or "-"


# ==============================================================================
# 4. MÓDULO INDEPENDIENTE DE DOCUMENTOS AUDITABLES
# ==============================================================================
@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    date_hierarchy = "subido_en"
    list_display = (
        "nombre",
        "get_estudiante",
        "get_cedula",
        "get_modalidad",
        "get_tamano",
        "subido_en",
        "descargar_archivo",
    )
    list_filter = ("subido_en", "postulacion__modalidad")
    search_fields = (
        "nombre",
        "postulacion__estudiante__username",
        "postulacion__estudiante__cedula",
        "postulacion__estudiante__first_name",
        "postulacion__estudiante__last_name",
    )
    readonly_fields = ("subido_en", "descargar_archivo", "get_tamano")
    inlines = [VersionDocumentoInline]

    @admin.display(description="Estudiante", ordering="postulacion__estudiante")
    def get_estudiante(self, obj):
        return f"{obj.postulacion.estudiante.get_full_name() or obj.postulacion.estudiante.username}"

    @admin.display(description="Cédula", ordering="postulacion__estudiante__cedula")
    def get_cedula(self, obj):
        return obj.postulacion.estudiante.cedula or "-"

    @admin.display(description="Modalidad", ordering="postulacion__modalidad")
    def get_modalidad(self, obj):
        return obj.postulacion.modalidad.nombre

    @admin.display(description="Tamaño")
    def get_tamano(self, obj):
        try:
            if obj.archivo and obj.archivo.size:
                kb = obj.archivo.size / 1024
                if kb < 1024:
                    return f"{kb:.1f} KB"
                return f"{kb / 1024:.2f} MB"
        except Exception:
            pass
        return "-"

    @admin.display(description="Acción / Descarga")
    def descargar_archivo(self, obj):
        if obj.archivo:
            return format_html(
                '<a href="{}" target="_blank" style="padding: 4px 10px; background: #011C5B; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 11px;">⬇️ Descargar</a>',
                obj.archivo.url,
            )
        return "-"


# ==============================================================================
# 5. MODALIDADES INSTITUCIONALES
# ==============================================================================
@admin.register(Modalidad)
class ModalidadAdmin(admin.ModelAdmin):
    list_display = ("nombre", "activa", "creada_en")
    list_filter = ("activa",)
    search_fields = ("nombre", "descripcion")


# ==============================================================================
# 6. HISTORIAL DE AUDITORÍA FORENSE (SOLO LECTURA)
# ==============================================================================
@admin.register(HistorialEstado)
class HistorialEstadoAdmin(admin.ModelAdmin):
    date_hierarchy = "fecha"
    list_display = (
        "postulacion",
        "get_estudiante",
        "estado_anterior",
        "estado_nuevo",
        "realizado_por",
        "es_correccion",
        "fecha",
    )
    list_filter = ("estado_nuevo", "es_correccion", "fecha")
    search_fields = (
        "postulacion__estudiante__username",
        "postulacion__estudiante__cedula",
        "observacion",
    )
    readonly_fields = [f.name for f in HistorialEstado._meta.fields]

    @admin.display(description="Estudiante", ordering="postulacion__estudiante")
    def get_estudiante(self, obj):
        return obj.postulacion.estudiante.username

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
