import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RutaProtegida from "./components/RutaProtegida";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CrearUsuario from "./pages/CrearUsuario";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PanelAprobacion from "./pages/PanelAprobacion";
import PanelEstudiante from "./pages/PanelEstudiante";

function Home() {
  const { usuario } = useAuth();
  if (usuario?.rol === "ESTUDIANTE") return <PanelEstudiante />;
  return <PanelAprobacion />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<CrearUsuario />} />


          {/* Rutas Protegidas (Dashboard) */}
          <Route
            path="/app"
            element={
              <RutaProtegida>
                <Layout><Home /></Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/app/aprobaciones"
            element={
              <RutaProtegida rolesPermitidos={["ASESOR", "COMITE", "ADMIN", "ADMINISTRADOR"]}>
                <Layout><PanelAprobacion /></Layout>
              </RutaProtegida>
            }
          />
          <Route
            path="/app/dashboard"
            element={
              <RutaProtegida rolesPermitidos={["ASESOR", "COMITE", "ADMIN", "ADMINISTRADOR"]}>
                <Layout><Dashboard /></Layout>
              </RutaProtegida>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
