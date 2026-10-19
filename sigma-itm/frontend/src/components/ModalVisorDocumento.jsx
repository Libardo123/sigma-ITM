import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";

/**
 * Resuelve la URL absoluta del archivo para el visor o descarga.
 * Garantiza que las rutas relativas incluyan el prefijo /media/ si hace falta.
 */
export function resolverUrlDocumento(urlArchivo) {
  if (!urlArchivo) return "#";
  if (urlArchivo.startsWith("http://") || urlArchivo.startsWith("https://")) {
    return urlArchivo;
  }
  let ruta = urlArchivo.startsWith("/") ? urlArchivo : `/${urlArchivo}`;
  if (!ruta.startsWith("/media/")) {
    ruta = `/media${ruta}`;
  }
  const apiBase = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";
  const hostBase = apiBase.replace(/\/api\/?$/, "");
  return `${hostBase}${ruta}`;
}

/**
 * Detecta la extensión del archivo a partir de la URL o nombre.
 */
export function obtenerExtensionArchivo(nombreOUrl) {
  if (!nombreOUrl) return "";
  const partes = nombreOUrl.split("?")[0].split(".");
  if (partes.length < 2) return "";
  return partes.pop().toLowerCase();
}

/**
 * Fuerza la descarga directa de un archivo al disco local del usuario,
 * evitando que el navegador abra una pestaña o previsualización.
 *
 * @param {string} urlArchivo - URL o Blob URL del archivo
 * @param {string} [nombreSugerido] - Nombre sugerido del archivo
 */
export async function forzarDescargaArchivo(urlArchivo, nombreSugerido) {
  if (!urlArchivo || urlArchivo === "#") return;
  try {
    let blob;
    if (urlArchivo.startsWith("blob:")) {
      const res = await fetch(urlArchivo);
      blob = await res.blob();
    } else {
      const res = await fetch(urlArchivo);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      blob = await res.blob();
    }

    const rutaSinQuery = urlArchivo.split("?")[0];
    const partesRuta = rutaSinQuery.split(".");
    const ext = partesRuta.length > 1 ? partesRuta.pop().toLowerCase() : "";

    let nombreFinal = nombreSugerido || (rutaSinQuery.split("/").pop() || "documento");
    if (ext && !nombreFinal.toLowerCase().endsWith(`.${ext}`)) {
      nombreFinal = `${nombreFinal}.${ext}`;
    }

    // 1. Si el navegador soporta File System Access API (Chrome, Edge),
    // abrimos el diálogo nativo "Guardar como..." para que el usuario elija la carpeta.
    if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
      try {
        const opcionesPicker = {
          suggestedName: nombreFinal,
        };

        if (ext) {
          const mapaMime = {
            pdf: "application/pdf",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            doc: "application/msword",
            xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            xls: "application/vnd.ms-excel",
            csv: "text/csv",
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            webp: "image/webp",
            txt: "text/plain",
          };
          if (mapaMime[ext]) {
            opcionesPicker.types = [
              {
                description: `Archivo ${ext.toUpperCase()}`,
                accept: { [mapaMime[ext]]: [`.${ext}`] },
              },
            ];
          }
        }

        const handle = await window.showSaveFilePicker(opcionesPicker);
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return; // Guardado con éxito en la carpeta elegida por el usuario
      } catch (pickerErr) {
        // Si el usuario canceló voluntariamente el diálogo, no hacemos nada
        if (pickerErr.name === "AbortError") {
          return;
        }
        console.warn("showSaveFilePicker omitido, procediendo con descarga estándar:", pickerErr);
      }
    }

    // 2. Fallback estándar para navegadores sin showSaveFilePicker o entornos que lo requieran
    const urlBlob = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = urlBlob;
    a.download = nombreFinal;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(urlBlob);
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 200);
  } catch (err) {
    console.warn("Fallo descarga forzada vía Blob, usando enlace nativo:", err);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = urlArchivo;
    a.download = nombreSugerido || "documento";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 200);
  }
}

/**
 * Componente Modal universal para previsualizar y descargar cualquier tipo
 * de documento de SIGMA ITM:
 * - PDF (visor nativo)
 * - Word .docx (renderizado visual en HTML con docx-preview)
 * - Excel .xlsx/.xls/.csv (hojas de cálculo interactivas con xlsx)
 * - Imágenes .png, .jpg, .webp, .svg
 * - Texto plano .txt, .json, .md
 */
