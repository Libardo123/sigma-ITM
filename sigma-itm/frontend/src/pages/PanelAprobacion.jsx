import { useEffect, useState } from "react";
import api from "../api/client";
import EstadoBadge from "../components/EstadoBadge";
import { useAuth } from "../context/AuthContext";

import { MODALIDADES_OFICIALES } from "../constants/modalidades";
export { MODALIDADES_OFICIALES };

const ETIQUETAS_ESTADO = {
  POSTULACION: "Postulación",
  REVISION_DOCUMENTAL: "Revisión Documental",
  APROBACION: "Aprobación",
  EN_PROCESO: "En Proceso",
  SUSTENTACION: "Sustentación",
  REVISION_COMITE: "Revisión Comité",
  FINALIZADO: "Finalizado",
  RECHAZADO: "Rechazado",
};

const ETIQUETAS_ESTADO_ACTIVAS = {
  POSTULACION: "Postulación",
  REVISION_DOCUMENTAL: "Revisión Documental",
  APROBACION: "Aprobación",
  EN_PROCESO: "En Proceso",
  SUSTENTACION: "Sustentación",
  REVISION_COMITE: "Revisión Comité",
};

function etiquetaBotonTransicion(estadoDestino) {
  const etiquetas = {
    REVISION_DOCUMENTAL: "Enviar a Revisión",
    APROBACION: "Aprobar y Continuar",
    EN_PROCESO: "Aprobar e Iniciar Proyecto",
    SUSTENTACION: "Aprobar y Sustentar",
    REVISION_COMITE: "Enviar a Revisión del Comité",
    FINALIZADO: "Aprobar y Finalizar Proyecto",
    RECHAZADO: "Rechazar definitivamente",
  };
  return etiquetas[estadoDestino] ?? estadoDestino;
}

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
 * Evalúa si el usuario autenticado tiene potestad para gestionar la etapa actual.
 */
function puedeGestionarEtapa(postulacion, usuario) {
  if (!usuario || !postulacion) return false;

  // Administrador pleno (no auxiliar) gestiona todo
  if (
    (usuario.rol === "ADMIN" || usuario.rol === "ADMINISTRADOR") &&
    !usuario.es_auxiliar
  ) {
    return true;
  }

  // Etapas del Comité de Trabajos de Grado
  // (previas a la asignación del asesor y revisión final tras sustentación)
  const estadosSoloComite = [
    "POSTULACION",
    "REVISION_DOCUMENTAL",
    "APROBACION",
    "REVISION_COMITE",
  ];
  if (estadosSoloComite.includes(postulacion.estado)) {
    return usuario.rol === "COMITE";
  }

  // EN_PROCESO y SUSTENTACIÓN son gestionadas por el Asesor asignado
  // El asesor conduce la sustentación y luego envía al Comité
  if (["EN_PROCESO", "SUSTENTACION"].includes(postulacion.estado)) {
    const asesorId = postulacion.asesor?.id ?? postulacion.asesor;
    return usuario.rol === "ASESOR" && asesorId === usuario.id;
  }

  return false;
}

/**
 * Genera el mensaje explicativo cuando la postulación está en modo solo lectura.
 */
function mensajeSoloLectura(postulacion, usuario) {
  if (!usuario || !postulacion) return "Modo solo lectura.";

  if (["FINALIZADO", "RECHAZADO"].includes(postulacion.estado)) {
    return "Proceso en estado final — no hay más acciones disponibles.";
  }

  // Etapas del Comité: previas y revisión final
  const estadosSoloComite = [
    "POSTULACION",
    "REVISION_DOCUMENTAL",
    "APROBACION",
    "REVISION_COMITE",
  ];
  if (estadosSoloComite.includes(postulacion.estado)) {
    if (usuario.rol !== "COMITE" && usuario.rol !== "ADMIN" && usuario.rol !== "ADMINISTRADOR") {
      return `Modo solo lectura: La gestión de esta etapa corresponde al Comité de Trabajos de Grado.`;
    }
  }

  // EN_PROCESO y SUSTENTACIÓN son del asesor
  if (["EN_PROCESO", "SUSTENTACION"].includes(postulacion.estado)) {
    const asesorId = postulacion.asesor?.id ?? postulacion.asesor;
    if (usuario.rol === "ASESOR" && asesorId !== usuario.id) {
      return `Modo solo lectura: Solo el asesor titular (${postulacion.asesor_nombre || "sin asignar"}) puede gestionar esta etapa.`;
    }
    if (usuario.rol === "COMITE") {
      return `El proyecto está siendo gestionado por el asesor asignado (${postulacion.asesor_nombre || "sin asignar"}) en la etapa '${postulacion.estado_display || postulacion.estado}'.`;
    }
    return `Modo solo lectura: La etapa '${postulacion.estado_display || postulacion.estado}' corresponde al asesor asignado (${postulacion.asesor_nombre || "sin asignar"}).`;
  }

  return "Modo solo lectura: No tienes permisos para gestionar esta etapa.";
}

