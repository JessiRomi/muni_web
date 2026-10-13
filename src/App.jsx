import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Home from "./pages/home/Home";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import "./App.css";

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
        <Route element={<ProtectedRoute />}>
          <Route path="/panel" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
