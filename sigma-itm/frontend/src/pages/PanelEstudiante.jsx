/**
 * PanelEstudiante.jsx — SIGMA ITM
 *
 * Panel principal del estudiante:
 * 1. Muestra y gestiona su proceso activo de opción de grado.
 * 2. Permite consultar el historial de proyectos y opciones de grado anteriores.
 * 3. Formulario integral para radicar una nueva postulación entre las 10 modalidades oficiales
 *    del ITM con datos completos del estudiante, propuesta y carga de documento inicial.
 */

import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import EstadoBadge from "../components/EstadoBadge";
import ModalVisorDocumento, { forzarDescargaArchivo } from "../components/ModalVisorDocumento";
import HistorialVersionesDocumento from "../components/HistorialVersionesDocumento";
import Timeline from "../components/Timeline";
import { useAuth } from "../context/AuthContext";
import { MODALIDADES_OFICIALES, obtenerInfoModalidad } from "../constants/modalidades";
import FichaModalidadProyecto from "../components/FichaModalidadProyecto";

const TIPOS_PERMITIDOS = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Resuelve la URL absoluta del archivo para descarga o visualización en navegador.
 */
function obtenerUrlDocumento(urlArchivo) {
  if (!urlArchivo) return "#";
  if (urlArchivo.startsWith("http://") || urlArchivo.startsWith("https://")) {
    return urlArchivo;
  }
  const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  const hostBase = apiBase.replace(/\/api\/?$/, "");
  const rutaLimpia = urlArchivo.startsWith("/") ? urlArchivo : `/${urlArchivo}`;
  return `${hostBase}${rutaLimpia}`;
}

/**
 * Formatea una fecha ISO a formato local es-CO legible.
 */
