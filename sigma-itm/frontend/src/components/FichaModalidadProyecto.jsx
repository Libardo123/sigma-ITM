import { useState } from "react";
import { obtenerInfoModalidad } from "../constants/modalidades";

/**
 * FichaModalidadProyecto.jsx — SIGMA ITM
 *
 * Componente modular que encabeza cada expediente de grado:
 * 1. Ficha institucional de la Modalidad (ícono, descripción, requisitos oficiales).
 * 2. Título jerárquico del Proyecto.
 * 3. Semáforo de Turno y Responsable Activo ("¿Quién tiene el turno en este momento?").
 *    - Maneja explícitamente el caso de "Pedir Corrección" / "Subsanación" donde la pelota
 *      pasa al estudiante o vuelve al evaluador.
 * 4. Barra de progreso visual por etapas.
 *
 * @param {Object} props
 * @param {Object} props.postulacion - Datos completos de la postulación
 * @param {boolean} [props.esEstudiante] - Si el visor corresponde al estudiante o evaluador
 */
export default function FichaModalidadProyecto({ postulacion, esEstudiante = false }) {
  const [mostrarDetallesModalidad, setMostrarDetallesModalidad] = useState(false);

  if (!postulacion) return null;

  const infoModalidad = obtenerInfoModalidad(postulacion.modalidad_nombre);

  // Definición de las 5 Macro-Estaciones del tren de grado ITM
  const ESTACIONES = [
    { id: "RADICACION", label: "1. Radicación", estados: ["POSTULACION", "REVISION_DOCUMENTAL"] },
    { id: "APROBACION", label: "2. Aval & Asesor", estados: ["APROBACION"] },
    { id: "DESARROLLO", label: "3. En Proceso", estados: ["EN_PROCESO"] },
    { id: "SUSTENTACION", label: "4. Sustentación", estados: ["SUSTENTACION", "REVISION_COMITE"] },
    { id: "FINALIZADO", label: "5. Grado", estados: ["FINALIZADO"] },
  ];

  const estacionActualIndex = ESTACIONES.findIndex((est) =>
    est.estados.includes(postulacion.estado)
  );

  // Lógica del "Semáforo de Turno": determina quién tiene la responsabilidad operativa ahora
  const obtenerTurnoActual = () => {
    // CASO 1: Observación de corrección activa (El evaluador le devolvió el proyecto al estudiante)
    if (postulacion.requiere_correccion) {
      return {
        tipo: "CORRECCION",
        claseCaja: "bg-amber-50 border-amber-300 text-amber-950",
        claseBadge: "bg-amber-600 text-white",
        icono: "⚠️",
        titulo: esEstudiante
          ? "¡Tu turno! Tienes observaciones pendientes por corregir"
          : "Turno del Estudiante: Subsanación pendiente de entrega",
        subtitulo: "El trámite está detenido esperando que el estudiante subsane los documentos o ajustes solicitados.",
        accion: "El estudiante debe revisar las observaciones y cargar su subsanación.",
      };
    }

    // CASO 2: El estudiante acaba de enviar su subsanación (El evaluador tiene la pelota de nuevo)
    if ((postulacion.mensaje_subsanacion || postulacion.subsanado_en) && !postulacion.requiere_correccion) {
      return {
        tipo: "SUBSANADO",
        claseCaja: "bg-emerald-50 border-emerald-300 text-emerald-950",
        claseBadge: "bg-emerald-600 text-white",
        icono: "🔔",
        titulo: esEstudiante
          ? "Subsanación enviada — En revisión por tus evaluadores"
          : "Subsanación radicada — Turno de revisión del evaluador",
        subtitulo: "El estudiante ya entregó las correcciones solicitadas. Listo para validar o solicitar nuevo ajuste.",
        accion: "Revisar los documentos corregidos y aprobar el paso a la siguiente etapa o devolver.",
      };
    }

    // CASO 3: Flujo estándar según el estado del proceso
    switch (postulacion.estado) {
      case "POSTULACION":
      case "REVISION_DOCUMENTAL":
        return {
          tipo: "COMITE_REVISION",
          claseCaja: "bg-indigo-50/80 border-indigo-200 text-indigo-950",
          claseBadge: "bg-indigo-600 text-white",
          icono: "🏛️",
          titulo: "Turno: Comité de Grados / Coordinación",
          subtitulo: "Revisión documental inicial de los requisitos de la modalidad.",
          accion: "El Comité verifica la propuesta y da aval para la asignación del asesor.",
        };

      case "APROBACION":
        return {
          tipo: "ADMIN_ASIGNACION",
          claseCaja: "bg-purple-50 border-purple-200 text-purple-950",
          claseBadge: "bg-itm-purple text-white",
          icono: "👔",
          titulo: "Turno: Administrador de Modalidades",
          subtitulo: "Asignación formal del Docente Asesor temático y metodológico.",
          accion: "Asignar al docente asesor para que el proyecto pase a ejecución formal.",
        };

      case "EN_PROCESO":
        return {
          tipo: "ASESOR_DESARROLLO",
          claseCaja: "bg-blue-50 border-blue-200 text-blue-950",
          claseBadge: "bg-blue-600 text-white",
          icono: "👨‍🏫",
          titulo: `Turno: Docente Asesor ${postulacion.asesor_nombre ? `(${postulacion.asesor_nombre})` : "(Pendiente asignación)"}`,
          subtitulo: "Ejecución, tutoría y seguimiento continuo del proyecto de grado.",
          accion: "El asesor orienta los entregables y autoriza el paso a sustentación.",
        };

      case "SUSTENTACION":
        return {
          tipo: "JURADOS_SUSTENTACION",
          claseCaja: "bg-teal-50 border-teal-200 text-teal-950",
          claseBadge: "bg-teal-600 text-white",
          icono: "📋",
          titulo: "Turno: Jurados Evaluadores y Asesor",
          subtitulo: "Programación, desarrollo de sustentación y calificación del proyecto.",
          accion: "El asesor/jurado emite la citación oficial y registra el resultado evaluativo.",
        };

      case "REVISION_COMITE":
        return {
          tipo: "COMITE_CIERRE",
          claseCaja: "bg-indigo-50 border-indigo-200 text-indigo-950",
          claseBadge: "bg-indigo-700 text-white",
          icono: "🏛️",
          titulo: "Turno: Comité de Grados (Cierre y Acta)",
          subtitulo: "Validación institucional del acta de sustentación aprobada.",
          accion: "El Comité aprueba y da por finalizado oficialmente el proceso de grado.",
        };

      case "FINALIZADO":
        return {
          tipo: "FINALIZADO",
          claseCaja: "bg-emerald-50 border-emerald-300 text-emerald-950",
          claseBadge: "bg-emerald-600 text-white",
          icono: "🎓",
          titulo: "Proceso Culminado Exitosamente",
          subtitulo: "Opción de grado finalizada y aprobada según el reglamento ITM.",
          accion: "Certificado institucional disponible para descarga.",
        };

      case "RECHAZADO":
        return {
          tipo: "RECHAZADO",
          claseCaja: "bg-red-50 border-red-200 text-red-950",
          claseBadge: "bg-red-600 text-white",
          icono: "❌",
          titulo: "Proceso Cerrado / Rechazado",
          subtitulo: "El trámite no cumplió con los requerimientos mínimos de la modalidad.",
          accion: "Consulta las observaciones históricas para radicar una nueva postulación.",
        };

      default:
        return {
          tipo: "GENERAL",
          claseCaja: "bg-slate-50 border-slate-200 text-slate-800",
          claseBadge: "bg-slate-600 text-white",
          icono: "📌",
          titulo: "En seguimiento institucional",
          subtitulo: "Proceso en curso.",
          accion: "Revisar los documentos del estudiante.",
        };
    }
  };

  const turno = obtenerTurnoActual();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-4 space-y-4">
      {/* 1. Cabecera de Modalidad y Título */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Badge Grande de Modalidad Oficial */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 text-itm-purple border border-purple-200/80 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs">
              <span className="text-base" aria-hidden="true">{infoModalidad.icono}</span>
              <span>Modalidad: {postulacion.modalidad_nombre}</span>
            </span>

            <button
              type="button"
              onClick={() => setMostrarDetallesModalidad(!mostrarDetallesModalidad)}
              className="text-[11px] font-bold text-itm-blue hover:text-itm-purple hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              title="Ver qué exige y cómo funciona esta modalidad en el ITM"
            >
              <span>{mostrarDetallesModalidad ? "Ocultar guía ✕" : "ℹ️ ¿Qué exige esta modalidad?"}</span>
            </button>
          </div>

          {/* Título Oficial del Proyecto */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug break-words">
            {postulacion.titulo_proyecto ? (
              <span>"{postulacion.titulo_proyecto}"</span>
            ) : (
              <span className="italic text-slate-400">Propuesta de opción de grado sin título asignado</span>
            )}
          </h3>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full border border-slate-200">
            <span>🏛️</span>
            <span>Reglamento ITM</span>
          </span>
        </div>
      </div>

      {/* 2. Panel Desplegable: Normativa y Requisitos de esta Modalidad */}
      {mostrarDetallesModalidad && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-blue-50/70 border border-purple-200 text-xs text-slate-700 space-y-3.5 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center justify-between font-bold text-itm-purple text-xs pb-2 border-b border-purple-100">
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              <span>{infoModalidad.icono}</span>
              <span>Guía Reglamentaria Oficial: {infoModalidad.nombre}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Normativa Facultad de Ingenierías ITM</span>
          </div>

          <p className="text-slate-700 leading-relaxed font-normal">
            {infoModalidad.queEs || infoModalidad.descripcion}
          </p>

          {infoModalidad.perfilEstudiante && (
            <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100 text-[11px] text-slate-600">
              <strong className="text-itm-purple block font-bold mb-0.5">🎯 Perfil del Estudiante:</strong>
              {infoModalidad.perfilEstudiante}
            </div>
          )}

          {/* Ruta Paso a Paso para Graduarse */}
          {infoModalidad.pasosProceso && (
            <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1.5 shadow-2xs">
              <strong className="text-itm-blue block text-[11px] uppercase tracking-wide font-black">
                🧭 Ruta paso a paso para graduarse:
              </strong>
              <div className="space-y-1 text-[11px] text-slate-600">
                {infoModalidad.pasosProceso.map((paso, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="bg-itm-blue text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{paso.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requisitos para Graduarse */}
          {infoModalidad.requisitosParaGraduarse && (
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
              <strong className="text-emerald-900 block uppercase tracking-wide font-black">
                ✅ Requisitos indispensables para obtener el grado:
              </strong>
              <ul className="space-y-1">
                {infoModalidad.requisitosParaGraduarse.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span className="leading-snug font-medium">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white p-2.5 rounded-xl border border-purple-100 shadow-2xs">
              <strong className="text-slate-800 block mb-0.5">📦 Entregable para Grado:</strong>
              <span className="text-slate-600">{infoModalidad.entregablesFinales}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-purple-100 shadow-2xs">
              <strong className="text-slate-800 block mb-0.5">🎤 Evaluación / Sustentación:</strong>
              <span className="text-slate-600">{infoModalidad.requiereSustentacion}</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-start gap-2 shadow-2xs">
            <span className="text-base shrink-0">⚠️</span>
            <div>
              <strong className="text-amber-900 block text-[11px]">Requisito Clave de Aprobación:</strong>
              <span className="text-slate-700 text-[11px]">{infoModalidad.requisitoClave}</span>
            </div>
          </div>

          {postulacion.documentos_requeridos?.length > 0 && (
            <div className="pt-1">
              <span className="font-bold text-slate-700 block text-[11px] mb-1">
                📑 Documentos obligatorios que debes anexar:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                {postulacion.documentos_requeridos.map((req, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span className="font-medium text-slate-800">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Semáforo de Turno y Responsable Activo */}
      <div className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${turno.claseCaja}`}>
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0" aria-hidden="true">{turno.icono}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-2xs ${turno.claseBadge}`}>
                Responsabilidad Activa
              </span>
              <h4 className="text-xs sm:text-sm font-black tracking-tight truncate">
                {turno.titulo}
              </h4>
            </div>
            <p className="text-xs mt-0.5 font-medium opacity-90">
              {turno.subtitulo}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-current/10">
          <span className="text-[11px] font-bold block opacity-75 uppercase tracking-wide">
            Próxima Acción:
          </span>
          <span className="text-xs font-semibold max-w-xs block sm:inline">
            {turno.accion}
          </span>
        </div>
      </div>

      {/* 4. Mini Línea de Tiempo de las Macro-Estaciones */}
      {postulacion.estado !== "RECHAZADO" && (
        <div className="pt-1">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {ESTACIONES.map((est, idx) => {
              const esPasada = idx < estacionActualIndex;
              const esActual = idx === estacionActualIndex;

              return (
                <div key={est.id} className="flex-1 flex flex-col items-center group">
                  {/* Conector y punto */}
                  <div className="w-full flex items-center">
                    <div
                      className={`h-1 flex-1 rounded-l ${
                        idx === 0 ? "invisible" : esPasada || esActual ? "bg-itm-purple" : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${
                        esPasada
                          ? "bg-itm-purple text-white shadow-xs"
                          : esActual
                          ? "bg-itm-blue text-white ring-4 ring-blue-100 shadow-sm scale-110"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {esPasada ? "✓" : idx + 1}
                    </div>
                    <div
                      className={`h-1 flex-1 rounded-r ${
                        idx === ESTACIONES.length - 1 ? "invisible" : esPasada ? "bg-itm-purple" : "bg-slate-200"
                      }`}
                    />
                  </div>
                  {/* Etiqueta */}
                  <span
                    className={`text-[10px] mt-1.5 font-bold text-center leading-tight transition-colors hidden sm:block ${
                      esActual
                        ? "text-itm-blue font-black"
                        : esPasada
                        ? "text-slate-700"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    {est.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