export default function PanelAprobacion() {
  const { usuario } = useAuth();
  const [procesos, setProcesos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [observaciones, setObservaciones] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorCarga, setErrorCarga] = useState("");
  const [cargando, setCargando] = useState(true);

  // Estados inline por tarjeta para feedback inmediato al usuario
  const [erroresPorTarjeta, setErroresPorTarjeta] = useState({});
  const [documentosFaltantesPorTarjeta, setDocumentosFaltantesPorTarjeta] = useState({});
  const [mensajesAsignacion, setMensajesAsignacion] = useState({});

  // Pestañas
  const [pestanaActiva, setPestanaActiva] = useState("gestion"); // 'gestion' | 'historial'

  // Asignación de asesores
  const [asesores, setAsesores] = useState([]);
  const [asesoresSeleccionados, setAsesoresSeleccionados] = useState({});

  // Historial expandible por proyecto
  const [historialVisible, setHistorialVisible] = useState({});
  const [historialData, setHistorialData] = useState({});
  const [cargandoHistorial, setCargandoHistorial] = useState({});

  // Acordeón para expandir/colapsar tarjeta de proyecto (expandido por defecto para visualización directa)
  const [proyectosColapsados, setProyectosColapsados] = useState({});

  const toggleExpandirProyecto = (id) => {
    setProyectosColapsados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtros de búsqueda para la pestaña de Historial
  const [busquedaHistorial, setBusquedaHistorial] = useState("");
  const [filtroModalidadHistorial, setFiltroModalidadHistorial] = useState("");

  // Estado del Modal de Corrección / Devolución Ampliado
  const [modalCorreccion, setModalCorreccion] = useState({
    abierto: false,
    procesoId: null,
    tituloProyecto: "",
    estudianteNombre: "",
    esEdicion: false,
    observacion: "",
    archivo: null,
    archivoActual: null,
    eliminarArchivo: false,
    enviando: false,
    error: "",
  });

  // Estado del Modal de Notificación de Sustentación (asesor → estudiante)
  const [modalSustentacion, setModalSustentacion] = useState({
    abierto: false,
    procesoId: null,
    tituloProyecto: "",
    estudianteNombre: "",
    mensaje: "",
    archivo: null,
    archivoActual: null,
    eliminarArchivo: false,
    esEdicion: false,
    enviando: false,
    error: "",
  });

  // Estado del Modal "Enviar al Comité" (asesor → comité tras sustentación)
  const [modalEnviarComite, setModalEnviarComite] = useState({
    abierto: false,
    procesoId: null,
    estadoDestino: null,
    tituloProyecto: "",
    estudianteNombre: "",
    mensaje: "",
    archivo: null,
    enviando: false,
    error: "",
  });

  // Estado del Modal "Rechazo Definitivo"
  const [modalRechazo, setModalRechazo] = useState({
    abierto: false,
    procesoId: null,
    tituloProyecto: "",
    estudianteNombre: "",
    mensaje: "",
    archivo: null,
    enviando: false,
    error: "",
  });

  // Estado del Modal "Enviar a Asesor" (admin → asesor)
  const [modalEnviarAsesor, setModalEnviarAsesor] = useState({
    abierto: false,
    procesoId: null,
    tituloProyecto: "",
    estudianteNombre: "",
    asesorId: null,
    mensaje: "",
    archivo: null,
    archivoActual: null,
    eliminarArchivo: false,
    esEdicion: false,
    enviando: false,
    error: "",
  });

  // Estado de Solicitudes de Registro (Aprobación por Admin)
  const [solicitudesUsuarios, setSolicitudesUsuarios] = useState([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false);
  const [modalRechazoUsuario, setModalRechazoUsuario] = useState({
    abierto: false,
    usuario: null,
    motivo: "",
    enviando: false,
    error: "",
  });
  const [modalAprobadoExito, setModalAprobadoExito] = useState({
    abierto: false,
    usuario: null,
  });
  const [modalRechazadoExito, setModalRechazadoExito] = useState({
    abierto: false,
    usuario: null,
    motivo: "",
  });

  const cargarSolicitudesUsuarios = async () => {
    const esAdmin = usuario?.rol === "ADMIN" || usuario?.rol === "ADMINISTRADOR";
    if (!esAdmin) return;
    setCargandoSolicitudes(true);
    try {
      const { data } = await api.get("/usuarios/pendientes/");
      setSolicitudesUsuarios(data.results ?? data);
    } catch {
      // Silencioso
    } finally {
      setCargandoSolicitudes(false);
    }
  };

  const handleAprobarUsuario = async (u) => {
    try {
      await api.post(`/usuarios/${u.id}/aprobar/`);
      setMensajeExito(`Usuario @${u.username} (${u.first_name} ${u.last_name}) aprobado y activado exitosamente.`);
      setModalAprobadoExito({ abierto: true, usuario: u });
      await cargarSolicitudesUsuarios();
    } catch (err) {
      setMensaje(err.response?.data?.detail || "No se pudo activar la cuenta del usuario.");
    }
  };

  const handleRechazarUsuario = async (e) => {
    if (e) e.preventDefault();
    const u = modalRechazoUsuario.usuario;
    if (!u) return;
    setModalRechazoUsuario((prev) => ({ ...prev, enviando: true, error: "" }));
    try {
      await api.post(`/usuarios/${u.id}/rechazar/`, {
        motivo: modalRechazoUsuario.motivo,
      });
      setMensajeExito(`Solicitud del usuario @${u.username} rechazada.`);
      setModalRechazadoExito({
        abierto: true,
        usuario: u,
        motivo: modalRechazoUsuario.motivo,
      });
      setModalRechazoUsuario({ abierto: false, usuario: null, motivo: "", enviando: false, error: "" });
      await cargarSolicitudesUsuarios();
    } catch (err) {
      setModalRechazoUsuario((prev) => ({
        ...prev,
        enviando: false,
        error: err.response?.data?.detail || "No se pudo rechazar la solicitud.",
      }));
    }
  };

  const cargar = async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    setErrorCarga("");
    try {
      const { data } = await api.get("/postulaciones/", {
        params: filtroEstado ? { estado: filtroEstado } : {},
      });
      setProcesos(data.results ?? data);
    } catch {
      if (!silencioso) {
        setErrorCarga(
          "No se pudo cargar la lista de procesos. Verifica tu conexión e intenta de nuevo."
        );
        setProcesos([]);
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  };

  const cargarAsesores = async () => {
    const esComiteOAdmin =
      usuario?.rol === "COMITE" ||
      usuario?.rol === "ADMIN" ||
      usuario?.rol === "ADMINISTRADOR";
    if (esComiteOAdmin) {
      try {
        const { data } = await api.get("/usuarios/asesores/");
        setAsesores(data.results ?? data);
      } catch {
        // Silencioso
      }
    }
  };

  useEffect(() => {
    cargar();

    const handleFocus = () => {
      cargar(true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [filtroEstado]);

  useEffect(() => {
    cargarAsesores();
    cargarSolicitudesUsuarios();
  }, [usuario]);

  const transicionar = async (id, nuevo_estado) => {
    setMensaje("");
    setMensajeExito("");
    setErroresPorTarjeta((prev) => ({ ...prev, [id]: "" }));
    setDocumentosFaltantesPorTarjeta((prev) => ({ ...prev, [id]: [] }));
    try {
      await api.post(`/postulaciones/${id}/transicionar/`, {
        nuevo_estado,
        observacion: observaciones[id] || "",
      });
      setObservaciones((prev) => ({ ...prev, [id]: "" }));
      setMensajeExito("Etapa avanzada correctamente.");
      await cargar();
    } catch (e) {
      const faltantes = e.response?.data?.documentos_faltantes || [];
      const detalleError =
        (faltantes.length > 0
          ? `Faltan documentos obligatorios para avanzar a Revisión: ${faltantes.join(", ")}.`
          : e.response?.data?.detail) ||
        "No se pudo aplicar el cambio de estado.";
      setMensaje(detalleError);
      setErroresPorTarjeta((prev) => ({ ...prev, [id]: detalleError }));
      if (faltantes.length > 0) {
        setDocumentosFaltantesPorTarjeta((prev) => ({ ...prev, [id]: faltantes }));
      }
    }
  };

  const abrirModalCorreccion = (proceso, esEdicion = false) => {
    setModalCorreccion({
      abierto: true,
      procesoId: proceso.id,
      tituloProyecto: proceso.titulo_proyecto,
      estudianteNombre: proceso.estudiante_nombre,
      esEdicion,
      observacion: esEdicion
        ? proceso.observacion_correccion || ""
        : observaciones[proceso.id] || "",
      archivo: null,
      archivoActual: proceso.archivo_correccion || null,
      eliminarArchivo: false,
      enviando: false,
      error: "",
    });
  };

  const cerrarModalCorreccion = () => {
    setModalCorreccion({
      abierto: false,
      procesoId: null,
      tituloProyecto: "",
      estudianteNombre: "",
      esEdicion: false,
      observacion: "",
      archivo: null,
      archivoActual: null,
      eliminarArchivo: false,
      enviando: false,
      error: "",
    });
  };

  const handleGuardarCorreccionModal = async (e) => {
    if (e) e.preventDefault();
    const obs = modalCorreccion.observacion?.trim();
    if (!obs || obs.length < 10) {
      setModalCorreccion((prev) => ({
        ...prev,
        error: "Debes escribir una observación detallada de al menos 10 caracteres para orientar al estudiante.",
      }));
      return;
    }

    setModalCorreccion((prev) => ({ ...prev, enviando: true, error: "" }));
    try {
      const formData = new FormData();
      formData.append("observacion", obs);
      if (modalCorreccion.archivo) {
        formData.append("archivo", modalCorreccion.archivo);
      }
      if (modalCorreccion.esEdicion && modalCorreccion.eliminarArchivo) {
        formData.append("eliminar_archivo", "true");
      }

      const endpoint = modalCorreccion.esEdicion
        ? `/postulaciones/${modalCorreccion.procesoId}/modificar_correccion/`
        : `/postulaciones/${modalCorreccion.procesoId}/solicitar_correccion/`;

      await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setObservaciones((prev) => ({ ...prev, [modalCorreccion.procesoId]: "" }));
      setMensajeExito(
        modalCorreccion.esEdicion
          ? "Observación de corrección y archivo de retroalimentación actualizados exitosamente."
          : "Observación de corrección y archivo de retroalimentación enviados al estudiante con éxito."
      );
      cerrarModalCorreccion();
      await cargar();
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No se pudo registrar la solicitud de corrección. Verifica los datos e intenta de nuevo.";
      setModalCorreccion((prev) => ({ ...prev, error: detalle, enviando: false }));
    }
  };

  const cancelarCorreccion = async (procesoId, titulo) => {
    if (
      !window.confirm(
        `¿Confirmas que deseas cancelar y retirar la solicitud de corrección para el proyecto "${
          titulo || "Sin título"
        }"? El trámite volverá a estar activo y se desbloqueará inmediatamente.`
      )
    ) {
      return;
    }
    setMensaje("");
    setMensajeExito("");
    try {
      await api.post(`/postulaciones/${procesoId}/cancelar_correccion/`);
      setMensajeExito("Solicitud de corrección cancelada. El trámite ha sido reanudado.");
      await cargar();
    } catch (err) {
      const detalle =
        err.response?.data?.detail || "No se pudo cancelar la solicitud de corrección.";
      setMensaje(detalle);
      setErroresPorTarjeta((prev) => ({ ...prev, [procesoId]: detalle }));
    }
  };

  const solicitarCorreccion = async (id) => {
    const proceso = procesos.find((p) => p.id === id);
    if (proceso) {
      abrirModalCorreccion(proceso, false);
    }
  };

  const abrirModalSustentacion = (proceso, esEdicion = false) => {
    setModalSustentacion({
      abierto: true,
      procesoId: proceso.id,
      tituloProyecto: proceso.titulo_proyecto,
      estudianteNombre: proceso.estudiante_nombre,
      mensaje: esEdicion ? proceso.mensaje_sustentacion || "" : "",
      archivo: null,
      archivoActual: proceso.archivo_sustentacion || null,
      eliminarArchivo: false,
      esEdicion,
      enviando: false,
      error: "",
    });
  };

  const cerrarModalSustentacion = () => {
    setModalSustentacion({
      abierto: false,
      procesoId: null,
      tituloProyecto: "",
      estudianteNombre: "",
      mensaje: "",
      archivo: null,
      archivoActual: null,
      eliminarArchivo: false,
      esEdicion: false,
      enviando: false,
      error: "",
    });
  };

  const eliminarSustentacion = async (procesoId, titulo) => {
    if (!window.confirm(`¿Estás seguro de eliminar la citación a sustentación para "${titulo || "este proyecto"}"?`)) return;
    try {
      await api.delete(`/postulaciones/${procesoId}/eliminar_sustentacion/`);
      setMensajeExito("Sustentación eliminada con éxito.");
      await cargar();
    } catch (e) {
      setMensaje(e.response?.data?.detail || "Error al eliminar sustentación.");
    }
  };

  const handleEnviarSustentacion = async (e) => {
    if (e) e.preventDefault();
    const msg = modalSustentacion.mensaje?.trim();
    if (!msg || msg.length < 10) {
      setModalSustentacion((prev) => ({
        ...prev,
        error: "Debes escribir un mensaje de al menos 10 caracteres para el estudiante.",
      }));
      return;
    }
    setModalSustentacion((prev) => ({ ...prev, enviando: true, error: "" }));
    try {
      const formData = new FormData();
      formData.append("mensaje", msg);
      if (modalSustentacion.archivo) {
        formData.append("archivo", modalSustentacion.archivo);
      }
      if (modalSustentacion.esEdicion && modalSustentacion.eliminarArchivo) {
        formData.append("eliminar_archivo", "true");
      }
      const endpoint = modalSustentacion.esEdicion
        ? `/postulaciones/${modalSustentacion.procesoId}/modificar_sustentacion/`
        : `/postulaciones/${modalSustentacion.procesoId}/notificar_sustentacion/`;
        
      await api.post(
        endpoint,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMensajeExito(
        modalSustentacion.esEdicion ? "Notificación de sustentación actualizada con éxito." : "Notificación de sustentación enviada al estudiante con éxito."
      );
      cerrarModalSustentacion();
      await cargar();
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No se pudo enviar la notificación. Verifica los datos e intenta de nuevo.";
      setModalSustentacion((prev) => ({ ...prev, error: detalle, enviando: false }));
    }
  };

  const abrirModalEnviarComite = (proceso, estadoDestino) => {
    setModalEnviarComite({
      abierto: true,
      procesoId: proceso.id,
      estadoDestino,
      tituloProyecto: proceso.titulo_proyecto,
      estudianteNombre: proceso.estudiante_nombre,
      mensaje: "",
      archivo: null,
      enviando: false,
      error: "",
    });
  };

  const cerrarModalEnviarComite = () => {
    setModalEnviarComite({
      abierto: false,
      procesoId: null,
      estadoDestino: null,
      tituloProyecto: "",
      estudianteNombre: "",
      mensaje: "",
      archivo: null,
      enviando: false,
      error: "",
    });
  };

  const handleEnviarComite = async (e) => {
    if (e) e.preventDefault();
    setModalEnviarComite((prev) => ({ ...prev, enviando: true, error: "" }));
    try {
      const formData = new FormData();
      formData.append("nuevo_estado", modalEnviarComite.estadoDestino);
      formData.append(
        "observacion",
        modalEnviarComite.mensaje.trim() ||
          "Asesor envía al Comité tras sustentación aprobada."
      );
      if (modalEnviarComite.archivo) {
        formData.append("archivo", modalEnviarComite.archivo);
      }
      await api.post(
        `/postulaciones/${modalEnviarComite.procesoId}/transicionar/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMensajeExito(
        "Proyecto enviado al Comité de Trabajos de Grado correctamente. Se les notificó por correo."
      );
      cerrarModalEnviarComite();
      await cargar();
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No se pudo enviar al Comité. Verifica e intenta de nuevo.";
      setModalEnviarComite((prev) => ({ ...prev, error: detalle, enviando: false }));
    }
  };

  const abrirModalRechazo = (proceso) => {
    setModalRechazo({
      abierto: true,
      procesoId: proceso.id,
      tituloProyecto: proceso.titulo_proyecto,
      estudianteNombre: proceso.estudiante_nombre,
      mensaje: "",
      archivo: null,
      enviando: false,
      error: "",
    });
  };

  const cerrarModalRechazo = () => {
    setModalRechazo({
      abierto: false,
      procesoId: null,
      tituloProyecto: "",
      estudianteNombre: "",
      mensaje: "",
      archivo: null,
      enviando: false,
      error: "",
    });
  };

  const handleRechazarDefinitivo = async (e) => {
    e.preventDefault();
    if (!modalRechazo.procesoId) return;
    setModalRechazo((prev) => ({ ...prev, enviando: true, error: "" }));

    try {
      const formData = new FormData();
      formData.append("nuevo_estado", "RECHAZADO");
      
      const prefijo = modalRechazo.mensaje.trim() ? "Rechazo Definitivo: " : "";
      if (modalRechazo.mensaje.trim()) {
        formData.append("observacion", prefijo + modalRechazo.mensaje);
      } else {
        formData.append("observacion", "Rechazo Definitivo del proyecto.");
      }
      
      if (modalRechazo.archivo) {
        formData.append("archivo", modalRechazo.archivo);
      }

      await api.post(
        `/postulaciones/${modalRechazo.procesoId}/transicionar/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMensajeExito(
        "Proyecto rechazado definitivamente. Se le ha notificado al estudiante."
      );
      cerrarModalRechazo();
      await cargar();
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No se pudo registrar el rechazo. Verifica e intenta de nuevo.";
      setModalRechazo((prev) => ({ ...prev, error: detalle, enviando: false }));
    }
  };

  const abrirModalEnviarAsesor = (proceso, esEdicion = false) => {
    const asesorIdActual =
      asesoresSeleccionados[proceso.id] || proceso.asesor?.id || proceso.asesor || null;
    setModalEnviarAsesor({
      abierto: true,
      procesoId: proceso.id,
      tituloProyecto: proceso.titulo_proyecto,
      estudianteNombre: proceso.estudiante_nombre,
      asesorId: asesorIdActual,
      mensaje: esEdicion ? proceso.mensaje_asesor || "" : "",
      archivo: null,
      archivoActual: proceso.archivo_asesor || null,
      eliminarArchivo: false,
      esEdicion,
      enviando: false,
      error: "",
    });
  };

  const cerrarModalEnviarAsesor = () => {
    setModalEnviarAsesor({
      abierto: false,
      procesoId: null,
      tituloProyecto: "",
      estudianteNombre: "",
      asesorId: null,
      mensaje: "",
      archivo: null,
      archivoActual: null,
      eliminarArchivo: false,
      esEdicion: false,
      enviando: false,
      error: "",
    });
  };

  const eliminarDirectriz = async (procesoId, titulo) => {
    if (!window.confirm(`¿Estás seguro de eliminar la directriz enviada al asesor para "${titulo || "este proyecto"}"?`)) return;
    try {
      await api.delete(`/postulaciones/${procesoId}/eliminar_directriz/`);
      setMensajeExito("Directriz eliminada con éxito.");
      await cargar();
    } catch (e) {
      setMensaje(e.response?.data?.detail || "Error al eliminar directriz.");
    }
  };

  const handleEnviarAsesor = async (e) => {
    if (e) e.preventDefault();
    if (!modalEnviarAsesor.asesorId && !modalEnviarAsesor.esEdicion) {
      setModalEnviarAsesor((prev) => ({
        ...prev,
        error: "Debes seleccionar un asesor antes de enviar el proyecto.",
      }));
      return;
    }
    setModalEnviarAsesor((prev) => ({ ...prev, enviando: true, error: "" }));
    try {
      const formData = new FormData();
      if (!modalEnviarAsesor.esEdicion) {
        formData.append("asesor_id", modalEnviarAsesor.asesorId);
        formData.append("transicionar", "true");
      }
      if (modalEnviarAsesor.mensaje.trim()) {
        formData.append("mensaje", modalEnviarAsesor.mensaje.trim());
      }
      if (modalEnviarAsesor.archivo) {
        formData.append("archivo", modalEnviarAsesor.archivo);
      }
      if (modalEnviarAsesor.esEdicion && modalEnviarAsesor.eliminarArchivo) {
        formData.append("eliminar_archivo", "true");
      }
      
      const endpoint = modalEnviarAsesor.esEdicion
        ? `/postulaciones/${modalEnviarAsesor.procesoId}/modificar_directriz/`
        : `/postulaciones/${modalEnviarAsesor.procesoId}/asignar_asesor/`;
        
      await api.post(
        endpoint,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMensajeExito(
        modalEnviarAsesor.esEdicion ? "Directriz al asesor modificada con éxito." : "Proyecto enviado al asesor con éxito."
      );
      cerrarModalEnviarAsesor();
      await cargar();
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No se pudo enviar al asesor. Verifica los datos e intenta de nuevo.";
      setModalEnviarAsesor((prev) => ({ ...prev, error: detalle, enviando: false }));
    }
  };

  const asignarAsesor = async (procesoId) => {
    const asesorId = asesoresSeleccionados[procesoId];
    if (!asesorId) {
      const err = "Por favor selecciona un asesor de la lista desplegable.";
      setMensaje(err);
      setErroresPorTarjeta((prev) => ({ ...prev, [procesoId]: err }));
      return;
    }
    setMensaje("");
    setMensajeExito("");
    setErroresPorTarjeta((prev) => ({ ...prev, [procesoId]: "" }));
    try {
      await api.post(`/postulaciones/${procesoId}/asignar_asesor/`, {
        asesor_id: asesorId,
        mensaje: mensajesAsignacion[procesoId] || "",
      });
      setMensajeExito("Asesor asignado formalmente con éxito.");
      setMensajesAsignacion((prev) => ({ ...prev, [procesoId]: "" }));
      await cargar();
    } catch (e) {
      const err = e.response?.data?.detail || "No se pudo asignar el asesor seleccionado.";
      setMensaje(err);
      setErroresPorTarjeta((prev) => ({ ...prev, [procesoId]: err }));
    }
  };

  const eliminarPostulacion = async (procesoId, titulo) => {
    if (
      !window.confirm(
        `¿Confirmas que deseas eliminar permanentemente la postulación "${
          titulo || "Sin título"
        }"? Esta acción cancelará la solicitud y sus documentos adjuntos.`
      )
    ) {
      return;
    }
    setMensaje("");
    setMensajeExito("");
    try {
      await api.delete(`/postulaciones/${procesoId}/`);
      setMensajeExito("Postulación eliminada exitosamente del sistema.");
      await cargar();
    } catch (e) {
      setMensaje(
        e.response?.data?.detail || "No se pudo eliminar la postulación."
      );
    }
  };

  const toggleHistorial = async (id) => {
    const abierto = !!historialVisible[id];
    setHistorialVisible((prev) => ({ ...prev, [id]: !abierto }));

    if (!abierto && !historialData[id]) {
      setCargandoHistorial((prev) => ({ ...prev, [id]: true }));
      try {
        const { data } = await api.get(`/postulaciones/${id}/historial/`);
        setHistorialData((prev) => ({ ...prev, [id]: data }));
      } catch {
        setHistorialData((prev) => ({ ...prev, [id]: [] }));
      } finally {
        setCargandoHistorial((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  // Métricas
  const esAsesor = usuario?.rol === "ASESOR";
  const esComite = usuario?.rol === "COMITE";
  const esAdmin = usuario?.rol === "ADMIN" || usuario?.rol === "ADMINISTRADOR";

  const totalProcesos = procesos.length;
  const enProceso = procesos.filter((p) => p.estado === "EN_PROCESO").length;
  const requierenCorreccion = procesos.filter((p) => p.requiere_correccion).length;
  const finalizados = procesos.filter(
    (p) => p.estado === "FINALIZADO" || p.estado === "REVISION_COMITE" || p.estado === "SUSTENTACION"
  ).length;
  const sinAsesor = procesos.filter((p) => !p.asesor).length;

  // Filtrado de proyectos para la pestaña de Historial
  const proyectosFiltradosHistorial = procesos.filter((p) => {
    const coincideTexto =
      !busquedaHistorial ||
      (p.estudiante_nombre &&
        p.estudiante_nombre
          .toLowerCase()
          .includes(busquedaHistorial.toLowerCase())) ||
      (p.titulo_proyecto &&
        p.titulo_proyecto
          .toLowerCase()
          .includes(busquedaHistorial.toLowerCase())) ||
      (p.modalidad_nombre &&
        p.modalidad_nombre
          .toLowerCase()
          .includes(busquedaHistorial.toLowerCase())) ||
      (p.asesor_nombre &&
        p.asesor_nombre
          .toLowerCase()
          .includes(busquedaHistorial.toLowerCase()));

    const coincideModalidad =
      !filtroModalidadHistorial || p.modalidad_nombre === filtroModalidadHistorial;

    return coincideTexto && coincideModalidad;
  });

  // Modalidad actualmente seleccionada para ver su ficha
  const modalidadSeleccionadaInfo = MODALIDADES_OFICIALES.find(
    (m) => m.nombre === filtroModalidadHistorial
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 mt-6">
      {/* Encabezado contextual según el rol */}
      <div className="bg-gradient-to-r from-slate-900 via-itm-blue-dark to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/10 text-blue-200 border border-white/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {esAsesor
                  ? "Panel del Docente Asesor"
                  : esComite
                  ? "Comité de Trabajos de Grado"
                  : "Administración Institucional"}
              </span>
              <span className="text-xs text-blue-200">
                • {usuario?.first_name || usuario?.username}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Panel de Control de Procesos
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {esAsesor
                ? "Supervisa los proyectos asignados a tu asesoría académica, revisa entregables, emite retroalimentación y gestiona la aprobación de etapas."
                : esComite
                ? "Revisión documental, aprobación de postulaciones, asignación de docentes asesores y control de sustentaciones."
                : "Control global del ciclo de vida de modalidades de grado del ITM."}
            </p>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <p className="text-2xl font-black text-white">{totalProcesos}</p>
              <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wide">
                {esAsesor ? "Mis Asesorías" : "Total Trámites"}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <p className="text-2xl font-black text-amber-300">{enProceso}</p>
              <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wide">
                En Proceso
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <p className="text-2xl font-black text-red-300">{requierenCorreccion}</p>
              <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wide">
                Corrección
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <p className="text-2xl font-black text-emerald-300">
                {esAsesor ? finalizados : sinAsesor}
              </p>
              <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wide">
                {esAsesor ? "Finalizados" : "Sin Asesor"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de navegación: Procesos Activos vs Historial Completo */}
      <div className="flex flex-col md:flex-row border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm">
        <button
          onClick={() => setPestanaActiva("gestion")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            pestanaActiva === "gestion"
              ? "bg-itm-blue text-white shadow-md shadow-itm-blue/20"
              : "text-slate-600 hover:text-itm-blue hover:bg-slate-50"
          }`}
        >
          <span>📋</span>
          <span>
            Gestión de Procesos ({procesos.filter((p) => !["FINALIZADO", "RECHAZADO", "REVISION_COMITE"].includes(p.estado)).length})
          </span>
        </button>
        <button
          onClick={() => setPestanaActiva("comite")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            pestanaActiva === "comite"
              ? "bg-itm-blue text-white shadow-md shadow-itm-blue/20"
              : "text-slate-600 hover:text-itm-blue hover:bg-slate-50"
          }`}
        >
          <span>🏛️</span>
          <span>
            Revisión Comité ({procesos.filter((p) => p.estado === "REVISION_COMITE" || p.estado === "FINALIZADO").length})
          </span>
        </button>
        <button
          onClick={() => setPestanaActiva("historial")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            pestanaActiva === "historial"
              ? "bg-itm-blue text-white shadow-md shadow-itm-blue/20"
              : "text-slate-600 hover:text-itm-blue hover:bg-slate-50"
          }`}
        >
          <span>📜</span>
          <span>Historial y Trazabilidad de Proyectos</span>
        </button>
        {(usuario?.rol === "ADMIN" || usuario?.rol === "ADMINISTRADOR") && (
          <button
            onClick={() => {
              setPestanaActiva("usuarios");
              cargarSolicitudesUsuarios();
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              pestanaActiva === "usuarios"
                ? "bg-itm-blue text-white shadow-md shadow-itm-blue/20"
                : "text-slate-600 hover:text-itm-blue hover:bg-slate-50"
            }`}
          >
            <span>👥</span>
            <span>Solicitudes de Usuarios</span>
            {solicitudesUsuarios.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-1 animate-pulse">
                {solicitudesUsuarios.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Alertas */}
      {mensaje && (
        <div
          role="alert"
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3"
        >
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-red-700 font-semibold">{mensaje}</p>
          </div>
        </div>
      )}

      {mensajeExito && (
        <div
          role="alert"
          className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3"
        >
          <span className="text-xl">✅</span>
          <div>
            <p className="text-emerald-800 font-semibold">{mensajeExito}</p>
          </div>
        </div>
      )}

      {/* Alerta Destacada para el Administrador / Evaluador de Procesos Subsanados */}
      {(() => {
        const procesosSubsanados = procesos.filter(
          (p) =>
            (p.mensaje_subsanacion || p.subsanado_en) &&
            !p.requiere_correccion &&
            p.estado !== "FINALIZADO" &&
            p.estado !== "RECHAZADO"
        );
        if (procesosSubsanados.length === 0) return null;
        return (
          <div
            role="alert"
            className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-l-4 border-emerald-500 p-4 rounded-r-2xl shadow-sm flex items-start justify-between gap-4 animate-in fade-in"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5 animate-bounce">🔔</span>
              <div>
                <p className="text-emerald-950 font-black text-sm">
                  ¡Atención Administrador! Tienes {procesosSubsanados.length} proyecto{procesosSubsanados.length === 1 ? "" : "s"} con correcciones recién subsanadas por el estudiante
                </p>
                <p className="text-emerald-800 text-xs mt-1 leading-relaxed">
                  El estudiante ya atendió las observaciones solicitadas y radicó los ajustes. Los expedientes se encuentran listos para que los revises y continúes con el avance de etapa.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {procesosSubsanados.map((pSub) => (
                    <span
                      key={pSub.id}
                      className="bg-white text-emerald-900 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs flex items-center gap-1.5"
                    >
                      <span>🎓</span>
                      <span>{pSub.estudiante_nombre}</span>
                      <span className="text-slate-400 font-normal">|</span>
                      <span className="italic">{pSub.titulo_proyecto ? `"${pSub.titulo_proyecto}"` : pSub.modalidad_nombre}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {errorCarga && (
        <div
          role="alert"
          className="glass-panel border-t-4 border-red-500 rounded-2xl p-8 text-center mt-6"
        >
          <p className="text-red-700 font-bold text-lg mb-4">{errorCarga}</p>
          <button
            onClick={cargar}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg shadow transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {cargando && !errorCarga && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-itm-purple"></div>
        </div>
      )}

      {/* PESTAÑA 1 y COMITÉ: GESTIÓN DE PROCESOS ACTIVOS Y EN REVISIÓN */}
      {!cargando && !errorCarga && (pestanaActiva === "gestion" || pestanaActiva === "comite") && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {pestanaActiva === "comite" 
                ? "Proyectos radicados al Comité para evaluación final"
                : esAsesor
                ? "Proyectos donde ejerces como asesor titular"
                : "Trámites activos radicados en plataforma"}
            </p>
            <div className="flex items-center gap-3">
              <label
                htmlFor="filtro-estado"
                className="text-sm font-bold text-itm-blue"
              >
                Filtro:
              </label>
              <select
                id="filtro-estado"
                className="border-2 border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-itm-purple bg-white shadow-sm transition-all"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                aria-label="Filtrar procesos por estado"
              >
                <option value="">Todos los estados</option>
                {Object.entries(ETIQUETAS_ESTADO).map(([valor, label]) => (
                  <option key={valor} value={valor}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(() => {
            const procesosFiltrados = procesos.filter((p) => {
              if (pestanaActiva === "gestion") {
                if (["FINALIZADO", "RECHAZADO", "REVISION_COMITE"].includes(p.estado)) return false;
              } else if (pestanaActiva === "comite") {
                if (!["REVISION_COMITE", "FINALIZADO"].includes(p.estado)) return false;
              }
              if (filtroEstado) return p.estado === filtroEstado;
              return true;
            });

            if (procesosFiltrados.length === 0) {
              return (
                <div className="glass-panel rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                  <span className="text-4xl block mb-3">📭</span>
                  <p className="text-slate-800 font-bold text-base mb-1">
                    {filtroEstado
                      ? `0 proyectos encontrados en etapa: ${ETIQUETAS_ESTADO[filtroEstado] || filtroEstado}`
                      : "No hay procesos registrados en esta vista"}
                  </p>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">
                    Prueba seleccionando 'Todos los estados' o cambiando el filtro de búsqueda.
                  </p>
                </div>
              );
            }


            return procesosFiltrados.map((p) => (
              <article
                key={p.id}
                className="glass-panel rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border-t-4 border-transparent hover:border-itm-purple"
              >
                {/* Encabezado de la Tarjeta del Proyecto con datos institucionales completos del estudiante */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-black text-slate-900">
                        {p.estudiante_nombre}
                      </h3>
                      {p.estudiante_cedula && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-mono font-bold border border-slate-200">
                          CC: {p.estudiante_cedula}
                        </span>
                      )}
                    </div>

                    {/* Ficha institucional completa del estudiante */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-xs text-slate-600 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
                      <p className="flex items-center gap-1.5">
                        <span>🎓</span>
                        <span>
                          <strong className="text-slate-700">Programa:</strong>{" "}
                          {p.estudiante_programa || "Tecnología en Desarrollo de Software"}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span>📧</span>
                        <span>
                          <strong className="text-slate-700">Correo:</strong>{" "}
                          <a
                            href={`mailto:${p.estudiante_email}`}
                            className="text-itm-blue hover:underline"
                          >
                            {p.estudiante_email || `${p.estudiante}@correo.itm.edu.co`}
                          </a>
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span>📚</span>
                        <span>
                          <strong className="text-slate-700">Semestre:</strong>{" "}
                          {p.estudiante_semestre || "6° Semestre"}
                        </span>
                      </p>
                    </div>


                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      <span className="bg-blue-50 text-itm-blue border border-blue-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                        {p.modalidad_nombre}
                      </span>
                      {p.titulo_proyecto && (
                        <span className="text-sm font-semibold text-slate-700 italic">
                          "{p.titulo_proyecto}"
                        </span>
                      )}
                    </div>

                    {/* Asesor Asignado info */}
                    <div className="text-xs flex items-center gap-2 text-slate-600 pt-1">
                      <span className="font-bold text-slate-700">Docente Asesor:</span>
                      {p.asesor_nombre ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <span>👤</span>
                          <span>{p.asesor_nombre}</span>
                          {p.asesor_email && (
                            <span className="text-slate-500 font-normal">({p.asesor_email})</span>
                          )}
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                          ⚠️ Sin Asesor Asignado (Pendiente de asignación por Comité/Admin)
                        </span>
                      )}
                    </div>

                    {p.requiere_correccion && (
                      <span className="inline-flex items-center gap-1 mt-2 bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                        <span>⚠️</span> Corrección pendiente por el estudiante
                      </span>
                    )}

                    {(p.mensaje_subsanacion || p.subsanado_en) &&
                      !p.requiere_correccion &&
                      p.estado !== "FINALIZADO" &&
                      p.estado !== "RECHAZADO" && (
                        <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-500 text-emerald-950 shadow-xs flex items-center justify-between gap-3 flex-wrap animate-in fade-in">
                          <div className="flex items-center gap-2">
                            <span className="text-xl animate-bounce">🔔</span>
                            <div>
                              <span className="font-black text-xs text-emerald-900 uppercase tracking-wide block">
                                ¡Corrección Subsanada por el Estudiante! (Listo para tu revisión)
                              </span>
                              <span className="text-xs text-emerald-800 font-medium italic">
                                "{p.mensaje_subsanacion || "Ajustes radicados satisfactoriamente."}"
                              </span>
                            </div>
                          </div>
                          {p.subsanado_en && (
                            <span className="text-[11px] font-bold bg-white text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
                              Subsanado el {formatearFecha(p.subsanado_en)}
                            </span>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <EstadoBadge estado={p.estado} texto={p.estado_display} />
                    <button
                      onClick={() => toggleExpandirProyecto(p.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs bg-white text-slate-700 hover:bg-slate-50 hover:text-itm-purple"
                    >
                      <span>{!proyectosColapsados[p.id] ? "🔼" : "🔽"}</span>
                      <span>
                        {!proyectosColapsados[p.id] ? "Ocultar Detalles" : "Ver Detalles y Acciones"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Contenido Expandible del Proyecto (Visible por defecto) */}
                {!proyectosColapsados[p.id] && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">

              {/* Directriz del Comité/Admin para el Asesor si existe */}
              {p.mensaje_asesor && (
                <div className="mt-3 p-3 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-col sm:flex-row sm:items-start gap-2.5">
                  <span className="text-base shrink-0">📌</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-blue-700 block">
                      Directriz / Instrucción para el Docente Asesor:
                    </span>
                    <span className="font-medium italic whitespace-pre-wrap">"{p.mensaje_asesor}"</span>
                    {p.archivo_asesor && (
                      <div className="mt-2 text-[11px] font-bold text-itm-blue hover:text-itm-purple">
                        <a href={obtenerUrlDocumento(p.archivo_asesor)} target="_blank" rel="noreferrer">
                          📎 Ver Documento Adjunto ↗
                        </a>
                      </div>
                    )}
                  </div>
                  {esAdmin && (
                    <div className="shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
                      <button 
                        onClick={() => abrirModalEnviarAsesor(p, true)} 
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 border border-blue-300 hover:border-blue-500 rounded px-2 py-1 bg-white shadow-2xs transition-colors"
                      >
                        ✏️ Modificar
                      </button>
                      <button 
                        onClick={() => eliminarDirectriz(p.id, p.titulo_proyecto)} 
                        className="text-[11px] font-bold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 rounded px-2 py-1 bg-white shadow-2xs transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Selector de Asesor con Mensaje (para Admin) */}
              {esAdmin && asesores.length > 0 && (
                <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Asignar / Cambiar Asesor:
                    </span>
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <select
                        className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium focus:ring-2 focus:ring-itm-purple w-full"
                        value={
                          asesoresSeleccionados[p.id] ??
                          (p.asesor?.id ?? p.asesor ?? "")
                        }
                        onChange={(e) =>
                          setAsesoresSeleccionados({
                            ...asesoresSeleccionados,
                            [p.id]: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Seleccionar Docente Asesor --</option>
                        {asesores.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.first_name} {a.last_name} ({a.email})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => asignarAsesor(p.id)}
                        className="shrink-0 text-xs font-bold bg-itm-blue hover:bg-itm-blue-dark text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                      >
                        Asignar
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Escribe una directriz o mensaje de asignación para el profesor asesor (opcional)"
                    value={mensajesAsignacion[p.id] || ""}
                    onChange={(e) =>
                      setMensajesAsignacion({
                        ...mensajesAsignacion,
                        [p.id]: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-itm-purple placeholder:text-slate-400 font-medium"
                  />
                </div>
              )}

              {/* Botón para ver bitácora */}
              <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => toggleHistorial(p.id)}
                  className="text-xs text-itm-blue hover:text-itm-purple font-bold flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 transition-colors shadow-xs"
                >
                  <span>📜</span>
                  <span>
                    {historialVisible[p.id] ? "Ocultar Bitácora del Trámite" : "Ver Bitácora y Auditoría"}
                  </span>
                </button>
              </div>

              {/* Historial desplegable / Bitácora dentro de la tarjeta */}
              {historialVisible[p.id] && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                    <span>📜</span> Bitácora y Auditoría del Trámite
                  </h4>
                  {cargandoHistorial[p.id] ? (
                    <p className="text-xs text-slate-500 italic">
                      Cargando eventos de auditoría...
                    </p>
                  ) : historialData[p.id]?.length > 0 ? (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                      {historialData[p.id].map((h) => (
                        <div
                          key={h.id}
                          className="text-xs bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
                            <span>
                              {h.estado_anterior_display || h.estado_anterior} ➔{" "}
                              <strong className="text-itm-blue">
                                {h.estado_nuevo_display || h.estado_nuevo}
                              </strong>
                            </span>
                            <span className="text-slate-400 font-normal">
                              {formatearFecha(h.fecha)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Por: <strong>{h.realizado_por}</strong>
                          </p>
                          {h.observacion && (
                            <p className="text-xs italic text-slate-800 bg-slate-50 p-1.5 rounded mt-1 border-l-2 border-itm-purple">
                              "{h.observacion}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No hay eventos de auditoría registrados aún para este trámite.
                    </p>
                  )}
                </div>
              )}

              {/* Anuncio destacado si el estudiante acaba de radicar subsanación */}
              {(p.mensaje_subsanacion || p.subsanado_en) && !p.requiere_correccion && (
                <div className="mt-4 mb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-itm-blue p-4 rounded-2xl shadow-xs space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-extrabold text-itm-blue text-sm">
                      <span>🔔</span>
                      <span>Subsanación de correcciones radicada por el estudiante</span>
                    </div>
                    {p.subsanado_en && (
                      <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-blue-200">
                        Radicado el {formatearFecha(p.subsanado_en)}
                      </span>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-200/80 shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Mensaje del estudiante:
                    </p>
                    <p className="text-slate-800 font-medium italic">
                      "{p.mensaje_subsanacion || "El estudiante reportó las correcciones como subsanadas."}"
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    💡 Revisa los documentos corregidos a continuación en <strong>Documentos del Estudiante</strong>. Si la entrega es satisfactoria, utiliza el botón de aprobación para continuar al siguiente proceso.
                  </p>
                </div>
              )}

              {/* Sección de Documentos Radicados (Bloque 15) */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <span>📎</span> Documentos del Estudiante
                </h4>
                {p.documentos && p.documentos.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {p.documentos.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p
                            className="text-xs font-bold text-slate-800 truncate"
                            title={doc.nombre}
                          >
                            📄 {doc.nombre}
                          </p>
                          {doc.descripcion && (
                            <p className="text-[11px] text-slate-600 truncate italic">
                              {doc.descripcion}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400">
                            {formatearFecha(doc.subido_en)}
                          </p>
                        </div>
                        <a
                          href={obtenerUrlDocumento(doc.archivo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Descargar o ver documento ${doc.nombre}`}
                          className="shrink-0 text-xs font-bold text-itm-blue hover:text-itm-purple hover:underline bg-white px-2.5 py-1.5 rounded border border-slate-200 shadow-2xs"
                        >
                          Ver / Descargar ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    El estudiante aún no ha subido documentos para este trámite.
                  </p>
                )}
              </div>

              {/* Sección de Citación a Sustentación */}
              {(p.mensaje_sustentacion || p.archivo_sustentacion) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-itm-purple mb-3 flex items-center gap-1.5">
                    <span>🎓</span> Historial: Citación a Sustentación
                  </h4>
                  <div className="bg-white border-l-4 border-itm-purple p-4 rounded-r-xl shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>👤</span> Enviado por: {p.asesor_nombre || "Asesor Asignado"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        🗓️ {p.actualizada_en ? formatearFecha(p.actualizada_en) : "Fecha registrada"}
                      </span>
                    </div>
                    {p.mensaje_sustentacion && (
                      <div className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100 mb-3 whitespace-pre-wrap leading-relaxed">
                        {p.mensaje_sustentacion}
                      </div>
                    )}
                    {p.archivo_sustentacion && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50 p-2.5 rounded-lg border border-purple-100 text-xs mb-3">
                        <span className="text-purple-900 font-medium flex items-center gap-1.5">
                          <span>📎</span> Archivo adjunto de la citación
                        </span>
                        <a
                          href={obtenerUrlDocumento(p.archivo_sustentacion)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-itm-blue hover:text-itm-purple hover:underline bg-white px-3 py-1.5 rounded-md border border-purple-200 shadow-2xs text-center"
                        >
                          Ver Documento ↗
                        </a>
                      </div>
                    )}
                    
                    {/* Botones de gestión para el Asesor */}
                    {esAsesor && p.estado === "SUSTENTACION" && (
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button 
                          onClick={() => abrirModalSustentacion(p, true)} 
                          className="text-[11px] font-bold text-itm-blue hover:text-itm-purple border border-blue-200 hover:border-blue-400 rounded px-3 py-1.5 bg-white shadow-2xs transition-colors"
                        >
                          ✏️ Modificar
                        </button>
                        <button 
                          onClick={() => eliminarSustentacion(p.id, p.titulo_proyecto)} 
                          className="text-[11px] font-bold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 rounded px-3 py-1.5 bg-white shadow-2xs transition-colors"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sección de Acciones y Gestión de Etapa (Bloque 21) */}
              {(() => {
                // 1. Regla terminal inmutable: Procesos finalizados o rechazados no admiten más acciones ni correcciones
                if (["FINALIZADO", "RECHAZADO"].includes(p.estado)) {
                  return (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className={`flex items-center gap-2 text-xs font-semibold p-3 rounded-lg border ${
                        p.estado === "FINALIZADO"
                          ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                          : "text-slate-600 bg-slate-50 border-slate-200"
                      }`}>
                        <span>{p.estado === "FINALIZADO" ? "🎓" : "🛑"}</span>
                        <span>
                          {p.estado === "FINALIZADO"
                            ? "Proyecto finalizado y aprobado formalmente. El proceso de grado culminó con éxito y el certificado oficial ya está disponible."
                            : "Proceso rechazado definitivamente — trámite cerrado."}
                        </span>
                      </div>
                    </div>
                  );
                }

                const puedeGestionar = puedeGestionarEtapa(p, usuario);

                // 2. Modo solo lectura para etapas no gestionables por el usuario
                if (!puedeGestionar) {
                  return (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                        <span>🔒</span>
                        <span>{mensajeSoloLectura(p, usuario)}</span>
                      </div>
                      {esAsesor && (
                        <p className="text-[11px] text-slate-400 mt-1.5 pl-1 italic">
                          Nota: Como docente asesor asignado, tu gestión académica de entregables, observaciones y visto bueno para sustentación se activará formalmente cuando la coordinación culmine la revisión documental y active la etapa <strong>'En Proceso'</strong>.
                        </p>
                      )}
                    </div>
                  );
                }

                if (p.requiere_correccion) {
                  return (
                    <div className="mt-5 pt-4 border-t border-amber-100 flex flex-col gap-3 bg-amber-50/90 p-4 rounded-xl border border-amber-200">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl leading-none">⏳</span>
                          <div>
                            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                              En espera de respuesta del estudiante
                            </p>
                            <p className="text-xs text-amber-800 font-medium mt-0.5">
                              Hay una corrección pendiente de subsanar. El avance de etapa se encuentra pausado hasta que el estudiante radique sus ajustes.
                            </p>
                            {p.observacion_correccion && (
                              <p className="text-xs italic text-amber-900 bg-white/80 p-2.5 rounded-lg mt-2 border border-amber-200/80 shadow-2xs">
                                "{p.observacion_correccion}"
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 shrink-0 self-start">
                          Avance bloqueado
                        </span>
                      </div>

                      {p.archivo_correccion && (
                        <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-lg border border-amber-200 text-xs">
                          <span className="text-amber-900 font-medium flex items-center gap-1.5">
                            <span>📎</span> Documento con comentarios adjuntado
                          </span>
                          <a
                            href={obtenerUrlDocumento(p.archivo_correccion)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-itm-blue hover:text-itm-purple hover:underline flex items-center gap-1"
                          >
                            <span>Ver / Descargar archivo ↗</span>
                          </a>
                        </div>
                      )}

                      {/* Operaciones CRUD sobre la corrección solicitada */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => abrirModalCorreccion(p, true)}
                          className="text-xs font-bold bg-white text-slate-700 hover:text-itm-blue border border-slate-300 hover:border-itm-blue px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          title="Modificar las observaciones o cambiar el documento adjunto"
                        >
                          <span>✏️</span>
                          <span>Modificar Observación / Archivo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelarCorreccion(p.id, p.titulo_proyecto)}
                          className="text-xs font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          title="Cancelar devolución y permitir que el trámite continúe sin corrección"
                        >
                          <span>↩️</span>
                          <span>Cancelar Devolución</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                if (p.transiciones_disponibles?.length > 0) {
                  const tieneErrorTarjeta = !!erroresPorTarjeta[p.id];
                  const transicionesValidas = (p.transiciones_disponibles || []).filter(
                    (dest) => dest !== "POSTULACION"
                  );
                  return (
                    <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                      {/* Anuncio destacado si el estudiante acaba de radicar subsanación */}
                      {p.mensaje_subsanacion && (
                        <div className="mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-itm-blue p-4 rounded-xl shadow-2xs space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 font-extrabold text-itm-blue">
                            <span>🔔</span>
                            <span>Subsanación de correcciones radicada por el estudiante</span>
                            {p.subsanado_en && (
                              <span className="text-[11px] text-slate-500 font-normal">
                                • {formatearFecha(p.subsanado_en)}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-800 font-medium italic bg-white/90 p-2.5 rounded-lg border border-blue-100">
                            "{p.mensaje_subsanacion}"
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium">
                            Revisa el documento corregido en la lista superior de <strong>Documentos del Estudiante</strong>. Si la entrega es satisfactoria, utiliza el botón de aprobación para continuar al siguiente proceso.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        {!(esAsesor && p.estado === "SUSTENTACION") && (
                          <input
                            type="text"
                            placeholder="Observación o nota para el registro de auditoría (opcional)..."
                            className={`flex-1 bg-slate-50 border rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all ${
                              tieneErrorTarjeta
                                ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
                                : "border-slate-200"
                            }`}
                            value={observaciones[p.id] || ""}
                            onChange={(e) => {
                              setObservaciones({
                                ...observaciones,
                                [p.id]: e.target.value,
                              });
                              if (erroresPorTarjeta[p.id]) {
                                setErroresPorTarjeta((prev) => ({ ...prev, [p.id]: "" }));
                              }
                            }}
                          />
                        )}


                        <div className="flex flex-wrap gap-2.5 items-center justify-center">
                          {/* Botón Devolver para Corrección — siempre visible para quien puede gestionar */}
                          <button
                            type="button"
                            onClick={() => abrirModalCorreccion(p, false)}
                            aria-label="Pedir corrección o devolver para ajustes"
                            className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>📝</span>
                            <span>Pedir Corrección</span>
                          </button>

                          {/* === ASESOR en EN_PROCESO: Avanzar a Sustentación === */}
                          {esAsesor && p.estado === "EN_PROCESO" ? (
                            <>
                              {transicionesValidas
                                .filter((d) => d !== "RECHAZADO")
                                .map((dest) => (
                                  <button
                                    key={dest}
                                    type="button"
                                    onClick={() => transicionar(p.id, dest)}
                                    className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <span>🎓</span>
                                    <span>Avanzar a Sustentación</span>
                                  </button>
                                ))}

                              {transicionesValidas.includes("RECHAZADO") && (
                                <button
                                  type="button"
                                  onClick={() => abrirModalRechazo(p)}
                                  className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                                  title="Rechazo definitivo — el proyecto no podrá continuar en este ciclo"
                                >
                                  <span>⛔</span>
                                  <span>Rechazo Definitivo</span>
                                </button>
                              )}
                            </>

                          ) : esAsesor && p.estado === "SUSTENTACION" ? (
                            /* === ASESOR en SUSTENTACIÓN: notificar fecha + enviar al Comité + Rechazar === */
                            <>
                              {/* Botón: Notificar fecha/lugar de sustentación al estudiante */}
                              <button
                                type="button"
                                onClick={() => abrirModalSustentacion(p)}
                                className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                              >
                                <span>🎓</span>
                                <span>Notificar Sustentación</span>
                              </button>

                              {/* Botón: Enviar al Comité (abre modal con mensaje + doc opcional) */}
                              {(() => {
                                const dest = transicionesValidas.find((d) => d !== "RECHAZADO");
                                return dest ? (
                                  <button
                                    type="button"
                                    onClick={() => abrirModalEnviarComite(p, dest)}
                                    className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <span>🏛️</span>
                                    <span>Enviar al Comité</span>
                                  </button>
                                ) : null;
                              })()}

                              {/* Botón: Rechazo definitivo del proceso */}
                              {transicionesValidas.includes("RECHAZADO") && (
                                <button
                                  type="button"
                                  onClick={() => abrirModalRechazo(p)}
                                  className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                                  title="Rechazo definitivo — el proyecto no podrá continuar en este ciclo"

                                >
                                  <span>⛔</span>
                                  <span>Rechazo Definitivo</span>
                                </button>
                              )}
                            </>

                          ) : (esAdmin && p.estado === "APROBACION") ? (
                            /* === ADMIN en APROBACIÓN: Enviar a Asesor + Rechazar === */
                            <>
                              <button
                                type="button"
                                onClick={() => abrirModalEnviarAsesor(p)}
                                className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                              >
                                <span>👨‍🏫</span>
                                <span>Enviar a Asesor</span>
                              </button>

                              {transicionesValidas.includes("RECHAZADO") && (
                                <button
                                  type="button"
                                  onClick={() => abrirModalRechazo(p)}
                                  className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                                  title="Rechazo definitivo — el proyecto no podrá continuar en este ciclo"
                                >
                                  <span>⛔</span>
                                  <span>Rechazo Definitivo</span>
                                </button>
                              )}
                            </>

                          ) : (
                            /* === COMITÉ y ADMIN en otras etapas (POSTULACION, REVISION_DOCUMENTAL, REVISION_COMITE) === */
                            transicionesValidas.map((estadoDestino) => (
                              <button
                                key={estadoDestino}
                                type="button"
                                onClick={() =>
                                  estadoDestino === "RECHAZADO"
                                    ? abrirModalRechazo(p)
                                    : transicionar(p.id, estadoDestino)
                                }
                                className={`text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 ${
                                  estadoDestino === "FINALIZADO"
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                                    : "bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light"
                                }`}
                                title={estadoDestino === "RECHAZADO" ? "Rechazo definitivo — el proyecto no podrá continuar en este ciclo" : ""}
                              >
                                <span>{estadoDestino === "RECHAZADO" ? "⛔" : estadoDestino === "FINALIZADO" ? "🎓" : "✓"}</span>
                                <span>
                                  {estadoDestino === "RECHAZADO"
                                    ? "Rechazo Definitivo"
                                    : etiquetaBotonTransicion(estadoDestino)}
                                </span>
                              </button>
                            ))
                          )}

                          {/* Botón eliminar postulación errónea (Admin, solo en POSTULACION) */}
                          {esAdmin && p.estado === "POSTULACION" && (
                            <button
                              type="button"
                              onClick={() => eliminarPostulacion(p.id, p.titulo_proyecto)}
                              className="text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 transition-colors flex items-center justify-center gap-1 shrink-0"
                              title="Eliminar postulación errónea"
                            >
                              <span>🗑️</span>
                              <span>Eliminar Petición</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Alerta de Error Inline en la misma tarjeta */}
                      {erroresPorTarjeta[p.id] && (
                        <div
                          role="alert"
                          className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs font-semibold text-red-700 flex items-center gap-2"
                        >
                          <span>⚠️</span>
                          <span>{erroresPorTarjeta[p.id]}</span>
                        </div>
                      )}

                      {/* Documentos Faltantes mostrados directamente bajo los botones */}
                      {documentosFaltantesPorTarjeta[p.id]?.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                          <p className="font-bold mb-1 flex items-center gap-1.5">
                            <span>📄</span>
                            <span>Documentos obligatorios no radicados por el estudiante:</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {documentosFaltantesPorTarjeta[p.id].map((doc, idx) => (
                              <span
                                key={idx}
                                className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-semibold border border-amber-300/60"
                              >
                                ✕ {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                      No hay transiciones disponibles en esta etapa.
                    </p>
                  </div>
                );
              })()}
              
              </div>
              )}
            </article>
          ));
        })()}
      </div>
      )}

      {/* PESTAÑA 2: HISTORIAL COMPLETO Y TRAZABILIDAD INSTITUCIONAL CON CATÁLOGO COMPLETO DE MODALIDADES */}
      {!cargando && !errorCarga && pestanaActiva === "historial" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Historial y Trazabilidad Integral de Proyectos
                </h3>
                <p className="text-xs text-slate-500">
                  Consulta de todas las modalidades de grado del ITM, estudiantes, asesores y bitácora de auditoría.
                </p>
              </div>

              {/* Buscador en tiempo real y Filtro por TODAS las modalidades oficiales */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por estudiante, proyecto, asesor..."
                  value={busquedaHistorial}
                  onChange={(e) => setBusquedaHistorial(e.target.value)}
                  className="border border-slate-300 rounded-lg px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-itm-purple focus:outline-none w-full sm:w-64"
                />

                <select
                  value={filtroModalidadHistorial}
                  onChange={(e) => setFiltroModalidadHistorial(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-itm-purple bg-white"
                >
                  <option value="">Todas las modalidades (10)</option>
                  {MODALIDADES_OFICIALES.map((m) => {
                    const conteo = procesos.filter(
                      (p) => p.modalidad_nombre === m.nombre
                    ).length;
                    return (
                      <option key={m.nombre} value={m.nombre}>
                        {m.icono} {m.nombre} ({conteo})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Explorador visual de las 10 Modalidades Oficiales */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Catálogo de Modalidades ITM — Filtra o consulta su descripción:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {MODALIDADES_OFICIALES.map((m) => {
                  const conteo = procesos.filter(
                    (p) => p.modalidad_nombre === m.nombre
                  ).length;
                  const estaSeleccionada = filtroModalidadHistorial === m.nombre;
                  return (
                    <button
                      key={m.nombre}
                      onClick={() =>
                        setFiltroModalidadHistorial(
                          estaSeleccionada ? "" : m.nombre
                        )
                      }
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                        estaSeleccionada
                          ? "bg-itm-blue text-white border-itm-blue shadow-md"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <span>{m.icono}</span>
                        <span className="truncate">{m.nombre}</span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full self-start ${
                          estaSeleccionada
                            ? "bg-white/20 text-white"
                            : conteo > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {conteo} {conteo === 1 ? "proyecto" : "proyectos"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ficha Descriptiva de la Modalidad Seleccionada */}
          {modalidadSeleccionadaInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl p-2 bg-white rounded-xl shadow-xs border border-blue-100">
                    {modalidadSeleccionadaInfo.icono}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black text-slate-900">
                        {modalidadSeleccionadaInfo.nombre}
                      </h4>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          proyectosFiltradosHistorial.length > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {proyectosFiltradosHistorial.length}{" "}
                        {proyectosFiltradosHistorial.length === 1
                          ? "proyecto registrado"
                          : "proyectos registrados"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                      {modalidadSeleccionadaInfo.descripcion}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setFiltroModalidadHistorial("")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 self-start sm:self-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Ver todas
                </button>
              </div>
            </div>
          )}

          {/* Listado de proyectos o Estado en Ceros */}
          {proyectosFiltradosHistorial.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
              <span className="text-4xl block mb-3">
                {modalidadSeleccionadaInfo ? modalidadSeleccionadaInfo.icono : "🔍"}
              </span>
              <p className="text-slate-800 font-bold text-base mb-1">
                {modalidadSeleccionadaInfo
                  ? `0 proyectos registrados en ${modalidadSeleccionadaInfo.nombre}`
                  : "No se encontraron proyectos con los criterios de búsqueda"}
              </p>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {modalidadSeleccionadaInfo
                  ? `Actualmente no hay estudiantes con trámites activos en esta opción de grado. Las postulaciones aparecerán aquí cuando los alumnos se registren.`
                  : "Prueba modificando los términos del buscador o seleccionando otra modalidad en el catálogo."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proyectosFiltradosHistorial.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-itm-purple transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900">
                          {p.estudiante_nombre}
                        </span>
                        <span className="bg-blue-50 text-itm-blue border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {p.modalidad_nombre}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium">
                        "{p.titulo_proyecto || "Sin título definido"}"
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                        <span>
                          Docente Asesor:{" "}
                          <strong className="text-slate-700">
                            {p.asesor_nombre || "Sin asesor"}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>Iniciado: {formatearFecha(p.creada_en)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <EstadoBadge estado={p.estado} texto={p.estado_display} />
                      <button
                        onClick={() => toggleHistorial(p.id)}
                        className="text-xs font-bold text-itm-blue hover:text-itm-purple bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span>📜</span>
                        <span>
                          {historialVisible[p.id]
                            ? "Cerrar Bitácora"
                            : "Ver Auditoría Completa"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Detalle del Historial */}
                  {historialVisible[p.id] && (
                    <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                        <span>📜</span> Bitácora Histórica de Eventos ({p.estudiante_nombre})
                      </h4>
                      {cargandoHistorial[p.id] ? (
                        <p className="text-xs text-slate-500 italic">
                          Cargando eventos de auditoría...
                        </p>
                      ) : historialData[p.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {historialData[p.id].map((h) => (
                            <div
                              key={h.id}
                              className="text-xs bg-white p-3 rounded-lg border border-slate-200 shadow-2xs"
                            >
                              <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                                <span>
                                  {h.estado_anterior_display || h.estado_anterior} ➔{" "}
                                  <strong className="text-itm-blue">
                                    {h.estado_nuevo_display || h.estado_nuevo}
                                  </strong>
                                </span>
                                <span className="text-slate-400 font-normal">
                                  {formatearFecha(h.fecha)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Responsable: <strong>{h.realizado_por}</strong>
                              </p>
                              {h.observacion && (
                                <p className="text-xs italic text-slate-800 bg-slate-50 p-2 rounded mt-1.5 border-l-2 border-itm-purple">
                                  "{h.observacion}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">
                          No hay eventos registrados para este trámite.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: SOLICITUDES DE REGISTRO DE USUARIOS (SOLO ADMINISTRADOR) */}
      {pestanaActiva === "usuarios" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-itm-blue/10 text-itm-blue font-black text-xs uppercase px-3 py-1 rounded-full border border-itm-blue/20">
                  Control Institucional de Cuentas
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {solicitudesUsuarios.length} pendiente{solicitudesUsuarios.length === 1 ? "" : "s"}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Aprobación de Cuentas de Nuevos Usuarios
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Los nuevos usuarios quedan en estado inactivo tras registrarse hasta que el Administrador valide su rol (Estudiante, Asesor o Miembro del Comité). Al aprobar una cuenta, el usuario queda habilitado para iniciar sesión.
              </p>
            </div>
            <button
              onClick={cargarSolicitudesUsuarios}
              disabled={cargandoSolicitudes}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all self-start md:self-auto"
            >
              <span className={cargandoSolicitudes ? "animate-spin" : ""}>🔄</span>
              <span>{cargandoSolicitudes ? "Actualizando..." : "Refrescar Solicitudes"}</span>
            </button>
          </div>

          {/* Listado / Tabla */}
          {cargandoSolicitudes ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <span className="animate-spin inline-block text-3xl mb-2">⏳</span>
              <p className="text-sm font-bold text-slate-600">Cargando solicitudes de registro...</p>
            </div>
          ) : solicitudesUsuarios.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-100">
                ✓
              </div>
              <h3 className="text-base font-black text-slate-800">
                No hay solicitudes de registro pendientes
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Todas las cuentas registradas en SIGMA ITM han sido procesadas o ya se encuentran activadas.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                      <th className="py-3.5 px-4">Usuario / Nombre</th>
                      <th className="py-3.5 px-4">Cédula / Documento</th>
                      <th className="py-3.5 px-4">Correo Electrónico</th>
                      <th className="py-3.5 px-4">Programa Académico</th>
                      <th className="py-3.5 px-4">Rol Solicitado</th>
                      <th className="py-3.5 px-4">Fecha Registro</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {solicitudesUsuarios.map((u) => {
                      const badgeColors = {
                        ESTUDIANTE: "bg-blue-50 text-blue-700 border-blue-200",
                        ASESOR: "bg-purple-50 text-purple-700 border-purple-200",
                        COMITE: "bg-amber-50 text-amber-700 border-amber-200",
                        ADMIN: "bg-rose-50 text-rose-700 border-rose-200",
                      };
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-black text-slate-900">
                              {u.first_name} {u.last_name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              @{u.username}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-medium text-slate-700">
                            {u.cedula || "—"}
                          </td>
                          <td className="py-4 px-4">
                            <a
                              href={`mailto:${u.email}`}
                              className="text-itm-blue hover:underline font-medium"
                            >
                              {u.email}
                            </a>
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            {u.programa_academico || "—"}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                badgeColors[u.rol] || "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {u.rol}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-500 text-[11px]">
                            {formatearFecha(u.date_joined)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleAprobarUsuario(u)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                                title="Aprobar y activar cuenta"
                              >
                                <span>✓</span>
                                <span>Aprobar</span>
                              </button>
                              <button
                                onClick={() =>
                                  setModalRechazoUsuario({
                                    abierto: true,
                                    usuario: u,
                                    motivo: "",
                                    enviando: false,
                                    error: "",
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center gap-1"
                                title="Rechazar solicitud"
                              >
                                <span>✕</span>
                                <span>Rechazar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {/* MODAL AMPLIADO DE SOLICITUD / EDICIÓN DE CORRECCIÓN (CRUD Y SUBIDA DE DOCUMENTO) */}
      {modalCorreccion.abierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-correccion-titulo"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Cabecera del Modal */}
            <div className="bg-gradient-to-r from-slate-900 via-itm-blue-dark to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    {modalCorreccion.esEdicion ? "Edición de Observación" : "Devolución al Alumno"}
                  </span>
                  <span className="text-xs text-blue-200 truncate">
                    • {modalCorreccion.estudianteNombre}
                  </span>
                </div>
                <h3
                  id="modal-correccion-titulo"
                  className="text-lg sm:text-xl font-black tracking-tight text-white"
                >
                  {modalCorreccion.esEdicion
                    ? "Modificar Observaciones de Corrección"
                    : "Pedir Corrección / Devolver al Alumno"}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                  Proyecto: <strong>{modalCorreccion.tituloProyecto || "Sin título"}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalCorreccion}
                disabled={modalCorreccion.enviando}
                className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-base shrink-0"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <form onSubmit={handleGuardarCorreccionModal} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                <span className="text-base shrink-0">ℹ️</span>
                <p className="leading-relaxed">
                  Al enviar esta corrección, el trámite quedará marcado como{" "}
                  <strong>"Requiere Corrección"</strong> en el panel del estudiante. El avance de etapa
                  se pausará hasta que el estudiante revise tus observaciones y radique los ajustes correspondientes.
                </p>
              </div>

              {/* Textarea de Observación */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="modal-obs-texto"
                    className="text-xs font-bold text-slate-800 uppercase tracking-wide"
                  >
                    Observación o Comentarios Detallados: <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${
                      modalCorreccion.observacion.trim().length >= 10
                        ? "text-slate-400"
                        : "text-amber-600 font-bold"
                    }`}
                  >
                    {modalCorreccion.observacion.trim().length}/10 mín.
                  </span>
                </div>
                <textarea
                  id="modal-obs-texto"
                  rows={5}
                  value={modalCorreccion.observacion}
                  onChange={(e) =>
                    setModalCorreccion((prev) => ({
                      ...prev,
                      observacion: e.target.value,
                      error: "",
                    }))
                  }
                  placeholder="Escribe de manera clara y explícita qué aspectos debe corregir el estudiante, qué documentos debe corregir o qué cambios de fondo se requieren en su propuesta..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Subida de Documento Corregido / Anotado */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div>
                  <label
                    htmlFor="modal-obs-archivo"
                    className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5"
                  >
                    <span>📎</span> Adjuntar Documento con Comentarios / Correcciones (Opcional):
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Puedes adjuntar el archivo PDF, Word (.docx) u observaciones anotadas para que el alumno lo descargue directamente desde su panel.
                  </p>
                </div>

                {/* Si ya existía un archivo adjunto previamente (modo edición) */}
                {modalCorreccion.esEdicion && modalCorreccion.archivoActual && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-amber-900 truncate">
                        Archivo actualmente adjunto:
                      </p>
                      <a
                        href={obtenerUrlDocumento(modalCorreccion.archivoActual)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-itm-blue font-bold hover:underline truncate block"
                      >
                        Descargar archivo actual ↗
                      </a>
                    </div>
                    <label className="flex items-center gap-1.5 shrink-0 text-red-700 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modalCorreccion.eliminarArchivo}
                        onChange={(e) =>
                          setModalCorreccion((prev) => ({
                            ...prev,
                            eliminarArchivo: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span>Eliminar archivo</span>
                    </label>
                  </div>
                )}

                <div>
                  <input
                    id="modal-obs-archivo"
                    type="file"
                    accept=".pdf,.docx,.doc,.xlsx,.zip,.rar"
                    disabled={modalCorreccion.eliminarArchivo}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setModalCorreccion((prev) => ({
                        ...prev,
                        archivo: f || null,
                        error: "",
                      }));
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-itm-blue/10 file:text-itm-blue hover:file:bg-itm-blue/20 cursor-pointer disabled:opacity-50"
                  />
                  {modalCorreccion.archivo && (
                    <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <span>✓</span> Archivo seleccionado: {modalCorreccion.archivo.name} (
                      {(modalCorreccion.archivo.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Mensaje de Error */}
              {modalCorreccion.error && (
                <div
                  role="alert"
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs font-semibold text-red-700 flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span>{modalCorreccion.error}</span>
                </div>
              )}

              {/* Botones de acción del Modal */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrarModalCorreccion}
                  disabled={modalCorreccion.enviando}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={modalCorreccion.enviando}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {modalCorreccion.enviando ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>{modalCorreccion.esEdicion ? "💾" : "📤"}</span>
                      <span>
                        {modalCorreccion.esEdicion
                          ? "Guardar Cambios"
                          : "Enviar Corrección al Estudiante"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ENVIAR A ASESOR (admin → asesor, solo lo ve el profesor) */}
      {modalEnviarAsesor.abierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-enviar-asesor-titulo"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-itm-blue-dark to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-blue-400/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Envío al Docente Asesor
                  </span>
                  <span className="text-xs text-blue-200 truncate">
                    • {modalEnviarAsesor.estudianteNombre}
                  </span>
                </div>
                <h3
                  id="modal-enviar-asesor-titulo"
                  className="text-lg sm:text-xl font-black tracking-tight text-white"
                >
                  {modalEnviarAsesor.esEdicion ? "Modificar Directriz para el Asesor" : "Enviar Proyecto al Docente Asesor"}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                  Proyecto: <strong>{modalEnviarAsesor.tituloProyecto || "Sin título"}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModalEnviarAsesor}
                disabled={modalEnviarAsesor.enviando}
                className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-base shrink-0"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnviarAsesor} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                <span className="text-base shrink-0">👨‍🏫</span>
                <p className="leading-relaxed">
                  El mensaje y documento adjunto son visibles <strong>únicamente para el docente asesor</strong>. El estudiante no verá esta información.
                </p>
              </div>

              {/* Selector de asesor si no hay uno asignado */}
              {!modalEnviarAsesor.asesorId && (
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1.5">
                    Seleccionar Asesor: <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-itm-purple bg-white"
                    value={modalEnviarAsesor.asesorId || ""}
                    onChange={(e) =>
                      setModalEnviarAsesor((prev) => ({
                        ...prev,
                        asesorId: e.target.value || null,
                        error: "",
                      }))
                    }
                  >
                    <option value="">-- Selecciona un asesor --</option>
                    {asesores.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.first_name} {a.last_name} — {a.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Confirmación si ya hay asesor */}
              {modalEnviarAsesor.asesorId && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <span>✓</span>
                  <span>
                    Asesor asignado: <strong>
                      {asesores.find((a) => String(a.id) === String(modalEnviarAsesor.asesorId))?.first_name || ""}{" "}
                      {asesores.find((a) => String(a.id) === String(modalEnviarAsesor.asesorId))?.last_name || ""}
                    </strong>
                  </span>
                </div>
              )}

              {/* Mensaje para el asesor (opcional) */}
              <div>
                <label
                  htmlFor="modal-asesor-mensaje"
                  className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1.5"
                >
                  Mensaje / Directriz para el Asesor (Opcional):
                </label>
                <textarea
                  id="modal-asesor-mensaje"
                  rows={4}
                  value={modalEnviarAsesor.mensaje}
                  onChange={(e) =>
                    setModalEnviarAsesor((prev) => ({
                      ...prev,
                      mensaje: e.target.value,
                      error: "",
                    }))
                  }
                  placeholder="Escribe instrucciones, directrices o contexto que el asesor debe conocer sobre este proyecto..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Documento adjunto (opcional) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
                <label
                  htmlFor="modal-asesor-archivo"
                  className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5"
                >
                  <span>📎</span> Adjuntar Documento para el Asesor (Opcional):
                </label>
                
                {modalEnviarAsesor.esEdicion && modalEnviarAsesor.archivoActual && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-2 text-xs mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-amber-900 truncate">
                        Archivo actualmente adjunto:
                      </p>
                      <a
                        href={obtenerUrlDocumento(modalEnviarAsesor.archivoActual)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-itm-blue font-bold hover:underline truncate block"
                      >
                        Descargar archivo actual ↗
                      </a>
                    </div>
                    <label className="flex items-center gap-1.5 shrink-0 text-red-700 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modalEnviarAsesor.eliminarArchivo}
                        onChange={(e) =>
                          setModalEnviarAsesor((prev) => ({
                            ...prev,
                            eliminarArchivo: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span>Eliminar archivo</span>
                    </label>
                  </div>
                )}
                <input
                  id="modal-asesor-archivo"
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.zip,.rar"
                  disabled={modalEnviarAsesor.eliminarArchivo}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setModalEnviarAsesor((prev) => ({ ...prev, archivo: f || null }));
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-itm-blue/10 file:text-itm-blue hover:file:bg-itm-blue/20 cursor-pointer disabled:opacity-50"
                />
                {modalEnviarAsesor.archivo && (
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <span>✓</span> {modalEnviarAsesor.archivo.name} (
                    {(modalEnviarAsesor.archivo.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {modalEnviarAsesor.error && (
                <div
                  role="alert"
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs font-semibold text-red-700 flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span>{modalEnviarAsesor.error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrarModalEnviarAsesor}
                  disabled={modalEnviarAsesor.enviando}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalEnviarAsesor.enviando}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {modalEnviarAsesor.enviando ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>{modalEnviarAsesor.esEdicion ? "💾" : "👨‍🏫"}</span>
                      <span>{modalEnviarAsesor.esEdicion ? "Guardar Cambios" : "Enviar al Asesor"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NOTIFICACIÓN DE SUSTENTACIÓN (asesor → estudiante) */}
      {modalSustentacion.abierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sustentacion-titulo"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Cabecera del Modal */}
            <div className="bg-gradient-to-r from-slate-900 via-itm-blue-dark to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Notificación de Sustentación
                  </span>
                  <span className="text-xs text-blue-200 truncate">
                    • {modalSustentacion.estudianteNombre}
                  </span>
                </div>
                <h3
                  id="modal-sustentacion-titulo"
                  className="text-lg sm:text-xl font-black tracking-tight text-white"
                >
                  {modalSustentacion.esEdicion ? "Modificar Notificación de Sustentación" : "Enviar Mensaje de Sustentación al Estudiante"}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                  Proyecto: <strong>{modalSustentacion.tituloProyecto || "Sin título"}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalSustentacion}
                disabled={modalSustentacion.enviando}
                className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-base shrink-0"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <form onSubmit={handleEnviarSustentacion} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                <span className="text-base shrink-0">🎓</span>
                <p className="leading-relaxed">
                  Este mensaje llegará al estudiante con información sobre la sustentación (fecha, hora, lugar, instrucciones, etc.). El documento adjunto es <strong>opcional</strong>.
                </p>
              </div>

              {/* Textarea del mensaje */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="modal-sust-mensaje"
                    className="text-xs font-bold text-slate-800 uppercase tracking-wide"
                  >
                    Mensaje para el Estudiante: <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${
                      modalSustentacion.mensaje.trim().length >= 10
                        ? "text-slate-400"
                        : "text-amber-600 font-bold"
                    }`}
                  >
                    {modalSustentacion.mensaje.trim().length}/10 mín.
                  </span>
                </div>
                <textarea
                  id="modal-sust-mensaje"
                  rows={5}
                  value={modalSustentacion.mensaje}
                  onChange={(e) =>
                    setModalSustentacion((prev) => ({
                      ...prev,
                      mensaje: e.target.value,
                      error: "",
                    }))
                  }
                  placeholder="Escribe la fecha, hora y lugar de sustentación, y cualquier indicación adicional que el estudiante deba conocer para prepararse..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Adjuntar documento (opcional) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
                <label
                  htmlFor="modal-sust-archivo"
                  className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5"
                >
                  <span>📎</span> Adjuntar Documento (Opcional):
                </label>
                <p className="text-[11px] text-slate-500">
                  Puedes adjuntar un PDF, Word u otro documento con información sobre la sustentación.
                </p>
                
                {modalSustentacion.esEdicion && modalSustentacion.archivoActual && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-2 text-xs mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-amber-900 truncate">
                        Archivo actualmente adjunto:
                      </p>
                      <a
                        href={obtenerUrlDocumento(modalSustentacion.archivoActual)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-itm-blue font-bold hover:underline truncate block"
                      >
                        Descargar archivo actual ↗
                      </a>
                    </div>
                    <label className="flex items-center gap-1.5 shrink-0 text-red-700 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modalSustentacion.eliminarArchivo}
                        onChange={(e) =>
                          setModalSustentacion((prev) => ({
                            ...prev,
                            eliminarArchivo: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span>Eliminar archivo</span>
                    </label>
                  </div>
                )}
                <input
                  id="modal-sust-archivo"
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.zip,.rar"
                  disabled={modalSustentacion.eliminarArchivo}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setModalSustentacion((prev) => ({
                      ...prev,
                      archivo: f || null,
                      error: "",
                    }));
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-itm-blue/10 file:text-itm-blue hover:file:bg-itm-blue/20 cursor-pointer disabled:opacity-50"
                />
                {modalSustentacion.archivo && (
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <span>✓</span> Archivo seleccionado: {modalSustentacion.archivo.name} (
                    {(modalSustentacion.archivo.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Mensaje de Error */}
              {modalSustentacion.error && (
                <div
                  role="alert"
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs font-semibold text-red-700 flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span>{modalSustentacion.error}</span>
                </div>
              )}

              {/* Botones del Modal */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrarModalSustentacion}
                  disabled={modalSustentacion.enviando}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={modalSustentacion.enviando}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {modalSustentacion.enviando ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>{modalSustentacion.esEdicion ? "💾" : "🎓"}</span>
                      <span>{modalSustentacion.esEdicion ? "Guardar Cambios" : "Enviar Notificación al Estudiante"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ════════════════════════════════════════════════════════════════════
          MODAL — ENVIAR AL COMITÉ (asesor → comité tras sustentación)
          ════════════════════════════════════════════════════════════════════ */}
      {modalEnviarComite.abierto && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModalEnviarComite(); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Cabecera */}
            <div className="bg-gradient-to-r from-itm-blue to-itm-purple px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>🏛️</span> Enviar al Comité de Trabajos de Grado
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  El proyecto pasará a revisión final del Comité
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModalEnviarComite}
                className="text-white/70 hover:text-white text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo */}
            <form onSubmit={handleEnviarComite} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Info del proyecto */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Proyecto
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {modalEnviarComite.tituloProyecto || "Sin título"}
                </p>
                <p className="text-xs text-slate-500">
                  Estudiante: <strong>{modalEnviarComite.estudianteNombre}</strong>
                </p>
              </div>

              {/* Banner informativo */}
              <div className="bg-blue-50 border-l-4 border-itm-blue p-3.5 rounded-r-xl text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>💡</span> ¿Qué pasa al enviar?
                </p>
                <ul className="list-disc list-inside space-y-0.5 font-medium text-blue-800">
                  <li>El estado del proyecto avanza para revisión del Comité</li>
                  <li>El Comité recibirá una notificación por correo electrónico</li>
                  <li>El estudiante también será notificado del avance</li>
                </ul>
              </div>

              {/* Mensaje (opcional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-comite-mensaje"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Observaciones para el Comité{" "}
                  <span className="text-slate-400 font-normal normal-case">(opcional)</span>
                </label>
                <textarea
                  id="modal-comite-mensaje"
                  rows={3}
                  placeholder="Ej: La sustentación se realizó satisfactoriamente el día... El estudiante demostró dominio del tema..."
                  value={modalEnviarComite.mensaje}
                  onChange={(e) =>
                    setModalEnviarComite((prev) => ({ ...prev, mensaje: e.target.value, error: "" }))
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-itm-purple resize-none"
                />
              </div>

              {/* Archivo adjunto (opcional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-comite-archivo"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Documento adjunto{" "}
                  <span className="text-slate-400 font-normal normal-case">(opcional — acta, evaluación, etc.)</span>
                </label>
                <input
                  id="modal-comite-archivo"
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.zip,.rar"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setModalEnviarComite((prev) => ({ ...prev, archivo: f || null, error: "" }));
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-itm-blue/10 file:text-itm-blue hover:file:bg-itm-blue/20 cursor-pointer"
                />
                {modalEnviarComite.archivo && (
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <span>✓</span> {modalEnviarComite.archivo.name} (
                    {(modalEnviarComite.archivo.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Error */}
              {modalEnviarComite.error && (
                <div
                  role="alert"
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs font-semibold text-red-700 flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span>{modalEnviarComite.error}</span>
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrarModalEnviarComite}
                  disabled={modalEnviarComite.enviando}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalEnviarComite.enviando}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {modalEnviarComite.enviando ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>🏛️</span>
                      <span>Enviar al Comité</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ════════════════════════════════════════════════════════════════════
          MODAL — RECHAZO DEFINITIVO
          ════════════════════════════════════════════════════════════════════ */}
      {modalRechazo.abierto && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModalRechazo(); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Cabecera */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>⛔</span> Rechazo Definitivo del Proyecto
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Esta acción es irreversible y finalizará el proceso actual.
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModalRechazo}
                className="text-white/70 hover:text-white text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo */}
            <form onSubmit={handleRechazarDefinitivo} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Info del proyecto */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Proyecto a Rechazar
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {modalRechazo.tituloProyecto || "Sin título"}
                </p>
                <p className="text-xs text-slate-600">
                  Estudiante: <strong>{modalRechazo.estudianteNombre}</strong>
                </p>
              </div>

              {/* Mensaje informativo */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-xs text-red-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <span>⚠️</span>
                  <span>¿Qué pasa al rechazar?</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>El estado del proyecto pasará a <strong>Rechazado</strong>.</li>
                  <li>El estudiante recibirá una notificación por correo electrónico con tus motivos.</li>
                  <li>El estudiante no podrá continuar el proceso en este semestre.</li>
                </ul>
              </div>

              {/* Textarea para el motivo */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  Motivos del Rechazo (Opcional pero recomendado)
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all placeholder:text-slate-400"
                  placeholder="Ej: El proyecto no alcanzó a completarse en los tiempos estipulados por el calendario académico..."
                  value={modalRechazo.mensaje}
                  onChange={(e) =>
                    setModalRechazo((prev) => ({ ...prev, mensaje: e.target.value, error: "" }))
                  }
                />
              </div>

              {/* Subida de archivo */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  Documento Adjunto (Opcional — acta, rúbrica, etc.)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                    <span>Seleccionar archivo</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        setModalRechazo((prev) => ({ ...prev, archivo: f || null, error: "" }));
                      }}
                    />
                  </label>
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                    {modalRechazo.archivo ? (
                      <>
                        <span>✅</span> {modalRechazo.archivo.name} (
                        {(modalRechazo.archivo.size / (1024 * 1024)).toFixed(2)} MB)
                      </>
                    ) : (
                      "Ningún archivo seleccionado"
                    )}
                  </span>
                </div>
              </div>

              {/* Mensaje de Error */}
              {modalRechazo.error && (
                <div
                  role="alert"
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs font-semibold text-red-700 flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span>{modalRechazo.error}</span>
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrarModalRechazo}
                  disabled={modalRechazo.enviando}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalRechazo.enviando}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {modalRechazo.enviando ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>⛔</span>
                      <span>Rechazar Definitivamente</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIRMAR RECHAZO DE REGISTRO DE USUARIO */}
      {modalRechazoUsuario.abierto && modalRechazoUsuario.usuario && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-6">
              <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Rechazo de Registro
              </span>
              <h3 className="text-lg font-black mt-2">
                Rechazar Registro de @{modalRechazoUsuario.usuario.username}
              </h3>
              <p className="text-xs text-rose-100 mt-1">
                {modalRechazoUsuario.usuario.first_name} {modalRechazoUsuario.usuario.last_name} ({modalRechazoUsuario.usuario.email})
              </p>
            </div>

            <form onSubmit={handleRechazarUsuario} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Motivo del Rechazo
                </label>
                <textarea
                  required
                  rows={4}
                  value={modalRechazoUsuario.motivo}
                  onChange={(e) =>
                    setModalRechazoUsuario((prev) => ({ ...prev, motivo: e.target.value }))
                  }
                  placeholder="Explica la razón (ej. No se encuentra matriculado en la facultad, no adjuntó soporte, rol incorrecto...)"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>

              {modalRechazoUsuario.error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs font-semibold text-red-700">
                  ⚠️ {modalRechazoUsuario.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setModalRechazoUsuario({
                      abierto: false,
                      usuario: null,
                      motivo: "",
                      enviando: false,
                      error: "",
                    })
                  }
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalRechazoUsuario.enviando}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm transition-all"
                >
                  {modalRechazoUsuario.enviando ? "Rechazando..." : "Confirmar Rechazo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APROBACIÓN EXITOSA Y ENVÍO DE CORREO AL USUARIO */}
      {modalAprobadoExito.abierto && modalAprobadoExito.usuario && (() => {
        const u = modalAprobadoExito.usuario;
        const asunto = encodeURIComponent("Aprobación de Cuenta Institucional - SIGMA ITM");
        const cuerpo = encodeURIComponent(
          `Hola ${u.first_name || "Usuario"},\n\nTe informamos que tu solicitud de registro en la plataforma SIGMA ITM con el rol de ${u.rol} ha sido APROBADA satisfactoriamente por la Administración institucional.\n\nTu cuenta ya se encuentra ACTIVADA. Puedes ingresar con tu usuario (${u.username}) a través del siguiente enlace:\n${window.location.origin}/login\n\n¡Bienvenido/a al Sistema de Gestión de Trabajos de Grado del ITM!\n\nAtentamente,\nAdministración SIGMA ITM\nFacultad de Ingenierías - ITM`
        );
        const mailtoUrl = `mailto:${u.email}?subject=${asunto}&body=${cuerpo}`;
        const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(u.email)}&subject=${asunto}&body=${cuerpo}`;
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(u.email)}&su=${asunto}&body=${cuerpo}`;

        return (
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
                <h3 className="text-xl font-black">¡Cuenta Aprobada y Activada!</h3>
                <p className="text-xs text-emerald-100 mt-1">
                  El usuario <strong>@{u.username}</strong> ({u.first_name} {u.last_name}) ya puede ingresar a SIGMA ITM.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
                  <p><strong>Destinatario:</strong> {u.email}</p>
                  <p><strong>Rol Activado:</strong> {u.rol}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Puedes notificarle inmediatamente a su correo con 1 solo clic utilizando tu cliente preferido:
                  </p>
                </div>

                <div className="space-y-2">
                  <a
                    href={mailtoUrl}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-itm-blue hover:bg-itm-blue-dark text-white font-black text-xs rounded-xl shadow-sm transition-all"
                  >
                    <span>✉️</span>
                    <span>Abrir Cliente de Correo Predeterminado (Mailto)</span>
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
                    onClick={() => setModalAprobadoExito({ abierto: false, usuario: null })}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 3: RECHAZO EXITOSO Y NOTIFICACIÓN POR CORREO */}
      {modalRechazadoExito.abierto && modalRechazadoExito.usuario && (() => {
        const u = modalRechazadoExito.usuario;
        const motivo = modalRechazadoExito.motivo;
        const asunto = encodeURIComponent("Notificación sobre tu solicitud de registro - SIGMA ITM");
        const cuerpo = encodeURIComponent(
          `Hola ${u.first_name || "Usuario"},\n\nTe informamos que tu solicitud de registro en la plataforma SIGMA ITM con el rol de ${u.rol} no ha sido aprobada por el siguiente motivo:\n\n"${motivo || "No cumple con las validaciones institucionales requeridas."}"\n\nSi consideras que se trata de un error o requieres asistencia, puedes responder a este mensaje institucional.\n\nAtentamente,\nAdministración SIGMA ITM\nFacultad de Ingenierías - ITM`
        );
        const mailtoUrl = `mailto:${u.email}?subject=${asunto}&body=${cuerpo}`;
        const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(u.email)}&subject=${asunto}&body=${cuerpo}`;
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(u.email)}&su=${asunto}&body=${cuerpo}`;

        return (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-6 text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border border-white/30">
                  ✕
                </div>
                <h3 className="text-xl font-black">Solicitud Rechazada</h3>
                <p className="text-xs text-rose-100 mt-1">
                  La solicitud de <strong>@{u.username}</strong> fue rechazada y la cuenta eliminada.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
                  <p><strong>Destinatario:</strong> {u.email}</p>
                  <p><strong>Motivo indicado:</strong> {motivo || "Sin motivo especificado"}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Puedes notificarle formalmente a su correo con el motivo del rechazo:
                  </p>
                </div>

                <div className="space-y-2">
                  <a
                    href={mailtoUrl}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-sm transition-all"
                  >
                    <span>✉️</span>
                    <span>Notificar Rechazo vía Mailto</span>
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
                    onClick={() =>
                      setModalRechazadoExito({ abierto: false, usuario: null, motivo: "" })
                    }
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
