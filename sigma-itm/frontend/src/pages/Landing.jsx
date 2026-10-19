import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import logoItm from "../assets/logo-itm.png";
import { useAuth } from "../context/AuthContext";

import { MODALIDADES_OFICIALES } from "../constants/modalidades";

export default function Landing() {
  const { usuario } = useAuth();
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [modalidadModal, setModalidadModal] = useState(null);

  // Si el usuario ya está logueado, lo mandamos directo a la app
  if (usuario) {
    return <Navigate to="/app" replace />;
  }

  const modalidadesVisibles = mostrarTodas ? MODALIDADES_OFICIALES : MODALIDADES_OFICIALES.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Navbar Público */}
      <nav className="glass-panel sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoItm} alt="Logo Institucional ITM" className="h-10" />
            <span className="font-black text-2xl tracking-tight text-itm-blue border-l-2 border-slate-200 pl-4">
              SIGMA <span className="text-itm-purple">ITM</span>
            </span>
          </div>
          <Link
            to="/login"
            className="bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition-all hover:scale-105"
          >
            Iniciar Sesión
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-itm-blue/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-itm-purple/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-itm-blue/10 text-itm-blue font-bold text-sm tracking-wide mb-6 uppercase">
            Plataforma Académica Institucional
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
            Gestiona tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-itm-blue to-itm-purple">Opción de Grado</span> fácilmente.
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
            El sistema oficial del Instituto Tecnológico Metropolitano (ITM) para administrar, revisar y aprobar los proyectos y prácticas de nuestros estudiantes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-gradient-to-r from-itm-blue to-itm-purple text-white font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-lg"
            >
              Comenzar mi proceso
            </Link>
            <button
              onClick={() => {
                setMostrarTodas(true);
                document.getElementById('modalidades').scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-white text-itm-blue font-bold py-4 px-10 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-lg border border-slate-200"
            >
              Ver modalidades y requisitos
            </button>
          </div>
        </div>

        {/* Modalidades Grid */}
        <div id="modalidades" className="relative z-10 max-w-6xl mx-auto mt-32 w-full text-left">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-itm-blue mb-4">Modalidades Oficiales de Grado (10 Opciones ITM)</h2>
            <p className="text-slate-500 font-medium text-lg max-w-3xl mx-auto">
              Consulta en detalle la descripción completa, perfil requerido, ruta paso a paso y requisitos reglamentarios para graduarte con cualquiera de las opciones institucionales.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modalidadesVisibles.map((mod, index) => {
              const colorClasses = {
                blue: "bg-blue-100 text-blue-700 border-blue-200",
                purple: "bg-purple-100 text-purple-700 border-purple-200",
                emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
                amber: "bg-amber-100 text-amber-700 border-amber-200",
                rose: "bg-rose-100 text-rose-700 border-rose-200",
                cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
                indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
                teal: "bg-teal-100 text-teal-700 border-teal-200",
                fuchsia: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
                orange: "bg-orange-100 text-orange-700 border-orange-200",
              };

              return (
                <div key={index} className="glass-panel p-7 rounded-3xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-slate-200/80 shadow-md">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className={`w-14 h-14 ${colorClasses[mod.color] || "bg-blue-100 text-blue-700"} rounded-2xl flex items-center justify-center text-3xl shadow-inner border`}>
                        {mod.icono}
                      </div>
                      {mod.codigo && (
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                          {mod.codigo}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-1 leading-snug">{mod.nombre}</h3>
                    {mod.subtitulo && (
                      <p className="text-xs font-bold text-itm-purple mb-3">
                        {mod.subtitulo}
                      </p>
                    )}
                    <p className="text-slate-600 text-xs font-normal leading-relaxed mb-4">
                      {mod.descripcion}
                    </p>

                    {/* Bloque de requisitos y condiciones */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                      {mod.condicionesPrevias && (
                        <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 text-amber-950">
                          <span className="font-bold flex items-center gap-1 mb-0.5 text-[11px] text-amber-900">
                            📊 Créditos y Condiciones:
                          </span>
                          <span className="text-[11px] leading-tight block font-medium">{mod.condicionesPrevias}</span>
                        </div>
                      )}

                      {mod.documentosRequeridos && mod.documentosRequeridos.length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                          <span className="font-bold flex items-center gap-1 mb-1 text-[11px] text-itm-blue">
                            📑 Documentos Obligatorios a Radicar:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                            {mod.documentosRequeridos.map((doc, idx) => (
                              <li key={idx} className="leading-tight"><span className="text-slate-800 font-medium">{doc}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {mod.requisitoClave && (
                        <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/80 text-blue-950">
                          <span className="font-bold text-[11px] text-itm-blue block mb-0.5">📌 Requisito Clave:</span>
                          <span className="text-[11px] leading-tight block text-slate-700">{mod.requisitoClave}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Botón para abrir la guía completa */}
                    <button
                      type="button"
                      onClick={() => setModalidadModal(mod)}
                      className="w-full mt-4 bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>📘</span>
                      <span>Ver requisitos y guía para graduarse</span>
                      <span className="text-[10px] opacity-80">→</span>
                    </button>

                    <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between gap-2">
                      <span className="font-semibold truncate">⚖️ {mod.responsableAprobacion}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!mostrarTodas && (
            <div className="text-center mt-12">
              <button
                onClick={() => setMostrarTodas(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-full transition-colors border border-slate-300"
              >
                Ver todas las modalidades ↓
              </button>
            </div>
          )}
          
          {mostrarTodas && (
            <div className="text-center mt-12">
              <button
                onClick={() => {
                  setMostrarTodas(false);
                  document.getElementById('modalidades').scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-full transition-colors border border-slate-300"
              >
                Mostrar menos ↑
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Descriptivo Completo de la Modalidad */}
      {modalidadModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setModalidadModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto my-auto text-left flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal */}
            <div className="bg-gradient-to-r from-itm-blue-dark via-itm-blue to-itm-purple text-white p-6 sm:p-7 rounded-t-3xl flex items-start justify-between gap-4 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-4xl p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner shrink-0">
                  {modalidadModal.icono}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/30">
                      {modalidadModal.codigo}
                    </span>
                    <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                      Oficial ITM
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                    {modalidadModal.nombre}
                  </h3>
                  <p className="text-xs sm:text-sm text-sky-200 font-medium">
                    {modalidadModal.subtitulo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalidadModal(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors shrink-0"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 sm:p-8 space-y-6 text-slate-800 text-sm">
              {/* Sección 1: ¿En qué consiste? */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <h4 className="font-black text-itm-blue text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>📖</span> ¿En qué consiste esta modalidad?
                </h4>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  {modalidadModal.queEs || modalidadModal.descripcion}
                </p>
                {modalidadModal.perfilEstudiante && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                    <span className="font-bold text-itm-purple block mb-1">🎯 Perfil del estudiante idóneo:</span>
                    <span className="text-slate-600 leading-relaxed">{modalidadModal.perfilEstudiante}</span>
                  </div>
                )}
              </div>

              {/* Sección 2: Ruta Paso a Paso para Graduarse */}
              {modalidadModal.pasosProceso && (
                <div className="border border-blue-100 bg-blue-50/40 rounded-2xl p-5 space-y-3">
                  <h4 className="font-black text-itm-blue text-sm uppercase tracking-wide flex items-center gap-2">
                    <span>🧭</span> Ruta paso a paso para graduarte con esta modalidad:
                  </h4>
                  <div className="space-y-2.5">
                    {modalidadModal.pasosProceso.map((paso, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                        <span className="bg-itm-blue text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          {paso.replace(/^\d+\.\s*/, '')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección 3: Requisitos indispensables para obtener el grado */}
              {modalidadModal.requisitosParaGraduarse && (
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-5 space-y-2.5">
                  <h4 className="font-black text-emerald-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <span>✅</span> Requisitos indispensables para obtener el grado:
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-emerald-950">
                    {modalidadModal.requisitosParaGraduarse.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✔</span>
                        <span className="leading-snug font-medium">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sección 4: Grid con Documentos, Entregables y Evaluación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Documentos */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h5 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
                    <span>📑</span> Documentos Obligatorios:
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                    {modalidadModal.documentosRequeridos?.map((doc, idx) => (
                      <li key={idx} className="leading-snug">
                        <span className="text-slate-800 font-medium">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Entregables Finales */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h5 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
                    <span>📦</span> Entregable para Grado:
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {modalidadModal.entregablesFinales}
                  </p>
                </div>

                {/* Criterios de Evaluación */}
                {modalidadModal.criteriosEvaluacion && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 md:col-span-2">
                    <h5 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
                      <span>⚖️</span> Criterios y Mecanismo de Aprobación:
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {modalidadModal.criteriosEvaluacion}
                    </p>
                    <p className="text-xs font-semibold text-itm-purple mt-2">
                      🎤 Sustentación: {modalidadModal.requiereSustentacion}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-5 bg-slate-100 border-t border-slate-200 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                🏛️ Instancia de Aprobación: <strong className="text-slate-700">{modalidadModal.responsableAprobacion}</strong>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setModalidadModal(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 transition-colors"
                >
                  Cerrar
                </button>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple transition-all text-center shadow-xs"
                >
                  Postularme a esta modalidad →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-lg mb-2 text-white">SIGMA ITM - 2026</p>
          <p className="text-sm">Instituto Tecnológico Metropolitano. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
