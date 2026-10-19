import React, { useState } from "react";
import { forzarDescargaArchivo } from "./ModalVisorDocumento";

/**
 * Obtiene la extensión limpia de una ruta de archivo.
 */
function obtenerTipoArchivo(ruta) {
  if (!ruta) return "DOCUMENTO";
  const ext = ruta.split(".").pop().toLowerCase();
  return ext.toUpperCase();
}

/**
 * Extrae el nombre simple de un archivo desde su ruta.
 */
function extraerNombreArchivo(ruta) {
  if (!ruta) return "archivo";
  const segmentos = ruta.split("/");
  return decodeURIComponent(segmentos[segmentos.length - 1]);
}

/**
 * HistorialVersionesDocumento
 *
 * Muestra el distintivo de versión actual (v1, v2, v3, v4...) y un historial
 * desplegable de versiones previas con trazabilidad forense (motivo, fecha, autor,
 * previsualización y descarga independiente de cada versión).
 *
 * Incluye comparador lado a lado con tabla de diferencias técnicas y motivos.
 */
export default function HistorialVersionesDocumento({
  documento,
  onPrevisualizar,
  onReemplazar,
  onReemplazarVersion,
  onEliminarVersion,
  obtenerUrl,
  formatearFecha,
  className = "",
}) {
  const [expandido, setExpandido] = useState(false);
  const [modalComparar, setModalComparar] = useState(null); // { vA, vB }

  if (!documento) return null;

  const versiones =
    documento.versiones && documento.versiones.length > 0
      ? documento.versiones
      : [
          {
            id: `v1-${documento.id}`,
            numero_version: 1,
            archivo: documento.archivo,
            descripcion: documento.descripcion || "Documento original radicado",
            motivo: "Radicación original en expediente",
            creado_en: documento.subido_en,
            creado_por_nombre: "Estudiante",
          },
        ];

  const versionActualNum =
    documento.version_actual || versiones[0]?.numero_version || 1;
  const tieneMultiplesVersiones = versiones.length > 1;

  const abrirComparador = (vA, vB) => {
    // Si no se especifican, compara la original (v1) con la más reciente
    const verOriginal =
      versiones.find((v) => v.numero_version === 1) ||
      versiones[versiones.length - 1];
    const verReciente = versiones[0];
    setModalComparar({
      vA: vA || verOriginal,
      vB: vB || verReciente,
    });
  };

  return (
    <div className={`w-full mt-2 pt-2 border-t border-slate-100 ${className}`}>
      {/* Barra de Versión y Controles de Auditoría */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
              versionActualNum > 1
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
            title={`Versión vigente en el expediente: v${versionActualNum}`}
          >
            <span>🏷️</span>
            <span>
              v{versionActualNum} {versionActualNum > 1 ? "Corregido" : "Original"}
            </span>
          </span>

          {tieneMultiplesVersiones && (
            <button
              type="button"
              onClick={() => setExpandido(!expandido)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-itm-purple bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
              title="Ver u ocultar el historial de versiones previas"
            >
              <span>📜</span>
              <span>Historial ({versiones.length} versiones)</span>
              <span className="text-[10px] transition-transform duration-200">
                {expandido ? "▲" : "▼"}
              </span>
            </button>
          )}

          {tieneMultiplesVersiones && (
            <button
              type="button"
              onClick={() => abrirComparador()}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg border border-indigo-200 transition-all cursor-pointer shadow-2xs"
              title="Comparar cambios entre la versión original y la última versión radicada"
            >
              <span>⚖️</span>
              <span>Comparar v1 vs v{versionActualNum}</span>
            </button>
          )}
        </div>

        {/* Botón rápido de Reemplazo si el usuario se equivocó o necesita corregir */}
        {onReemplazar && (
          <button
            type="button"
            onClick={onReemplazar}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-all cursor-pointer shadow-2xs"
            title="¿Te equivocaste de archivo o requieres corregir? Haz clic aquí para sustituirlo por una nueva versión"
          >
            <span>🔄</span>
            <span>Reemplazar / Cambiar Archivo</span>
          </button>
        )}
      </div>

      {/* Historial Desplegable de Versiones */}
      {expandido && (
        <div className="mt-3 p-4 bg-slate-50/95 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-200 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
            <div>
              <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>🗂️</span> Trazabilidad Forense de Versiones (v1 a v{versionActualNum})
              </p>
              <p className="text-[11px] text-slate-500">
                Auditoría inmutable de sustituciones, motivos y archivos físicos resguardados en el ITM.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {onReemplazar && (
                <button
                  type="button"
                  onClick={() => onReemplazar(null)}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                  title={`Subir una nueva entrega que se registrará como v${versionActualNum + 1}`}
                >
                  <span>🔄</span>
                  <span>Cargar Nueva Versión (v{versionActualNum + 1})</span>
                </button>
              )}
              {tieneMultiplesVersiones && (
                <button
                  type="button"
                  onClick={() => abrirComparador()}
                  className="text-[11px] font-black text-itm-purple hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>⚖️</span>
                  <span>Abrir Comparador</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {versiones.map((v) => {
              const esVigente = v.numero_version === versionActualNum;
              const esOriginal = v.numero_version === 1;
              const tipoArchivo = obtenerTipoArchivo(v.archivo);
              const nombreArchivo = extraerNombreArchivo(v.archivo);

              return (
                <div
                  key={v.id || v.numero_version}
                  className={`p-3.5 rounded-xl border transition-all text-xs ${
                    esVigente
                      ? "bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-200/60"
                      : "bg-white/85 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          esVigente
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : esOriginal
                            ? "bg-slate-100 text-slate-700 border border-slate-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        v{v.numero_version}{" "}
                        {esVigente
                          ? "• Actual Vigente"
                          : esOriginal
                          ? "• Original Radicado"
                          : "• Corregido"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                        {tipoArchivo}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        🗓️{" "}
                        {formatearFecha
                          ? formatearFecha(v.creado_en)
                          : new Date(v.creado_en).toLocaleString("es-CO")}
                      </span>
                    </div>

                    {/* Botonera Estandarizada Completa para CADA Versión */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      {/* 1. Ver / Previsualizar */}
                      {onPrevisualizar && (
                        <button
                          type="button"
                          onClick={() =>
                            onPrevisualizar({
                              nombre: `${documento.nombre} (v${v.numero_version})`,
                              archivo: v.archivo,
                              descripcion: v.motivo || v.descripcion,
                              fecha: formatearFecha
                                ? formatearFecha(v.creado_en)
                                : v.creado_en,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-itm-purple hover:bg-itm-purple hover:text-white bg-purple-50 rounded-lg border border-purple-200 transition-all cursor-pointer shadow-2xs"
                          title={`Previsualizar archivo de la versión v${v.numero_version}`}
                        >
                          <span>👁️</span>
                          <span>Ver</span>
                        </button>
                      )}

                      {/* 2. Descargar archivo */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          const urlDescarga = obtenerUrl
                            ? obtenerUrl(v.archivo)
                            : v.archivo;
                          forzarDescargaArchivo(
                            urlDescarga,
                            `${documento.nombre}_v${v.numero_version}`
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-itm-blue hover:bg-slate-100 bg-white rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
                        title={`Descargar archivo de la versión v${v.numero_version}`}
                      >
                        <span>⬇️</span>
                        <span>Descargar</span>
                      </button>

                      {/* 3. Reemplazar / Sustituir este archivo si hubo error al subir */}
                      {(onReemplazarVersion || onReemplazar) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onReemplazarVersion) {
                              onReemplazarVersion(v);
                            } else if (onReemplazar) {
                              onReemplazar(v);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all cursor-pointer shadow-2xs"
                          title={`Reemplazar o cambiar el archivo de la versión v${v.numero_version} si te equivocaste al subirlo`}
                        >
                          <span>🔄</span>
                          <span>Reemplazar</span>
                        </button>
                      )}

                      {/* 4. Cotejar / Comparar */}
                      {tieneMultiplesVersiones && (
                        <button
                          type="button"
                          onClick={() => {
                            if (esVigente) {
                              abrirComparador(versiones[1] || versiones[versiones.length - 1], v);
                            } else {
                              abrirComparador(v, versiones[0]);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 bg-indigo-50 rounded-lg border border-indigo-200 transition-all cursor-pointer shadow-2xs"
                          title={
                            esVigente
                              ? `Cotejar versión vigente (v${v.numero_version}) con la versión anterior`
                              : `Cotejar v${v.numero_version} con la versión vigente (v${versionActualNum})`
                          }
                        >
                          <span>⚖️</span>
                          <span className="hidden sm:inline">Cotejar</span>
                        </button>
                      )}

                      {/* 5. Tarro de basura / Eliminar esta versión */}
                      {onEliminarVersion && (
                        <button
                          type="button"
                          onClick={() => onEliminarVersion(v)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-red-600 hover:text-red-800 bg-white hover:bg-red-50 rounded-lg border border-red-200 transition-all cursor-pointer shadow-2xs"
                          title={`Eliminar la versión v${v.numero_version} si fue subida por error`}
                        >
                          <span>🗑️</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Archivo y Motivo o Justificación del Cambio */}
                  <div className="space-y-1 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                    <p className="text-[11px] text-slate-600 font-mono truncate">
                      <span className="font-sans font-bold text-slate-500">Archivo:</span> {nombreArchivo}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-700">
                      <span className="text-slate-500 font-bold">Motivo / Justificación:</span>{" "}
                      <span className="italic text-slate-900 font-normal">
                        "{v.motivo || v.descripcion || "Radicación inicial en expediente institucional."}"
                      </span>
                    </p>
                    {v.descripcion && v.descripcion !== v.motivo && (
                      <p className="text-[10px] text-slate-500">
                        <span className="font-bold">Notas:</span> {v.descripcion}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL COMPARADOR DE VERSIONES (COTEJO FORENSE Y DIFERENCIAS) */}
      {modalComparar && (() => {
        const tipoA = obtenerTipoArchivo(modalComparar.vA.archivo);
        const tipoB = obtenerTipoArchivo(modalComparar.vB.archivo);
        const nombreA = extraerNombreArchivo(modalComparar.vA.archivo);
        const nombreB = extraerNombreArchivo(modalComparar.vB.archivo);
        const fechaA = formatearFecha
          ? formatearFecha(modalComparar.vA.creado_en)
          : modalComparar.vA.creado_en;
        const fechaB = formatearFecha
          ? formatearFecha(modalComparar.vB.creado_en)
          : modalComparar.vB.creado_en;

        return (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-itm-blue via-indigo-900 to-itm-purple text-white p-5 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/20 border border-white/30 text-white">
                    Auditoría Forense ITM
                  </span>
                  <h3 className="text-lg font-black mt-1">
                    Comparador de Versiones Documentales
                  </h3>
                  <p className="text-xs text-indigo-100 truncate max-w-md sm:max-w-xl">
                    Documento: <strong>{documento.nombre}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalComparar(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Selectores de Versión */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Versión A (Referencia / Anterior):
                  </label>
                  <select
                    value={modalComparar.vA.numero_version}
                    onChange={(e) => {
                      const sel = versiones.find(
                        (v) => String(v.numero_version) === e.target.value
                      );
                      if (sel) setModalComparar((prev) => ({ ...prev, vA: sel }));
                    }}
                    className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-itm-purple cursor-pointer shadow-2xs"
                  >
                    {versiones.map((v) => (
                      <option key={v.numero_version} value={v.numero_version}>
                        v{v.numero_version} (
                        {v.numero_version === 1 ? "Original" : "Corregido"}) — {obtenerTipoArchivo(v.archivo)} —{" "}
                        {formatearFecha ? formatearFecha(v.creado_en) : v.creado_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Versión B (Comparar / Posterior):
                  </label>
                  <select
                    value={modalComparar.vB.numero_version}
                    onChange={(e) => {
                      const sel = versiones.find(
                        (v) => String(v.numero_version) === e.target.value
                      );
                      if (sel) setModalComparar((prev) => ({ ...prev, vB: sel }));
                    }}
                    className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-itm-purple cursor-pointer shadow-2xs"
                  >
                    {versiones.map((v) => (
                      <option key={v.numero_version} value={v.numero_version}>
                        v{v.numero_version} (
                        {v.numero_version === versionActualNum
                          ? "Vigente Actual"
                          : "Corregido"}
                        ) — {obtenerTipoArchivo(v.archivo)} —{" "}
                        {formatearFecha ? formatearFecha(v.creado_en) : v.creado_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Matriz Resumen de Diferencias Clave */}
              <div className="px-6 pt-4 pb-0">
                <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 text-xs">
                  <p className="font-black text-slate-700 mb-2 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                    <span>📊</span> Resumen Técnico de Diferencias
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold">FORMATO DE ARCHIVO</span>
                      <span className="font-black text-slate-800">
                        {tipoA} ➔ {tipoB} {tipoA !== tipoB ? "(Cambiado)" : "(Igual)"}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold">ORDEN DE EVOLUCIÓN</span>
                      <span className="font-black text-indigo-700">
                        v{modalComparar.vA.numero_version} ➔ v{modalComparar.vB.numero_version}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold">ESTADO INSTITUCIONAL</span>
                      <span className="font-black text-emerald-700">
                        Ambos archivados sin pérdida
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cuerpo Comparador Lado a Lado */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Columna Versión A */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-200 text-slate-800">
                          v{modalComparar.vA.numero_version}{" "}
                          {modalComparar.vA.numero_version === 1
                            ? "(Original)"
                            : "(Versión Previa)"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                          {tipoA}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        🗓️ {fechaA}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                        Nombre físico del archivo:
                      </p>
                      <p className="text-xs font-mono text-slate-700 bg-white p-2 rounded-lg border border-slate-200 truncate">
                        {nombreA}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Motivo / Justificación Registrada:
                      </p>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 italic min-h-[60px]">
                        "
                        {modalComparar.vA.motivo ||
                          modalComparar.vA.descripcion ||
                          "Radicación inicial en el expediente."}
                        "
                      </div>
                    </div>

                    {modalComparar.vA.descripcion && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                          Notas Complementarias:
                        </p>
                        <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                          {modalComparar.vA.descripcion}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      {onPrevisualizar && (
                        <button
                          type="button"
                          onClick={() => {
                            onPrevisualizar({
                              nombre: `${documento.nombre} (v${modalComparar.vA.numero_version})`,
                              archivo: modalComparar.vA.archivo,
                              descripcion: modalComparar.vA.motivo,
                              fecha: fechaA,
                            });
                          }}
                          className="flex-1 py-2 text-xs font-bold text-itm-purple bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>👁️</span>
                          <span>Previsualizar v{modalComparar.vA.numero_version}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const url = obtenerUrl
                            ? obtenerUrl(modalComparar.vA.archivo)
                            : modalComparar.vA.archivo;
                          forzarDescargaArchivo(
                            url,
                            `${documento.nombre}_v${modalComparar.vA.numero_version}`
                          );
                        }}
                        className="py-2 px-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Descargar este archivo"
                      >
                        <span>⬇️</span>
                      </button>
                    </div>
                  </div>

                  {/* Columna Versión B */}
                  <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white">
                          v{modalComparar.vB.numero_version}{" "}
                          {modalComparar.vB.numero_version === versionActualNum
                            ? "(Vigente Actual)"
                            : "(Corregido)"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">
                          {tipoB}
                        </span>
                      </div>
                      <span className="text-[11px] text-indigo-700 font-semibold">
                        🗓️ {fechaB}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-indigo-900 mb-0.5">
                        Nombre físico del archivo:
                      </p>
                      <p className="text-xs font-mono text-slate-800 bg-white p-2 rounded-lg border border-indigo-200 truncate">
                        {nombreB}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-indigo-900 mb-1">
                        Motivo / Justificación Registrada:
                      </p>
                      <div className="bg-white p-3 rounded-xl border border-indigo-200 text-xs text-slate-800 italic min-h-[60px] shadow-2xs">
                        "
                        {modalComparar.vB.motivo ||
                          modalComparar.vB.descripcion ||
                          "Sin motivo registrado."}
                        "
                      </div>
                    </div>

                    {modalComparar.vB.descripcion && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-indigo-900 mb-0.5">
                          Notas Complementarias:
                        </p>
                        <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-indigo-200">
                          {modalComparar.vB.descripcion}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-indigo-200 flex items-center gap-2">
                      {onPrevisualizar && (
                        <button
                          type="button"
                          onClick={() => {
                            onPrevisualizar({
                              nombre: `${documento.nombre} (v${modalComparar.vB.numero_version})`,
                              archivo: modalComparar.vB.archivo,
                              descripcion: modalComparar.vB.motivo,
                              fecha: fechaB,
                            });
                          }}
                          className="flex-1 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>👁️</span>
                          <span>Previsualizar v{modalComparar.vB.numero_version}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const url = obtenerUrl
                            ? obtenerUrl(modalComparar.vB.archivo)
                            : modalComparar.vB.archivo;
                          forzarDescargaArchivo(
                            url,
                            `${documento.nombre}_v${modalComparar.vB.numero_version}`
                          );
                        }}
                        className="py-2 px-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Descargar este archivo"
                      >
                        <span>⬇️</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nota de Auditoría ITM */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                  <span className="text-base">🛡️</span>
                  <p>
                    <strong>Trazabilidad forense inmutable:</strong> Ambas
                    versiones permanecen almacenadas físicamente en el repositorio
                    institucional del ITM. Los evaluadores y estudiantes pueden
                    consultar y descargar el archivo original y cada versión
                    subsanada en cualquier momento.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setModalComparar(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar Comparador
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
