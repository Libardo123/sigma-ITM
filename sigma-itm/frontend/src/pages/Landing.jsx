import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import logoItm from "../assets/logo-itm.png";
import { useAuth } from "../context/AuthContext";

const TODAS_LAS_MODALIDADES = [
  {
    icono: "💼",
    nombre: "Prácticas Profesionales",
    desc: "Aplica tus conocimientos en un entorno laboral real. Requiere pre-aprobación del centro de prácticas y carta de la empresa.",
    color: "blue"
  },
  {
    icono: "🎓",
    nombre: "Trabajo de Grado",
    desc: "Desarrolla una propuesta clásica de grado con el acompañamiento de un asesor metodológico y temático.",
    color: "purple"
  },
  {
    icono: "🚀",
    nombre: "Emprendimiento",
    desc: "Desarrolla tu propia idea de negocio estructurada. Requiere plan de negocios y viabilidad financiera aprobada.",
    color: "emerald"
  },
  {
    icono: "🔬",
    nombre: "Producto de Investigación",
    desc: "Únete a un semillero o propone tu propia investigación guiado por un docente experto en la materia.",
    color: "amber"
  },
  {
    icono: "🧪",
    nombre: "Producto en Laboratorio",
    desc: "Construye una propuesta técnica avalada por un laboratorio o grupo de investigación de la institución.",
    color: "rose"
  },
  {
    icono: "🌐",
    nombre: "Pasantía",
    desc: "Realiza un intercambio o pasantía en otra institución educativa nacional o internacional.",
    color: "cyan"
  },
  {
    icono: "🏆",
    nombre: "Reconocimiento Laboral",
    desc: "Valida tu experiencia laboral actual si está directamente relacionada con tu programa académico.",
    color: "indigo"
  },
  {
    icono: "📜",
    nombre: "Certificación",
    desc: "Obtén una certificación técnica internacional válida como requisito de grado según el reglamento.",
    color: "teal"
  },
  {
    icono: "📚",
    nombre: "Cursos de Posgrado",
    desc: "Adelanta materias de especialización o maestría como opción para tu grado de pregrado.",
    color: "fuchsia"
  },
  {
    icono: "🤝",
    nombre: "Ingeniería para la Gente",
    desc: "Aplica tus conocimientos en proyectos de impacto social y comunitario avalados por la institución.",
    color: "orange"
  }
];

export default function Landing() {
  const { usuario } = useAuth();
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Si el usuario ya está logueado, lo mandamos directo a la app
  if (usuario) {
    return <Navigate to="/app" replace />;
  }

  const modalidadesVisibles = mostrarTodas ? TODAS_LAS_MODALIDADES : TODAS_LAS_MODALIDADES.slice(0, 3);

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
            Plataforma Académica
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
              Ver modalidades
            </button>
          </div>
        </div>

        {/* Modalidades Grid */}
        <div id="modalidades" className="relative z-10 max-w-6xl mx-auto mt-32 w-full text-left">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-itm-blue mb-4">Modalidades Disponibles</h2>
            <p className="text-slate-500 font-medium text-lg">Conoce las opciones que tienes para culminar tu carrera.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {modalidadesVisibles.map((mod, index) => {
              // Tailwind JIT no soporta clases dinámicas tipo bg-${color}-100,
              // por lo que debemos mapear los colores a clases completas.
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                purple: "bg-purple-100 text-purple-600",
                emerald: "bg-emerald-100 text-emerald-600",
                amber: "bg-amber-100 text-amber-600",
                rose: "bg-rose-100 text-rose-600",
                cyan: "bg-cyan-100 text-cyan-600",
                indigo: "bg-indigo-100 text-indigo-600",
                teal: "bg-teal-100 text-teal-600",
                fuchsia: "bg-fuchsia-100 text-fuchsia-600",
                orange: "bg-orange-100 text-orange-600",
              };

              return (
                <div key={index} className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                  <div className={`w-14 h-14 ${colorClasses[mod.color]} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner`}>
                    {mod.icono}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{mod.nombre}</h3>
                  <p className="text-slate-600 font-medium">
                    {mod.desc}
                  </p>
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
