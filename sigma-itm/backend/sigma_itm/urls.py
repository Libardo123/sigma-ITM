"""
urls.py — sigma_itm (proyecto principal)
Configuración de rutas raíz del proyecto SIGMA ITM.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

rate_login = "100/m" if settings.DEBUG else "5/15m"


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Permite autenticarse usando tanto el nombre de usuario (@username) como el correo institucional."""

    def validate(self, attrs):
        identificador = attrs.get(self.username_field)
        if identificador:
            from core.models import Usuario
            from django.db.models import Q

            usuario = Usuario.objects.filter(
                Q(username__iexact=identificador) | Q(email__iexact=identificador)
            ).first()
            if usuario:
                attrs[self.username_field] = usuario.username

        return super().validate(attrs)


class LoginConRateLimit(TokenObtainPairView):
    """Vista de login con rate limiting aplicado por IP.

    Límite: 5 peticiones por 15 minutos por dirección IP en producción,
    y 100 por minuto en desarrollo (DEBUG) para permitir alternar perfiles.
    Al exceder el límite, devuelve HTTP 429 con un mensaje en formato JSON.
    """

    serializer_class = EmailOrUsernameTokenObtainPairSerializer

    @method_decorator(
        ratelimit(key="ip", rate=rate_login, method="POST", block=False)
    )
    def post(self, request, *args, **kwargs):
        """Autentica al usuario y devuelve los tokens JWT con control de tasa."""
        if getattr(request, "limited", False):
            from rest_framework.response import Response
            from rest_framework import status

            return Response(
                {
                    "detail": "Demasiados intentos de inicio de sesión. Por favor espera unos minutos antes de reintentar."
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        username = request.data.get("username")
        password = request.data.get("password")
        if username and password:
            from core.models import Usuario
            from django.db.models import Q

            try:
                usuario_db = Usuario.objects.filter(
                    Q(username__iexact=username) | Q(email__iexact=username)
                ).first()
                if usuario_db and usuario_db.check_password(password) and not usuario_db.is_active:
                    from rest_framework.response import Response
                    from rest_framework import status

                    return Response(
                        {
                            "detail": (
                                "Tu cuenta se encuentra registrada pero aún está pendiente de aprobación "
                                "por el Administrador institucional del ITM."
                            ),
                            "cuenta_pendiente": True,
                        },
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
            except Exception:
                pass

        return super().post(request, *args, **kwargs)


urlpatterns = [
    path("admin/", admin.site.urls),
    # Bloque 9: endpoint de login con rate limiting (5 intentos / 15 min / IP).
    path("api/auth/login/", LoginConRateLimit.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("core.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
