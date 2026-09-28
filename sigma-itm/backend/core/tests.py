"""
tests.py — SIGMA ITM (core)
Suite de pruebas con pytest-django para la lógica de negocio.

Cobertura prioritaria:
  1. Motor de estados (Postulacion.transicionar y solicitar_correccion).
  2. Estrategias de validación de modalidad (validadores_modalidad.py).
  3. Permisos por rol en get_queryset.
  4. Señal de notificación por correo.

Convención de nombres:
  - test_<accion>_<condicion>_<resultado_esperado>
"""

from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, RequestFactory
from rest_framework.test import APIClient

from core.models import (
    Documento,
    EstadoProceso,
    HistorialEstado,
    Modalidad,
    Postulacion,
    Rol,
    TransicionInvalida,
    obtener_clase_estado,
    TRANSICIONES_VALIDAS,
)
from core.validadores_modalidad import (
    ResultadoValidacion,
    ValidadorGenerico,
    ValidadorPracticasProfesionales,
    ValidadorTrabajoDeGrado,
    ValidadorProductoEnLaboratorio,
    obtener_validador,
)

Usuario = get_user_model()


# ===========================================================================
# Fixtures reutilizables
# ===========================================================================

@pytest.fixture
def modalidad_trabajo_grado(db):
    """Crea la modalidad 'Trabajo de Grado' en la BD de prueba."""
    return Modalidad.objects.create(nombre="Trabajo de Grado")


@pytest.fixture
def modalidad_practicas(db):
    return Modalidad.objects.create(nombre="Prácticas Profesionales")


@pytest.fixture
def modalidad_laboratorio(db):
    return Modalidad.objects.create(nombre="Producto en Laboratorio")


@pytest.fixture
def modalidad_generica(db):
    return Modalidad.objects.create(nombre="Emprendimiento")


@pytest.fixture
def estudiante(db):
    return Usuario.objects.create_user(  # type: ignore
        username="est1",
        password="sigma2026",
        rol="ESTUDIANTE",
        email="est1@itm.edu.co",
    )


@pytest.fixture
def asesor(db):
    return Usuario.objects.create_user(  # type: ignore
        username="asesor1",
        password="sigma2026",
        rol="ASESOR",
        email="asesor1@itm.edu.co",
    )


@pytest.fixture
def comite(db):
    return Usuario.objects.create_user(  # type: ignore
        username="comite1",
        password="sigma2026",
        rol="COMITE",
    )


@pytest.fixture
def admin_pleno(db):
    return Usuario.objects.create_user(  # type: ignore
        username="admin1",
        password="sigma2026",
        rol="ADMIN",
        es_auxiliar=False,
    )


@pytest.fixture
def admin_auxiliar(db):
    return Usuario.objects.create_user(  # type: ignore
        username="aux1",
        password="sigma2026",
        rol="ADMIN",
        es_auxiliar=True,
    )


@pytest.fixture
def estudiante_2(db):
    return Usuario.objects.create_user(  # type: ignore
        username="est2",
        password="sigma2026",
        rol="ESTUDIANTE",
    )


@pytest.fixture
def postulacion_en_postulacion(db, estudiante, modalidad_trabajo_grado):
    """Postulación en estado inicial POSTULACION."""
    return Postulacion.objects.create(
        estudiante=estudiante,
        modalidad=modalidad_trabajo_grado,
    )


@pytest.fixture
def postulacion_en_proceso(db, estudiante, modalidad_trabajo_grado, asesor):
    """Postulación que ya llegó al estado EN_PROCESO."""
    p = Postulacion.objects.create(
        estudiante=estudiante,
        modalidad=modalidad_trabajo_grado,
        asesor=asesor,
        estado=EstadoProceso.EN_PROCESO,
    )
    return p


# ===========================================================================
# BLOQUE 1: Motor de estados
# ===========================================================================

