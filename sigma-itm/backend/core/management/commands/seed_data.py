from django.core.management.base import BaseCommand

from core.models import Modalidad, Rol, Usuario

MODALIDADES = [
    "Trabajo de Grado",
    "Prácticas Profesionales",
    "Pasantía",
    "Emprendimiento",
    "Producto en Laboratorio",
    "Producto de Investigación",
    "Reconocimiento Laboral",
    "Certificación",
    "Cursos de Posgrado",
    "Ingeniería para la Gente",
]


class Command(BaseCommand):
    help = "Crea datos iniciales: modalidades de grado y usuarios de prueba por rol."

    def handle(self, *args, **options):
        for nombre in MODALIDADES:
            obj, created = Modalidad.objects.get_or_create(nombre=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Modalidad creada: {nombre}"))

        usuarios_demo = [
            dict(username="estudiante1", first_name="Jorge", last_name="Bernal",
                 rol=Rol.ESTUDIANTE, programa_academico="Tecnología en Desarrollo de Software"),
            dict(username="asesor1", first_name="Miguel Antonio", last_name="Ojeda Enríquez",
                 rol=Rol.ASESOR),
            dict(username="comite1", first_name="Jorge Iván", last_name="Bedoya Restrepo",
                 rol=Rol.COMITE),
        ]
        for datos in usuarios_demo:
            username = datos["username"]
            if not Usuario.objects.filter(username=username).exists():
                user = Usuario.objects.create_user(password="sigma2026", **datos)
                self.stdout.write(self.style.SUCCESS(f"Usuario creado: {user.username} ({user.rol})"))

        self.stdout.write(self.style.SUCCESS("Datos semilla listos."))
