import { useCallback, useEffect, useState } from "react";
import { LogOut, Landmark, RefreshCw, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import activitiesService from "../../services/activitiesService";
import ActivityForm from "./activities/ActivityForm";
import ActivityList from "./activities/ActivityList";
import SiteFooter from "../../components/layout/SiteFooter";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  
  const navigate = useNavigate();
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const isAdmin = user?.roles?.includes("ADMINISTRADOR");

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await activitiesService.getAll();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar las actividades. Intentá nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  async function handleActivityCreated() {
    setShowForm(false);
    await loadActivities();
  }

  return (
    <>
      <main className="dashboard">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <Landmark size={28} />
            <div>
              <strong>MUNI CIPOLLETTI</strong>
              <span>Plataforma de actividades</span>
            </div>
          </div>
          <button
            className="dashboard-logout"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </header>
        <section className="dashboard-content">
          <span className="dashboard-eyebrow">PANEL PRINCIPAL</span>
          <h1>¡Bienvenido!</h1>
          <p>Ingresaste correctamente a la plataforma municipal.</p>
          {user && (
            <div className="dashboard-user">
              <strong>{user.email}</strong>
              <span>Rol: {(user.roles || []).join(", ")}</span>
            </div>
          )}
          <section className="dashboard-activities">
            <div className="dashboard-activities-heading">
              <div>
                <span className="dashboard-eyebrow">GESTIÓN</span>
                <h2>Actividades</h2>
              </div>
              <div className="dashboard-activity-actions">
                {isAdmin && (
                  <button
                    className="dashboard-primary-action"
                    type="button"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={18} />
                    Nueva actividad
                  </button>
                )}
                <button
                  className="dashboard-logout"
                  type="button"
                  onClick={loadActivities}
                  disabled={loading}
                >
                  <RefreshCw size={17} />
                  Actualizar
                </button>
              </div>
            </div>
            {showForm && isAdmin && (
              <ActivityForm
                onCreated={handleActivityCreated}
                onCancel={() => setShowForm(false)}
              />
            )}
            <ActivityList
              activities={activities}
              loading={loading}
              error={error}
              onRetry={loadActivities}
            />
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
