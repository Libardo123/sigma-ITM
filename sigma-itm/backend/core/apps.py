from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Configuración de la aplicación 'core' de SIGMA ITM.

    El método ready() conecta las señales definidas en signals.py.
    Esto garantiza que las notificaciones por email se registren al
    iniciar Django, sin importar signals.py desde ningún otro módulo.
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self) -> None:
        """Importa las señales para que Django las registre al arrancar."""
        import core.signals  # noqa: F401 — importación por efecto secundario
