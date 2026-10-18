import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Home from "./pages/home/Home";
import ParticipantDashboard from "./pages/participant/ParticipantDashboard";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import RoleSelector from "./pages/roles/RoleSelector";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { getRoleDestination } from "./utils/roleNavigation";
import "./App.css";

function AuthenticatedEntry() {
  const { user } = useAuth();
  return <Navigate to={getRoleDestination(user?.roles)} replace />;
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return window.localStorage.getItem("muni-theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("muni-theme", darkMode ? "dark" : "light");
    } catch {
      // La aplicación sigue funcionando aunque el navegador no permita guardar preferencias.
    }
  }, [darkMode]);

  const toggleTheme = useCallback(() => {
    setDarkMode((currentTheme) => !currentTheme);
  }, []);

  return (
    <div className={`app ${darkMode ? "theme-dark" : "theme-light"}`}>
      <Routes>
        <Route
          path="/"
          element={<Home darkMode={darkMode} onToggleTheme={toggleTheme} />}
        />
        <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR"]} />}>
          <Route path="/panel" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["PARTICIPANTE"]} />}>
          <Route path="/participante" element={<ParticipantDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["INSTRUCTOR"]} />}>
          <Route path="/instructor" element={<InstructorDashboard />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/elegir-rol" element={<RoleSelector />} />
          <Route path="/inicio" element={<AuthenticatedEntry />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
