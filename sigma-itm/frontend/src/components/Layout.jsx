import { Link, useLocation, useNavigate } from "react-router-dom";
import logoItm from "../assets/logo-itm.png";
import { useAuth } from "../context/AuthContext";

function obtenerEncabezadoContextual(pathname, usuario) {
  const rutaLimpia = pathname.replace(/\/$/, "");

  if (rutaLimpia === "/app/dashboard") {
    return {
      titulo: "Estadísticas Generales",
      subtitulo: "Métricas consolidadas y avance institucional",
    };
  }

  if (rutaLimpia === "/app/aprobaciones") {
    return {
      titulo: "Panel de Aprobación de Procesos",
      subtitulo: "Revisión, seguimiento y control de etapas",
    };
  }

  if (rutaLimpia === "/app") {
    if (usuario?.rol === "ESTUDIANTE") {
      const nombreCompleto =
        [usuario.first_name, usuario.last_name].filter(Boolean).join(" ") ||
        usuario.username ||
        "Estudiante";
      const programa = usuario.programa_academico ? ` • ${usuario.programa_academico}` : "";
      return {
        titulo: "Mi Proceso de Opción de Grado",
        subtitulo: `${nombreCompleto}${programa}`,
      };
    }

    return {
      titulo: "Panel de Aprobación de Procesos",
      subtitulo: "Revisión, seguimiento y control de etapas",
    };
  }

  return {
    titulo: "Sistema de Gestión de Modalidades de Grado",
    subtitulo: "Instituto Tecnológico Metropolitano",
  };
}

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const salir = () => {
    logout();
    navigate("/login");
  };

  const encabezado = obtenerEncabezadoContextual(location.pathname, usuario);

  const menuItems = [];
  
  if (usuario?.rol === "ESTUDIANTE") {
    menuItems.push({ path: "/app", label: "Mi Proceso", icon: "📄" });
  } else {
    menuItems.push({ path: "/app", label: "Procesos", icon: "📋" });
    menuItems.push({ path: "/app/dashboard", label: "Estadísticas", icon: "📊" });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Navegación Lateral) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Link to="/app" className="font-black text-2xl tracking-tight text-white flex items-center gap-3">
            <img src={logoItm} alt="Logo ITM" className="h-8 brightness-0 invert" />
            <span>SIGMA<span className="text-itm-blue">ITM</span></span>
          </Link>
        </div>
        
        <div className="p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Menú Principal</p>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive 
                      ? "bg-itm-blue text-white shadow-lg shadow-itm-blue/20" 
                      : "hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-itm-blue font-bold text-lg border border-slate-700">
              {usuario?.first_name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{usuario?.first_name} {usuario?.last_name}</p>
              <p className="text-xs font-semibold text-itm-purple truncate">{usuario?.rol}</p>
            </div>
          </div>
          <button
            onClick={salir}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 font-bold py-3 rounded-xl transition-all border border-slate-700 hover:border-red-500/30"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* Topbar para móvil */}
        <header className="glass-panel flex flex-col px-6 py-3 sticky top-0 z-10 shadow-sm md:hidden border-b border-slate-200">
          <div className="flex items-center justify-between">
            <Link to="/app" className="font-black text-lg text-itm-blue flex items-center gap-2">
              <img src={logoItm} alt="Logo ITM" className="h-6" />
              <span>SIGMA<span className="text-itm-purple">ITM</span></span>
            </Link>
            <button onClick={salir} className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors">
              Salir
            </button>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-sm font-bold text-slate-800 leading-tight">
              {encabezado.titulo}
            </p>
            {encabezado.subtitulo && (
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {encabezado.subtitulo}
              </p>
            )}
          </div>
        </header>

        {/* Topbar para escritorio con contexto dinámico */}
        <header className="h-20 bg-white/70 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 border-b border-slate-200 hidden md:flex">
          <div>
            <h1 className="text-xl font-black text-itm-blue tracking-tight">
              {encabezado.titulo}
            </h1>
            {encabezado.subtitulo && (
              <p className="text-xs font-semibold text-slate-500">
                {encabezado.subtitulo}
              </p>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className="text-slate-400 hover:text-itm-blue transition-colors relative"
              aria-label="Notificaciones del sistema"
            >
              <span className="text-2xl" aria-hidden="true">🔔</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
