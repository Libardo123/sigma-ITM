/**
 * Dashboard.jsx — SIGMA ITM
 *
 * Panel de analítica para Asesores, Comité y Administradores.
 * Consume GET /api/analitica/ y muestra 2 gráficos con Recharts:
 *   1. BarChart: cantidad de procesos por estado.
 *   2. PieChart: distribución por modalidad.
 *
 * Diseño UX (Bloque 8):
 *   - Estado de carga explícito con skeleton o spinner.
 *   - Estado vacío con mensaje claro (no un gráfico roto).
 *   - Estado de error con botón de reintentar.
 */

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

// Paleta de colores para los gráficos (cohesiva con el sistema de diseño del proyecto)
const COLORES_ESTADO = {
  POSTULACION: "#3b82f6",         // blue-500
  REVISION_DOCUMENTAL: "#8b5cf6", // violet-500
  APROBACION: "#f59e0b",          // amber-500
  EN_PROCESO: "#06b6d4",          // cyan-500
  SUSTENTACION: "#10b981",        // emerald-500
  FINALIZADO: "#22c55e",          // green-500
  RECHAZADO: "#ef4444",           // red-500
};

const COLORES_PIE = [
  "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4",
  "#10b981", "#f97316", "#ec4899", "#14b8a6",
  "#a78bfa", "#fb923c",
];

// Etiquetas legibles para los estados en el eje X
const ETIQUETA_ESTADO = {
  POSTULACION: "Postulación",
  REVISION_DOCUMENTAL: "Rev. Documental",
  APROBACION: "Aprobación",
  EN_PROCESO: "En Proceso",
  SUSTENTACION: "Sustentación",
  FINALIZADO: "Finalizado",
  RECHAZADO: "Rechazado",
};

// ---------------------------------------------------------------------------
// Sub-componente: esqueleto de carga para gráficos
// ---------------------------------------------------------------------------
function GraficoSkeleton() {
  return (
    <div
      className="h-64 bg-slate-100 rounded-lg animate-pulse"
      role="status"
      aria-label="Cargando gráfico..."
    />
  );
}

// ---------------------------------------------------------------------------
// Sub-componente: estado vacío
// ---------------------------------------------------------------------------
function EstadoVacio({ mensaje }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 p-6 text-center">
      <span className="text-3xl mb-2">📊</span>
      <p className="text-slate-500 text-sm font-medium">{mensaje}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal: Dashboard
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const { usuario } = useAuth();
  const esAsesor = usuario?.rol === "ASESOR";

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const { data } = await api.get("/analitica/");
      setDatos(data);
    } catch {
      setError(
        "No se pudieron cargar los datos de analítica. Verifica tu conexión e intenta de nuevo."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Transformar datos para Recharts
  const datosBarChart = datos?.por_estado?.map((item) => ({
    estado: ETIQUETA_ESTADO[item.estado] ?? item.estado,
    total: item.total,
    relleno: COLORES_ESTADO[item.estado] ?? "#94a3b8",
  })) ?? [];

  const datosPieChart = datos?.por_modalidad?.map((item, i) => ({
    name: item.modalidad__nombre ?? "Sin modalidad",
    value: item.total,
    color: COLORES_PIE[i % COLORES_PIE.length],
  })) ?? [];

  const totalProcesos = datosBarChart.reduce((acc, d) => acc + d.total, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            {esAsesor ? "Métricas Personales" : "Consolidado Institucional"}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {esAsesor
            ? "Dashboard de Analítica — Mis Asesorías"
            : "Dashboard de Analítica"}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {esAsesor
            ? "Resumen del estado y modalidades de los proyectos asignados bajo tu asesoría académica."
            : "Resumen del estado actual de todos los procesos de opción de grado."}
        </p>
      </div>

      {/* Error con Reintentar */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
        >
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button
            onClick={cargar}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* Tarjeta de resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total procesos", valor: totalProcesos },
              {
                label: "Finalizados",
                valor:
                  datos?.por_estado?.find((e) => e.estado === "FINALIZADO")
                    ?.total ?? 0,
              },
              {
                label: "Rechazados",
                valor:
                  datos?.por_estado?.find((e) => e.estado === "RECHAZADO")
                    ?.total ?? 0,
              },
            ].map(({ label, valor }) => (
              <div
                key={label}
                className="bg-white shadow rounded-xl p-4 text-center"
              >
                {cargando ? (
                  <div className="h-8 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900">{valor}</p>
                )}
                <p className="text-slate-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Gráfico 1: Procesos por estado */}
          <div className="bg-white shadow rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              Procesos por estado
            </h3>
            {cargando ? (
              <GraficoSkeleton />
            ) : datosBarChart.length === 0 ? (
              <EstadoVacio
                mensaje={
                  esAsesor
                    ? "Aún no tienes proyectos asignados como asesor titular. Cuando el Comité te asigne proyectos, verás tus métricas aquí."
                    : "Aún no hay procesos registrados. Los gráficos aparecerán cuando haya datos disponibles."
                }
              />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={datosBarChart}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="estado"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                    borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [value, "Procesos"]}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {datosBarChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.relleno} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico 2: Distribución por modalidad */}
          <div className="bg-white shadow rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              Distribución por modalidad
            </h3>
            {cargando ? (
              <GraficoSkeleton />
            ) : datosPieChart.length === 0 ? (
              <EstadoVacio
                mensaje={
                  esAsesor
                    ? "No tienes proyectos con modalidades asignadas aún."
                    : "No hay datos de modalidades disponibles aún."
                }
              />
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={datosPieChart}
                    cx="50%"
                    cy="52%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={true}
                  >
                    {datosPieChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Procesos"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
