import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoItm from "../assets/logo-itm.png";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        (err.response?.status === 429
          ? "Demasiados intentos de acceso. Espera un momento antes de reintentar."
          : "Usuario o contraseña incorrectos.");
      setError(detalle);
    } finally {
      setCargando(false);
    }
  };

  const ingresarComo = async (perfilUsuario) => {
    setUsername(perfilUsuario);
    setPassword("sigma2026");
    setError("");
    setCargando(true);
    try {
      await login(perfilUsuario, "sigma2026");
      navigate("/");
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        (err.response?.status === 429
          ? "Demasiados intentos de acceso. Espera un momento antes de reintentar."
          : "Usuario o contraseña incorrectos.");
      setError(detalle);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Header with ITM Logo */}
      <header className="absolute top-0 w-full z-50 px-8 py-6 flex items-center justify-between">
        <Link to="/" title="Ir a la página principal">
          <img 
            src={logoItm} 
            alt="Logo Institucional ITM" 
            className="h-12 drop-shadow-md brightness-0 invert hover:scale-105 transition-transform cursor-pointer" 
          />
        </Link>
        <div className="flex items-center gap-2 text-white/90 font-bold tracking-widest text-sm">
          <span>PORTAL ACADÉMICO</span>
        </div>
      </header>

      {/* Hero Banner Emulation */}
      <div className="relative bg-gradient-to-r from-itm-blue via-itm-purple to-[#011C5B] py-16 px-8 overflow-hidden flex items-center justify-center">
        {/* Network dots bg */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:40px_40px]"></div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl z-10 text-center relative" style={{ textShadow: '4px 4px 0 #661081, 8px 8px 15px rgba(0,0,0,0.5)' }}>
          SIGMA ITM
        </h1>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 relative">
        <form onSubmit={onSubmit} className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md border-t-4 border-itm-purple relative z-10 -mt-24">
          <h2 className="text-3xl font-bold text-itm-purple mb-1 text-center">Bienvenido</h2>
          <p className="text-slate-500 text-xs mb-6 text-center">
            Sistema de Seguimiento y Control de Modalidades de Opción de Grado
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-itm-blue mb-1.5 uppercase tracking-wide">Usuario o Correo Institucional</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all bg-slate-50"
                value={username}
                placeholder="ej: estudiante1 o usuario@correo.itm.edu.co"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-itm-blue mb-1.5 uppercase tracking-wide">Contraseña</label>
              <input
                type="password"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all bg-slate-50"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r text-left">
              <p className="text-red-700 text-xs font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-6 bg-[#8A6EBA] hover:bg-itm-purple disabled:opacity-70 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-widest text-xs"
          >
            {cargando ? "Ingresando..." : "Ingresar al Sistema"}
          </button>

          {/* Acceso Rápido por Perfil (Demostración) */}
          <div className="mt-4 text-center">
            <Link
              to="/registro"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-itm-purple hover:text-[#6a4a9e] hover:underline transition-colors"
            >
              <span>✨</span> ¿No tienes cuenta? Crear una aquí
            </Link>
          </div>

          {/* Acceso Rápido por Perfil (Demostración) */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Acceso Rápido a Perfiles de Prueba:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={cargando}
                onClick={() => ingresarComo("estudiante1")}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all"
              >
                <div className="flex items-center gap-1 font-bold text-xs text-slate-800">
                  <span>🎓</span>
                  <span>Estudiante</span>
                </div>
                <p className="text-[10px] text-slate-500">Jorge Bernal</p>
              </button>

              <button
                type="button"
                disabled={cargando}
                onClick={() => ingresarComo("asesor1")}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-left transition-all"
              >
                <div className="flex items-center gap-1 font-bold text-xs text-slate-800">
                  <span>👨‍🏫</span>
                  <span>Docente Asesor</span>
                </div>
                <p className="text-[10px] text-slate-500">Miguel Ojeda</p>
              </button>

              <button
                type="button"
                disabled={cargando}
                onClick={() => ingresarComo("comite1")}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all"
              >
                <div className="flex items-center gap-1 font-bold text-xs text-slate-800">
                  <span>🏛️</span>
                  <span>Comité Grado</span>
                </div>
                <p className="text-[10px] text-slate-500">Comité Principal</p>
              </button>

              <button
                type="button"
                disabled={cargando}
                onClick={() => ingresarComo("admin1")}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-left transition-all"
              >
                <div className="flex items-center gap-1 font-bold text-xs text-slate-800">
                  <span>⚙️</span>
                  <span>Administrador</span>
                </div>
                <p className="text-[10px] text-slate-500">Admin General</p>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2 italic">
              Contraseña de todos: sigma2026
            </p>
          </div>
        </form>
      </main>
      
      {/* Footer minimal */}
      <footer className="bg-[#001340] py-6 text-center text-white/60 text-xs mt-auto">
        <p>Institución Universitaria ITM - Reacreditada en Alta Calidad</p>
      </footer>
    </div>
  );
}
