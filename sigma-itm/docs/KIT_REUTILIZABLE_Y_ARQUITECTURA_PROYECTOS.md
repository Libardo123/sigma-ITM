# 📦 Kit de Componentes, Patrones y Módulos Reutilizables (SIGMA ITM Boilerplate)

Este documento es una **guía de extracción arquitectónica**. Contiene los componentes, patrones de diseño y módulos más valiosos desarrollados en **SIGMA ITM** que pueden ser extraídos y reutilizados en cualquier proyecto futuro institucional o empresarial, sin importar el dominio de negocio.

---

## 1. Motor de Estados Finitos (Patrón State — GoF)
* **Ubicación en el proyecto:** [`backend/core/models.py`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/backend/core/models.py#L58-L130)
* **¿Para qué sirve en otros proyectos?:** Cualquier sistema que maneje trámites, solicitudes, compras, PQRS, matrículas o flujos de aprobación paso a paso requiere una máquina de estados para evitar que un registro salte etapas ilegalmente.

### Código Reutilizable:
```python
class TransicionInvalida(Exception):
    """Lanzada cuando se intenta una transición de estado no permitida."""
    pass

class EstadoBase:
    transiciones_permitidas: list[str] = []

    @classmethod
    def puede_transicionar_a(cls, nuevo_estado: str) -> bool:
        return nuevo_estado in cls.transiciones_permitidas

class EstadoPostulacion(EstadoBase):
    transiciones_permitidas = ["REVISION_DOCUMENTAL", "RECHAZADO"]

class EstadoRevision(EstadoBase):
    transiciones_permitidas = ["APROBADO", "POSTULACION"]  # Subsanación permitida

_REGISTRO_ESTADOS = {
    "POSTULACION": EstadoPostulacion,
    "REVISION_DOCUMENTAL": EstadoRevision,
}

def validar_transicion(estado_actual: str, nuevo_estado: str):
    manejador = _REGISTRO_ESTADOS.get(estado_actual, EstadoBase)
    if not manejador.puede_transicionar_a(nuevo_estado):
        raise TransicionInvalida(f"No se puede pasar de {estado_actual} a {nuevo_estado}")
```
* **Ventaja:** Principio Open/Closed (SOLID). Para agregar un nuevo estado en otro proyecto, solo creas una clase nueva sin romper la lógica existente.

---

## 2. Sistema de Roles y Permisos RBAC Dinámico
* **Ubicación en el proyecto:** [`backend/core/permissions.py`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/backend/core/permissions.py)
* **¿Para qué sirve en otros proyectos?:** Control de acceso basado en roles para APIs REST en Django, con discriminación de roles plenos vs. roles auxiliares/de solo lectura.

### Patrón Central (DRY):
```python
class Rol(models.TextChoices):
    ESTUDIANTE = "ESTUDIANTE", "Estudiante"
    DOCENTE = "DOCENTE", "Docente"
    ADMIN = "ADMIN", "Administrador"

# En el modelo Usuario:
@property
def es_admin(self) -> bool:
    return self.rol == Rol.ADMIN or self.is_superuser

# En permisos de Django REST:
class EsAdminPleno(BasePermission):
    def has_permission(self, request, view) -> bool:
        u = request.user
        return bool(u and u.is_authenticated and u.es_admin and not u.es_auxiliar)
```

---

## 3. Bitácora de Auditoría Inmutable (Event Sourcing Light)
* **Ubicación en el proyecto:** `HistorialEstado` en [`backend/core/models.py`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/backend/core/models.py)
* **¿Para qué sirve en otros proyectos?:** Para auditorías institucionales, cumplimiento legal o trazabilidad de "quién aprobó qué, cuándo y por qué".

### Esquema Reutilizable:
```python
class HistorialAuditoria(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entidad_id = models.UUIDField()
    estado_anterior = models.CharField(max_length=50)
    estado_nuevo = models.CharField(max_length=50)
    autor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    observaciones = models.TextField(blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha"]
```

---

## 4. Motor de Validación de Reglas Dinámicas (Patrón Strategy)
* **Ubicación en el proyecto:** [`backend/core/validadores_modalidad.py`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/backend/core/validadores_modalidad.py)
* **¿Para qué sirve en otros proyectos?:** Permite que diferentes tipos de solicitudes (ej. Beca, Convenio, Opción de Grado, Pasantía) tengan diferentes reglas de documentos obligatorios sin llenar el código de condicionales `if/else`.

### Patrón Strategy:
```python
@dataclass(frozen=True)
class ResultadoValidacion:
    es_valido: bool
    faltantes: list[str]

class ValidadorEstrategia(abc.ABC):
    documentos_obligatorios: list[str] = []
    def validar(self, expediente) -> ResultadoValidacion:
        nombres = set(expediente.documentos.values_list('nombre', flat=True))
        faltantes = [d for d in self.documentos_obligatorios if d not in nombres]
        return ResultadoValidacion(len(faltantes) == 0, faltantes)
```

---

## 5. Generador Oficial de Certificados PDF con Código QR
* **Ubicación en el proyecto:** `core/pdf_utils.py`
* **¿Para qué sirve en otros proyectos?:** Generar constancias, actas, diplomas o certificados verificables mediante escaneo de código QR contra la base de datos institucional.
* **Tecnología:** `ReportLab` + `qrcode`.

---

## 6. Sistema de Diseño Frontend Institucional (Tailwind CSS)
* **Ubicación en el proyecto:** [`frontend/tailwind.config.js`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/frontend/tailwind.config.js) y [`frontend/src/index.css`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/frontend/src/index.css)
* **Tokens oficiales listos para copiar a cualquier proyecto:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        itm: {
          'blue-dark': '#001340',     // Fondo Sidebar / Navbar
          blue: '#011C5B',            // Botones e identidad primaria
          purple: '#661081',          // Acentos y estados
          'purple-light': '#910581',  // Textos destacados
          gray: '#C6C6C6',            // Tipografía de alto contraste
        }
      }
    }
  }
}
```
* **Distintivo de Marca Especial (Insignia / Avatar):**
  `bg-gradient-to-tr from-itm-purple via-indigo-600 to-sky-500 text-white font-black border border-white/20 shadow-md`

---

## 7. Componentes de UI Altamente Reutilizables
* **Layout Maestro con Menú Lateral Accesible:** [`frontend/src/components/Layout.jsx`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/frontend/src/components/Layout.jsx) — Cascarón completo responsive para aplicaciones administrativas con RBAC.
* **Visor Universal de Documentos:** [`frontend/src/components/ModalVisorDocumento.jsx`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/frontend/src/components/ModalVisorDocumento.jsx) — Permite previsualizar PDFs, imágenes JPG/PNG y textos sin abrir ventanas externas, con zoom y descarga.
* **Línea de Tiempo de Etapas (Timeline):** [`frontend/src/components/Timeline.jsx`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/frontend/src/components/Timeline.jsx) — Muestra al usuario de forma reactiva en qué etapa se encuentra su solicitud.

---

## 8. Generadores Automatizados de Diagramas en Alta Resolución (Headless Puppeteer)
* **Ubicación en el proyecto:** [`frontend/generate_vertical_graph.mjs`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/frontend/generate_vertical_graph.mjs) y [`frontend/generate_light_diagrams.mjs`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/frontend/generate_light_diagrams.mjs)
* **¿Para qué sirve?:** Generar infografías y grafos técnicos en resolución 4K a partir de plantillas HTML/CSS en segundos, evitando diseñar diagramas manualmente en Canva o Visio.

---

## 9. Script de Simulación E2E de Flujo Completo
* **Ubicación en el proyecto:** [`backend/scripts/simulacion_flujo_completo.py`](file:///c:/Users/liba-/OneDrive/Escritorio/1.0ITM_2026-2/Proyecto%20jorge/sigma-itm-skeleton/sigma-itm/backend/scripts/simulacion_flujo_completo.py)
* **¿Para qué sirve?:** Antes de entregar o presentar un proyecto, este script crea usuarios de prueba automáticamente, radica una solicitud, la aprueba en cada rol, prueba las devoluciones y emite el certificado final, comprobando la integridad total de la base de datos en menos de 5 segundos.
