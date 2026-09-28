const ESTILOS = {
  POSTULACION: "bg-slate-100 text-slate-700",
  REVISION_DOCUMENTAL: "bg-amber-100 text-amber-800",
  APROBACION: "bg-blue-100 text-blue-800",
  EN_PROCESO: "bg-indigo-100 text-indigo-800",
  SUSTENTACION: "bg-purple-100 text-purple-800",
  REVISION_COMITE: "bg-fuchsia-100 text-fuchsia-800",
  FINALIZADO: "bg-emerald-100 text-emerald-800",
  RECHAZADO: "bg-red-100 text-red-800",
};

export default function EstadoBadge({ estado, texto }) {
  const clase = ESTILOS[estado] || "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${clase}`}>
      {texto || estado}
    </span>
  );
}