class TestMotorEstados:
    """Pruebas para Postulacion.transicionar() y solicitar_correccion()."""

    def test_transicion_valida_postulacion_a_revision(
        self, postulacion_en_postulacion, asesor
    ):
        """Debe avanzar de POSTULACION a REVISION_DOCUMENTAL correctamente."""
        postulacion_en_postulacion.transicionar(
            nuevo_estado=EstadoProceso.REVISION_DOCUMENTAL,
            usuario=asesor,
            observacion="Documentos recibidos.",
        )
        assert postulacion_en_postulacion.estado == EstadoProceso.REVISION_DOCUMENTAL

    def test_transicion_crea_entrada_en_historial(
        self, postulacion_en_postulacion, asesor
    ):
        """Cada transición válida debe crear un registro en HistorialEstado."""
        postulacion_en_postulacion.transicionar(
            nuevo_estado=EstadoProceso.REVISION_DOCUMENTAL,
            usuario=asesor,
        )
        entrada = HistorialEstado.objects.get(
            postulacion=postulacion_en_postulacion,
            estado_nuevo=EstadoProceso.REVISION_DOCUMENTAL,
        )
        assert entrada.estado_anterior == EstadoProceso.POSTULACION
        assert entrada.es_correccion == False

    def test_transicion_invalida_lanza_excepcion(
        self, postulacion_en_postulacion, asesor
    ):
        """Intentar saltar estados directamente debe lanzar TransicionInvalida."""
        with pytest.raises(TransicionInvalida):
            postulacion_en_postulacion.transicionar(
                nuevo_estado=EstadoProceso.FINALIZADO,  # Salto ilegal
                usuario=asesor,
            )

    def test_rechazado_es_terminal_sin_transiciones(self):
        """El estado RECHAZADO no debe tener transiciones de salida."""
        clase = obtener_clase_estado(EstadoProceso.RECHAZADO)
        assert clase.es_terminal() is True
        assert clase.transiciones_permitidas == []

    def test_finalizado_es_terminal_sin_transiciones(self):
        """El estado FINALIZADO no debe tener transiciones de salida."""
        clase = obtener_clase_estado(EstadoProceso.FINALIZADO)
        assert clase.es_terminal() is True

    def test_rechazado_solo_alcanzable_desde_en_proceso_y_sustentacion(self):
        """RECHAZADO debe estar en las transiciones de EN_PROCESO, SUSTENTACION y REVISION_COMITE."""
        estados_que_permiten_rechazar = [
            estado
            for estado, transiciones in TRANSICIONES_VALIDAS.items()
            if EstadoProceso.RECHAZADO in transiciones
        ]
        assert set(estados_que_permiten_rechazar) == {
            EstadoProceso.EN_PROCESO,
            EstadoProceso.SUSTENTACION,
            EstadoProceso.REVISION_COMITE,
        }

    def test_transicion_con_correccion_pendiente_lanza_excepcion(
        self, postulacion_en_postulacion, asesor
    ):
        """Si requiere_correccion=True, transicionar() debe lanzar TransicionInvalida (Bloque 17)."""
        postulacion_en_postulacion.requiere_correccion = True
        postulacion_en_postulacion.observacion_correccion = "Falta el acta."
        postulacion_en_postulacion.save()

        with pytest.raises(TransicionInvalida):
            postulacion_en_postulacion.transicionar(
                nuevo_estado=EstadoProceso.REVISION_DOCUMENTAL,
                usuario=asesor,
            )

    def test_transiciones_disponibles_vacia_si_requiere_correccion(
        self, postulacion_en_postulacion
    ):
        """Si requiere_correccion=True, transiciones_disponibles debe retornar lista vacía [] (Bloque 17)."""
        postulacion_en_postulacion.requiere_correccion = True
        assert postulacion_en_postulacion.transiciones_disponibles == []

    def test_solicitar_correccion_no_cambia_estado(
        self, postulacion_en_postulacion, asesor
    ):
        """solicitar_correccion() debe dejar el proceso en el mismo estado."""
        estado_inicial = postulacion_en_postulacion.estado
        postulacion_en_postulacion.solicitar_correccion(
            usuario=asesor,
            observacion="El título del proyecto debe ser más descriptivo.",
        )
        assert postulacion_en_postulacion.estado == estado_inicial

    def test_solicitar_correccion_activa_el_flag(
        self, postulacion_en_postulacion, asesor
    ):
        """solicitar_correccion() debe marcar requiere_correccion=True."""
        postulacion_en_postulacion.solicitar_correccion(
            usuario=asesor,
            observacion="Necesita corregir la propuesta.",
        )
        assert postulacion_en_postulacion.requiere_correccion is True

    def test_solicitar_correccion_crea_historial_con_flag(
        self, postulacion_en_postulacion, asesor
    ):
        """La solicitud de corrección debe registrarse en historial con es_correccion=True."""
        postulacion_en_postulacion.solicitar_correccion(
            usuario=asesor,
            observacion="Ajustar el marco teórico.",
        )
        entrada = HistorialEstado.objects.filter(
            postulacion=postulacion_en_postulacion,
            es_correccion=True,
        ).first()
        assert entrada is not None
        assert entrada.estado_anterior == entrada.estado_nuevo

    def test_solicitar_correccion_observacion_vacia_lanza_error(
        self, postulacion_en_postulacion, asesor
    ):
        """solicitar_correccion() con observación vacía debe lanzar ValueError."""
        with pytest.raises(ValueError):
            postulacion_en_postulacion.solicitar_correccion(
                usuario=asesor,
                observacion="   ",
            )

    def test_transiciones_disponibles_refleja_estado_actual(
        self, postulacion_en_postulacion
    ):
        """transiciones_disponibles debe coincidir con TRANSICIONES_VALIDAS para el estado actual."""
        estado = postulacion_en_postulacion.estado
        assert (
            postulacion_en_postulacion.transiciones_disponibles
            == TRANSICIONES_VALIDAS[estado]
        )


# ===========================================================================
# BLOQUE 4: Estrategias de validación por modalidad
# ===========================================================================

class TestValidadoresModalidad:
    """Pruebas para las estrategias del patrón Strategy en validadores_modalidad.py."""

    def _crear_postulacion_con_documentos(self, postulacion, nombres_docs):
        """Helper: agrega documentos a una postulación por su nombre."""
        from core.models import Documento
        import tempfile
        for nombre in nombres_docs:
            Documento.objects.create(
                postulacion=postulacion,
                nombre=nombre,
                archivo="documentos/test_file.pdf",
            )

    def test_fabrica_devuelve_validador_correcto_para_trabajo_grado(
        self, modalidad_trabajo_grado
    ):
        """obtener_validador() debe devolver ValidadorTrabajoDeGrado para esa modalidad."""
        validador = obtener_validador("Trabajo de Grado")
        assert isinstance(validador, ValidadorTrabajoDeGrado)

    def test_fabrica_devuelve_validador_generico_para_modalidad_desconocida(self):
        """Para modalidades no registradas, debe devolver ValidadorGenerico."""
        validador = obtener_validador("Modalidad Inexistente")
        assert isinstance(validador, ValidadorGenerico)

    def test_validador_generico_siempre_es_valido(
        self, postulacion_en_postulacion
    ):
        """El validador genérico nunca debe devolver documentos faltantes."""
        validador = ValidadorGenerico()
        resultado = validador.validar_documentos(postulacion_en_postulacion)
        assert resultado.es_valido is True
        assert resultado.documentos_faltantes == []

    def test_validador_trabajo_grado_con_todos_los_docs(
        self, db, postulacion_en_postulacion
    ):
        """ValidadorTrabajoDeGrado debe aprobar cuando todos los documentos están presentes."""
        self._crear_postulacion_con_documentos(
            postulacion_en_postulacion,
            [
                "Propuesta de proyecto de grado",
                "Certificado de paz y salvo académico",
                "Carta de presentación al comité",
            ],
        )
        validador = ValidadorTrabajoDeGrado()
        resultado = validador.validar_documentos(postulacion_en_postulacion)
        assert resultado.es_valido is True
        assert resultado.documentos_faltantes == []

    def test_validador_trabajo_grado_con_docs_faltantes(
        self, db, postulacion_en_postulacion
    ):
        """ValidadorTrabajoDeGrado debe reportar los documentos faltantes."""
        self._crear_postulacion_con_documentos(
            postulacion_en_postulacion,
            ["Propuesta de proyecto de grado"],  # Faltan 2 documentos
        )
        validador = ValidadorTrabajoDeGrado()
        resultado = validador.validar_documentos(postulacion_en_postulacion)
        assert resultado.es_valido is False
        assert len(resultado.documentos_faltantes) == 2

    def test_validador_trabajo_grado_es_case_insensitive(
        self, db, postulacion_en_postulacion
    ):
        """La comparación de nombres de documentos debe ser case-insensitive."""
        self._crear_postulacion_con_documentos(
            postulacion_en_postulacion,
            [
                "PROPUESTA DE PROYECTO DE GRADO",  # Mayúsculas
                "certificado de paz y salvo académico",  # Minúsculas
                "Carta De Presentación Al Comité",  # Capitalizado
            ],
        )
        validador = ValidadorTrabajoDeGrado()
        resultado = validador.validar_documentos(postulacion_en_postulacion)
        assert resultado.es_valido is True

    def test_validador_practicas_con_docs_faltantes(
        self, db, postulacion_en_postulacion
    ):
        """ValidadorPracticasProfesionales debe detectar documentos faltantes."""
        # Solo subimos 2 de 4 documentos requeridos
        self._crear_postulacion_con_documentos(
            postulacion_en_postulacion,
            [
                "Carta de aceptación de la empresa",
                "Plan de trabajo aprobado por la empresa",
            ],
        )
        validador = ValidadorPracticasProfesionales()
        resultado = validador.validar_documentos(postulacion_en_postulacion)
        assert resultado.es_valido is False
        assert len(resultado.documentos_faltantes) == 2

    def test_resultado_validacion_bool_false_cuando_invalido(self):
        """ResultadoValidacion con es_valido=False debe ser falsy."""
        resultado = ResultadoValidacion(
            es_valido=False, documentos_faltantes=["Doc A"]
        )
        assert not resultado

    def test_resultado_validacion_bool_true_cuando_valido(self):
        """ResultadoValidacion con es_valido=True debe ser truthy."""
        resultado = ResultadoValidacion(es_valido=True)
        assert resultado


