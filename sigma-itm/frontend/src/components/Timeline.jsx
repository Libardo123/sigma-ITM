/**
 * Timeline.jsx — SIGMA ITM
 * Barra de progreso estandarizada en 5 macro-etapas institucionales oficiales:
 * 1. Radicación ➔ 2. Aval & Asesor ➔ 3. En Proceso ➔ 4. Sustentación ➔ 5. Grado
 */

export default function Timeline({ estadoActual }) {
  if (estadoActual === "RECHAZADO") {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-xs font-bold text-center">
        ❌ Este proceso fue cerrado o rechazado conforme al reglamento de opciones de grado del ITM.
      </div>
    );
  }

  const obtenerMacroEtapa = (estado) => {
    switch (estado) {
      case "POSTULACION":
        return 1;
      case "REVISION_DOCUMENTAL":
      case "APROBACION":
        return 2;
      case "EN_PROCESO":
        return 3;
      case "SUSTENTACION":
      case "REVISION_COMITE":
        return 4;
      case "FINALIZADO":
        return 5;
      default:
        return 1;
    }
  };

  const pasoActual = obtenerMacroEtapa(estadoActual);

  const etapas = [
    { num: 1, label: "Radicación" },
    { num: 2, label: "Aval & Asesor" },
    { num: 3, label: "En Proceso" },
    { num: 4, label: "Sustentación" },
    { num: 5, label: "Grado" },
  ];

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {etapas.map((etapa, idx) => {
          const completado = etapa.num < pasoActual || pasoActual === 5;
          const esActual = etapa.num === pasoActual && pasoActual !== 5;
          return (
            <div key={etapa.num} className="flex-1 flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-xs ${
                  completado
                    ? "bg-itm-purple text-white ring-4 ring-purple-100"
                    : esActual
                    ? "bg-itm-blue text-white ring-4 ring-blue-100 animate-pulse"
                    : "bg-slate-100 text-slate-400 border border-slate-300"
                }`}
              >
                {completado ? "✓" : etapa.num}
              </div>
              <span
                className={`text-[11px] font-bold mt-2 text-center transition-colors ${
                  completado || esActual ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {etapa.num}. {etapa.label}
              </span>
              {idx < etapas.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-4 left-1/2 w-full h-1 -z-10 transition-colors ${
                    etapa.num < pasoActual ? "bg-itm-purple" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
