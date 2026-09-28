"""
validadores_modalidad.py — SIGMA ITM
Validación de documentos requeridos por modalidad de opción de grado.

Implementa el patrón Strategy (GoF):
- `ValidadorModalidad`: interfaz abstracta.
- Subclases concretas: una por modalidad con reglas propias.
- `obtener_validador()`: fábrica que devuelve la estrategia correcta.

El llamador (Postulacion o PostulacionViewSet) solo trabaja contra la
interfaz `ValidadorModalidad` — nunca instancia estrategias directamente.
"""

from __future__ import annotations

import abc
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from core.models import Postulacion


# ---------------------------------------------------------------------------
# Tipo de resultado de la validación
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ResultadoValidacion:
    """Resultado inmutable de una validación de documentos.

    Attributes:
        es_valido: True si todos los documentos obligatorios están presentes.
        documentos_faltantes: Lista descriptiva de los documentos que faltan.
    """

    es_valido: bool
    documentos_faltantes: list[str] = field(default_factory=list)

    def __bool__(self) -> bool:
        return self.es_valido


# ---------------------------------------------------------------------------
# Interfaz base (Strategy)
# ---------------------------------------------------------------------------

class ValidadorModalidad(abc.ABC):
    """Interfaz abstracta para los validadores de documentos por modalidad.

    Cada estrategia concreta define qué documentos son obligatorios para
    su modalidad específica. La lógica de validación es idéntica en todas
    (comprobar presencia de nombres), lo que varía es la lista de requisitos.
    """

    #: Lista de nombres de documentos obligatorios para esta modalidad.
    documentos_obligatorios: list[str] = []

    def validar_documentos(self, postulacion: "Postulacion") -> ResultadoValidacion:
        """Verifica que la postulación tenga todos los documentos obligatorios.

        La comparación es case-insensitive y compara por nombre de documento.

        Args:
            postulacion: Instancia de Postulacion con sus documentos precargados.

        Returns:
            ResultadoValidacion con el resultado y la lista de documentos faltantes.
        """
        from core.models import Documento
        nombres_subidos = [
            doc.nombre.strip().lower()
            for doc in Documento.objects.filter(postulacion=postulacion)
        ]

        def cumple_requisito(req: str) -> bool:
            req_lower = req.strip().lower()
            # 1. Coincidencia exacta
            if req_lower in nombres_subidos:
                return True
            # 2. Coincidencia parcial o por palabras clave relevantes
            for subido in nombres_subidos:
                if not subido:
                    continue
                if subido in req_lower or req_lower in subido:
                    return True
                # Palabras clave principales (propuesta, paz y salvo, carta, etc.)
                palabras_req = {p for p in req_lower.split() if len(p) > 3}
                palabras_subido = {p for p in subido.split() if len(p) > 3}
                if len(palabras_req & palabras_subido) >= 2:
                    return True
            return False

        faltantes = [
            nombre_req
            for nombre_req in self.documentos_obligatorios
            if not cumple_requisito(nombre_req)
        ]

        return ResultadoValidacion(
            es_valido=len(faltantes) == 0,
            documentos_faltantes=faltantes,
        )

    @property
    @abc.abstractmethod
    def nombre_modalidad(self) -> str:
        """Nombre canónico de la modalidad que esta estrategia valida."""
        ...


# ---------------------------------------------------------------------------
# Estrategias concretas
# (Los nombres exactos deben coincidir con los de seed_data.py)
# ---------------------------------------------------------------------------

class ValidadorTrabajoDeGrado(ValidadorModalidad):
    """Validador para la modalidad 'Trabajo de Grado'.

    Documentos obligatorios según reglamentación del ITM:
    - Propuesta de proyecto de grado firmada por el asesor.
    - Certificado de paz y salvo académico.
    - Carta de presentación al comité.
    """

    nombre_modalidad = "Trabajo de Grado"
    documentos_obligatorios = [
        "Propuesta de proyecto de grado",
        "Certificado de paz y salvo académico",
        "Carta de presentación al comité",
    ]


