import { useCallback, useEffect, useState } from "react";
import { LogOut, Landmark, RefreshCw, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import activitiesService from "../../services/activitiesService";
import ActivityForm from "./activities/ActivityForm";
import ActivityList from "./activities/ActivityList";
import SiteFooter from "../../components/layout/SiteFooter";
import AdminProfile from "./AdminProfile";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [finishingId, setFinishingId] = useState(null);
  const [reactivatingId, setReactivatingId] = useState(null);
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

  function handleNewActivity() {
    setEditingActivity(null);
    setActionError("");
    setShowForm(true);
  }

  function handleEditActivity(activity) {
    setEditingActivity(activity);
    setActionError("");
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingActivity(null);
  }

  async function handleActivitySaved() {
    setShowForm(false);
    setEditingActivity(null);
    await loadActivities();
  }

  async function handleDeleteActivity(activity) {
    const confirmed = window.confirm(
      `¿Querés eliminar la actividad "${activity.name}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) return;

    setActionError("");
    setDeletingId(activity.id);

    try {
      await activitiesService.delete(activity.id);
      await loadActivities();
    } catch (err) {
      console.error("Error al eliminar actividad:", err.response?.data);
      const message = err.response?.data?.message;
      setActionError(
        (Array.isArray(message) ? message.join(", ") : message) ||
          "No se pudo eliminar la actividad. Verificá si tiene registros asociados.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleFinishActivity(activity) {
    const confirmed = window.confirm(
      `¿Querés finalizar la actividad "${activity.name}"? Se conservarán sus encuentros, inscripciones y materiales, pero no debería aceptar nuevas operaciones.`,
    );

    if (!confirmed) return;

    setActionError("");
    setFinishingId(activity.id);

    try {
      await activitiesService.finish(activity.id);
      await loadActivities();
    } catch (err) {
      console.error("Error al finalizar actividad:", err.response?.data);
      const message = err.response?.data?.message;

      setActionError(
        (Array.isArray(message) ? message.join(", ") : message) ||
          "No se pudo finalizar la actividad. Intentá nuevamente.",
      );
    } finally {
      setFinishingId(null);
    }
  }
  async function handleReactivateActivity(activity) {
    const confirmed = window.confirm(
      `¿Querés reactivar la actividad "${activity.name}"? Se conservarán sus encuentros, inscripciones y materiales.`,
    );

    if (!confirmed) return;

    setActionError("");
    setReactivatingId(activity.id);

    try {
      await activitiesService.reactivate(activity.id);
      await loadActivities();
    } catch (err) {
      console.error("Error completo al reactivar:", err);
      console.error("Mensaje:", err.message);
      console.error("Respuesta HTTP:", err.response?.status);
      console.error("Datos de respuesta:", err.response?.data);
      console.error("URL solicitada:", err.config?.url);
      console.error("Método HTTP:", err.config?.method);

      const message = err.response?.data?.message;

      setActionError(
        (Array.isArray(message) ? message.join(", ") : message) ||
          err.message ||
          "No se pudo reactivar la actividad. Intentá nuevamente.",
      );
    }
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
          {isAdmin && <AdminProfile user={user} />}
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
                    onClick={handleNewActivity}
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

            {actionError && (
              <p role="alert" className="activity-form-error">
                {actionError}
              </p>
            )}

            {showForm && isAdmin && (
              <ActivityForm
                key={editingActivity?.id ?? "new-activity"}
                activity={editingActivity}
                onCreated={handleActivitySaved}
                onUpdated={handleActivitySaved}
                onCancel={handleCancelForm}
              />
            )}

            <ActivityList
              activities={activities}
              loading={loading}
              error={error}
              isAdmin={isAdmin}
              deletingId={deletingId}
              finishingId={finishingId}
              reactivatingId={reactivatingId}
              onReactivate={handleReactivateActivity}
              onFinish={handleFinishActivity}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
              onRetry={loadActivities}
            />
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
