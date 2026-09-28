const ESTADOS_ORDEN = [
  ["POSTULACION", "Postulación"],
  ["REVISION_DOCUMENTAL", "Revisión Documental"],
  ["APROBACION", "Aprobación"],
  ["EN_PROCESO", "En Proceso"],
  ["SUSTENTACION", "Sustentación"],
  ["REVISION_COMITE", "Revisión Comité"],
  ["FINALIZADO", "Finalizado"],
];

export default function Timeline({ estadoActual }) {
  if (estadoActual === "RECHAZADO") {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm font-medium">
        Este proceso fue rechazado. Consulta las observaciones y vuelve a postular.
      </div>
    );
  }

  const idxActual = ESTADOS_ORDEN.findIndex(([key]) => key === estadoActual);

  return (
    <div className="flex flex-wrap gap-2">
      {ESTADOS_ORDEN.map(([key, label], i) => {
        const completado = i < idxActual;
        const actual = i === idxActual;
        return (
          <div
            key={key}
            className={`flex-1 min-w-[110px] text-center rounded-lg px-2 py-3 text-xs font-semibold border
              ${completado ? "bg-emerald-50 border-emerald-300 text-emerald-700" : ""}
              ${actual ? "bg-blue-600 border-blue-600 text-white shadow" : ""}
              ${!completado && !actual ? "bg-slate-50 border-slate-200 text-slate-400" : ""}`}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