# ===========================================================================
# BLOQUE 3: Permisos por rol — aislamiento de datos
# ===========================================================================

@pytest.mark.django_db
class TestPermisosRolQueryset:
    """Pruebas de aislamiento de datos por rol en get_queryset()."""

    def test_estudiante_solo_ve_sus_propias_postulaciones(
        self, estudiante, estudiante_2, modalidad_trabajo_grado
    ):
        """Un estudiante nunca debe ver las postulaciones de otro estudiante."""
        Postulacion.objects.create(estudiante=estudiante, modalidad=modalidad_trabajo_grado)
        Postulacion.objects.create(estudiante=estudiante_2, modalidad=modalidad_trabajo_grado)

        client = APIClient()
        client.force_authenticate(user=estudiante)
        response = client.get("/api/postulaciones/")

        assert response.status_code == 200
        resultados = response.data.get("results", response.data)
        assert all(
            p["estudiante"] == estudiante.pk for p in resultados
        )
        assert len(resultados) == 1

    def test_asesor_solo_ve_postulaciones_asignadas(
        self, asesor, estudiante, estudiante_2, modalidad_trabajo_grado
    ):
        """Un asesor solo debe ver las postulaciones donde está asignado como asesor."""
        Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_trabajo_grado,
            asesor=asesor,
        )
        Postulacion.objects.create(
            estudiante=estudiante_2,
            modalidad=modalidad_trabajo_grado,
            # Sin asesor — no debe aparecer para el asesor
        )

        client = APIClient()
        client.force_authenticate(user=asesor)
        response = client.get("/api/postulaciones/")

        assert response.status_code == 200
        resultados = response.data.get("results", response.data)
        assert len(resultados) == 1

    def test_comite_ve_todos_los_procesos(
        self, comite, estudiante, estudiante_2, modalidad_trabajo_grado
    ):
        """El comité debe poder ver todos los procesos sin filtro."""
        Postulacion.objects.create(estudiante=estudiante, modalidad=modalidad_trabajo_grado)
        Postulacion.objects.create(estudiante=estudiante_2, modalidad=modalidad_trabajo_grado)

        client = APIClient()
        client.force_authenticate(user=comite)
        response = client.get("/api/postulaciones/")

        assert response.status_code == 200
        resultados = response.data.get("results", response.data)
        assert len(resultados) == 2

    def test_admin_auxiliar_no_puede_aprobar_transicion(
        self, admin_auxiliar, estudiante, modalidad_trabajo_grado
    ):
        """Un admin auxiliar no debe poder aplicar transiciones de estado (EsAsesorOComite)."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_trabajo_grado,
        )
        client = APIClient()
        client.force_authenticate(user=admin_auxiliar)
        response = client.post(
            f"/api/postulaciones/{postulacion.id}/transicionar/",
            {"nuevo_estado": EstadoProceso.REVISION_DOCUMENTAL},
        )
        # EsAsesorOComite rechaza a auxiliares — debe ser 403
        assert response.status_code == 403


# ===========================================================================
# BLOQUE 5: Señales — Notificaciones por correo
# ===========================================================================

@pytest.mark.django_db
class TestNotificacionesEmail:
    """Pruebas para las señales de notificación en signals.py."""

    def test_transicion_envia_email_al_estudiante(
        self, postulacion_en_postulacion, asesor
    ):
        """Al avanzar de estado, debe enviarse un correo al estudiante."""
        postulacion_en_postulacion.transicionar(
            nuevo_estado=EstadoProceso.REVISION_DOCUMENTAL,
            usuario=asesor,
            observacion="Revisando.",
        )
        assert len(mail.outbox) == 1
        assert "SIGMA ITM" in mail.outbox[0].subject
        assert postulacion_en_postulacion.estudiante.email in mail.outbox[0].to

    def test_correccion_envia_email_con_asunto_diferente(
        self, postulacion_en_postulacion, asesor
    ):
        """La solicitud de corrección debe enviar un email con asunto distinto al de avance."""
        postulacion_en_postulacion.solicitar_correccion(
            usuario=asesor,
            observacion="Ajustar la propuesta de proyecto.",
        )
        assert len(mail.outbox) == 1
        assert "observación" in mail.outbox[0].subject.lower() or "corrección" in mail.outbox[0].subject.lower()

    def test_no_envia_email_si_estudiante_sin_correo(
        self, db, modalidad_trabajo_grado, asesor
    ):
        """Si el estudiante no tiene email, no debe intentar enviar el correo."""
        estudiante_sin_email = Usuario.objects.create_user(  # type: ignore
            username="sinemail",
            password="sigma2026",
            rol="ESTUDIANTE",
            email="",
        )
        postulacion = Postulacion.objects.create(
            estudiante=estudiante_sin_email,
            modalidad=modalidad_trabajo_grado,
        )
        # No debe lanzar excepción ni enviar email
        postulacion.transicionar(
            nuevo_estado=EstadoProceso.REVISION_DOCUMENTAL,
            usuario=asesor,
        )
        assert len(mail.outbox) == 0


# ===========================================================================
# BLOQUE 16: Restricción de roles por etapa (PuedeGestionarEtapaActual)
# ===========================================================================

@pytest.mark.django_db
class TestPuedeGestionarEtapaActual:
    """Pruebas de RBAC granular por etapa para PuedeGestionarEtapaActual."""

    @pytest.fixture
    def asesor_otro(self, db):
        return Usuario.objects.create_user(  # type: ignore
            username="asesor_otro",
            password="sigma2026",
            rol="ASESOR",
            email="asesor_otro@itm.edu.co",
        )

    def test_comite_puede_transicionar_en_postulacion(
        self, comite, estudiante, modalidad_generica
    ):
        """Comité sí puede transicionar de POSTULACION a REVISION_DOCUMENTAL."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.POSTULACION,
        )
        client = APIClient()
        client.force_authenticate(user=comite)
        response = client.post(
            f"/api/postulaciones/{postulacion.id}/transicionar/",
            {"nuevo_estado": EstadoProceso.REVISION_DOCUMENTAL},
        )
        assert response.status_code == 200
        postulacion.refresh_from_db()
        assert postulacion.estado == EstadoProceso.REVISION_DOCUMENTAL

    def test_asesor_no_puede_transicionar_en_postulacion(
        self, asesor, estudiante, modalidad_generica
    ):
        """Un Asesor no debe poder transicionar un proceso en etapa POSTULACION."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.POSTULACION,
            asesor=asesor,
        )
        client = APIClient()
        client.force_authenticate(user=asesor)
        response = client.post(
            f"/api/postulaciones/{postulacion.id}/transicionar/",
            {"nuevo_estado": EstadoProceso.REVISION_DOCUMENTAL},
        )
        assert response.status_code == 403
        assert "Comité" in response.data.get("detail", "")

    def test_comite_no_puede_transicionar_en_proceso(
        self, comite, estudiante, modalidad_generica, asesor
    ):
        """El Comité no puede transicionar una postulación que está EN_PROCESO."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.EN_PROCESO,
            asesor=asesor,
        )
        client = APIClient()
        client.force_authenticate(user=comite)
        response = client.post(
            f"/api/postulaciones/{postulacion.id}/transicionar/",
            {"nuevo_estado": EstadoProceso.SUSTENTACION},
        )
        assert response.status_code == 403
        assert "asesor" in response.data.get("detail", "").lower()

    def test_asesor_asignado_puede_transicionar_en_proceso(
        self, asesor, estudiante, modalidad_generica
    ):
        """El asesor asignado sí puede avanzar de EN_PROCESO a SUSTENTACION."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.EN_PROCESO,
            asesor=asesor,
        )
        client = APIClient()
        client.force_authenticate(user=asesor)
        response = client.post(
            f"/api/postulaciones/{postulacion.id}/transicionar/",
            {"nuevo_estado": EstadoProceso.SUSTENTACION},
        )
        assert response.status_code == 200
        postulacion.refresh_from_db()
        assert postulacion.estado == EstadoProceso.SUSTENTACION

    def test_asesor_no_asignado_no_puede_transicionar_en_proceso(
        self, asesor, asesor_otro, estudiante, modalidad_generica
    ):
        """Un asesor no asignado a este proyecto no puede intervenir en EN_PROCESO."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.EN_PROCESO,
            asesor=asesor,
        )
        client = APIClient()
        client.force_authenticate(user=asesor_otro)
        response = client.post(
            f"/api/postulaciones/{postulacion.id}/transicionar/",
            {"nuevo_estado": EstadoProceso.SUSTENTACION},
        )
        assert response.status_code in [403, 404]

    def test_comite_puede_transicionar_en_revision_comite(
        self, comite, estudiante, modalidad_generica, asesor
    ):
        """El Comité sí puede dictar el fallo final en REVISION_COMITE (pasar a FINALIZADO)."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.REVISION_COMITE,
            asesor=asesor,
        )
        client = APIClient()
        client.force_authenticate(user=comite)
        response = client.post(
            f"/api/postulaciones/{postulacion.id}/transicionar/",
            {"nuevo_estado": EstadoProceso.FINALIZADO},
        )
        assert response.status_code == 200
        postulacion.refresh_from_db()
        assert postulacion.estado == EstadoProceso.FINALIZADO

    def test_admin_pleno_puede_transicionar_en_cualquier_etapa(
        self, admin_pleno, estudiante, modalidad_generica, asesor
    ):
        """El administrador pleno tiene autorización sobre cualquier etapa."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.EN_PROCESO,
            asesor=asesor,
        )
        client = APIClient()
        client.force_authenticate(user=admin_pleno)
        response = client.post(
            f"/api/postulaciones/{postulacion.id}/transicionar/",
            {"nuevo_estado": EstadoProceso.SUSTENTACION},
        )
        assert response.status_code == 200
        postulacion.refresh_from_db()
        assert postulacion.estado == EstadoProceso.SUSTENTACION

    def test_solicitar_correccion_respeta_rbac_por_etapa(
        self, comite, asesor, estudiante, modalidad_generica
    ):
        """En etapa POSTULACION, solo Comité puede pedir corrección; Asesor recibe 403."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.POSTULACION,
            asesor=asesor,
        )
        # Asesor intenta pedir corrección en etapa del Comité
        client_asesor = APIClient()
        client_asesor.force_authenticate(user=asesor)
        res_asesor = client_asesor.post(
            f"/api/postulaciones/{postulacion.id}/solicitar_correccion/",
            {"observacion": "Falta corregir la descripción inicial."},
        )
        assert res_asesor.status_code == 403

        # Comité intenta pedir corrección en etapa del Comité -> Éxito
        client_comite = APIClient()
        client_comite.force_authenticate(user=comite)
        res_comite = client_comite.post(
            f"/api/postulaciones/{postulacion.id}/solicitar_correccion/",
            {"observacion": "Falta corregir la descripción inicial."},
        )
        assert res_comite.status_code == 200
        postulacion.refresh_from_db()
        assert postulacion.requiere_correccion is True

    def test_transicionar_api_con_correccion_pendiente_devuelve_400(
        self, comite, estudiante, modalidad_generica
    ):
        """La API transicionar debe devolver HTTP 400 si requiere_correccion es True (Bloque 17)."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.POSTULACION,
            requiere_correccion=True,
            observacion_correccion="Corregir documentos primero.",
        )
        client = APIClient()
        client.force_authenticate(user=comite)
        res = client.post(
            f"/api/postulaciones/{postulacion.id}/transicionar/",
            {"nuevo_estado": EstadoProceso.REVISION_DOCUMENTAL},
        )
        assert res.status_code == 400
        assert "subsanar" in res.data.get("detail", "").lower() or "correcciones" in res.data.get("detail", "").lower()


