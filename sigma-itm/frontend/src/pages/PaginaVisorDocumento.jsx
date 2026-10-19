import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";
import {
  forzarDescargaArchivo,
  obtenerExtensionArchivo,
  resolverUrlDocumento,
} from "../components/ModalVisorDocumento";

/**
 * PaginaVisorDocumento.jsx
 *
 * Página independiente a pantalla completa para abrir cualquier documento
 * institucional (Word, Excel, PDF, Imágenes, Texto) en una nueva pestaña
 * sin forzar descargas inesperadas del navegador.
 */
export default function PaginaVisorDocumento() {
  const [searchParams] = useSearchParams();
  const archivo = searchParams.get("archivo");
  const nombre = searchParams.get("nombre") || "Documento adjunto";
  const fecha = searchParams.get("fecha");
  const descripcion = searchParams.get("descripcion");

  const [blobUrl, setBlobUrl] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  // Estados para hojas de Excel
  const [hojasExcel, setHojasExcel] = useState([]);
  const [hojaActiva, setHojaActiva] = useState(0);
  const [datosHojaExcel, setDatosHojaExcel] = useState([]);

  // Estado para texto plano
  const [contenidoTexto, setContenidoTexto] = useState("");

  const docxContainerRef = useRef(null);

  const urlAbsoluta = resolverUrlDocumento(archivo);
  const extension = obtenerExtensionArchivo(archivo || nombre);

  const esPdf = extension === "pdf";
  const esImagen = ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(extension);
  const esWord = ["docx", "doc"].includes(extension);
  const esExcel = ["xlsx", "xls", "csv"].includes(extension);
  const esTexto = ["txt", "log", "json", "md"].includes(extension);

  useEffect(() => {
    document.title = `${nombre} · Visor SIGMA ITM`;
  }, [nombre]);

  useEffect(() => {
    let cancelado = false;
    let urlGenerada = null;

    if (!archivo) {
      setCargando(false);
      setErrorCarga("No se especificó ningún archivo para visualizar.");
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

        urlGenerada = URL.createObjectURL(blob);
        setBlobUrl(urlGenerada);

        if (esWord && extension === "docx") {
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
          console.warn("Fallo carga de visor en pestaña:", err);
          setBlobUrl(urlAbsoluta);
          setCargando(false);
          if (!esPdf && !esImagen) {
            setErrorCarga("No se pudo cargar la vista previa directa de este documento.");
          }
        }
      });

    return () => {
      cancelado = true;
      if (urlGenerada) {
        URL.revokeObjectURL(urlGenerada);
      }
    };
  }, [urlAbsoluta, extension, esWord, esExcel, esPdf, esImagen, esTexto, archivo]);

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
      console.error("Error cambiando hoja Excel:", e);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-100 font-sans text-slate-800">
      {/* Barra Superior Institucional */}
      <header className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-itm-purple/10 text-itm-purple flex items-center justify-center text-lg font-bold">
            {esPdf ? "📄" : esImagen ? "🖼️" : esWord ? "📘" : esExcel ? "📊" : "📁"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-xl" title={nombre}>
                {nombre}
              </h1>
              {extension && (
                <span className="shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-itm-purple/10 text-itm-purple border border-itm-purple/20">
                  {extension}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">
              SIGMA ITM · Visor Institucional de Documentos
              {fecha ? ` · Subido el ${fecha}` : ""}
              {descripcion ? ` · ${descripcion}` : ""}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => forzarDescargaArchivo(blobUrl || urlAbsoluta, nombre)}
            className="inline-flex items-center gap-1.5 bg-itm-purple hover:bg-[#500c66] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            title="Descargar este archivo a tu dispositivo"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Descargar</span>
          </button>

          <button
            type="button"
            onClick={() => window.close()}
            className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            title="Cerrar esta pestaña"
          >
            <span>Cerrar</span>
          </button>
        </div>
      </header>

      {/* Barra de Hojas si es Excel con múltiples hojas */}
      {esExcel && hojasExcel.length > 1 && (
        <div className="px-5 py-2 bg-slate-200/80 border-b border-slate-300 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[11px] font-bold text-slate-600 mr-2 flex items-center gap-1 shrink-0">
            <span>📑 Hojas del libro:</span>
          </span>
          {hojasExcel.map((nombreHoja, idx) => (
            <button
              key={nombreHoja}
              onClick={() => cambiarHojaExcel(idx)}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-all shrink-0 cursor-pointer ${
                hojaActiva === idx
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
              }`}
            >
              {nombreHoja}
            </button>
          ))}
        </div>
      )}

      {/* Contenedor Principal de Previsualización */}
      <main className="flex-1 overflow-auto p-3 sm:p-6 flex items-center justify-center relative">
        {cargando && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs gap-3">
            <div className="w-10 h-10 border-4 border-itm-purple/20 border-t-itm-purple rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-600 animate-pulse">
              Cargando documento en pestaña completa...
            </p>
          </div>
        )}

        {errorCarga && (
          <div className="bg-white rounded-xl p-8 max-w-md text-center shadow border border-slate-200 space-y-3 z-10 my-auto">
            <div className="text-3xl">⚠️</div>
            <h2 className="font-bold text-slate-800 text-sm">Vista previa no disponible</h2>
            <p className="text-xs text-slate-500">{errorCarga}</p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => forzarDescargaArchivo(blobUrl || urlAbsoluta, nombre)}
                className="inline-flex items-center gap-1.5 bg-itm-purple hover:bg-[#500c66] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <span>⬇️ Descargar Documento</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. PDF */}
        {esPdf && !errorCarga && (
          <object
            data={blobUrl || `${urlAbsoluta}#toolbar=1`}
            type="application/pdf"
            className="w-full h-full rounded-lg bg-white shadow border border-slate-200"
          >
            <iframe
              src={blobUrl || `${urlAbsoluta}#toolbar=1`}
              title={`Visor PDF - ${nombre}`}
              className="w-full h-full rounded-lg bg-white shadow border border-slate-200"
            />
          </object>
        )}

        {/* 2. Imagen */}
        {esImagen && !errorCarga && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={blobUrl || urlAbsoluta}
              alt={nombre}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-lg bg-white"
            />
          </div>
        )}

        {/* 3. Word (.docx) */}
        {esWord && !errorCarga && (
          <div className="w-full h-full overflow-auto bg-slate-200/80 rounded-lg p-4 sm:p-8 flex justify-center">
            <div
              ref={docxContainerRef}
              className="bg-white shadow-xl rounded-md p-6 sm:p-12 max-w-4xl w-full min-h-full docx-container prose prose-sm text-slate-800"
            />
          </div>
        )}

        {/* 4. Excel (.xlsx, .csv) */}
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

        {/* 5. Texto Plano */}
        {esTexto && !errorCarga && (
          <div className="w-full h-full overflow-auto bg-slate-900 text-emerald-400 font-mono text-xs p-6 rounded-lg shadow-inner">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {contenidoTexto || "Archivo de texto vacío"}
            </pre>
          </div>
        )}
      </main>

      {/* Pie informativo */}
      <footer className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SIGMA ITM · Sistema Integral de Grados y Modalidades Académicas</span>
        </span>
        <span className="text-[11px] text-slate-400">
          Documento institucional oficial
        </span>
      </footer>
    </div>
  );
}