export default function ModalVisorDocumento({ documento, onCerrar }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  // Estados específicos para hojas de cálculo Excel
  const [hojasExcel, setHojasExcel] = useState([]);
  const [hojaActiva, setHojaActiva] = useState(0);
  const [datosHojaExcel, setDatosHojaExcel] = useState([]);

  // Estado para texto plano
  const [contenidoTexto, setContenidoTexto] = useState("");

  const docxContainerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  const urlAbsoluta = resolverUrlDocumento(documento?.archivo);
  const extension = obtenerExtensionArchivo(documento?.archivo || documento?.nombre);

  const esPdf = extension === "pdf";
  const esImagen = ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(extension);
  const esWord = ["docx", "doc"].includes(extension);
  const esExcel = ["xlsx", "xls", "csv"].includes(extension);
  const esTexto = ["txt", "log", "json", "md"].includes(extension);

  useEffect(() => {
    let cancelado = false;
    let urlGenerada = null;

    if (!documento || !documento.archivo) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setErrorCarga(null);
    setContenidoTexto("");
    setHojasExcel([]);
    setDatosHojaExcel([]);

    fetch(urlAbsoluta)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.blob();
      })
      .then(async (blob) => {
        if (cancelado) return;

        // 1. Crear Blob URL universal
        urlGenerada = URL.createObjectURL(blob);
        setBlobUrl(urlGenerada);

        // 2. Procesamiento según extensión
        if (esWord && extension === "docx") {
          // Renderizado de Word (.docx)
          const arrayBuffer = await blob.arrayBuffer();
          if (docxContainerRef.current && !cancelado) {
            docxContainerRef.current.innerHTML = "";
            await renderAsync(arrayBuffer, docxContainerRef.current, null, {
              className: "docx-documento",
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              breakPages: true,
            });
          }
        } else if (esExcel) {
          // Procesamiento de Excel / CSV (.xlsx, .xls, .csv)
          const arrayBuffer = await blob.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          if (!cancelado) {
            const nombres = workbook.SheetNames || [];
            setHojasExcel(nombres);
            if (nombres.length > 0) {
              setHojaActiva(0);
              const hoja = workbook.Sheets[nombres[0]];
              const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" });
              setDatosHojaExcel(filas);
            }
          }
        } else if (esTexto) {
          const texto = await blob.text();
          if (!cancelado) setContenidoTexto(texto);
        }

        if (!cancelado) setCargando(false);
      })
      .catch((err) => {
        if (!cancelado) {
          console.warn("Aviso al procesar archivo en visor:", err);
          // Fallback: Si falla fetch o renderizado, usar URL directa
          setBlobUrl(urlAbsoluta);
          setCargando(false);
          // Solo marcar error crítico si no es PDF/imagen (los cuales el navegador aún puede intentar)
          if (!esPdf && !esImagen) {
            setErrorCarga("No se pudo procesar la previsualización directa de este archivo.");
          }
        }
      });

    return () => {
      cancelado = true;
      if (urlGenerada) {
        URL.revokeObjectURL(urlGenerada);
      }
    };
  }, [urlAbsoluta, extension, esWord, esExcel, esPdf, esImagen, esTexto, documento]);

  // Manejo de cambio de pestaña en Excel
  const cambiarHojaExcel = async (indiceHoja) => {
    setHojaActiva(indiceHoja);
    try {
      const res = await fetch(urlAbsoluta);
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const nombreHoja = hojasExcel[indiceHoja];
      if (nombreHoja && workbook.Sheets[nombreHoja]) {
        const filas = XLSX.utils.sheet_to_json(workbook.Sheets[nombreHoja], { header: 1, defval: "" });
        setDatosHojaExcel(filas);
      }
    } catch (e) {
      console.error("Error cambiando de hoja en Excel:", e);
    }
  };

  if (!documento || !documento.archivo) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label={`Previsualización de ${documento.nombre || "documento"}`}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior de Controles y Metadatos */}
        <header className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0" aria-hidden="true">
              {esPdf ? "📄" : esImagen ? "🖼️" : esWord ? "📘" : esExcel ? "📊" : "📁"}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate max-w-md" title={documento.nombre}>
                  {documento.nombre || "Documento adjunto"}
                </h3>
                {extension && (
                  <span className="shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-itm-purple/10 text-itm-purple border border-itm-purple/20">
                    {extension}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">
                {documento.fecha ? `Subido el ${documento.fecha}` : "Expediente institucional SIGMA ITM"}
                {documento.descripcion ? ` · ${documento.descripcion}` : ""}
              </p>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => forzarDescargaArchivo(blobUrl || urlAbsoluta, documento.nombre)}
              className="inline-flex items-center gap-1.5 bg-itm-purple hover:bg-[#500c66] text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Descargar este archivo a tu dispositivo"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Descargar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                if (documento.archivo) params.set("archivo", documento.archivo);
                if (documento.nombre) params.set("nombre", documento.nombre);
                if (documento.fecha) params.set("fecha", documento.fecha);
                if (documento.descripcion) params.set("descripcion", documento.descripcion);
                window.open(`/visor?${params.toString()}`, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors cursor-pointer"
              title="Abrir este documento en una pestaña completa"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">Pestaña</span>
            </button>

            <button
              type="button"
              onClick={onCerrar}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              title="Cerrar visor (Esc)"
              aria-label="Cerrar visor"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Barra de pestañas en caso de libros de Excel con múltiples hojas */}
        {esExcel && hojasExcel.length > 1 && (
          <div className="px-5 py-2 bg-slate-200/70 border-b border-slate-300 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[11px] font-bold text-slate-600 mr-2 flex items-center gap-1 shrink-0">
              <span>📑 Hojas:</span>
            </span>
            {hojasExcel.map((nombre, idx) => (
              <button
                key={nombre}
                onClick={() => cambiarHojaExcel(idx)}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-all shrink-0 ${
                  hojaActiva === idx
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                }`}
              >
                {nombre}
              </button>
            ))}
          </div>
        )}

        {/* Cuerpo del Visor universal */}
        <div className="flex-grow bg-slate-100 overflow-auto flex items-center justify-center p-2 sm:p-4 relative">
          {cargando && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs gap-3">
              <div className="w-10 h-10 border-4 border-itm-purple/20 border-t-itm-purple rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-600 animate-pulse">
                Cargando y procesando vista previa del documento...
              </p>
            </div>
          )}

          {errorCarga && (
            <div className="bg-white rounded-xl p-8 max-w-md text-center shadow border border-slate-200 space-y-3 z-10 my-auto">
              <div className="text-3xl">⚠️</div>
              <h4 className="font-bold text-slate-800 text-sm">Vista previa no disponible</h4>
              <p className="text-xs text-slate-500">{errorCarga}</p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => forzarDescargaArchivo(blobUrl || urlAbsoluta, documento.nombre)}
                  className="inline-flex items-center gap-1.5 bg-itm-purple hover:bg-[#500c66] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <span>⬇️ Descargar Documento</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. Visor de PDF */}
          {esPdf && !errorCarga && (
            <object
              data={blobUrl || `${urlAbsoluta}#toolbar=1`}
              type="application/pdf"
              className="w-full h-full rounded-lg bg-white shadow-inner border border-slate-200"
            >
              <iframe
                src={blobUrl || `${urlAbsoluta}#toolbar=1`}
                title={`Visor PDF - ${documento.nombre}`}
                className="w-full h-full rounded-lg bg-white shadow-inner border border-slate-200"
              />
            </object>
          )}

          {/* 2. Visor de Imágenes */}
          {esImagen && !errorCarga && (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={blobUrl || urlAbsoluta}
                alt={documento.nombre || "Previsualización de imagen"}
                className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-lg bg-white"
              />
            </div>
          )}

          {/* 3. Visor de Word (.docx) */}
          {esWord && !errorCarga && (
            <div className="w-full h-full overflow-auto bg-slate-200/80 rounded-lg p-4 sm:p-6 flex justify-center">
              <div 
                ref={docxContainerRef}
                className="bg-white shadow-xl rounded-md p-6 sm:p-10 max-w-4xl w-full min-h-full docx-container prose prose-sm text-slate-800"
              />
            </div>
          )}

          {/* 4. Visor de Excel (.xlsx, .xls, .csv) */}
          {esExcel && !errorCarga && (
            <div className="w-full h-full overflow-auto bg-white rounded-lg shadow border border-slate-200 p-2">
              {datosHojaExcel && datosHojaExcel.length > 0 ? (
                <div className="overflow-auto max-h-full">
                  <table className="min-w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 sticky top-0 z-10">
                        <th className="py-2 px-3 border-r border-slate-200 text-slate-400 font-mono w-12 text-center bg-slate-200">#</th>
                        {datosHojaExcel[0].map((encabezado, cIdx) => (
                          <th key={cIdx} className="py-2 px-3 border-r border-slate-200 font-bold whitespace-nowrap bg-slate-100">
                            {encabezado !== undefined && encabezado !== "" ? String(encabezado) : `Columna ${cIdx + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datosHojaExcel.slice(1).map((fila, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white hover:bg-purple-50/50" : "bg-slate-50/80 hover:bg-purple-50/50"}>
                          <td className="py-1.5 px-3 border-b border-r border-slate-200 text-slate-400 font-mono text-center select-none bg-slate-100/50">
                            {rIdx + 2}
                          </td>
                          {datosHojaExcel[0].map((_, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 border-b border-r border-slate-200 text-slate-700 whitespace-nowrap">
                              {fila[cIdx] !== undefined ? String(fila[cIdx]) : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 italic">
                  Esta hoja no contiene datos para mostrar.
                </div>
              )}
            </div>
          )}

          {/* 5. Visor de Texto Plano (.txt, .log, .json, .md) */}
          {esTexto && !errorCarga && (
            <div className="w-full h-full overflow-auto bg-slate-900 text-emerald-400 font-mono text-xs p-5 rounded-lg shadow-inner">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {contenidoTexto || "Archivo de texto vacío"}
              </pre>
            </div>
          )}
        </div>

        {/* Pie informativo del visor */}
        <footer className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Visor Universal de Documentos · SIGMA ITM</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">Esc</kbd> para cerrar
          </span>
        </footer>
      </div>
    </div>
  );
}
