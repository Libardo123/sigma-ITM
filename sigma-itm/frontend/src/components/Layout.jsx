import { useState, useEffect } from "react";
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
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [sidebarColapsado, setSidebarColapsado] = useState(() => {
    try {
      const guardado = localStorage.getItem("sigma_sidebar_colapsado");
      return guardado ? JSON.parse(guardado) : false;
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarColapsado((prev) => {
      const nuevo = !prev;
      try {
        localStorage.setItem("sigma_sidebar_colapsado", JSON.stringify(nuevo));
      } catch (e) {
        console.error("Error guardando preferencia de sidebar:", e);
      }
      return nuevo;
    });
  };

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMenuMovilAbierto(false);
  }, [location.pathname]);

  const salir = () => {
    setMenuMovilAbierto(false);
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
    <div className="min-h-screen bg-slate-50 flex w-full overflow-x-hidden">
      {/* Sidebar Escritorio Colapsable (#001340, #011C5B, #661081, #C6C6C6) */}
      <aside 
        className={`bg-itm-blue-dark text-itm-gray flex flex-col hidden md:flex fixed h-full z-20 border-r border-itm-blue transition-all duration-300 ease-in-out ${
          sidebarColapsado ? "w-20" : "w-64"
        }`}
      >
        {/* Botón flotante para contraer / expandir el panel */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-7 w-7 h-7 bg-itm-purple hover:bg-itm-blue text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all transform hover:scale-110 cursor-pointer z-30"
          title={sidebarColapsado ? "Expandir menú lateral" : "Contraer menú lateral para maximizar espacio"}
          aria-label={sidebarColapsado ? "Expandir menú lateral" : "Contraer menú lateral"}
        >
          <span className="text-[11px] font-bold leading-none select-none">
            {sidebarColapsado ? "▶" : "◀"}
          </span>
        </button>

        <div className={`h-20 flex items-center border-b border-itm-blue ${sidebarColapsado ? "justify-center px-2" : "px-6"}`}>
          <Link to="/app" className="font-black tracking-tight text-white flex items-center gap-2.5 overflow-hidden">
            <img src={logoItm} alt="Logo ITM" className="h-8 brightness-0 invert drop-shadow-sm shrink-0" />
            {!sidebarColapsado && (
              <span className="flex items-center tracking-tight font-black text-2xl truncate">
                SIGMA<span className="bg-gradient-to-tr from-itm-purple via-indigo-600 to-sky-500 text-white font-black text-sm px-2 py-0.5 rounded-lg ml-1.5 shadow-md border border-white/20">ITM</span>
              </span>
            )}
          </Link>
        </div>
        
        <div className={`p-4 ${sidebarColapsado ? "px-2" : "p-6"}`}>
          {!sidebarColapsado && (
            <p className="text-[11px] font-black text-itm-gray uppercase tracking-widest mb-4 flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-itm-purple shrink-0"></span>
              Menú Principal
            </p>
          )}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center rounded-xl transition-all ${
                    sidebarColapsado ? "justify-center p-3" : "gap-3 px-4 py-3"
                  } ${
                    isActive 
                      ? "bg-gradient-to-r from-itm-blue to-itm-purple text-white font-bold shadow-md border border-itm-purple/40" 
                      : "text-itm-gray hover:bg-itm-blue hover:text-white font-medium"
                  }`}
                >
                  <span className={sidebarColapsado ? "text-2xl" : "text-xl"}>{item.icon}</span>
                  {!sidebarColapsado && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`mt-auto border-t border-itm-blue ${sidebarColapsado ? "p-3 flex flex-col items-center" : "p-6"}`}>
          <div className={`flex items-center mb-5 ${sidebarColapsado ? "justify-center" : "gap-3"}`}>
            <div 
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-itm-purple via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-lg border-2 border-white/20 shadow-md shrink-0 cursor-default"
              title={`${usuario?.first_name || usuario?.username || "Usuario"} (${usuario?.rol})`}
            >
              {(usuario?.first_name || usuario?.username || "U").charAt(0).toUpperCase()}
            </div>
            {!sidebarColapsado && (
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-bold text-white truncate">{usuario?.first_name} {usuario?.last_name || usuario?.username}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-itm-purple/40 text-white border border-itm-purple/60 truncate">
                  {usuario?.rol}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={salir}
            title="Cerrar Sesión"
            className={`w-full flex items-center justify-center gap-2 bg-itm-blue/60 hover:bg-red-950/40 hover:text-red-300 text-itm-gray font-bold rounded-xl transition-all border border-itm-blue hover:border-red-500/40 cursor-pointer ${
              sidebarColapsado ? "p-3 text-lg" : "py-3 px-4 text-xs sm:text-sm"
            }`}
          >
            <span>🚪</span>
            {!sidebarColapsado && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Drawer Móvil Deslizable (Overlay y Panel lateral para celulares) */}
      {menuMovilAbierto && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={() => setMenuMovilAbierto(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-itm-blue-dark text-itm-gray flex flex-col z-50 md:hidden border-r border-itm-blue shadow-2xl transition-transform duration-300 ease-in-out ${
          menuMovilAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-itm-blue">
          <Link 
            to="/app" 
            onClick={() => setMenuMovilAbierto(false)}
            className="font-black text-xl tracking-tight text-white flex items-center gap-2"
          >
            <img src={logoItm} alt="Logo ITM" className="h-7 brightness-0 invert drop-shadow-sm" />
            <span className="flex items-center tracking-tight font-black">
              SIGMA<span className="bg-gradient-to-tr from-itm-purple via-indigo-600 to-sky-500 text-white font-black text-xs px-1.5 py-0.5 rounded-md ml-1 shadow-sm border border-white/20">ITM</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuMovilAbierto(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-itm-gray hover:text-white hover:bg-itm-blue transition-colors text-lg font-bold"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <p className="text-[10px] font-black text-itm-gray uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-itm-purple"></span>
            Navegación
          </p>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuMovilAbierto(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm ${
                    isActive 
                      ? "bg-gradient-to-r from-itm-blue to-itm-purple text-white font-bold shadow-md border border-itm-purple/40" 
                      : "text-itm-gray hover:bg-itm-blue hover:text-white font-medium"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-itm-blue bg-itm-blue-dark/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-itm-purple via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-base border-2 border-white/20 shadow-md shrink-0">
              {(usuario?.first_name || usuario?.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-white truncate">{usuario?.first_name} {usuario?.last_name || usuario?.username}</p>
              <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-itm-purple/40 text-white border border-itm-purple/60">
                {usuario?.rol}
              </span>
            </div>
          </div>
          <button
            onClick={salir}
            className="w-full flex items-center justify-center gap-2 bg-itm-blue/60 hover:bg-red-950/40 hover:text-red-300 text-itm-gray font-bold py-2.5 rounded-xl transition-all border border-itm-blue hover:border-red-500/40 text-xs cursor-pointer"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area con margen adaptativo según si el sidebar está colapsado o expandido */}
      <div 
        className={`flex-1 flex flex-col min-h-screen w-full min-w-0 transition-all duration-300 ease-in-out ${
          sidebarColapsado ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Topbar para celular y pantalla dividida (< md) */}
        <header className="glass-panel flex flex-col px-4 py-3 sticky top-0 z-10 shadow-sm md:hidden border-b border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setMenuMovilAbierto(true)}
                className="p-1.5 -ml-1 text-itm-blue hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center text-xl font-bold cursor-pointer"
                aria-label="Abrir menú de navegación"
              >
                ☰
              </button>
              <Link to="/app" className="font-black text-base text-itm-blue flex items-center gap-1.5 truncate">
                <img src={logoItm} alt="Logo ITM" className="h-5" />
                <span className="flex items-center">SIGMA<span className="bg-gradient-to-tr from-itm-purple via-indigo-600 to-sky-500 text-white font-black text-[10px] px-1 py-0.2 rounded ml-1 shadow-xs border border-white/20">ITM</span></span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-itm-purple bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full max-w-[120px] truncate">
                {usuario?.rol}
              </span>
              <button 
                onClick={salir} 
                className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors p-1"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight truncate">
              {encabezado.titulo}
            </p>
            {encabezado.subtitulo && (
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {encabezado.subtitulo}
              </p>
            )}
          </div>
        </header>

        {/* Topbar para escritorio con toggle de sidebar y contexto dinámico (>= md) */}
        <header className="h-20 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 sticky top-0 z-10 border-b border-slate-200 hidden md:flex">
          <div className="min-w-0 pr-4 flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 text-slate-500 hover:text-itm-blue hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200/80 shadow-2xs shrink-0"
              title={sidebarColapsado ? "Expandir barra lateral" : "Contraer barra lateral para maximizar espacio"}
              aria-label="Alternar panel lateral"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-black text-itm-blue tracking-tight truncate">
                {encabezado.titulo}
              </h1>
              {encabezado.subtitulo && (
                <p className="text-xs font-semibold text-slate-500 truncate">
                  {encabezado.subtitulo}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <button
              type="button"
              className="text-slate-400 hover:text-itm-blue transition-colors relative cursor-pointer"
              aria-label="Notificaciones del sistema"
            >
              <span className="text-2xl" aria-hidden="true">🔔</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-5 lg:p-8 w-full min-w-0">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
