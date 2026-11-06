"""Utilidades de base de datos para búsquedas sin tildes.

SQLite no trae una función ``unaccent`` nativa y ``LIKE`` no ignora las
tildes. Para que la búsqueda del panel ("gomez" encuentre "Gómez") siga
funcionando ahora que se resuelve en el servidor, se registra una función
SQL ``UNACCENT()`` en cada conexión SQLite y se expone como transformación
ORM: ``campo__sinacento``.
"""

from __future__ import annotations

import unicodedata

from django.db import connections
from django.db.backends.signals import connection_created
from django.db.models import CharField, TextField, Transform


def quitar_acentos(valor):
    """Devuelve el texto sin tildes/diacríticos (y en minúsculas)."""
    if valor is None:
        return None
    texto = str(valor)
    descompuesto = unicodedata.normalize("NFKD", texto)
    return "".join(c for c in descompuesto if not unicodedata.combining(c)).lower()


class SinAcento(Transform):
    """Transformación ORM ``campo__sinacento`` → ``UNACCENT(campo)``."""

    lookup_name = "sinacento"
    function = "UNACCENT"


def _registrar_en_conexion(connection) -> None:
    if connection.vendor != "sqlite" or connection.connection is None:
        return
    connection.connection.create_function(
        "unaccent", 1, quitar_acentos, deterministic=True
    )


def _al_crear_conexion(sender, connection, **kwargs) -> None:
    _registrar_en_conexion(connection)


def registrar_soporte_sin_acentos() -> None:
    """Registra el lookup y la función SQLite al arrancar Django."""
    CharField.register_lookup(SinAcento)
    TextField.register_lookup(SinAcento)
    connection_created.connect(
        _al_crear_conexion, dispatch_uid="core_unaccent_sqlite"
    )
    # Si alguna conexión ya estaba abierta antes de ready(), se registra aquí.
    for connection in connections.all():
        _registrar_en_conexion(connection)
