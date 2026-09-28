import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import logoItm from "../assets/logo-itm.png";

const ROLES = [
  { value: "ESTUDIANTE", label: "Estudiante",      emoji: "🎓", desc: "Postula y hace seguimiento a su opción de grado" },
  { value: "ASESOR",     label: "Docente Asesor",  emoji: "👨‍🏫", desc: "Revisa y asesora los trabajos de sus estudiantes" },
  { value: "COMITE",     label: "Comité de Grado", emoji: "🏛️", desc: "Aprueba o rechaza postulaciones del programa" },
];

const PROGRAMAS = [
  "Ingeniería de Sistemas",
  "Ingeniería Electrónica",
  "Ingeniería Biomédica",
  "Tecnología en Sistemas de Información",
  "Tecnología en Electrónica",
  "Administración Tecnológica",
  "Otro",
];

function calcularFortaleza(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const fortalezaConfig = [
  { label: "Muy débil",  color: "bg-red-500",    text: "text-red-600"     },
  { label: "Débil",      color: "bg-orange-400",  text: "text-orange-500"  },
  { label: "Regular",    color: "bg-yellow-400",  text: "text-yellow-600"  },
  { label: "Buena",      color: "bg-blue-400",    text: "text-blue-600"    },
  { label: "Fuerte",     color: "bg-emerald-500", text: "text-emerald-600" },
  { label: "Excelente",  color: "bg-emerald-600", text: "text-emerald-700" },
];

export default function CrearUsuario() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    cedula: "",
    programa_academico: "",
    rol: "ESTUDIANTE",
    username: "",
    password: "",
    confirmar_password: "",
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [usuarioCreado, setUsuarioCreado] = useState(null);

  const cambiar = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: "" }));
    setErrorGlobal("");
  };

  const validarPaso1 = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "El nombre es obligatorio.";
    if (!form.last_name.trim()) e.last_name = "El apellido es obligatorio.";
    if (!form.email.trim()) {
      e.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Ingresa un correo electrónico válido.";
    }
    if (!form.cedula.trim()) e.cedula = "La cédula es obligatoria.";
    if (!form.programa_academico && form.rol === "ESTUDIANTE")
      e.programa_academico = "Selecciona tu programa académico.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const validarPaso2 = () => {
    const e = {};
    if (!form.username.trim()) {
      e.username = "El nombre de usuario es obligatorio.";
    } else if (/\s/.test(form.username)) {
      e.username = "El usuario no puede contener espacios.";
    }
    if (!form.password) {
      e.password = "La contraseña es obligatoria.";
    } else if (form.password.length < 8) {
      e.password = "La contraseña debe tener al menos 8 caracteres.";
    }
    if (form.password !== form.confirmar_password) {
      e.confirmar_password = "Las contraseñas no coinciden.";
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const siguientePaso = () => {
    if (paso === 1 && validarPaso1()) setPaso(2);
  };

  const enviar = async () => {
    if (!validarPaso2()) return;
    setCargando(true);
    setErrorGlobal("");
    try {
      const { data } = await api.post("/usuarios/registrar/", form);
      setUsuarioCreado(data);
      setPaso(3);
    } catch (err) {
      const respData = err.response?.data;
      if (respData && typeof respData === "object") {
        const nuevosErrores = {};
        let hayErrorCampo = false;
        for (const [campo, msgs] of Object.entries(respData)) {
          if (campo === "non_field_errors") {
            setErrorGlobal(Array.isArray(msgs) ? msgs.join(" ") : msgs);
          } else {
            nuevosErrores[campo] = Array.isArray(msgs) ? msgs.join(" ") : msgs;
            hayErrorCampo = true;
          }
        }
        if (hayErrorCampo) {
          setErrores(nuevosErrores);
          const camposPaso1 = ["first_name", "last_name", "email", "cedula", "programa_academico"];
          if (Object.keys(nuevosErrores).some((c) => camposPaso1.includes(c))) {
            setPaso(1);
          }
        }
      } else {
        setErrorGlobal("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  };

  const fortaleza = calcularFortaleza(form.password);
  const barraFortaleza = fortalezaConfig[Math.min(fortaleza, 5)];

  // ── PASO 3: Éxito (Pendiente de Aprobación por el Admin) ────────────────────
  if (paso === 3) {
    const emailAdmin = "admin@itm.edu.co";
    const nombreCompleto = `${form.first_name} ${form.last_name}`.trim() || usuarioCreado?.username;
    const rolInfo = ROLES.find((r) => r.value === (usuarioCreado?.rol || form.rol));
    const rolLabel = rolInfo?.label || form.rol;
    const asuntoNotificacion = `SIGMA ITM — Solicitud de activación de cuenta: ${nombreCompleto} (${rolLabel})`;
    const cuerpoNotificacion = `Estimado Administrador del ITM:\n\nEl usuario ${nombreCompleto}, identificado con cédula ${form.cedula || usuarioCreado?.cedula || "N/A"}, correo institucional ${form.email || usuarioCreado?.email} y programa académico ${form.programa_academico || usuarioCreado?.programa_academico || "No especificado"}, ha solicitado la creación de un perfil con rol de ${rolLabel} en la plataforma SIGMA ITM.\n\nPor favor ingrese al panel de administración para validar y autorizar su acceso.\n\nAtentamente,\n${nombreCompleto}`;
    
    const mailtoHref = `mailto:${encodeURIComponent(emailAdmin)}?subject=${encodeURIComponent(asuntoNotificacion)}&body=${encodeURIComponent(cuerpoNotificacion)}`;
    const webmailOutlookHref = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(emailAdmin)}&subject=${encodeURIComponent(asuntoNotificacion)}&body=${encodeURIComponent(cuerpoNotificacion)}`;
    const webmailGmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAdmin)}&su=${encodeURIComponent(asuntoNotificacion)}&body=${encodeURIComponent(cuerpoNotificacion)}`;

    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <HeaderPublico />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-lg text-center border-t-4 border-amber-500">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
              ⏳
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">¡Solicitud recibida!</h2>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full mb-4">
              <span>⚠️</span>
              <span>Pendiente de aprobación institucional</span>
            </div>
            <p className="text-slate-600 text-sm mb-2">
              El usuario <span className="font-bold text-slate-800">@{usuarioCreado?.username}</span> ha
              sido registrado con rol <span className="font-bold text-itm-purple">{rolLabel}</span>.
            </p>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Por políticas de seguridad del ITM, el <strong>Administrador institucional</strong> debe
              aprobar tu perfil antes de que puedas iniciar sesión. Te llegará una notificación de confirmación a tu correo <strong>{usuarioCreado?.email || form.email}</strong>.
            </p>

            {/* Acciones de Notificación por Correo sin APIs externas */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📩</span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Aviso al Administrador
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Puedes enviar un aviso inmediato a la administración con tu solicitud pre-diligenciada abriendo tu correo institucional con un solo clic:
              </p>
              <a
                href={mailtoHref}
                className="w-full bg-gradient-to-r from-itm-blue to-itm-purple hover:from-itm-blue-dark hover:to-itm-purple-light text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
              >
                <span>📬</span>
                <span>Abrir en mi Correo Predeterminado</span>
              </a>
              <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-500">
                <span>O abrir en web:</span>
                <a
                  href={webmailOutlookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-itm-blue hover:underline"
                >
                  Outlook ITM ↗
                </a>
                <span>•</span>
                <a
                  href={webmailGmailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-itm-blue hover:underline"
                >
                  Gmail ↗
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-itm-purple hover:bg-[#6a4a9e] text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-xs"
              >
                Ir a Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  setForm({
                    first_name: "", last_name: "", email: "", cedula: "",
                    programa_academico: "", rol: "ESTUDIANTE",
                    username: "", password: "", confirmar_password: "",
                  });
                  setErrores({});
                  setPaso(1);
                  setUsuarioCreado(null);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-xs"
              >
                Registrar otro usuario
              </button>
            </div>
          </div>
        </main>
        <PiePublico />
      </div>
    );
  }

  // ── PASOS 1 y 2 ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <HeaderPublico />

      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 relative">
        <div className="bg-white shadow-2xl rounded-2xl w-full max-w-lg border-t-4 border-itm-purple relative z-10 -mt-24 overflow-hidden">

          {/* Barra de progreso */}
          <div className="h-1.5 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-itm-blue to-itm-purple transition-all duration-500"
              style={{ width: paso === 1 ? "50%" : "100%" }}
            />
          </div>

          <div className="p-8 sm:p-10">
            {/* Cabecera */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                <span className={paso >= 1 ? "text-itm-purple" : ""}>Datos personales</span>
                <span>›</span>
                <span className={paso >= 2 ? "text-itm-purple" : ""}>Cuenta de acceso</span>
              </div>
              <h2 className="text-2xl font-black text-itm-purple">
                {paso === 1 ? "Crear cuenta en SIGMA ITM" : "Configura tu acceso"}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {paso === 1
                  ? "Completa tus datos personales para registrarte."
                  : "Elige un usuario y contraseña seguros."}
              </p>
            </div>

            {errorGlobal && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r">
                <p className="text-red-700 text-xs font-semibold">{errorGlobal}</p>
              </div>
            )}

            {/* ── PASO 1 ─────────────────────────────────────────────────── */}
            {paso === 1 && (
              <div className="space-y-4">
                {/* Selector de rol */}
                <div>
                  <label className="block text-xs font-bold text-itm-blue mb-2 uppercase tracking-wide">
                    Tipo de usuario
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => cambiar("rol", r.value)}
                        className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                          form.rol === r.value
                            ? "border-itm-purple bg-purple-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xl mb-0.5">{r.emoji}</div>
                        <div className="text-[10px] font-bold text-slate-700 leading-tight">
                          {r.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Campo
                    label="Nombres" id="first_name" value={form.first_name}
                    error={errores.first_name} placeholder="ej: Jorge Andrés"
                    onChange={(v) => cambiar("first_name", v)}
                  />
                  <Campo
                    label="Apellidos" id="last_name" value={form.last_name}
                    error={errores.last_name} placeholder="ej: Bernal López"
                    onChange={(v) => cambiar("last_name", v)}
                  />
                </div>

                <Campo
                  label="Correo institucional" id="email" type="email"
                  value={form.email} error={errores.email}
                  placeholder="ej: jbernal@itm.edu.co"
                  onChange={(v) => cambiar("email", v)}
                />

                <Campo
                  label="Número de cédula" id="cedula" value={form.cedula}
                  error={errores.cedula} placeholder="ej: 1234567890"
                  onChange={(v) => cambiar("cedula", v)}
                />

                {form.rol === "ESTUDIANTE" && (
                  <div>
                    <label className="block text-xs font-bold text-itm-blue mb-1.5 uppercase tracking-wide">
                      Programa académico
                    </label>
                    <select
                      value={form.programa_academico}
                      onChange={(e) => cambiar("programa_academico", e.target.value)}
                      className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all bg-slate-50 ${
                        errores.programa_academico ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                    >
                      <option value="">— Selecciona tu programa —</option>
                      {PROGRAMAS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errores.programa_academico && (
                      <p className="text-red-600 text-xs mt-1">{errores.programa_academico}</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={siguientePaso}
                  className="w-full mt-2 bg-itm-purple hover:bg-[#6a4a9e] text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-widest text-xs"
                >
                  Continuar →
                </button>
              </div>
            )}

            {/* ── PASO 2 ─────────────────────────────────────────────────── */}
            {paso === 2 && (
              <div className="space-y-4">
                {/* Resumen */}
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3">
                  <div className="text-2xl">
                    {ROLES.find((r) => r.value === form.rol)?.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {form.first_name} {form.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{form.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaso(1)}
                    className="ml-auto text-xs text-itm-purple hover:underline font-semibold"
                  >
                    Editar
                  </button>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-itm-blue mb-1.5 uppercase tracking-wide">
                    Nombre de usuario
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={form.username}
                    placeholder="ej: jbernal2026"
                    onChange={(e) => cambiar("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all bg-slate-50 ${
                      errores.username ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {errores.username && <p className="text-red-600 text-xs mt-1">{errores.username}</p>}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Sin espacios. Este será tu nombre de acceso al sistema.
                  </p>
                </div>

                {/* Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-itm-blue mb-1.5 uppercase tracking-wide">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    placeholder="Mínimo 8 caracteres"
                    onChange={(e) => cambiar("password", e.target.value)}
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all bg-slate-50 ${
                      errores.password ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {errores.password && <p className="text-red-600 text-xs mt-1">{errores.password}</p>}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 h-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all ${
                              i < fortaleza ? barraFortaleza.color : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] font-semibold mt-1 ${barraFortaleza.text}`}>
                        {barraFortaleza.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label htmlFor="confirmar_password" className="block text-xs font-bold text-itm-blue mb-1.5 uppercase tracking-wide">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmar_password"
                    type="password"
                    value={form.confirmar_password}
                    placeholder="Repite tu contraseña"
                    onChange={(e) => cambiar("confirmar_password", e.target.value)}
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all bg-slate-50 ${
                      errores.confirmar_password ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {errores.confirmar_password && (
                    <p className="text-red-600 text-xs mt-1">{errores.confirmar_password}</p>
                  )}
                  {form.confirmar_password && form.password === form.confirmar_password && (
                    <p className="text-emerald-600 text-xs mt-1 font-semibold">✓ Las contraseñas coinciden</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPaso(1)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all text-xs uppercase tracking-widest"
                  >
                    ← Atrás
                  </button>
                  <button
                    type="button"
                    onClick={enviar}
                    disabled={cargando}
                    className="flex-[2] bg-itm-purple hover:bg-[#6a4a9e] disabled:opacity-70 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-widest text-xs"
                  >
                    {cargando ? "Creando cuenta..." : "Crear cuenta"}
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-slate-400 mt-6">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-itm-purple font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </main>

      <PiePublico />
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function HeaderPublico() {
  return (
    <>
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

      <div className="relative bg-gradient-to-r from-itm-blue via-itm-purple to-[#011C5B] py-16 px-8 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:40px_40px]" />
        <h1
          className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl z-10 text-center relative"
          style={{ textShadow: "4px 4px 0 #661081, 8px 8px 15px rgba(0,0,0,0.5)" }}
        >
          SIGMA ITM
        </h1>
      </div>
    </>
  );
}

function PiePublico() {
  return (
    <footer className="bg-[#001340] py-6 text-center text-white/60 text-xs mt-auto">
      <p>Institución Universitaria ITM - Reacreditada en Alta Calidad</p>
    </footer>
  );
}

function Campo({ label, id, type = "text", value, error, placeholder, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-itm-blue mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-itm-purple transition-all bg-slate-50 ${
          error ? "border-red-400 bg-red-50" : "border-slate-300"
        }`}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