function formatearFecha(fechaIso) {
  if (!fechaIso) return "";
  return new Date(fechaIso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Resuelve la información del destinatario legítimo del documento según la etapa activa y asignación.
 */
function obtenerDestinatarioDocumento(proceso) {
  if (!proceso) {
    return {
      pill: "ENVÍO INSTITUCIONAL",
      titulo: "Coordinación ITM",
      subtitulo: "Gestión documental de tu proceso de grado.",
      icono: "🏢",
    };
  }
  switch (proceso.estado) {
    case "POSTULACION":
    case "REVISION_DOCUMENTAL":
      return {
        pill: "ENVÍO A COORDINACIÓN / ADMINISTRACIÓN",
        titulo: "Coordinación de Trabajos de Grado / Administrador",
        subtitulo: "Revisión y aval de los requisitos iniciales reglamentarios.",
        icono: "🏢",
      };
    case "APROBACION":
      return {
        pill: "ENVÍO AL ADMINISTRADOR DE MODALIDADES",
        titulo: "Administración de Modalidades ITM",
        subtitulo: "Aprobación de requisitos y formalización de docente asesor.",
        icono: "👔",
      };
    case "EN_PROCESO":
      return {
        pill: `ENVÍO AL DOCENTE ASESOR • ${proceso.asesor_nombre || "Asesor Asignado"}`,
        titulo: proceso.asesor_nombre ? `Docente Asesor: ${proceso.asesor_nombre}` : "Docente Asesor Asignado",
        subtitulo: proceso.asesor_email ? `Correo: ${proceso.asesor_email}` : "Tutoría técnica y seguimiento continuo de entregables.",
        icono: "👨‍🏫",
      };
    case "SUSTENTACION":
      return {
        pill: "ENVÍO A JURADOS EVALUADORES Y ASESOR",
        titulo: "Jurados Evaluadores y Docente Asesor",
        subtitulo: "Entregables y documentación para la sesión de sustentación y calificación.",
        icono: "📋",
      };
    case "REVISION_COMITE":
      return {
        pill: "ENVÍO AL COMITÉ DE TRABAJOS DE GRADO",
        titulo: "Comité de Trabajos de Grado ITM",
        subtitulo: "Revisión final de acta de sustentación y cierre institucional.",
        icono: "🏛️",
      };
    default:
      return {
        pill: "ENVÍO INSTITUCIONAL",
        titulo: "Evaluadores Asignados del Proyecto",
        subtitulo: "Expediente digital de opción de grado.",
        icono: "📁",
      };
  }
}

function FileUpload({ postulacionId, onDocumentoSubido }) {
  const [archivo, setArchivo] = useState(null);
  const [nombre, setNombre] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [exitoso, setExitoso] = useState(false);
  const inputRef = useRef(null);

  const validarArchivo = (file) => {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return "Solo se aceptan archivos PDF, DOCX, JPG o PNG.";
    }
    if (file.size > TAMANO_MAXIMO_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return `El archivo pesa ${mb} MB. El máximo permitido es 10 MB.`;
    }
    return "";
  };

  const handleArchivoSeleccionado = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExitoso(false);
    const errorValidacion = validarArchivo(file);
    if (errorValidacion) {
      setErrorArchivo(errorValidacion);
      setArchivo(null);
      return;
    }
    setErrorArchivo("");
    setArchivo(file);
    if (!nombre) setNombre(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleSubir = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setErrorArchivo("Selecciona un archivo primero.");
      return;
    }
    if (!nombre.trim()) {
      setErrorArchivo("El nombre del documento es obligatorio.");
      return;
    }

    setSubiendo(true);
    setErrorArchivo("");
    setExitoso(false);

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombre", nombre.trim());
    formData.append("postulacion", postulacionId);

    try {
      await api.post("/documentos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExitoso(true);
      setArchivo(null);
      setNombre("");
      if (inputRef.current) inputRef.current.value = "";
      onDocumentoSubido();
    } catch (err) {
      const detalle =
        err.response?.data?.archivo?.[0] ||
        err.response?.data?.detail ||
        "No se pudo subir el documento. Intenta de nuevo.";
      setErrorArchivo(detalle);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-8 mb-6 border-t-4 border-itm-purple">
      <h3 className="text-xl font-bold text-itm-blue mb-4">Subir Documento Requerido</h3>
      <form onSubmit={handleSubir} noValidate>
        <label htmlFor="doc-nombre" className="block text-sm font-semibold text-itm-blue mb-1">
          Nombre del documento
        </label>
        <input
          id="doc-nombre"
          type="text"
          className="w-full bg-white/70 border border-slate-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Propuesta de proyecto de grado"
          aria-describedby="doc-tipo-info"
        />

        <label htmlFor="doc-archivo" className="block text-sm font-semibold text-itm-blue mb-1">
          Archivo <span id="doc-tipo-info" className="font-normal text-slate-500">(PDF, DOCX, JPG o PNG — máx. 10 MB)</span>
        </label>
        <input
          id="doc-archivo"
          type="file"
          ref={inputRef}
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          className="block w-full text-sm text-slate-500 mb-4 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-itm-blue/10 file:text-itm-blue hover:file:bg-itm-blue/20 transition-all cursor-pointer"
          onChange={handleArchivoSeleccionado}
          aria-describedby="doc-tipo-info"
        />

        {errorArchivo && (
          <p role="alert" className="text-red-600 font-medium text-sm mb-4 border-l-2 border-red-500 pl-2">
            {errorArchivo}
          </p>
        )}

        {exitoso && (
          <p role="status" className="text-emerald-600 font-semibold text-sm mb-4 border-l-2 border-emerald-500 pl-2">
            ✓ Documento subido correctamente.
          </p>
        )}

        <button
          type="submit"
          disabled={subiendo || !archivo}
          className="w-full bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow transition-all duration-300"
          aria-busy={subiendo}
        >
          {subiendo ? "Subiendo archivo..." : "Subir documento"}
        </button>
      </form>
    </div>
  );
}

export default function PanelEstudiante() {
  const { usuario } = useAuth();
  const [postulaciones, setPostulaciones] = useState(null);
  const [procesoSeleccionadoId, setProcesoSeleccionadoId] = useState(null);
  const [modalidades, setModalidades] = useState([]);
  const [modalidadId, setModalidadId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcionPropuesta, setDescripcionPropuesta] = useState("");
  const [semestreEstudiante, setSemestreEstudiante] = useState("6° Semestre");
  const [telefonoEstudiante, setTelefonoEstudiante] = useState("300 123 4567");

  // Documentos iniciales adjuntos en la radicación
  const [documentosIniciales, setDocumentosIniciales] = useState([
    { id: 1, nombre: "Propuesta de proyecto de grado", archivo: null },
    { id: 2, nombre: "Certificado de paz y salvo académico", archivo: null },
    { id: 3, nombre: "Carta de presentación al comité", archivo: null },
  ]);
  const [errorDocumentosIniciales, setErrorDocumentosIniciales] = useState("");

  // Gestor Documental CRUD en el Estudiante
  const [nuevoDocNombre, setNuevoDocNombre] = useState("");
  const [nuevoDocDescripcion, setNuevoDocDescripcion] = useState("");
  const [nuevoDocArchivo, setNuevoDocArchivo] = useState(null);
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [errorSubiendoDoc, setErrorSubiendoDoc] = useState("");
  const [exitoSubiendoDoc, setExitoSubiendoDoc] = useState(false);
  const inputNuevoDocRef = useRef(null);

  // Edición de descripción inline
  const [docEnEdicionId, setDocEnEdicionId] = useState(null);
  const [descripcionEnEdicion, setDescripcionEnEdicion] = useState("");
  const [guardandoDescripcion, setGuardandoDescripcion] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [errorCarga, setErrorCarga] = useState("");
  const [historial, setHistorial] = useState([]);
  const [subsanando, setSubsanando] = useState(false);
  const [errorSubsanacion, setErrorSubsanacion] = useState("");

  // Modal de Subsanación con mensaje y archivo obligatorios
  const [modalSubsanacion, setModalSubsanacion] = useState({
    abierto: false,
    mensaje: "",
    archivo: null,
    enviando: false,
    error: "",
  });

  // Edición del título del proyecto (CRUD en Estudiante)
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [nuevoTituloProyecto, setNuevoTituloProyecto] = useState("");
  const [guardandoTitulo, setGuardandoTitulo] = useState(false);
  const [errorTitulo, setErrorTitulo] = useState("");

  const [validacionDocs, setValidacionDocs] = useState(null);
  const [cargandoValidacion, setCargandoValidacion] = useState(false);
  const [descargandoCertificado, setDescargandoCertificado] = useState(false);
  const [documentoAVisualizar, setDocumentoAVisualizar] = useState(null);
  const [errorCertificado, setErrorCertificado] = useState("");
  const [mostrarNuevaPostulacion, setMostrarNuevaPostulacion] = useState(false);
  const [pestanaActual, setPestanaActual] = useState("activo"); // 'activo' | 'historial'
  const [historialItemVisible, setHistorialItemVisible] = useState({});


  const cargar = async () => {
    setErrorCarga("");
    try {
      const { data } = await api.get("/postulaciones/");
      const lista = data.results ?? data;
      setPostulaciones(lista);
      if (lista.length > 0 && !procesoSeleccionadoId) {
        // Seleccionar por defecto el primer proceso ACTIVO, si existe
        const activo = lista.find((p) => !["FINALIZADO", "RECHAZADO"].includes(p.estado));
        setProcesoSeleccionadoId(activo ? activo.id : lista[0].id);
      }
    } catch {
      setErrorCarga("No se pudo cargar tu proceso. Verifica tu conexión e intenta de nuevo.");
      setPostulaciones([]);
    }
  };

  const cargarModalidades = async () => {
    try {
      const { data } = await api.get("/modalidades/", { params: { activa: true } });
      setModalidades(data.results ?? data);
    } catch {
      setModalidades([]);
    }
  };

  useEffect(() => {
    cargar();
    cargarModalidades();

    const handleFocus = () => {
      cargar();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Clasificación de procesos: activos vs históricos (finalizados / rechazados)
  const procesosActivos = postulaciones
    ? postulaciones.filter((p) => !["FINALIZADO", "RECHAZADO"].includes(p.estado))
    : [];
  const procesosHistoricos = postulaciones
    ? postulaciones.filter((p) => ["FINALIZADO", "RECHAZADO"].includes(p.estado))
    : [];

  // Proceso activo o actualmente en vista
  const proceso =
    postulaciones?.find((p) => p.id === procesoSeleccionadoId) ||
    procesosActivos[0] ||
    postulaciones?.[0];

  const cargarValidacion = async (postulacionId, silencioso = false) => {
    if (!postulacionId) return;
    if (!silencioso) setCargandoValidacion(true);
    try {
      const { data } = await api.get(`/postulaciones/${postulacionId}/validar_documentos/`);
      setValidacionDocs(data);
    } catch {
      setValidacionDocs(null);
    } finally {
      if (!silencioso) setCargandoValidacion(false);
    }
  };

  useEffect(() => {
    if (proceso) {
      cargarValidacion(proceso.id, !!validacionDocs);
      api
        .get(`/postulaciones/${proceso.id}/historial/`)
        .then(({ data }) => setHistorial(data))
        .catch(() => setHistorial([]));
    }
  }, [
    proceso?.id,
    proceso?.actualizada_en,
    proceso?.estado,
    proceso?.requiere_correccion,
    proceso?.asesor_nombre,
  ]);

  const handleDescargarCertificado = async (targetProceso = proceso) => {
    if (!targetProceso) return;
    setDescargandoCertificado(true);
    setErrorCertificado("");

    try {
      const respuesta = await api.get(`/postulaciones/${targetProceso.id}/certificado/`, {
        responseType: "blob",
      });

      let nombreArchivo = `certificado_finalizacion_${targetProceso.modalidad_nombre || "grado"}.pdf`;
      const disposition = respuesta.headers?.["content-disposition"];
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
        if (match && match[1]) {
          nombreArchivo = match[1].trim();
        }
      }

      const blob = new Blob([respuesta.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No se pudo descargar el certificado de finalización. Por favor, intenta de nuevo.";
      setErrorCertificado(detalle);
    } finally {
      setDescargandoCertificado(false);
    }
  };

  const abrirModalSubsanacion = () => {
    setModalSubsanacion({
      abierto: true,
      mensaje: "",
      archivo: null,
      enviando: false,
      error: "",
    });
  };

  const cerrarModalSubsanacion = () => {
    if (modalSubsanacion.enviando) return;
    setModalSubsanacion({
      abierto: false,
      mensaje: "",
      archivo: null,
      enviando: false,
      error: "",
    });
  };

  const [modalSubsanacionExito, setModalSubsanacionExito] = useState({
    abierto: false,
    mensaje: "",
  });

  const handleEnviarSubsanacionModal = async (e) => {
    e.preventDefault();
    if (!proceso) return;

    const mensajeLimpio = (modalSubsanacion.mensaje || "").trim();
    if (mensajeLimpio.length < 10) {
      setModalSubsanacion((prev) => ({
        ...prev,
        error: "Debes ingresar una explicación detallada de al menos 10 caracteres sobre los ajustes realizados.",
      }));
      return;
    }

    if (!modalSubsanacion.archivo) {
      setModalSubsanacion((prev) => ({
        ...prev,
        error: "Es obligatorio adjuntar el archivo o documento con las correcciones aplicadas para poder subsanar.",
      }));
      return;
    }

    setModalSubsanacion((prev) => ({ ...prev, enviando: true, error: "" }));

    try {
      const formData = new FormData();
      formData.append("mensaje", mensajeLimpio);
      formData.append("archivo", modalSubsanacion.archivo);

      await api.post(`/postulaciones/${proceso.id}/subsanar_correccion/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setModalSubsanacion({
        abierto: false,
        mensaje: "",
        archivo: null,
        enviando: false,
        error: "",
      });

      setModalSubsanacionExito({
        abierto: true,
        mensaje: mensajeLimpio,
      });

      await cargar();
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No se pudo radicar la subsanación. Verifica los datos e intenta de nuevo.";
      setModalSubsanacion((prev) => ({
        ...prev,
        enviando: false,
        error: detalle,
      }));
    }
  };

  const handleGuardarTitulo = async () => {
    if (!proceso) return;
    const tituloLimpio = nuevoTituloProyecto.trim();
    if (tituloLimpio.length < 5) {
      setErrorTitulo("El título debe contener al menos 5 caracteres.");
      return;
    }
    setGuardandoTitulo(true);
    setErrorTitulo("");
    try {
      await api.patch(`/postulaciones/${proceso.id}/`, {
        titulo_proyecto: tituloLimpio,
      });
      setEditandoTitulo(false);
      await cargar();
    } catch (err) {
      setErrorTitulo(
        err.response?.data?.detail || "No se pudo actualizar el título del proyecto."
      );
    } finally {
      setGuardandoTitulo(false);
    }
  };

  const handleDocumentoSubido = async () => {
    await cargar();
    if (proceso?.id) {
      await cargarValidacion(proceso.id);
    }
  };

  const [modalRadicarDoc, setModalRadicarDoc] = useState({
    abierto: false,
    nombre: "",
    descripcion: "",
    archivo: null,
    subiendo: false,
    error: "",
  });

  const [modalReemplazarDoc, setModalReemplazarDoc] = useState({
    abierto: false,
    docId: null,
    docNombre: "",
    descripcion: "",
    motivo: "",
    versionActual: 1,
    versionTarget: null, // null = cargar nueva versión (ej: v4). Objeto { id, numero_version } = sustituir archivo de esa versión específica
    archivo: null,
    enviando: false,
    error: "",
  });

  const handleEnviarModalRadicarDoc = async (e) => {
    e.preventDefault();
    if (!proceso) return;
    if (!modalRadicarDoc.archivo) {
      setModalRadicarDoc((prev) => ({
        ...prev,
        error: "Debes seleccionar un archivo para radicar.",
      }));
      return;
    }
    if (!modalRadicarDoc.nombre.trim()) {
      setModalRadicarDoc((prev) => ({
        ...prev,
        error: "El nombre del documento es obligatorio.",
      }));
      return;
    }

    setModalRadicarDoc((prev) => ({ ...prev, subiendo: true, error: "" }));

    const formData = new FormData();
    formData.append("postulacion", proceso.id);
    formData.append("nombre", modalRadicarDoc.nombre.trim());
    formData.append("descripcion", modalRadicarDoc.descripcion.trim());
    formData.append("archivo", modalRadicarDoc.archivo);

    try {
      await api.post("/documentos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExitoSubiendoDoc(true);
      setModalRadicarDoc({
        abierto: false,
        nombre: "",
        descripcion: "",
        archivo: null,
        subiendo: false,
        error: "",
      });
      await cargar();
      await cargarValidacion(proceso.id);
    } catch (err) {
      const detalle =
        err.response?.data?.archivo?.[0] ||
        err.response?.data?.detail ||
        "No se pudo subir el documento. Por favor intenta de nuevo.";
      setModalRadicarDoc((prev) => ({
        ...prev,
        subiendo: false,
        error: detalle,
      }));
    }
  };

  const handleEnviarReemplazoDoc = async (e) => {
    e.preventDefault();
    if (!modalReemplazarDoc.archivo || !modalReemplazarDoc.docId) {
      setModalReemplazarDoc((prev) => ({
        ...prev,
        error: "Debes seleccionar el archivo que sustituirá al actual.",
      }));
      return;
    }

    setModalReemplazarDoc((prev) => ({ ...prev, enviando: true, error: "" }));

    const formData = new FormData();
    formData.append("archivo", modalReemplazarDoc.archivo);

    try {
      if (modalReemplazarDoc.versionTarget) {
        // Modo: Sustituir archivo de una versión específica (corrección de error al subir)
        formData.append("version_id", modalReemplazarDoc.versionTarget.id || "");
        formData.append("numero_version", modalReemplazarDoc.versionTarget.numero_version);
        const motivoEnvio =
          modalReemplazarDoc.motivo.trim() ||
          `Corrección de archivo en versión v${modalReemplazarDoc.versionTarget.numero_version}`;
        formData.append("motivo", motivoEnvio);
        if (modalReemplazarDoc.descripcion) {
          formData.append("descripcion", modalReemplazarDoc.descripcion.trim());
        }

        await api.post(`/documentos/${modalReemplazarDoc.docId}/reemplazar-version/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Modo: Cargar nueva versión incremental (ej: v4, v5, etc.)
        if (modalReemplazarDoc.descripcion !== undefined) {
          formData.append("descripcion", modalReemplazarDoc.descripcion.trim());
        }
        if (modalReemplazarDoc.motivo !== undefined) {
          formData.append("motivo", modalReemplazarDoc.motivo.trim());
        }

        await api.patch(`/documentos/${modalReemplazarDoc.docId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setModalReemplazarDoc({
        abierto: false,
        docId: null,
        docNombre: "",
        descripcion: "",
        motivo: "",
        versionActual: 1,
        versionTarget: null,
        archivo: null,
        enviando: false,
        error: "",
      });
      await cargar();
      if (proceso?.id) {
        await cargarValidacion(proceso.id);
      }
    } catch (err) {
      const detalle =
        err.response?.data?.archivo?.[0] ||
        err.response?.data?.detail ||
        "No se pudo guardar el archivo. Por favor intenta de nuevo.";
      setModalReemplazarDoc((prev) => ({
        ...prev,
        enviando: false,
        error: detalle,
      }));
    }
  };

  const handleEliminarVersion = async (docId, version) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar la versión v${version.numero_version} de este documento? Esta acción eliminará dicho registro del expediente.`
    );
    if (!confirmacion) return;

    try {
      await api.post(`/documentos/${docId}/eliminar-version/`, {
        version_id: version.id,
        numero_version: version.numero_version,
      });
      await cargar();
      if (proceso?.id) {
        await cargarValidacion(proceso.id);
      }
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No se pudo eliminar la versión del documento. Por favor intenta de nuevo.";
      alert(detalle);
    }
  };

  const handleSubirNuevoDocumento = async (e) => {
    e.preventDefault();
    if (!proceso) return;
    if (!nuevoDocArchivo) {
      setErrorSubiendoDoc("Debes seleccionar un archivo para radicar.");
      return;
    }
    if (!nuevoDocNombre.trim()) {
      setErrorSubiendoDoc("El nombre del documento es obligatorio.");
      return;
    }

    setSubiendoDoc(true);
    setErrorSubiendoDoc("");
    setExitoSubiendoDoc(false);

    const formData = new FormData();
    formData.append("postulacion", proceso.id);
    formData.append("nombre", nuevoDocNombre.trim());
    formData.append("descripcion", nuevoDocDescripcion.trim());
    formData.append("archivo", nuevoDocArchivo);

    try {
      await api.post("/documentos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExitoSubiendoDoc(true);
      setNuevoDocNombre("");
      setNuevoDocDescripcion("");
      setNuevoDocArchivo(null);
      if (inputNuevoDocRef.current) inputNuevoDocRef.current.value = "";
      await cargar();
      await cargarValidacion(proceso.id);
    } catch (err) {
      const detalle =
        err.response?.data?.archivo?.[0] ||
        err.response?.data?.detail ||
        "No se pudo subir el documento. Por favor intenta de nuevo.";
      setErrorSubiendoDoc(detalle);
    } finally {
      setSubiendoDoc(false);
    }
  };

  const handleGuardarDescripcion = async (docId) => {
    setGuardandoDescripcion(true);
    try {
      await api.patch(`/documentos/${docId}/`, {
        descripcion: descripcionEnEdicion,
      });
      setDocEnEdicionId(null);
      setDescripcionEnEdicion("");
      await cargar();
    } catch (err) {
      alert(err.response?.data?.detail || "No se pudo actualizar la descripción.");
    } finally {
      setGuardandoDescripcion(false);
    }
  };

  const handleEliminarDocumento = async (docId, docNombre) => {
    if (
      !window.confirm(
        `¿Confirmas que deseas eliminar el documento "${docNombre}" de tu expediente?`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/documentos/${docId}/`);
      await cargar();
      if (proceso?.id) {
        await cargarValidacion(proceso.id);
      }
    } catch (err) {
      alert(
        err.response?.data?.detail || "No se pudo eliminar el documento de tu proceso."
      );
    }
  };

  const handleCancelarPostulacion = async (postulacionId) => {
    if (
      !window.confirm(
        "¿Estás seguro de cancelar y eliminar permanentemente esta solicitud de grado? Esta acción borrará la propuesta y sus anexos."
      )
    ) {
      return;
    }
    try {
      await api.delete(`/postulaciones/${postulacionId}/`);
      setProcesoSeleccionadoId(null);
      await cargar();
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "No se pudo cancelar la solicitud de postulación."
      );
    }
  };

  const handleArchivoInicialChange = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setErrorDocumentosIniciales("Solo se aceptan archivos PDF, DOCX, JPG o PNG.");
      return;
    }
    if (file.size > TAMANO_MAXIMO_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorDocumentosIniciales(`El archivo pesa ${mb} MB. El máximo permitido es 10 MB.`);
      return;
    }
    setErrorDocumentosIniciales("");
    setDocumentosIniciales((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, archivo: file } : doc))
    );
  };
  
  const handleNombreDocInicialChange = (val, id) => {
    setDocumentosIniciales((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, nombre: val } : doc))
    );
  };

  const postular = async (e) => {
    e.preventDefault();
    setError("");
    if (!modalidadId) {
      setError("Selecciona una modalidad.");
      return;
    }
    if (!titulo.trim()) {
      setError("Ingresa el título de tu propuesta de proyecto de grado.");
      return;
    }
    setEnviando(true);
    try {
      const faltanDocs = documentosIniciales.some(d => !d.archivo);
      if (faltanDocs) {
        setError("Debes adjuntar los 3 documentos requeridos para radicar la propuesta.");
        setEnviando(false);
        return;
      }

      const { data: nuevaPostulacion } = await api.post("/postulaciones/", {
        modalidad: modalidadId,
        titulo_proyecto: titulo.trim(),
      });

      if (nuevaPostulacion?.id) {
        // Subir los 3 documentos uno por uno
        for (const doc of documentosIniciales) {
          if (doc.archivo) {
            const formData = new FormData();
            formData.append("archivo", doc.archivo);
            formData.append(
              "nombre",
              doc.nombre.trim() || `Documento ${doc.id}`
            );
            formData.append("postulacion", nuevaPostulacion.id);
            try {
              await api.post("/documentos/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            } catch (e) {
              console.error(`Error al subir documento ${doc.nombre}`, e);
            }
          }
        }
      }

      await cargar();
      if (nuevaPostulacion?.id) {
        setProcesoSeleccionadoId(nuevaPostulacion.id);
      }
      setMostrarNuevaPostulacion(false);
      setPestanaActual("activo");
      setModalidadId("");
      setTitulo("");
      setDescripcionPropuesta("");
      setDocumentosIniciales([
        { id: 1, nombre: "Propuesta de proyecto de grado", archivo: null },
        { id: 2, nombre: "Certificado de paz y salvo académico", archivo: null },
        { id: 3, nombre: "Carta de presentación al comité", archivo: null },
      ]);
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No se pudo registrar la postulación. Intenta de nuevo.";
      setError(detalle);
    } finally {
      setEnviando(false);
    }
  };

  if (postulaciones === null && !errorCarga) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-itm-purple"></div>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div role="alert" className="max-w-lg mx-auto glass-panel border-t-4 border-red-500 rounded-2xl p-8 text-center mt-10">
        <p className="text-red-700 font-bold text-lg mb-6">{errorCarga}</p>
        <button
          onClick={() => {
            cargar();
            cargarModalidades();
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg shadow transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Si no tiene ningún proceso registrado o hace clic en "Postular a Nueva Opción de Grado"
  if (!proceso || mostrarNuevaPostulacion) {
    const modalidadSeleccionadaObj = modalidades.find(
      (m) => String(m.id) === String(modalidadId)
    );
    const infoModalidad = modalidadSeleccionadaObj
      ? obtenerInfoModalidad(modalidadSeleccionadaObj.nombre)
      : null;

    return (
      <div className="max-w-4xl mx-auto space-y-6 mt-6">
        {mostrarNuevaPostulacion && postulaciones?.length > 0 && (
          <button
            type="button"
            onClick={() => setMostrarNuevaPostulacion(false)}
            className="text-xs font-bold text-itm-blue hover:text-itm-purple transition-colors flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs"
          >
            <span>←</span>
            <span>Volver a mi panel de trámites</span>
          </button>
        )}

        {/* Encabezado del Formulario de Radicación */}
        <div className="bg-gradient-to-r from-itm-blue-dark via-itm-blue to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/10 text-blue-200 border border-white/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Formulario Oficial de Radicación
            </span>
            <span className="text-xs text-blue-200">• SIGMA ITM</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Selecciona tu modalidad de grado
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl font-medium">
            Elige entre las 10 opciones reglamentarias del ITM, completa los datos requeridos de tu propuesta y radica tus documentos de soporte.
          </p>
        </div>

        <form onSubmit={postular} noValidate className="space-y-6">
          {/* BLOQUE 1: DATOS INSTITUCIONALES DEL ESTUDIANTE */}
          <div className="glass-panel border-t-4 border-itm-blue rounded-2xl p-6 sm:p-8 shadow-md">
            <h3 className="text-base font-black text-itm-blue mb-4 flex items-center gap-2">
              <span>👤</span> 1. Información del Estudiante Postulante
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">Nombre Completo</span>
                <span className="font-bold text-slate-800 text-sm">
                  {usuario?.first_name} {usuario?.last_name || usuario?.username || "Jorge Bernal"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">Cédula / Documento</span>
                <span className="font-bold text-slate-800 text-sm">
                  {usuario?.cedula || "1037654321"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">Programa Académico</span>
                <span className="font-bold text-slate-800 text-sm">
                  {usuario?.programa_academico || "Tecnología en Desarrollo de Software"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">Correo Electrónico</span>
                <span className="font-bold text-slate-800 text-sm truncate block" title={usuario?.email}>
                  {usuario?.email || "jorge.bernal@correo.itm.edu.co"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label htmlFor="estudiante-semestre" className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">
                  Semestre en Curso
                </label>
                <select
                  id="estudiante-semestre"
                  value={semestreEstudiante}
                  onChange={(e) => setSemestreEstudiante(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                >
                  <option value="6° Semestre">6° Semestre</option>
                  <option value="7° Semestre">7° Semestre</option>
                  <option value="8° Semestre">8° Semestre</option>
                  <option value="9° Semestre">9° Semestre</option>
                  <option value="10° Semestre">10° Semestre</option>
                </select>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label htmlFor="estudiante-telefono" className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">
                  Teléfono / Celular de Contacto
                </label>
                <input
                  id="estudiante-telefono"
                  type="text"
                  value={telefonoEstudiante}
                  onChange={(e) => setTelefonoEstudiante(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  placeholder="300 123 4567"
                />
              </div>
            </div>
          </div>

          {/* BLOQUE 2: CATÁLOGO REGLAMENTARIO DE LAS 10 MODALIDADES */}
          <div className="glass-panel border-t-4 border-itm-purple rounded-2xl p-6 sm:p-8 shadow-md">
            <h3 className="text-base font-black text-itm-blue mb-2 flex items-center gap-2">
              <span>🎓</span> 2. Selección de Modalidad de Grado (10 Opciones ITM)
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Haz clic en cualquiera de las modalidades para consultar sus detalles reglamentarios y seleccionarla para tu propuesta:
            </p>

            {/* Cuadrícula interactiva de las 10 modalidades */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
              {MODALIDADES_OFICIALES.map((m) => {
                const encontradaEnBD = modalidades.find(
                  (mod) => mod.nombre.toLowerCase().trim() === m.nombre.toLowerCase().trim()
                );
                const valorId = encontradaEnBD ? String(encontradaEnBD.id) : m.nombre;
                const estaSeleccionada = String(modalidadId) === String(valorId);

                return (
                  <button
                    key={m.nombre}
                    type="button"
                    onClick={() => {
                      if (encontradaEnBD) setModalidadId(String(encontradaEnBD.id));
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                      estaSeleccionada
                        ? "bg-itm-blue text-white border-itm-blue shadow-md scale-[1.02]"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span className="text-2xl mb-1.5">{m.icono}</span>
                    <span className="font-bold leading-tight">{m.nombre}</span>
                  </button>
                );
              })}
            </div>

            {/* Selector desplegable de modalidades */}
            <label htmlFor="modalidad-select" className="block text-xs font-bold text-itm-blue uppercase tracking-wider mb-1.5">
              Modalidad seleccionada:
            </label>
            <select
              id="modalidad-select"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all font-semibold text-slate-800 text-sm"
              value={modalidadId}
              onChange={(e) => setModalidadId(e.target.value)}
              aria-required="true"
            >
              <option value="">-- Selecciona tu Modalidad --</option>
              {modalidades.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>

            {/* Ficha descriptiva reglamentaria de la modalidad seleccionada */}
            {infoModalidad && (
              <div className="bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 border border-blue-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-white rounded-xl shadow-xs border border-blue-100 shrink-0">
                      {infoModalidad.icono}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">
                          {infoModalidad.nombre}
                        </h4>
                        {infoModalidad.codigo && (
                          <span className="text-[10px] font-mono font-bold bg-blue-100 text-itm-blue px-2 py-0.5 rounded-md">
                            {infoModalidad.codigo}
                          </span>
                        )}
                      </div>
                      {infoModalidad.subtitulo && (
                        <p className="text-xs font-semibold text-itm-purple">
                          {infoModalidad.subtitulo}
                        </p>
                      )}
                    </div>
                  </div>
                  {infoModalidad.requiereSustentacion && (
                    <span className="text-[11px] font-bold bg-white text-slate-700 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-center shadow-xs">
                      🎤 {infoModalidad.requiereSustentacion.includes("Sí") ? "Requiere Sustentación Pública" : "Evaluación por Comité / Informe"}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {infoModalidad.queEs || infoModalidad.descripcion}
                </p>

                {infoModalidad.perfilEstudiante && (
                  <div className="bg-white/90 rounded-xl p-3 border border-purple-100 text-xs shadow-2xs">
                    <p className="font-bold text-itm-purple flex items-center gap-1.5 mb-1">
                      <span>🎯</span> Perfil del Estudiante Idóneo:
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {infoModalidad.perfilEstudiante}
                    </p>
                  </div>
                )}

                {/* Ruta Paso a Paso para Graduarse */}
                {infoModalidad.pasosProceso && infoModalidad.pasosProceso.length > 0 && (
                  <div className="bg-white/90 rounded-xl p-4 border border-blue-200/80 shadow-2xs space-y-2">
                    <p className="font-bold text-itm-blue text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span>🧭</span> Ruta paso a paso para graduarte con esta modalidad:
                    </p>
                    <div className="space-y-1.5">
                      {infoModalidad.pasosProceso.map((paso, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="bg-itm-blue text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug font-medium">
                            {paso.replace(/^\d+\.\s*/, '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requisitos para Obtener el Grado */}
                {infoModalidad.requisitosParaGraduarse && infoModalidad.requisitosParaGraduarse.length > 0 && (
                  <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200 shadow-2xs space-y-2">
                    <p className="font-bold text-emerald-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span>✅</span> Requisitos indispensables para obtener el grado:
                    </p>
                    <ul className="space-y-1 text-xs text-emerald-950">
                      {infoModalidad.requisitosParaGraduarse.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✔</span>
                          <span className="leading-snug font-medium">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Grilla de especificaciones reglamentarias */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {infoModalidad.condicionesPrevias && (
                    <div className="bg-white/90 rounded-xl p-3 border border-blue-100/80 text-xs shadow-2xs">
                      <p className="font-bold text-amber-700 flex items-center gap-1.5 mb-1">
                        <span>📊</span> Condiciones Previas y Créditos:
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {infoModalidad.condicionesPrevias}
                      </p>
                    </div>
                  )}

                  {infoModalidad.responsableAprobacion && (
                    <div className="bg-white/90 rounded-xl p-3 border border-blue-100/80 text-xs shadow-2xs">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                        <span>⚖️</span> Instancia Evaluadora:
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {infoModalidad.responsableAprobacion}
                      </p>
                    </div>
                  )}

                  {infoModalidad.documentosRequeridos && infoModalidad.documentosRequeridos.length > 0 && (
                    <div className="bg-white/90 rounded-xl p-3 border border-blue-100/80 text-xs shadow-2xs md:col-span-2">
                      <p className="font-bold text-itm-purple flex items-center gap-1.5 mb-1.5">
                        <span>📑</span> Documentos Obligatorios que debes radicar para esta modalidad:
                      </p>
                      <ul className="space-y-1 text-slate-700 list-disc list-inside">
                        {infoModalidad.documentosRequeridos.map((doc, idx) => (
                          <li key={idx} className="leading-snug">
                            <span className="font-medium text-slate-800">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {infoModalidad.entregablesFinales && (
                    <div className="bg-white/90 rounded-xl p-3 border border-blue-100/80 text-xs shadow-2xs">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                        <span>📦</span> Entregable para Cierre y Grado:
                      </p>
                      <p className="text-slate-600 leading-relaxed font-medium">
                        {infoModalidad.entregablesFinales}
                      </p>
                    </div>
                  )}

                  {infoModalidad.criteriosEvaluacion && (
                    <div className="bg-white/90 rounded-xl p-3 border border-blue-100/80 text-xs shadow-2xs">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                        <span>🎯</span> Criterio de Aprobación:
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {infoModalidad.criteriosEvaluacion}
                      </p>
                    </div>
                  )}
                </div>

                {infoModalidad.requisitoClave && (
                  <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-900">
                    <span className="font-bold">⚠️ Requisito Clave Ineludible: </span>
                    {infoModalidad.requisitoClave}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BLOQUE 3: DATOS DEL PROYECTO / PROPUESTA */}
          <div className="glass-panel border-t-4 border-indigo-600 rounded-2xl p-6 sm:p-8 shadow-md space-y-4">
            <h3 className="text-base font-black text-itm-blue flex items-center gap-2">
              <span>📌</span> 3. Información de la Propuesta de Grado
            </h3>

            <div>
              <label htmlFor="titulo-input" className="block text-xs font-bold text-itm-blue uppercase tracking-wider mb-1.5">
                Título del proyecto o propuesta <span className="text-red-500">*</span>
              </label>
              <input
                id="titulo-input"
                type="text"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all text-sm font-semibold text-slate-800"
                value={titulo}
                placeholder="Ej: Diseño e Implementación del Sistema Integral SIGMA ITM"
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="descripcion-input" className="block text-xs font-bold text-itm-blue uppercase tracking-wider mb-1.5">
                Descripción, Alcance y Justificación de la Propuesta
              </label>
              <textarea
                id="descripcion-input"
                rows={6}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all text-xs sm:text-sm font-medium text-slate-800 min-h-[140px] leading-relaxed resize-y shadow-inner"
                value={descripcionPropuesta}
                placeholder="Resume los objetivos, problema a resolver o justificación de tu opción de grado..."
                onChange={(e) => setDescripcionPropuesta(e.target.value)}
              />
            </div>
          </div>

          {/* BLOQUE 4: CARGA DE DOCUMENTOS INICIALES REQUERIDOS */}
          <div className="glass-panel border-t-4 border-teal-600 rounded-2xl p-6 sm:p-8 shadow-md space-y-4">
            <h3 className="text-base font-black text-itm-blue flex items-center gap-2">
              <span>📎</span> 4. Cargar Documentos de Soporte Obligatorios
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Por reglamento, es obligatorio adjuntar estos 3 documentos iniciales para radicar tu propuesta de grado.
            </p>

            {documentosIniciales.map((doc, index) => (
              <div key={doc.id} className={`grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200 ${index > 0 ? "mt-3" : ""}`}>
                <div>
                  <label htmlFor={`doc-nombre-${doc.id}`} className="block text-xs font-bold text-itm-blue uppercase tracking-wider mb-1.5">
                    Nombre del Documento {doc.id}
                  </label>
                  <input
                    id={`doc-nombre-${doc.id}`}
                    type="text"
                    value={doc.nombre}
                    onChange={(e) => handleNombreDocInicialChange(e.target.value, doc.id)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-itm-purple"
                  />
                </div>

                <div>
                  <label htmlFor={`doc-archivo-${doc.id}`} className="block text-xs font-bold text-itm-blue uppercase tracking-wider mb-1.5">
                    Archivo Adjunto <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`doc-archivo-${doc.id}`}
                    type="file"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleArchivoInicialChange(e, doc.id)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-itm-blue/10 file:text-itm-blue hover:file:bg-itm-blue/20 transition-all cursor-pointer"
                    required
                  />
                  {doc.archivo && (
                    <p className="mt-2 text-emerald-700 font-bold text-[10px] bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <span>✓</span> {doc.archivo.name}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {errorDocumentosIniciales && (
              <p role="alert" className="text-red-600 font-semibold text-xs border-l-2 border-red-500 pl-2 mt-4">
                {errorDocumentosIniciales}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-red-600 font-bold text-sm bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
              {error}
            </p>
          )}

          {/* BOTONES DE ENVÍO */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={enviando}
              aria-busy={enviando}
              className="flex-1 w-full bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light disabled:opacity-70 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              {enviando ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Radicando Propuesta ante el ITM...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Iniciar Postulación</span>
                </>
              )}
            </button>

            {postulaciones?.length > 0 && (
              <button
                type="button"
                onClick={() => setMostrarNuevaPostulacion(false)}
                className="w-full sm:w-auto px-6 py-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors uppercase tracking-wider"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  const infoModalidadActiva = proceso ? obtenerInfoModalidad(proceso.modalidad_nombre) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-6">
      {/* TARJETA INSTITUCIONAL DEL ESTUDIANTE Y ACCESO A NUEVA POSTULACIÓN */}
      <div className="bg-gradient-to-r from-slate-900 via-itm-blue-dark to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/10 text-blue-200 border border-white/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Portal del Estudiante
              </span>
              <span className="text-xs text-blue-200">
                • {usuario?.first_name} {usuario?.last_name || usuario?.username}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gestión de Opciones de Grado
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-2">
              <span>🆔 <strong>CC:</strong> {usuario?.cedula || "1037654321"}</span>
              <span>🎓 <strong>Programa:</strong> {usuario?.programa_academico || "Tecnología en Desarrollo de Software"}</span>
              <span>✉️ <strong>Correo:</strong> {usuario?.email || "jorge.bernal@correo.itm.edu.co"}</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMostrarNuevaPostulacion(true)}
              className="bg-gradient-to-r from-itm-purple to-indigo-600 hover:from-itm-purple-dark hover:to-indigo-700 text-white font-black px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <span>✨</span>
              <span>Postular a Nueva Opción de Grado</span>
            </button>
          </div>
        </div>
      </div>

      {/* SELECTOR DIRECTO DE PROCESOS / TRÁMITES DEL ESTUDIANTE */}
      {postulaciones && postulaciones.length > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="text-lg">📁</span>
            <span className="uppercase tracking-wider">Tus Trámites de Opción de Grado:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {postulaciones.map((p) => {
              const esSeleccionado = p.id === proceso?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProcesoSeleccionadoId(p.id);
                    setPestanaActual("activo");
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    esSeleccionado
                      ? "bg-itm-blue text-white border-itm-blue shadow-md scale-102"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>{p.modalidad_nombre}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      p.estado === "FINALIZADO"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-itm-blue"
                    }`}
                  >
                    {p.estado_display}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑAS DE NAVEGACIÓN: MI PROCESO ACTIVO VS HISTORIAL DE PROYECTOS */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm">
        <button
          onClick={() => setPestanaActual("activo")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            pestanaActual === "activo"
              ? "bg-itm-blue text-white shadow-md shadow-itm-blue/20"
              : "text-slate-600 hover:text-itm-blue hover:bg-slate-50"
          }`}
        >
          <span>⚡</span>
          <span>Detalle de este Proceso ({proceso.modalidad_nombre})</span>
        </button>
        <button
          onClick={() => setPestanaActual("historial")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            pestanaActual === "historial"
              ? "bg-itm-blue text-white shadow-md shadow-itm-blue/20"
              : "text-slate-600 hover:text-itm-blue hover:bg-slate-50"
          }`}
        >
          <span>📜</span>
          <span>Historial de Mis Proyectos Anteriores ({procesosHistoricos.length})</span>
        </button>
      </div>

      {/* VISTA 1: DETALLE DEL PROCESO SELECCIONADO */}
      {pestanaActual === "activo" && (
        <div className="space-y-6">
          {/* Ficha Integral de Modalidad, Turno Activo y Progreso Oficial ITM */}
          <FichaModalidadProyecto postulacion={proceso} esEstudiante={true} />

          <div className="glass-panel border-t-4 border-itm-blue rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{infoModalidadActiva?.icono || "🎓"}</span>
                  <h2 className="text-3xl font-black text-itm-blue">{proceso.modalidad_nombre}</h2>
                </div>

                {editandoTitulo ? (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={nuevoTituloProyecto}
                      onChange={(e) => setNuevoTituloProyecto(e.target.value)}
                      className="w-full text-base font-bold text-slate-900 border border-itm-blue rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-itm-purple"
                      placeholder="Escribe el nuevo título del proyecto..."
                    />
                    {errorTitulo && (
                      <p className="text-xs text-red-600 font-semibold">{errorTitulo}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGuardarTitulo}
                        disabled={guardandoTitulo}
                        className="text-xs font-bold bg-itm-blue hover:bg-itm-blue-dark text-white px-3.5 py-1.5 rounded-lg shadow-xs"
                      >
                        {guardandoTitulo ? "Guardando..." : "Guardar Título"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditandoTitulo(false)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-slate-600 font-bold text-lg">
                      {proceso.titulo_proyecto || "Proyecto sin título registrado"}
                    </p>
                    {(proceso.estado === "POSTULACION" || proceso.requiere_correccion) && (
                      <button
                        type="button"
                        onClick={() => {
                          setNuevoTituloProyecto(proceso.titulo_proyecto || "");
                          setEditandoTitulo(true);
                          setErrorTitulo("");
                        }}
                        className="text-xs font-bold text-itm-blue hover:text-itm-purple bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        title="Modificar el título de tu proyecto"
                      >
                        <span>✏️</span>
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Información del Docente Asesor */}
                <div className="mt-3">
                  {proceso.asesor_nombre ? (
                    <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <span>👨‍🏫</span>
                          <span>Docente Asesor Asignado</span>
                        </span>
                        <strong className="text-emerald-950 font-bold text-sm">
                          {proceso.asesor_nombre}
                        </strong>
                        {proceso.asesor_email && (
                          <span className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                            {proceso.asesor_email}
                          </span>
                        )}
                      </div>
                      {proceso.mensaje_asesor && (
                        <p className="text-slate-700 italic bg-white/80 p-2 rounded-lg border border-emerald-100 mt-1">
                          📌 <strong>Directriz del Comité/Administrador:</strong> "{proceso.mensaje_asesor}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                      <span>⚠️</span>
                      <span>Asesor: Pendiente de asignación por el Comité de Grados / Administrador</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <EstadoBadge estado={proceso.estado} texto={proceso.estado_display} />
              </div>
            </div>

            {/* Ficha Informativa de la Modalidad Activa */}
            {infoModalidadActiva && (
              <div className="relative z-10 mb-6 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700">
                <span className="text-xl shrink-0 p-1 bg-white rounded-lg shadow-2xs border border-blue-100">
                  {infoModalidadActiva.icono}
                </span>
                <div className="flex-1">
                  <strong className="text-itm-blue font-bold block mb-0.5 text-xs">
                    Acerca de tu modalidad seleccionada ({infoModalidadActiva.nombre}):
                  </strong>
                  <p className="leading-relaxed text-slate-600">{infoModalidadActiva.descripcion}</p>
                  {infoModalidadActiva.requisitoClave && (
                    <p className="mt-1 text-slate-500 italic text-[11px]">
                      📌 Requisito reglamentario: {infoModalidadActiva.requisitoClave}
                    </p>
                  )}
                </div>
              </div>
            )}

            {proceso.requiere_correccion && (
              <div role="alert" aria-live="assertive" className="mt-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-amber-900 font-bold text-lg">Corrección requerida en esta etapa</p>
                </div>
                <p className="text-amber-800 mt-2 font-medium bg-white p-3 rounded border border-amber-100">
                  {proceso.observacion_correccion}
                </p>

                {/* Documento con correcciones y anotaciones del evaluador/asesor */}
                {proceso.archivo_correccion && (
                  <div className="mt-3 p-3.5 bg-amber-100/90 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-amber-950 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0">📎</span>
                      <div>
                        <p className="font-bold text-amber-900">Documento de retroalimentación adjuntado por el evaluador / asesor</p>
                        <p className="text-[11px] text-amber-800 font-normal">
                          Descarga este archivo para revisar las marcas, anotaciones y sugerencias antes de radicar tus correcciones.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setDocumentoAVisualizar({
                            nombre: "Documento con observaciones del evaluador",
                            archivo: proceso.archivo_correccion,
                            descripcion: "Observaciones y correcciones adjuntadas por el docente asesor",
                            fecha: formatearFecha(proceso.subsanado_en || proceso.creada_en),
                          })
                        }
                        className="bg-white hover:bg-purple-50 text-itm-purple border border-purple-200 px-3 py-2 rounded-lg shadow-xs font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Previsualizar archivo con correcciones"
                      >
                        <span>👁️ Ver</span>
                      </button>
                      <a
                        href={obtenerUrlDocumento(proceso.archivo_correccion)}
                        download
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          forzarDescargaArchivo(obtenerUrlDocumento(proceso.archivo_correccion), "Observaciones_Correccion");
                        }}
                        className="shrink-0 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 px-3 py-2 rounded-lg shadow-xs font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>📥 Descargar</span>
                      </a>
                    </div>
                  </div>
                )}

                {errorSubsanacion && (
                  <p role="alert" className="text-red-600 font-semibold text-xs mt-3 border-l-2 border-red-500 pl-2">
                    {errorSubsanacion}
                  </p>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={abrirModalSubsanacion}
                    className="bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <span>📝</span>
                    <span>Subsanar Corrección y Adjuntar Archivo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Banner de Confirmación de Subsanación Radicada */}
            {!proceso.requiere_correccion &&
              (proceso.mensaje_subsanacion || proceso.subsanado_en) &&
              proceso.estado !== "FINALIZADO" &&
              proceso.estado !== "RECHAZADO" && (
                <div
                  role="region"
                  aria-label="Subsanación Radicada"
                  className="mt-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-l-4 border-emerald-500 rounded-r-2xl p-5 shadow-sm space-y-2 animate-in fade-in"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <p className="text-emerald-950 font-black text-base">
                        ¡Correcciones radicadas exitosamente!
                      </p>
                    </div>
                    {proceso.subsanado_en && (
                      <span className="text-xs font-semibold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200">
                        Radicado el {formatearFecha(proceso.subsanado_en)}
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-800 text-xs font-medium leading-relaxed">
                    Tu documento y explicación han sido recibidos por el sistema. El evaluador institucional (Administrador / Asesor) ha recibido el aviso y el trámite está listo para continuar con la siguiente etapa.
                  </p>
                  {proceso.mensaje_subsanacion && (
                    <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs text-xs text-slate-700 italic">
                      "{proceso.mensaje_subsanacion}"
                    </div>
                  )}
                </div>
              )}

            {/* Banner de Certificado de Finalización (Bloque 20) */}
            {proceso.estado === "FINALIZADO" && (
              <div
                role="region"
                aria-label="Certificado de Finalización"
                className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-itm-blue text-white shadow-lg relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎓</span>
                      <h3 className="text-xl font-black tracking-tight">
                        ¡Felicitaciones! Has culminado tu Opción de Grado
                      </h3>
                    </div>
                    <p className="text-white/90 text-sm font-medium">
                      Tu proceso se encuentra en estado{" "}
                      <span className="font-bold underline">FINALIZADO</span>. Ya puedes
                      descargar tu Certificado Oficial de Aprobación.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleDescargarCertificado(proceso)}
                      disabled={descargandoCertificado}
                      aria-busy={descargandoCertificado}
                      className="shrink-0 bg-white hover:bg-slate-100 disabled:opacity-75 text-emerald-800 font-extrabold px-5 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {descargandoCertificado ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-800"></span>
                          <span>Generando PDF...</span>
                        </>
                      ) : (
                        <>
                          <span>📥</span>
                          <span className="whitespace-nowrap">Descargar Certificado</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {errorCertificado && (
                  <div
                    role="alert"
                    className="mt-4 p-3 bg-red-600/90 text-white rounded-lg text-xs font-semibold border border-white/20"
                  >
                    {errorCertificado}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sección de Documentos Radicados y Requisitos Faltantes (CRUD Completo) */}
          <div className="glass-panel rounded-2xl p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-itm-blue mb-1 flex items-center gap-2">
                  <span>📎</span> Expediente y Documentos de tu Proceso
                </h3>
                <p className="text-slate-500 text-sm">
                  Gestión y radicación de requisitos para la modalidad <span className="font-semibold text-slate-700">{proceso.modalidad_nombre}</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Botón Principal para abrir el Modal Institucional de Radicación */}
                {proceso.estado !== "FINALIZADO" && proceso.estado !== "RECHAZADO" && (
                  <button
                    type="button"
                    onClick={() =>
                      setModalRadicarDoc({
                        abierto: true,
                        nombre: "",
                        descripcion: "",
                        archivo: null,
                        subiendo: false,
                        error: "",
                      })
                    }
                    className="bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>📤</span>
                    <span>Radicar / Anexar Documento</span>
                  </button>
                )}

                {/* Botón para Cancelar/Eliminar postulación en estado inicial */}
                {proceso.estado === "POSTULACION" && (
                  <button
                    type="button"
                    onClick={() => handleCancelarPostulacion(proceso.id)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Cancelar y eliminar esta solicitud de grado"
                  >
                    <span>🗑️</span>
                    <span>Cancelar / Eliminar Solicitud</span>
                  </button>
                )}
              </div>
            </div>

            {/* Verificación de Requisitos Obligatorios */}
            {cargandoValidacion ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-slate-600 text-sm">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-itm-blue"></span>
                <span>Verificando requisitos obligatorios de la modalidad...</span>
              </div>
            ) : validacionDocs && !validacionDocs.es_valido && validacionDocs.documentos_faltantes?.length > 0 && (proceso.estado === "POSTULACION" || proceso.requiere_correccion) ? (
              <div role="region" aria-label="Documentos faltantes" className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <span>⚠️</span>
                  <span>Aún te falta subir los siguientes documentos obligatorios:</span>
                </div>
                <ul className="divide-y divide-amber-200/70">
                  {validacionDocs.documentos_faltantes.map((docFaltante, idx) => (
                    <li key={idx} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{docFaltante}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setModalRadicarDoc({
                            abierto: true,
                            nombre: docFaltante,
                            descripcion: "",
                            archivo: null,
                            subiendo: false,
                            error: "",
                          })
                        }
                        className="text-xs bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold px-3 py-1 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        + Radicar este requisito
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : validacionDocs?.es_valido ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-xs">
                <span className="text-emerald-600 font-bold text-base">✓</span>
                <span>¡Excelente! Has cargado todos los documentos requeridos para esta modalidad.</span>
              </div>
            ) : null}

            {exitoSubiendoDoc && (
              <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-2xs">
                <span className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Documento radicado exitosamente en el expediente.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setExitoSubiendoDoc(false)}
                  className="text-emerald-600 hover:text-emerald-900 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* LISTADO Y GESTIÓN DE ARCHIVOS RADICADOS */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <span>📁</span> Documentos cargados en tu expediente ({proceso.documentos?.length || 0})
              </h4>
              {proceso.documentos && proceso.documentos.length > 0 ? (
                <ul className="space-y-2.5">
                  {proceso.documentos.map((doc) => {
                    const versArr = doc.versiones || [];
                    const maxVer = versArr.length > 0
                      ? Math.max(...versArr.map((v) => v.numero_version))
                      : (doc.version_actual || 1);
                    const siguienteNum = maxVer + 1;
                    const versionVigenteObj = versArr.find((v) => v.numero_version === maxVer) || versArr[0] || null;
                    const archivoVigente = versionVigenteObj?.archivo || doc.archivo;
                    const fechaVigente = versionVigenteObj?.creado_en || doc.subido_en;
                    const motivoVigente = versionVigenteObj?.motivo || doc.descripcion;
                    const tieneHistorial = versArr.length > 1;

                    return (
                    <li
                      key={doc.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors flex flex-col gap-3"
                    >
                      {/* Cabecera del Documento: Información y Acciones Principales */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2.5 border-b border-slate-200/60">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-lg shrink-0">📄</span>
                            <span
                              className="text-base font-black text-slate-800 hover:text-itm-purple transition-colors cursor-pointer truncate"
                              title={`Haz clic para previsualizar la versión vigente (v${maxVer}): ${doc.nombre}`}
                              onClick={() =>
                                setDocumentoAVisualizar({
                                  nombre: `${doc.nombre} (v${maxVer} - Vigente)`,
                                  archivo: archivoVigente,
                                  descripcion: motivoVigente,
                                  fecha: formatearFecha(fechaVigente),
                                })
                              }
                            >
                              {doc.nombre}
                            </span>

                            {/* Badge Destacado de Versión Vigente */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs border ${
                                tieneHistorial
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-200/50"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                              }`}
                              title={`Versión activa y vigente en el expediente: v${maxVer}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${tieneHistorial ? "bg-emerald-600 animate-pulse" : "bg-slate-400"}`}></span>
                              <span>v{maxVer} • {tieneHistorial ? "Actual Vigente" : "Original"}</span>
                            </span>
                          </div>

                          {/* Descripción / Justificación editable de la versión vigente */}
                          {docEnEdicionId === doc.id ? (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="text"
                                value={descripcionEnEdicion}
                                onChange={(e) => setDescripcionEnEdicion(e.target.value)}
                                placeholder="Escribe el motivo o justificación de esta versión..."
                                className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800"
                              />
                              <button
                                type="button"
                                onClick={() => handleGuardarDescripcion(doc.id)}
                                disabled={guardandoDescripcion}
                                className="bg-itm-blue text-white text-xs px-3 py-1 rounded font-bold hover:bg-itm-blue-dark transition-colors"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDocEnEdicionId(null);
                                  setDescripcionEnEdicion("");
                                }}
                                className="bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded font-bold hover:bg-slate-300 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1.5 space-y-1 text-xs">
                              <div className="flex items-start gap-1.5 flex-wrap">
                                <span className="text-slate-500 font-bold shrink-0">
                                  {tieneHistorial ? `Motivo / Justificación (v${maxVer}):` : "Descripción:"}
                                </span>
                                <span className="text-slate-800 italic font-medium">
                                  "{motivoVigente || doc.descripcion || "Sin justificación registrada"}"
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocEnEdicionId(doc.id);
                                    setDescripcionEnEdicion(motivoVigente || doc.descripcion || "");
                                  }}
                                  className="text-[11px] text-itm-blue hover:text-itm-purple font-semibold hover:underline shrink-0 ml-1"
                                  title="Editar motivo de la versión vigente"
                                >
                                  ✏️ Editar
                                </button>
                              </div>
                              {versionVigenteObj?.descripcion && versionVigenteObj.descripcion !== motivoVigente && (
                                <div className="text-[11px] text-slate-500">
                                  <span className="font-bold">Notas complementarias (v{maxVer}):</span> {versionVigenteObj.descripcion}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-medium flex-wrap">
                            <span>Radicado el {formatearFecha(doc.subido_en)}</span>
                            {tieneHistorial && (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ✓ v{maxVer} vigente actualizada el {formatearFecha(fechaVigente)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Acciones del Documento: Previsualizar, Descargar, Reemplazar y Eliminar */}
                        <div className="flex items-center gap-1.5 shrink-0 self-start">
                          <button
                            type="button"
                            onClick={() =>
                              setDocumentoAVisualizar({
                                nombre: `${doc.nombre} (v${maxVer} - Vigente)`,
                                archivo: archivoVigente,
                                descripcion: motivoVigente,
                                fecha: formatearFecha(fechaVigente),
                              })
                            }
                            aria-label={`Previsualizar versión vigente v${maxVer} de ${doc.nombre}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-itm-purple hover:bg-itm-purple hover:text-white bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200 transition-all shadow-xs cursor-pointer"
                            title={`Previsualizar la versión vigente (v${maxVer}) en pantalla`}
                          >
                            <span>👁️</span>
                            <span>Ver (v{maxVer})</span>
                          </button>
                          <a
                            href={obtenerUrlDocumento(archivoVigente)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Descargar versión vigente v${maxVer} de ${doc.nombre}`}
                            title={`Descargar archivo de la versión vigente (v${maxVer})`}
                            onClick={(e) => {
                              e.preventDefault();
                              forzarDescargaArchivo(obtenerUrlDocumento(archivoVigente), `${doc.nombre}_v${maxVer}`);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-itm-blue hover:bg-slate-100 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all shadow-xs cursor-pointer"
                          >
                            <span>⬇️</span>
                            <span>Descargar (v{maxVer})</span>
                          </a>

                          {proceso.estado !== "FINALIZADO" && proceso.estado !== "RECHAZADO" && (
                            <>
                              {(() => {
                                const versArr = doc.versiones || [];
                                const maxVer = versArr.length > 0
                                  ? Math.max(...versArr.map((v) => v.numero_version))
                                  : (doc.version_actual || 1);
                                const siguienteNum = maxVer + 1;

                                return (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setModalReemplazarDoc({
                                        abierto: true,
                                        docId: doc.id,
                                        docNombre: doc.nombre,
                                        descripcion: doc.descripcion || "",
                                        motivo: "",
                                        versionActual: maxVer,
                                        versionTarget: null, // Cargar nueva versión incremental (v4)
                                        archivo: null,
                                        enviando: false,
                                        error: "",
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-all shadow-xs cursor-pointer"
                                    title={`Subir una nueva versión (v${siguienteNum}) de este documento`}
                                  >
                                    <span>🔄</span>
                                    <span>Cargar nueva versión (v{siguienteNum})</span>
                                  </button>
                                );
                              })()}

                              <button
                                type="button"
                                onClick={() => handleEliminarDocumento(doc.id, doc.nombre)}
                                className="text-xs font-bold text-red-600 hover:text-red-800 bg-white hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition-all shadow-xs cursor-pointer"
                                title="Eliminar este archivo del expediente"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Control de Versiones Documentales (Historial v1, v2, v3... a ancho completo) */}
                      <div className="w-full">
                        <HistorialVersionesDocumento
                          documento={doc}
                          onPrevisualizar={setDocumentoAVisualizar}
                          obtenerUrl={obtenerUrlDocumento}
                          formatearFecha={formatearFecha}
                          onReemplazar={() => {
                            const versArr = doc.versiones || [];
                            const maxVer = versArr.length > 0
                              ? Math.max(...versArr.map((v) => v.numero_version))
                              : (doc.version_actual || 1);
                            setModalReemplazarDoc({
                              abierto: true,
                              docId: doc.id,
                              docNombre: doc.nombre,
                              descripcion: doc.descripcion || "",
                              motivo: "",
                              versionActual: maxVer,
                              versionTarget: null, // Cargar nueva versión (ej: v4)
                              archivo: null,
                              enviando: false,
                              error: "",
                            });
                          }}
                          onReemplazarVersion={(ver) => {
                            const versArr = doc.versiones || [];
                            const maxVer = versArr.length > 0
                              ? Math.max(...versArr.map((v) => v.numero_version))
                              : (doc.version_actual || 1);
                            setModalReemplazarDoc({
                              abierto: true,
                              docId: doc.id,
                              docNombre: doc.nombre,
                              descripcion: ver.descripcion || doc.descripcion || "",
                              motivo: ver.motivo || "",
                              versionActual: maxVer,
                              versionTarget: ver, // Sustituir archivo de esta versión específica
                              archivo: null,
                              enviando: false,
                              error: "",
                            });
                          }}
                          onEliminarVersion={(ver) => handleEliminarVersion(doc.id, ver)}
                        />
                      </div>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs text-center">
                  Aún no has radicado ningún documento. Utiliza el formulario superior para anexar tus requisitos.
                </div>
              )}
            </div>
          </div>
          {/* Detalles de Citación a Sustentación */}
          {(proceso.mensaje_sustentacion || proceso.archivo_sustentacion) && (
            <div className="glass-panel rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-itm-purple flex items-center gap-2 mb-4">
                <span>🎓</span> Historial: Citación a Sustentación
              </h3>
              <div className="bg-white border-l-4 border-itm-purple p-6 rounded-r-xl shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>👤</span> Enviado por: {proceso.asesor_nombre || "Tu Docente Asesor"}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mt-1 sm:mt-0">
                    🗓️ {proceso.actualizada_en ? new Date(proceso.actualizada_en).toLocaleString("es-CO") : "Fecha registrada"}
                  </span>
                </div>
                {proceso.mensaje_sustentacion && (
                  <div className="text-sm text-slate-600 bg-slate-50/50 p-4 rounded-lg border border-slate-100 mb-4 whitespace-pre-wrap leading-relaxed">
                    {proceso.mensaje_sustentacion}
                  </div>
                )}
                {proceso.archivo_sustentacion && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50 p-3.5 rounded-lg border border-purple-100 text-sm">
                    <span className="text-purple-900 font-medium flex items-center gap-1.5">
                      <span>📎</span> Archivo adjunto de la citación
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setDocumentoAVisualizar({
                            nombre: "Citación a Sustentación de Grado",
                            archivo: proceso.archivo_sustentacion,
                            descripcion: proceso.mensaje_sustentacion,
                            fecha: formatearFecha(proceso.creada_en),
                          })
                        }
                        className="text-xs font-bold text-itm-purple bg-white hover:bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-md transition-colors"
                        title="Previsualizar citación"
                      >
                        👁️ Ver
                      </button>
                      <a
                        href={obtenerUrlDocumento(proceso.archivo_sustentacion)}
                        download
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          forzarDescargaArchivo(obtenerUrlDocumento(proceso.archivo_sustentacion), "Citacion_Sustentacion");
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-itm-blue bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                        title="Descargar citación"
                      >
                        ⬇️ Descargar
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historial de Movimientos */}
          <div className="glass-panel rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-itm-blue flex items-center gap-2">
                <span className="text-itm-purple">📋</span> Historial de Movimientos de este Proceso
              </h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                {historial.length} evento{historial.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Leyenda */}
            {historial.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-5 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-itm-blue"><span className="w-2.5 h-2.5 rounded-full bg-itm-blue inline-block"></span>Avance de etapa</span>
                <span className="flex items-center gap-1.5 text-amber-700"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>Corrección / Observación</span>
                <span className="flex items-center gap-1.5 text-emerald-700"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>Asignación de asesor</span>
              </div>
            )}

            {historial.length === 0 ? (
              <p className="text-slate-500 font-medium text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                Tu proceso acaba de iniciar. Aún no hay eventos registrados.
              </p>
            ) : (
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
                {historial.map((h) => {
                  // Detectar tipo de evento para colorear adecuadamente
                  const esAsignacionAsesor =
                    !h.es_correccion &&
                    typeof h.observacion === "string" &&
                    h.observacion.startsWith("Asesor asignado:");

                  const esSubsanacion =
                    !h.es_correccion &&
                    typeof h.observacion === "string" &&
                    h.observacion.startsWith("Corrección subsanada");

                  // Extraer mensaje del admin si es asignación de asesor
                  let mensajeAdmin = "";
                  let tieneDocAsesor = false;
                  if (esAsignacionAsesor && h.observacion) {
                    if (h.observacion.includes("— Directriz:")) {
                      let directriz = h.observacion.split("— Directriz:")[1] || "";
                      if (directriz.includes("[Documento")) {
                        tieneDocAsesor = true;
                        directriz = directriz.split("[Documento")[0];
                      }
                      mensajeAdmin = directriz.trim();
                    }
                    if (h.observacion.includes("[Documento adjunto")) {
                      tieneDocAsesor = true;
                    }
                  }

                  const dotColor = esAsignacionAsesor
                    ? "bg-emerald-500"
                    : esSubsanacion
                    ? "bg-sky-500"
                    : h.es_correccion
                    ? "bg-amber-400"
                    : "bg-itm-blue";

                  const cardStyle = esAsignacionAsesor
                    ? "bg-emerald-50 border-emerald-200"
                    : esSubsanacion
                    ? "bg-sky-50 border-sky-200"
                    : h.es_correccion
                    ? "bg-amber-50 border-amber-200"
                    : "bg-white border-slate-100";

                  const tituloEvento = esAsignacionAsesor
                    ? "👨‍🏫 Asesor asignado a tu proceso"
                    : esSubsanacion
                    ? "✅ Corrección subsanada por ti"
                    : h.es_correccion
                    ? `⚠️ Observación del evaluador en: ${h.estado_anterior_display}`
                    : `${h.estado_anterior_display} ➔ ${h.estado_nuevo_display}`;

                  return (
                    <div key={h.id} className="relative">
                      <div className={`absolute w-3 h-3 rounded-full -left-[23px] top-2 border-2 border-white shadow-sm ${dotColor}`}></div>
                      <div className={`p-4 rounded-xl shadow-sm border ${cardStyle}`}>
                        <p className="font-bold text-slate-800 text-base mb-1">{tituloEvento}</p>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
                          {new Date(h.fecha).toLocaleString("es-CO")} • Por: {h.realizado_por}
                        </p>

                        {/* Mensaje del admin cuando se asignó el asesor */}
                        {esAsignacionAsesor && mensajeAdmin && (
                          <div className="mt-2 bg-white border border-emerald-200 rounded-lg p-3 text-sm text-slate-700 space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                              📌 Mensaje del Administrador / Comité:
                            </p>
                            <p className="italic">"{mensajeAdmin}"</p>
                          </div>
                        )}

                        {/* Indicador de documento adjunto del admin al asesor */}
                        {esAsignacionAsesor && tieneDocAsesor && (
                          <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                            <span>📎</span>
                            <span>El Administrador adjuntó un documento de contexto para el asesor.</span>
                          </p>
                        )}

                        {/* Observación general (solo si no es asignación de asesor para evitar duplicar) */}
                        {!esAsignacionAsesor && h.observacion && (
                          <div className="mt-2 bg-slate-50 text-slate-700 italic p-3 rounded border border-slate-200 text-sm">
                            "{h.observacion}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: HISTORIAL DE MIS OPCIONES DE GRADO ANTERIORES */}
      {pestanaActual === "historial" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xl font-black text-itm-blue mb-1">
              Historial de Opciones de Grado Radicadas
            </h3>
            <p className="text-xs text-slate-500">
              Aquí puedes consultar todos tus proyectos culminados, cartas de finalización, archivos históricos y trazabilidad académica completa.
            </p>
          </div>

          {procesosHistoricos.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
              <span className="text-4xl block mb-3">📜</span>
              <p className="text-slate-800 font-bold text-base mb-1">
                No tienes opciones de grado anteriores concluidas
              </p>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                Tus trámites culminados o archivados aparecerán aquí para tu consulta permanente y descarga de certificados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {procesosHistoricos.map((procHist) => {
                const infoMod = obtenerInfoModalidad(procHist.modalidad_nombre);
                const bitacoraAbierta = !!historialItemVisible[procHist.id];

                return (
                  <div
                    key={procHist.id}
                    className="glass-panel border-t-4 border-slate-400 rounded-2xl p-6 shadow-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{infoMod?.icono || "🎓"}</span>
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                            {procHist.modalidad_nombre}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900">
                          "{procHist.titulo_proyecto || "Proyecto Histórico"}"
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                          <span>📅 Radicado: {formatearFecha(procHist.creada_en)}</span>
                          {procHist.asesor_nombre && (
                            <span>👨‍🏫 Asesor Titular: {procHist.asesor_nombre}</span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <EstadoBadge estado={procHist.estado} texto={procHist.estado_display} />
                      </div>
                    </div>

                    {/* Documentos del proyecto histórico */}
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Documentos radicados en este expediente:
                      </h5>
                      {procHist.documentos && procHist.documentos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {procHist.documentos.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                            >
                              <span className="truncate font-semibold text-slate-700">📄 {doc.nombre}</span>
                              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDocumentoAVisualizar({
                                      nombre: doc.nombre,
                                      archivo: doc.archivo,
                                      fecha: formatearFecha(doc.subido_en),
                                    })
                                  }
                                  className="text-xs font-bold text-itm-purple bg-purple-50 hover:bg-itm-purple hover:text-white px-2 py-1 rounded border border-purple-200 transition-colors"
                                  title="Previsualizar archivo histórico"
                                >
                                  👁️ Ver
                                </button>
                                <a
                                  href={obtenerUrlDocumento(doc.archivo)}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    forzarDescargaArchivo(obtenerUrlDocumento(doc.archivo), doc.nombre);
                                  }}
                                  className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition-colors cursor-pointer"
                                  title="Descargar archivo histórico"
                                >
                                  ⬇️ Descargar
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No hay documentos adjuntos registrados.</p>
                      )}
                    </div>

                    {/* Acciones del proyecto histórico */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                      {procHist.estado === "FINALIZADO" ? (
                        <button
                          type="button"
                          onClick={() => handleDescargarCertificado(procHist)}
                          disabled={descargandoCertificado}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2"
                        >
                          <span>📥</span>
                          <span>Descargar Certificado Oficial</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Proceso archivado</span>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          if (!bitacoraAbierta) {
                            try {
                              const { data } = await api.get(`/postulaciones/${procHist.id}/historial/`);
                              setHistorialItemVisible((prev) => ({ ...prev, [procHist.id]: data }));
                            } catch {
                              setHistorialItemVisible((prev) => ({ ...prev, [procHist.id]: [] }));
                            }
                          } else {
                            setHistorialItemVisible((prev) => ({ ...prev, [procHist.id]: null }));
                          }
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-itm-blue transition-colors flex items-center gap-1.5"
                      >
                        <span>📜</span>
                        <span>{bitacoraAbierta ? "Ocultar Bitácora" : "Ver Bitácora de Movimientos"}</span>
                      </button>
                    </div>

                    {/* Bitácora expandible del proyecto histórico */}
                    {bitacoraAbierta && Array.isArray(historialItemVisible[procHist.id]) && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5 mt-2">
                        <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                          Bitácora de Eventos Registrados:
                        </p>
                        {historialItemVisible[procHist.id].length === 0 ? (
                          <p className="text-slate-400 italic">Sin eventos registrados.</p>
                        ) : (
                          historialItemVisible[procHist.id].map((h) => (
                            <div key={h.id} className="p-2 bg-white rounded border border-slate-200">
                              <p className="font-bold text-slate-800">
                                {h.estado_anterior_display} ➔ {h.estado_nuevo_display}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(h.fecha).toLocaleString("es-CO")} • Por: {h.realizado_por}
                              </p>
                              {h.observacion && (
                                <p className="italic text-slate-600 mt-1">"{h.observacion}"</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL AMPLIADO DE SUBSANACIÓN DE CORRECCIONES */}
      {modalSubsanacion.abierto && proceso && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-subsanacion-titulo"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full overflow-hidden transition-all transform animate-in zoom-in-95 duration-200">
            {/* Encabezado Institucional */}
            <div className="bg-gradient-to-r from-itm-blue-dark via-itm-blue to-indigo-900 text-white p-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-white/10 text-blue-200 border border-white/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Subsanar Observaciones
                  </span>
                  <span className="text-xs text-blue-200">• SIGMA ITM</span>
                </div>
                <h3
                  id="modal-subsanacion-titulo"
                  className="text-lg sm:text-xl font-black tracking-tight text-white"
                >
                  Radicar Correcciones al Evaluador / Asesor
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                  Proyecto: <strong>{proceso.titulo_proyecto || "Sin título"}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalSubsanacion}
                disabled={modalSubsanacion.enviando}
                className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-base shrink-0"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo del Formulario */}
            <form onSubmit={handleEnviarSubsanacionModal} className="p-6 space-y-5">
              {/* Observación previa del evaluador */}
              {proceso.observacion_correccion && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                    Observaciones a corregir indicadas por el evaluador:
                  </p>
                  <p className="italic bg-white/80 p-2 rounded-lg border border-amber-200/60">
                    "{proceso.observacion_correccion}"
                  </p>
                  {proceso.archivo_correccion && (
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-amber-800 font-semibold">
                        📎 Archivo con anotaciones del evaluador:
                      </span>
                      <a
                        href={obtenerUrlDocumento(proceso.archivo_correccion)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-itm-blue hover:underline"
                      >
                        Ver / Descargar ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Textarea explicativo obligatorio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="modal-subsanacion-mensaje"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Explicación de las correcciones realizadas <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {modalSubsanacion.mensaje.length}/10 caracteres mín.
                  </span>
                </div>
                <textarea
                  id="modal-subsanacion-mensaje"
                  rows={8}
                  required
                  placeholder="Detalla de forma clara qué cambios realizaste en el documento o propuesta según las observaciones recibidas..."
                  value={modalSubsanacion.mensaje}
                  onChange={(e) =>
                    setModalSubsanacion((prev) => ({
                      ...prev,
                      mensaje: e.target.value,
                      error: "",
                    }))
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-itm-purple placeholder:text-slate-400 font-medium min-h-[190px] leading-relaxed resize-y shadow-inner"
                />
              </div>

              {/* Selector de Archivo Corregido Obligatorio */}
              <div>
                <label
                  htmlFor="modal-subsanacion-archivo"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Documento corregido adjunto <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-subsanacion-archivo"
                  type="file"
                  required
                  accept=".pdf,.docx,.doc,.xlsx,.zip,.rar"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setModalSubsanacion((prev) => ({
                      ...prev,
                      archivo: f || null,
                      error: "",
                    }));
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-itm-blue/10 file:text-itm-blue hover:file:bg-itm-blue/20 cursor-pointer"
                />
                {modalSubsanacion.archivo && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <span>✓</span> Archivo seleccionado: {modalSubsanacion.archivo.name} (
                    {(modalSubsanacion.archivo.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Formatos permitidos: PDF, DOCX, DOC, XLSX, ZIP. Máximo 20 MB.
                </p>
              </div>

              {/* Alerta de Error */}
              {modalSubsanacion.error && (
                <div
                  role="alert"
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs font-semibold text-red-700 flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span>{modalSubsanacion.error}</span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrarModalSubsanacion}
                  disabled={modalSubsanacion.enviando}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={modalSubsanacion.enviando}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {modalSubsanacion.enviando ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                      <span>Radicando subsanación...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Radicar Subsanación al Evaluador</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NOTIFICACIÓN DE SUBSANACIÓN EXITOSA */}
      {modalSubsanacionExito.abierto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border border-white/30">
                ✓
              </div>
              <h3 className="text-xl font-black">¡Corrección Radicada Exitosamente!</h3>
              <p className="text-xs text-emerald-100 mt-1">
                Tus observaciones han sido subsanadas en el sistema. El evaluador institucional ya puede ver los ajustes en su panel.
              </p>
            </div>

            {(() => {
              const emailDestino = proceso?.asesor_email || "admin@itm.edu.co";
              const asunto = encodeURIComponent(
                `SIGMA ITM — Correcciones Subsanadas: ${proceso?.titulo_proyecto || proceso?.modalidad_nombre}`
              );
              const cuerpo = encodeURIComponent(
                `Estimado(a) Evaluador(a) / Administrador(a):\n\nLe informo que he radicado en la plataforma SIGMA ITM la subsanación de correcciones correspondiente a mi proyecto "${proceso?.titulo_proyecto || proceso?.modalidad_nombre}".\n\nDetalle de las correcciones aplicadas:\n"${modalSubsanacionExito.mensaje}"\n\nEl documento corregido y el expediente ya se encuentran actualizados en la plataforma para su revisión y continuación del trámite.\n\nAtentamente,\n${usuario?.first_name || ""} ${usuario?.last_name || ""}\nCédula: ${usuario?.cedula || ""}\nPrograma: ${usuario?.programa_academico || ""}`
              );
              const mailtoUrl = `mailto:${emailDestino}?subject=${asunto}&body=${cuerpo}`;
              const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(emailDestino)}&subject=${asunto}&body=${cuerpo}`;
              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailDestino)}&su=${asunto}&body=${cuerpo}`;

              return (
                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
                    <p><strong>Destinatario de aviso:</strong> {emailDestino}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Si lo deseas, puedes notificar de inmediato al evaluador abriendo tu correo institucional con 1 solo clic:
                    </p>
                  </div>

                  <div className="space-y-2">
                    <a
                      href={mailtoUrl}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-itm-blue hover:bg-itm-blue-dark text-white font-black text-xs rounded-xl shadow-sm transition-all"
                    >
                      <span>✉️</span>
                      <span>Notificar por Correo Predeterminado (Mailto)</span>
                    </a>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={outlookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
                      >
                        <span>📧</span>
                        <span>Outlook 365 ITM</span>
                      </a>
                      <a
                        href={gmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
                      >
                        <span>📮</span>
                        <span>Gmail Web</span>
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-right">
                    <button
                      onClick={() => setModalSubsanacionExito({ abierto: false, mensaje: "" })}
                      className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Cerrar y Ver Mi Panel
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {/* MODAL INSTITUCIONAL PARA RADICAR / ANEXAR NUEVO DOCUMENTO */}
      {modalRadicarDoc.abierto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Cabecera oscura institucional (como la de los evaluadores) */}
            <div className="bg-gradient-to-r from-slate-900 via-itm-blue-dark to-slate-900 text-white p-6 relative">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="inline-block bg-white/10 text-blue-200 border border-white/20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  {obtenerDestinatarioDocumento(proceso).pill}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setModalRadicarDoc((prev) => ({ ...prev, abierto: false }))
                  }
                  className="text-slate-400 hover:text-white p-1 rounded-lg text-lg transition-colors cursor-pointer"
                  title="Cerrar ventana"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-xl font-black text-white">
                Radicar Documento en tu Expediente
              </h3>
              <p className="text-xs text-slate-300 mt-1 truncate">
                Proyecto: {proceso?.titulo_proyecto || proceso?.modalidad_nombre}
              </p>
            </div>

            {/* Caja de Información del Destinatario */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs">
                <span className="text-2xl shrink-0 p-1 bg-white rounded-xl shadow-2xs border border-blue-100">
                  {obtenerDestinatarioDocumento(proceso).icono}
                </span>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    A quién va dirigido:
                  </span>
                  <strong className="text-itm-blue font-black text-sm block">
                    {obtenerDestinatarioDocumento(proceso).titulo}
                  </strong>
                  <p className="text-slate-600 mt-0.5 text-xs">
                    {obtenerDestinatarioDocumento(proceso).subtitulo}
                  </p>
                </div>
              </div>

              <form onSubmit={handleEnviarModalRadicarDoc} className="space-y-4">
                <div>
                  <label
                    htmlFor="modal-doc-nombre"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Nombre del documento o requisito reglamentario:
                  </label>
                  {proceso?.documentos_requeridos?.length > 0 && (
                    <select
                      value={modalRadicarDoc.nombre}
                      onChange={(e) =>
                        setModalRadicarDoc((prev) => ({
                          ...prev,
                          nombre: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-itm-purple mb-2 font-medium"
                    >
                      <option value="">-- Seleccionar requisito sugerido --</option>
                      {proceso.documentos_requeridos.map((req, i) => (
                        <option key={i} value={req}>
                          {req}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    id="modal-doc-nombre"
                    type="text"
                    value={modalRadicarDoc.nombre}
                    onChange={(e) =>
                      setModalRadicarDoc((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    placeholder="Ej: Propuesta técnica firmada, Informe de avance..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-itm-purple shadow-2xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-doc-descripcion"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Mensaje o nota explicativa para el destinatario (opcional):
                  </label>
                  <textarea
                    id="modal-doc-descripcion"
                    rows={5}
                    value={modalRadicarDoc.descripcion}
                    onChange={(e) =>
                      setModalRadicarDoc((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    placeholder="Ej: Señor asesor, adjunto el avance con el cronograma y diagrama solicitado..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-4 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-itm-purple shadow-2xs min-h-[130px] leading-relaxed resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Archivo a radicar (PDF, DOCX, JPG o PNG — máx. 10 MB):
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setModalRadicarDoc((prev) => ({
                        ...prev,
                        archivo: f || null,
                        nombre: prev.nombre || (f ? f.name.replace(/\.[^/.]+$/, "") : ""),
                      }));
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-itm-blue/10 file:text-itm-blue hover:file:bg-itm-blue/20 cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50"
                  />
                </div>

                {modalRadicarDoc.error && (
                  <p
                    role="alert"
                    className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200"
                  >
                    ⚠️ {modalRadicarDoc.error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setModalRadicarDoc((prev) => ({ ...prev, abierto: false }))
                    }
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={modalRadicarDoc.subiendo || !modalRadicarDoc.archivo}
                    className="px-5 py-2.5 bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {modalRadicarDoc.subiendo ? (
                      <>
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                        <span>Radicando archivo...</span>
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        <span>Radicar y Enviar Documento</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA REEMPLAZAR O SUSTITUIR ARCHIVO DE DOCUMENTO */}
      {modalReemplazarDoc.abierto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-itm-blue-dark to-slate-900 text-white p-6 relative">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="inline-block bg-white/10 text-blue-200 border border-white/20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  {modalReemplazarDoc.versionTarget
                    ? `Corrección de Archivo • v${modalReemplazarDoc.versionTarget.numero_version}`
                    : `Nueva Entrega • v${(modalReemplazarDoc.versionActual || 1) + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setModalReemplazarDoc((prev) => ({ ...prev, abierto: false }))
                  }
                  className="text-slate-400 hover:text-white p-1 rounded-lg text-lg transition-colors cursor-pointer"
                  title="Cerrar ventana"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-xl font-black text-white">
                {modalReemplazarDoc.versionTarget
                  ? `Sustituir Archivo de la Versión v${modalReemplazarDoc.versionTarget.numero_version}`
                  : `Cargar Nueva Versión (v${(modalReemplazarDoc.versionActual || 1) + 1})`}
              </h3>
              <p className="text-xs text-slate-300 mt-1 truncate">
                Documento: <strong>{modalReemplazarDoc.docNombre}</strong>{" "}
                {modalReemplazarDoc.versionTarget
                  ? `(Modificando archivo de la v${modalReemplazarDoc.versionTarget.numero_version})`
                  : `(Versión vigente actual: v${modalReemplazarDoc.versionActual || 1})`}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/80 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-blue-950 flex items-center gap-1">
                  <span>🛡️</span>{" "}
                  {modalReemplazarDoc.versionTarget
                    ? "Modo de Corrección de Archivo Subido por Error"
                    : "Control de Versiones Documentales Activo"}
                </p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {modalReemplazarDoc.versionTarget ? (
                    <>
                      Si te equivocaste al adjuntar el archivo de la <strong>Versión v{modalReemplazarDoc.versionTarget.numero_version}</strong>, puedes subir el archivo correcto aquí. Dicha versión se actualizará directamente para corregir el error sin romper la secuencia histórica.
                    </>
                  ) : (
                    <>
                      Al cargar este nuevo archivo se creará la <strong>Versión v{(modalReemplazarDoc.versionActual || 1) + 1}</strong>. La versión anterior (v{modalReemplazarDoc.versionActual || 1}) permanecerá archivada en el historial inmutable para consulta, trazabilidad y cotejo del docente evaluador.
                    </>
                  )}
                </p>
              </div>

              <form onSubmit={handleEnviarReemplazoDoc} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    {modalReemplazarDoc.versionTarget
                      ? `Nuevo archivo corregido para la v${modalReemplazarDoc.versionTarget.numero_version} (máx. 10 MB):`
                      : `Archivo de la nueva versión v${(modalReemplazarDoc.versionActual || 1) + 1} (máx. 10 MB):`}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setModalReemplazarDoc((prev) => ({
                        ...prev,
                        archivo: f || null,
                      }));
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-itm-blue/10 file:text-itm-blue hover:file:bg-itm-blue/20 cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-reemplazar-motivo"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5"
                  >
                    Motivo o Justificación del Cambio (Requerido para Trazabilidad):
                  </label>
                  <textarea
                    id="modal-reemplazar-motivo"
                    rows={3}
                    value={modalReemplazarDoc.motivo}
                    onChange={(e) =>
                      setModalReemplazarDoc((prev) => ({
                        ...prev,
                        motivo: e.target.value,
                      }))
                    }
                    placeholder={
                      modalReemplazarDoc.versionTarget
                        ? "Ej: Se adjuntó el archivo incorrecto en la entrega previa; se sustituye por la versión correcta aprobada..."
                        : "Explica qué correcciones o ajustes realizaste en este archivo (ej: Se incorporaron las correcciones metodológicas solicitadas por el asesor)..."
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all placeholder:text-slate-400 leading-relaxed resize-y shadow-inner"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-reemplazar-descripcion"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5"
                  >
                    Notas Complementarias (Opcional):
                  </label>
                  <textarea
                    id="modal-reemplazar-descripcion"
                    rows={2}
                    value={modalReemplazarDoc.descripcion}
                    onChange={(e) =>
                      setModalReemplazarDoc((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    placeholder="Notas adicionales sobre este documento..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all placeholder:text-slate-400 leading-relaxed resize-y shadow-inner"
                  />
                </div>

                {modalReemplazarDoc.error && (
                  <p
                    role="alert"
                    className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200"
                  >
                    ⚠️ {modalReemplazarDoc.error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setModalReemplazarDoc((prev) => ({ ...prev, abierto: false }))
                    }
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={modalReemplazarDoc.enviando || !modalReemplazarDoc.archivo}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {modalReemplazarDoc.enviando ? (
                      <>
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                        <span>Guardando archivo...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>
                          {modalReemplazarDoc.versionTarget
                            ? `Guardar Corrección en Versión v${modalReemplazarDoc.versionTarget.numero_version}`
                            : `Cargar y Radicar Versión v${(modalReemplazarDoc.versionActual || 1) + 1}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Previsualización y Descarga de Documentos */}
      <ModalVisorDocumento
        documento={documentoAVisualizar}
        onCerrar={() => setDocumentoAVisualizar(null)}
      />
    </div>
  );
}