# ===========================================================================
# BLOQUE 18: Endpoint y lógica de subsanación de correcciones
# ===========================================================================

@pytest.mark.django_db
class TestSubsanacionCorreccion:
    """Pruebas para el método Postulacion.subsanar_correccion y su endpoint."""

    def test_estudiante_puede_subsanar_correccion(
        self, estudiante, modalidad_generica
    ):
        """El estudiante titular debe poder marcar su corrección como subsanada."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.POSTULACION,
            requiere_correccion=True,
            observacion_correccion="Ajustar título y marco teórico.",
        )
        from django.core.files.uploadedfile import SimpleUploadedFile
        archivo = SimpleUploadedFile("corregido.pdf", b"%PDF-1.4...", content_type="application/pdf")
        client = APIClient()
        client.force_authenticate(user=estudiante)
        res = client.post(
            f"/api/postulaciones/{postulacion.id}/subsanar_correccion/",
            {"mensaje": "Se ajustaron las observaciones indicadas.", "archivo": archivo},
            format="multipart",
        )
        assert res.status_code == 200
        postulacion.refresh_from_db()
        assert postulacion.requiere_correccion is False
        assert postulacion.observacion_correccion == ""

        # Verificar auditoría en HistorialEstado
        historial = HistorialEstado.objects.filter(
            postulacion=postulacion, es_correccion=True
        ).order_by("-fecha").first()
        assert historial is not None
        assert "subsanada" in historial.observacion.lower()
        assert historial.realizado_por == estudiante

    def test_subsanar_sin_correccion_pendiente_devuelve_400(
        self, estudiante, modalidad_generica
    ):
        """Si el trámite no tiene correcciones pendientes, debe devolver HTTP 400."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.POSTULACION,
            requiere_correccion=False,
        )
        client = APIClient()
        client.force_authenticate(user=estudiante)
        res = client.post(
            f"/api/postulaciones/{postulacion.id}/subsanar_correccion/"
        )
        assert res.status_code == 400
        assert (
            "no tiene observaciones" in res.data.get("detail", "").lower()
            or "no hay correcciones" in res.data.get("detail", "").lower()
            or "subsanar" in res.data.get("detail", "").lower()
        )

    def test_asesor_o_comite_no_puede_subsanar(
        self, asesor, estudiante, modalidad_generica
    ):
        """Un usuario con rol ASESOR no puede llamar a subsanar_correccion (solo EsEstudiante)."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.EN_PROCESO,
            asesor=asesor,
            requiere_correccion=True,
            observacion_correccion="Revisar entregable 1.",
        )
        client = APIClient()
        client.force_authenticate(user=asesor)
        res = client.post(
            f"/api/postulaciones/{postulacion.id}/subsanar_correccion/"
        )
        assert res.status_code == 403

    def test_otro_estudiante_no_puede_subsanar(
        self, estudiante, estudiante_2, modalidad_generica
    ):
        """Un estudiante ajeno al trámite no puede subsanar el proceso de otro."""
        postulacion = Postulacion.objects.create(
            estudiante=estudiante,
            modalidad=modalidad_generica,
            estado=EstadoProceso.POSTULACION,
            requiere_correccion=True,
            observacion_correccion="Corregir documento.",
        )
        client = APIClient()
        client.force_authenticate(user=estudiante_2)
        res = client.post(
            f"/api/postulaciones/{postulacion.id}/subsanar_correccion/"
        )
        assert res.status_code in [403, 404]


@pytest.mark.django_db
class TestFlujoCompletoPuntaAPunta:
    """Verificación integral E2E con los usuarios semilla de SIGMA ITM:
    1. Postulación como estudiante (estudiante1 / sigma2026).
    2. Radicación de documento por el estudiante.
    3. Validación y visualización de documentos por Comité / Asesor.
    4. Solicitud de corrección por Comité.
    5. Bloqueo duro: intento de aprobar con corrección pendiente falla (HTTP 400).
    6. Subsanación por el estudiante (POST /subsanar_correccion/).
    7. Avance por Comité y RBAC por etapa (solo asesor asignado opera en EN_PROCESO).
    8. Avance a SUSTENTACION y FINALIZADO.
    9. Descarga de Certificado Oficial PDF por el estudiante.
    """

    def test_flujo_integral_postulacion_a_finalizado_y_certificado(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        from core.models import Modalidad, Rol, Usuario

        # 1. Crear usuarios y modalidades semilla
        estudiante = Usuario.objects.create_user(
            username="estudiante1",
            password="sigma2026",
            rol=Rol.ESTUDIANTE,
            first_name="Jorge",
            last_name="Bernal",
            programa_academico="Tecnología en Desarrollo de Software",
        )
        asesor = Usuario.objects.create_user(
            username="asesor1",
            password="sigma2026",
            rol=Rol.ASESOR,
            first_name="Miguel Antonio",
            last_name="Ojeda Enríquez",
        )
        comite = Usuario.objects.create_user(
            username="comite1",
            password="sigma2026",
            rol=Rol.COMITE,
            first_name="Jorge Iván",
            last_name="Bedoya Restrepo",
        )
        modalidad = Modalidad.objects.create(
            nombre="Trabajo de Grado",
            activa=True,
            requisitos=["Propuesta de trabajo de grado", "Certificado de paz y salvo académico"],
        )

        client_estudiante = APIClient()
        client_estudiante.force_authenticate(user=estudiante)

        client_comite = APIClient()
        client_comite.force_authenticate(user=comite)

        client_asesor = APIClient()
        client_asesor.force_authenticate(user=asesor)

        # 2. Estudiante postula a la modalidad
        res_post = client_estudiante.post(
            "/api/postulaciones/",
            {
                "modalidad": modalidad.id,
                "titulo_proyecto": "Plataforma Integral de Gestión Académica",
            },
        )
        assert res_post.status_code == 201, res_post.data
        postulacion_id = res_post.data["id"]

        # 3. Estudiante sube los 3 documentos obligatorios requeridos para Trabajo de Grado
        pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Title (Propuesta) >>\nendobj\ntrailer\n<< >>\n%%EOF"
        for doc_nombre in [
            "Propuesta de proyecto de grado",
            "Certificado de paz y salvo académico",
            "Carta de presentación al comité",
        ]:
            archivo = SimpleUploadedFile(f"{doc_nombre}.pdf", pdf_bytes, content_type="application/pdf")
            res_doc = client_estudiante.post(
                "/api/documentos/",
                {
                    "postulacion": postulacion_id,
                    "nombre": doc_nombre,
                    "archivo": archivo,
                },
                format="multipart",
            )
            assert res_doc.status_code == 201, res_doc.data

        # 4. Comité consulta la postulación y comprueba que los 3 documentos SÍ se ven
        res_detalle = client_comite.get(f"/api/postulaciones/{postulacion_id}/")
        assert res_detalle.status_code == 200
        docs = res_detalle.data.get("documentos", [])
        assert len(docs) == 3
        nombres_docs = [d["nombre"] for d in docs]
        assert "Propuesta de proyecto de grado" in nombres_docs
        assert "Certificado de paz y salvo académico" in nombres_docs
        assert "Carta de presentación al comité" in nombres_docs
        assert all("/media/documentos/" in d["archivo"] for d in docs)

        # 5. Comité avanza a REVISION_DOCUMENTAL
        res_trans_1 = client_comite.post(
            f"/api/postulaciones/{postulacion_id}/transicionar/",
            {"nuevo_estado": EstadoProceso.REVISION_DOCUMENTAL},
        )
        assert res_trans_1.status_code == 200, res_trans_1.data

        # 6. Comité solicita una corrección al estudiante
        res_corr = client_comite.post(
            f"/api/postulaciones/{postulacion_id}/solicitar_correccion/",
            {"observacion": "Falta incluir el marco teórico y ajustar la bibliografía según IEEE."},
        )
        assert res_corr.status_code == 200
        assert res_corr.data["requiere_correccion"] is True

        # 7. BLOQUEO DURO: Comité intenta avanzar a APROBACION con corrección pendiente -> DEBE FALLAR (400)
        res_intento_invalido = client_comite.post(
            f"/api/postulaciones/{postulacion_id}/transicionar/",
            {"nuevo_estado": EstadoProceso.APROBACION},
        )
        assert res_intento_invalido.status_code == 400
        assert "correcciones pendientes" in res_intento_invalido.data.get("detail", "").lower()

        # 8. Estudiante subsana la corrección (POST /subsanar_correccion/)
        archivo_sub = SimpleUploadedFile("subsanacion.pdf", pdf_bytes, content_type="application/pdf")
        res_subsanar = client_estudiante.post(
            f"/api/postulaciones/{postulacion_id}/subsanar_correccion/",
            {
                "mensaje": "Se corrigieron las observaciones y se incluye el marco teórico ajustado.",
                "archivo": archivo_sub,
            },
            format="multipart",
        )
        assert res_subsanar.status_code == 200
        assert res_subsanar.data["requiere_correccion"] is False
        assert res_subsanar.data["observacion_correccion"] == ""

        # 9. Con la corrección resuelta, Comité asigna el Asesor y avanza a APROBACION y EN_PROCESO
        post_obj = Postulacion.objects.get(id=postulacion_id)
        post_obj.asesor = asesor
        post_obj.save()

        res_aprob = client_comite.post(
            f"/api/postulaciones/{postulacion_id}/transicionar/",
            {"nuevo_estado": EstadoProceso.APROBACION},
        )
        assert res_aprob.status_code == 200

        res_en_proc = client_comite.post(
            f"/api/postulaciones/{postulacion_id}/transicionar/",
            {"nuevo_estado": EstadoProceso.EN_PROCESO},
        )
        assert res_en_proc.status_code == 200

        # 10. RBAC por etapa: Comité ya NO puede gestionar en EN_PROCESO (403 Forbidden)
        res_comite_bloqueado = client_comite.post(
            f"/api/postulaciones/{postulacion_id}/transicionar/",
            {"nuevo_estado": EstadoProceso.SUSTENTACION},
        )
        assert res_comite_bloqueado.status_code == 403
        assert "asesor" in res_comite_bloqueado.data.get("detail", "").lower()

        # 11. El Asesor asignado sí avanza a SUSTENTACION
        res_asesor_ok = client_asesor.post(
            f"/api/postulaciones/{postulacion_id}/transicionar/",
            {"nuevo_estado": EstadoProceso.SUSTENTACION},
        )
        assert res_asesor_ok.status_code == 200

        # 12. Asesor remite el proyecto al Comité tras sustentación aprobada
        res_rev_comite = client_asesor.post(
            f"/api/postulaciones/{postulacion_id}/transicionar/",
            {"nuevo_estado": EstadoProceso.REVISION_COMITE},
        )
        assert res_rev_comite.status_code == 200

        # 13. Comité avanza de REVISION_COMITE a FINALIZADO
        res_finalizar = client_comite.post(
            f"/api/postulaciones/{postulacion_id}/transicionar/",
            {"nuevo_estado": EstadoProceso.FINALIZADO},
        )
        assert res_finalizar.status_code == 200
        assert res_finalizar.data["estado"] == EstadoProceso.FINALIZADO

        # 13. Estudiante solicita su certificado oficial en PDF (GET /certificado/)
        res_cert = client_estudiante.get(f"/api/postulaciones/{postulacion_id}/certificado/")
        assert res_cert.status_code == 200
        assert res_cert["Content-Type"] == "application/pdf"
        assert "attachment; filename=" in res_cert["Content-Disposition"]
        assert res_cert.content.startswith(b"%PDF")


@pytest.mark.django_db
class TestAsignacionAsesorYListaAsesores:
    """Pruebas para los endpoints de asesores y asignación formal de asesor."""

    def test_obtener_lista_asesores_solo_retorna_asesores_activos(
        self, comite, estudiante, asesor
    ):
        client_comite = APIClient()
        client_comite.force_authenticate(user=comite)
        client_estudiante = APIClient()
        client_estudiante.force_authenticate(user=estudiante)

        # Crear otro asesor y un usuario no asesor
        Usuario.objects.create_user(
            username="asesor2",
            password="123",
            rol=Rol.ASESOR,
            first_name="Beatriz",
            last_name="Pinzón",
            is_active=True,
        )
        Usuario.objects.create_user(
            username="asesor_inactivo",
            password="123",
            rol=Rol.ASESOR,
            first_name="Inactivo",
            last_name="Docente",
            is_active=False,
        )

        # Comité consulta la lista de asesores
        res = client_comite.get("/api/usuarios/asesores/")
        assert res.status_code == 200
        nombres = [u["username"] for u in res.data]
        assert "asesor2" in nombres
        assert asesor.username in nombres
        assert "asesor_inactivo" not in nombres

        # Estudiante NO tiene permiso para consultar la lista de asesores
        res_estudiante = client_estudiante.get("/api/usuarios/asesores/")
        assert res_estudiante.status_code == 403

    def test_asignar_asesor_exitoso_y_registra_auditoria(
        self, comite, estudiante, postulacion_en_postulacion, asesor
    ):
        client_comite = APIClient()
        client_comite.force_authenticate(user=comite)
        client_estudiante = APIClient()
        client_estudiante.force_authenticate(user=estudiante)

        # Comité asigna asesor a la postulación
        url = f"/api/postulaciones/{postulacion_en_postulacion.id}/asignar_asesor/"
        res = client_comite.post(url, {"asesor_id": asesor.id})
        assert res.status_code == 200
        assert res.data["asesor"] == asesor.id

        postulacion_en_postulacion.refresh_from_db()
        assert postulacion_en_postulacion.asesor == asesor

        # Verifica auditoría
        ultimo_historial = HistorialEstado.objects.filter(
            postulacion=postulacion_en_postulacion
        ).last()
        assert "Asesor asignado:" in ultimo_historial.observacion

        # Estudiante NO puede asignar asesor
        res_est = client_estudiante.post(url, {"asesor_id": asesor.id})
        assert res_est.status_code == 403


@pytest.mark.django_db
class TestAnaliticaSegregadaPorRol:
    """Pruebas para GET /api/analitica/ y segregación de métricas por rol (Principio de Menor Privilegio)."""

    def test_analitica_asesor_solo_ve_sus_propios_proyectos(
        self, comite, estudiante, asesor, postulacion_en_postulacion, postulacion_en_proceso
    ):
        # postulacion_en_proceso tiene asesor asignado (asesor)
        # postulacion_en_postulacion no tiene asesor asignado
        client_asesor = APIClient()
        client_asesor.force_authenticate(user=asesor)

        res_asesor = client_asesor.get("/api/analitica/")
        assert res_asesor.status_code == 200
        assert res_asesor.data["es_asesor"] is True
        assert res_asesor.data["total_procesos"] == 1
        estados = [e["estado"] for e in res_asesor.data["por_estado"]]
        assert EstadoProceso.EN_PROCESO in estados
        assert EstadoProceso.POSTULACION not in estados

    def test_analitica_comite_ve_consolidado_institucional(
        self, comite, asesor, postulacion_en_postulacion, postulacion_en_proceso
    ):
        client_comite = APIClient()
        client_comite.force_authenticate(user=comite)

        res_comite = client_comite.get("/api/analitica/")
        assert res_comite.status_code == 200
        assert res_comite.data["es_asesor"] is False
        assert res_comite.data["total_procesos"] >= 2

    def test_analitica_estudiante_denegado(self, estudiante):
        client_estudiante = APIClient()
        client_estudiante.force_authenticate(user=estudiante)

        res = client_estudiante.get("/api/analitica/")
        assert res.status_code == 403


@pytest.mark.django_db
class TestCrudDocumentosYAsignacion:
    """Pruebas para CRUD de documentos con descripción, asignación con directriz y eliminación de postulación."""

    def test_estudiante_puede_crear_editar_eliminar_documento(
        self, estudiante, postulacion_en_postulacion
    ):
        client = APIClient()
        client.force_authenticate(user=estudiante)

        from django.core.files.uploadedfile import SimpleUploadedFile
        archivo = SimpleUploadedFile("propuesta.pdf", b"%PDF-1.4 test content", content_type="application/pdf")

        # 1. Crear documento con descripción
        res_create = client.post(
            "/api/documentos/",
            {
                "postulacion": str(postulacion_en_postulacion.id),
                "nombre": "Propuesta de proyecto de grado",
                "descripcion": "Versión 1.0 revisada",
                "archivo": archivo,
            },
            format="multipart",
        )
        assert res_create.status_code == 201
        doc_id = res_create.data["id"]
        assert res_create.data["descripcion"] == "Versión 1.0 revisada"

        # 2. Editar descripción vía PATCH
        res_patch = client.patch(
            f"/api/documentos/{doc_id}/",
            {"descripcion": "Versión 1.1 con firmas"},
            format="json",
        )
        assert res_patch.status_code == 200
        assert res_patch.data["descripcion"] == "Versión 1.1 con firmas"

        # 3. Eliminar documento vía DELETE
        res_del = client.delete(f"/api/documentos/{doc_id}/")
        assert res_del.status_code == 204
        assert not Documento.objects.filter(id=doc_id).exists()

    def test_asignar_asesor_guarda_mensaje_directriz(
        self, admin_pleno, asesor, postulacion_en_postulacion
    ):
        client = APIClient()
        client.force_authenticate(user=admin_pleno)

        res = client.post(
            f"/api/postulaciones/{postulacion_en_postulacion.id}/asignar_asesor/",
            {
                "asesor_id": asesor.id,
                "mensaje": "Acompañar al estudiante con enfoque en arquitectura cloud.",
            },
            format="json",
        )
        assert res.status_code == 200
        postulacion_en_postulacion.refresh_from_db()
        assert postulacion_en_postulacion.asesor == asesor
        assert "arquitectura cloud" in postulacion_en_postulacion.mensaje_asesor

    def test_eliminar_postulacion_en_postulacion_permitido(
        self, estudiante, postulacion_en_postulacion
    ):
        client = APIClient()
        client.force_authenticate(user=estudiante)

        res = client.delete(f"/api/postulaciones/{postulacion_en_postulacion.id}/")
        assert res.status_code == 204
        assert not Postulacion.objects.filter(id=postulacion_en_postulacion.id).exists()

    def test_eliminar_postulacion_en_proceso_bloqueado(
        self, estudiante, postulacion_en_proceso
    ):
        client = APIClient()
        client.force_authenticate(user=estudiante)

        res = client.delete(f"/api/postulaciones/{postulacion_en_proceso.id}/")
        assert res.status_code == 400
        assert Postulacion.objects.filter(id=postulacion_en_proceso.id).exists()


@pytest.mark.django_db
class TestAprobacionUsuariosPorAdmin:
    def test_registro_crea_usuario_inactivo_pendiente_aprobacion(self):
        client = APIClient()
        datos_registro = {
            "username": "nuevo_postulante",
            "password": "Password123*",
            "confirmar_password": "Password123*",
            "email": "postulante@correo.itm.edu.co",
            "first_name": "Nuevo",
            "last_name": "Postulante",
            "cedula": "1009876543",
            "programa_academico": "Ingeniería de Sistemas",
            "rol": "ESTUDIANTE",
        }
        res = client.post("/api/usuarios/registrar/", datos_registro, format="json")
        assert res.status_code == 201
        usuario = Usuario.objects.get(username="nuevo_postulante")
        assert usuario.is_active is False
        assert "aprobación" in res.data["mensaje"].lower()

    def test_login_con_usuario_inactivo_devuelve_401_con_mensaje_explicito(self):
        client = APIClient()
        usuario_inactivo = Usuario.objects.create_user(
            username="pendiente_ingreso",
            password="MiPassword123*",
            email="pendiente@itm.edu.co",
            rol="ESTUDIANTE",
            is_active=False,
        )
        res = client.post(
            "/api/auth/login/",
            {"username": "pendiente_ingreso", "password": "MiPassword123*"},
            format="json",
        )
        assert res.status_code == 401
        assert "pendiente de aprobación" in res.data["detail"]

    def test_admin_puede_listar_usuarios_pendientes(self, admin_user, estudiante):
        Usuario.objects.create_user(
            username="solicitante1",
            password="Password123*",
            email="solicitante1@itm.edu.co",
            rol="ESTUDIANTE",
            is_active=False,
        )
        client_admin = APIClient()
        client_admin.force_authenticate(user=admin_user)
        res_admin = client_admin.get("/api/usuarios/pendientes/")
        assert res_admin.status_code == 200
        assert any(u["username"] == "solicitante1" for u in res_admin.data)

        # No-admin no tiene permisos
        client_est = APIClient()
        client_est.force_authenticate(user=estudiante)
        res_est = client_est.get("/api/usuarios/pendientes/")
        assert res_est.status_code == 403

    def test_admin_puede_aprobar_usuario_y_permitir_login(self, admin_user):
        nuevo_user = Usuario.objects.create_user(
            username="estudiante_para_aprobar",
            password="Password123*",
            email="aprobar@itm.edu.co",
            rol="ESTUDIANTE",
            is_active=False,
        )
        client_admin = APIClient()
        client_admin.force_authenticate(user=admin_user)
        res_aprobacion = client_admin.post(f"/api/usuarios/{nuevo_user.id}/aprobar/")
        assert res_aprobacion.status_code == 200
        nuevo_user.refresh_from_db()
        assert nuevo_user.is_active is True

        # Ahora el usuario sí puede iniciar sesión con username
        client_anon = APIClient()
        res_login = client_anon.post(
            "/api/auth/login/",
            {"username": "estudiante_para_aprobar", "password": "Password123*"},
            format="json",
        )
        assert res_login.status_code == 200
        assert "access" in res_login.data

        # Y también puede iniciar sesión con su correo institucional
        res_login_email = client_anon.post(
            "/api/auth/login/",
            {"username": "aprobar@itm.edu.co", "password": "Password123*"},
            format="json",
        )
        assert res_login_email.status_code == 200
        assert "access" in res_login_email.data

    def test_admin_puede_rechazar_usuario(self, admin_user):
        nuevo_user = Usuario.objects.create_user(
            username="estudiante_para_rechazar",
            password="Password123*",
            email="rechazar@itm.edu.co",
            rol="ESTUDIANTE",
            is_active=False,
        )
        client_admin = APIClient()
        client_admin.force_authenticate(user=admin_user)
        res_rechazo = client_admin.post(
            f"/api/usuarios/{nuevo_user.id}/rechazar/",
            {"motivo": "No pertenece a la facultad de ingenierías"},
            format="json",
        )
        assert res_rechazo.status_code == 200
        assert not Usuario.objects.filter(username="estudiante_para_rechazar").exists()








