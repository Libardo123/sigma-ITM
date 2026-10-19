import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoItm from "../assets/logo-itm.png";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function Login() {
  const [username, setUsername] = useState(
    () => localStorage.getItem("sigma_recordar_usuario") || ""
  );
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [recordarme, setRecordarme] = useState(
    () => !!localStorage.getItem("sigma_recordar_usuario")
  );
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Estados para Modal Autónomo de Recuperación de Contraseña
  const [modalRecuperar, setModalRecuperar] = useState(false);
  const [recupIdentificador, setRecupIdentificador] = useState("");
  const [recupCedula, setRecupCedula] = useState("");
  const [recupNuevaPassword, setRecupNuevaPassword] = useState("");
  const [recupConfirmarPassword, setRecupConfirmarPassword] = useState("");
  const [recupVerPassword, setRecupVerPassword] = useState(false);
  const [recupCargando, setRecupCargando] = useState(false);
  const [recupError, setRecupError] = useState("");
  const [recupExito, setRecupExito] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setCargando(true);
    try {
      if (recordarme) {
        localStorage.setItem("sigma_recordar_usuario", username.trim());
      } else {
        localStorage.removeItem("sigma_recordar_usuario");
      }

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

  const abrirModalRecuperar = () => {
    setRecupIdentificador(username || "");
    setRecupCedula("");
    setRecupNuevaPassword("");
    setRecupConfirmarPassword("");
    setRecupVerPassword(false);
    setRecupError("");
    setRecupExito("");
    setModalRecuperar(true);
  };

  const cerrarModal = () => {
    setModalRecuperar(false);
    setRecupError("");
    setRecupExito("");
  };

  const handleRecuperarPassword = async (e) => {
    e.preventDefault();
    setRecupError("");
    setRecupExito("");

    if (!recupIdentificador.trim() || !recupCedula.trim() || !recupNuevaPassword) {
      setRecupError("Por favor completa todos los campos.");
      return;
    }

    if (recupNuevaPassword.length < 6) {
      setRecupError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (recupNuevaPassword !== recupConfirmarPassword) {
      setRecupError("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setRecupCargando(true);
    try {
      const res = await api.post("/usuarios/recuperar_password/", {
        identificador: recupIdentificador.trim(),
        cedula: recupCedula.trim(),
        nueva_password: recupNuevaPassword,
      });

      setRecupExito(
        res.data.mensaje ||
          "¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión con tu nueva contraseña."
      );
      // Precargar los datos en el login para mayor comodidad
      setUsername(res.data.username || recupIdentificador.trim());
      setPassword(recupNuevaPassword);
    } catch (err) {
      const detalle =
        err.response?.data?.detail ||
        "No fue posible restablecer la contraseña. Revisa los datos ingresados.";
      setRecupError(detalle);
    } finally {
      setRecupCargando(false);
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
        <h1 
          className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl z-10 text-center relative" 
          style={{ textShadow: '4px 4px 0 #661081, 8px 8px 15px rgba(0,0,0,0.5)' }}
        >
          SIGMA ITM
        </h1>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 relative">
        <form 
          onSubmit={onSubmit} 
          className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md border-t-4 border-itm-purple relative z-10 -mt-24"
        >
          <h2 className="text-3xl font-bold text-itm-purple mb-1 text-center">Bienvenido</h2>
          <p className="text-slate-500 text-xs mb-6 text-center">
            Sistema de Seguimiento y Control de Modalidades de Opción de Grado
          </p>

          <div className="space-y-4">
            {/* Campo Usuario o Correo */}
            <div>
              <label 
                htmlFor="username-input" 
                className="block text-xs font-bold text-itm-blue mb-1.5 uppercase tracking-wide"
              >
                Usuario o Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username-input"
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all bg-slate-50"
                  value={username}
                  placeholder="ej: estudiante1 o usuario@correo.itm.edu.co"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label 
                htmlFor="password-input" 
                className="block text-xs font-bold text-itm-blue mb-1.5 uppercase tracking-wide"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password-input"
                  type={verPassword ? "text" : "password"}
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all bg-slate-50"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  tabIndex="-1"
                  onClick={() => setVerPassword(!verPassword)}
                  title={verPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-itm-purple transition-colors"
                >
                  {verPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Fila de Utilidad: Recordarme y Recuperar Clave */}
          <div className="mt-3.5 flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none hover:text-slate-800">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-itm-purple focus:ring-itm-purple cursor-pointer accent-[#661081]"
              />
              <span>Recordar usuario</span>
            </label>

            <button
              type="button"
              onClick={abrirModalRecuperar}
              className="text-itm-purple hover:text-[#500c66] hover:underline font-semibold transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r text-left">
              <p className="text-red-700 text-xs font-semibold">{error}</p>
            </div>
          )}

          {/* Botón de Ingreso */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-5 bg-[#8A6EBA] hover:bg-itm-purple disabled:opacity-70 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-widest text-xs"
          >
            {cargando ? "Ingresando..." : "Ingresar al Sistema"}
          </button>

          {/* Enlace para registro */}
          <div className="mt-4 text-center">
            <Link
              to="/registro"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-itm-purple hover:text-[#500c66] hover:underline transition-colors"
            >
              <span>✨</span> ¿No tienes cuenta? Crear una aquí
            </Link>
          </div>

          {/* Sello de Seguridad Institucional */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Conexión institucional segura · Autenticación oficial ITM</span>
          </div>
        </form>
      </main>

      {/* Modal Autónomo de Recuperación de Contraseña */}
      {modalRecuperar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 border-t-4 border-itm-purple relative animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Botón cerrar */}
            <button
              onClick={cerrarModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1"
              title="Cerrar ventana"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-itm-purple flex items-center justify-center font-bold text-lg">
                🔑
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">Recuperar Contraseña</h3>
                <p className="text-xs text-slate-500">Autoservicio de Acceso Autónomo SIGMA ITM</p>
              </div>
            </div>

            {recupExito ? (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r text-xs text-emerald-900 space-y-1.5">
                  <p className="font-bold text-sm text-emerald-800">✅ ¡Contraseña Actualizada!</p>
                  <p>{recupExito}</p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Tus credenciales han sido preparadas en el formulario para que ingreses de inmediato.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarModal}
                  className="w-full bg-itm-purple hover:bg-[#500c66] text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Continuar e Iniciar Sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecuperarPassword} className="mt-3 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Para restablecer tu contraseña de forma autónoma, valida tu identidad ingresando tu usuario o correo y el número de documento registrado.
                </p>

                {recupError && (
                  <div className="p-2.5 bg-red-50 border-l-4 border-red-500 rounded-r text-red-700 text-xs">
                    <p className="font-semibold">{recupError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Usuario o Correo Institucional
                  </label>
                  <input
                    type="text"
                    required
                    value={recupIdentificador}
                    onChange={(e) => setRecupIdentificador(e.target.value)}
                    placeholder="ej: estudiante1 o correo@itm.edu.co"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Documento de Identidad (Cédula)
                  </label>
                  <input
                    type="text"
                    required
                    value={recupCedula}
                    onChange={(e) => setRecupCedula(e.target.value)}
                    placeholder="Número de cédula registrado"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={recupVerPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={recupNuevaPassword}
                        onChange={(e) => setRecupNuevaPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple bg-slate-50"
                      />
                      <button
                        type="button"
                        tabIndex="-1"
                        onClick={() => setRecupVerPassword(!recupVerPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <span className="text-xs">{recupVerPassword ? "🙈" : "👁️"}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Confirmar Contraseña
                    </label>
                    <input
                      type={recupVerPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={recupConfirmarPassword}
                      onChange={(e) => setRecupConfirmarPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={recupCargando}
                    className="flex-1 bg-itm-purple hover:bg-[#500c66] disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    {recupCargando ? "Restableciendo..." : "Restablecer mi Contraseña"}
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Asistencia con el Administrador */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>¿Dudas o cuenta inactiva?</span>
                  <a
                    href="mailto:admin@itm.edu.co?subject=Soporte%20Acceso%20SIGMA%20ITM&body=Hola%20Administrador,%20tengo%20un%20inconveniente%20con%20mi%20cuenta%20de%20SIGMA%20ITM:%0A%0A"
                    className="text-itm-purple hover:underline font-semibold"
                  >
                    Contactar al Administrador ITM
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer minimal */}
      <footer className="bg-[#001340] py-6 text-center text-white/60 text-xs mt-auto">
        <p>Institución Universitaria ITM - Reacreditada en Alta Calidad</p>
      </footer>
    </div>
  );
}