class ValidadorPracticasProfesionales(ValidadorModalidad):
    """Validador para la modalidad 'Prácticas Profesionales'.

    Documentos obligatorios según reglamentación del ITM:
    - Carta de aceptación de la empresa.
    - Plan de trabajo aprobado por la empresa.
    - Certificado de matrícula vigente.
    - ARL (seguro de riesgos laborales).
    """

    nombre_modalidad = "Prácticas Profesionales"
    documentos_obligatorios = [
        "Carta de aceptación de la empresa",
        "Plan de trabajo aprobado por la empresa",
        "Certificado de matrícula vigente",
        "ARL (seguro de riesgos laborales)",
    ]


class ValidadorProductoEnLaboratorio(ValidadorModalidad):
    """Validador para la modalidad 'Producto en Laboratorio'.

    Documentos obligatorios según reglamentación del ITM:
    - Propuesta técnica del producto.
    - Aval del laboratorio o grupo de investigación.
    - Certificado de paz y salvo académico.
    """

    nombre_modalidad = "Producto en Laboratorio"
    documentos_obligatorios = [
        "Propuesta técnica del producto",
        "Aval del laboratorio o grupo de investigación",
        "Certificado de paz y salvo académico",
    ]


class ValidadorProductoDeInvestigacion(ValidadorModalidad):
    """Validador para la modalidad 'Producto de Investigación'.

    Documentos obligatorios según reglamentación del ITM:
    - Propuesta de investigación firmada.
    - Aval del grupo de investigación.
    - Certificado de paz y salvo académico.
    - Carta de participación en proyecto de investigación.
    """

    nombre_modalidad = "Producto de Investigación"
    documentos_obligatorios = [
        "Propuesta de investigación firmada",
        "Aval del grupo de investigación",
        "Certificado de paz y salvo académico",
        "Carta de participación en proyecto de investigación",
    ]


class ValidadorGenerico(ValidadorModalidad):
    """Estrategia genérica para modalidades sin reglas estrictas de documentos.

    Aplica para: Pasantía, Emprendimiento, Reconocimiento Laboral,
    Certificación, Cursos de Posgrado, Ingeniería para la Gente.
    No exige documentos específicos vía código — el asesor revisa manualmente.
    """

    nombre_modalidad = "Genérica"
    documentos_obligatorios = []

    def validar_documentos(self, postulacion: "Postulacion") -> ResultadoValidacion:
        """La validación genérica siempre es válida desde el punto de vista
        del sistema — la revisión es manual por el asesor."""
        return ResultadoValidacion(es_valido=True, documentos_faltantes=[])


# ---------------------------------------------------------------------------
# Fábrica (Factory Function)
# ---------------------------------------------------------------------------

# Registro de estrategias: nombre canónico de modalidad → clase validadora.
# Los nombres DEBEN coincidir exactamente con los de MODALIDADES en seed_data.py.
_REGISTRO_VALIDADORES: dict[str, type[ValidadorModalidad]] = {
    "Trabajo de Grado":       ValidadorTrabajoDeGrado,
    "Prácticas Profesionales": ValidadorPracticasProfesionales,
    "Producto en Laboratorio": ValidadorProductoEnLaboratorio,
    "Producto de Investigación": ValidadorProductoDeInvestigacion,
}


def obtener_validador(nombre_modalidad: str) -> ValidadorModalidad:
    """Fábrica que devuelve la estrategia de validación correspondiente
    a la modalidad indicada.

    Para modalidades sin reglas estrictas, devuelve `ValidadorGenerico`
    (patrón Null Object: siempre retorna validación exitosa).

    Args:
        nombre_modalidad: Nombre exacto de la modalidad (ej. "Trabajo de Grado").

    Returns:
        Instancia de `ValidadorModalidad` lista para usar.
    """
    clase_validador = _REGISTRO_VALIDADORES.get(nombre_modalidad, ValidadorGenerico)
    return clase_validador()
