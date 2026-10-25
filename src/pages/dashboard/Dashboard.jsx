import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import activitiesService from "../../services/activitiesService";
import ActivityForm from "./activities/ActivityForm";
import ActivityList from "./activities/ActivityList";
import SiteFooter from "../../components/layout/SiteFooter";
import AdminProfile from "./AdminProfile";
import DashboardModal from "../../components/layout/DashboardModal";
import MunicipalHeader from "../../components/layout/MunicipalHeader";
import "../../styles/dashboard-section-heading.css";
import "../../styles/activity-cards.css";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const newActivityButtonRef = useRef(null);
  const modalCloseButtonRef = useRef(null);

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

  useEffect(() => {
    if (!showForm) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleCancelForm();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    requestAnimationFrame(() => {
      modalCloseButtonRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showForm]);

  useEffect(() => {
    if (!showForm) {
      newActivityButtonRef.current?.focus({ preventScroll: true });
    }
  }, [showForm]);

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
      const message = err.response?.data?.message;

      setActionError(
        (Array.isArray(message) ? message.join(", ") : message) ||
          err.message ||
          "No se pudo reactivar la actividad. Intentá nuevamente.",
      );
    } finally {
      setReactivatingId(null);
    }
  }

  return (
    <>
      <main className="dashboard">
        <MunicipalHeader onLogout={handleLogout} />
        <section className="dashboard-content">
          <div className="dashboard-welcome">
            <span className="dashboard-eyebrow">
              <Sparkles size={14} aria-hidden="true" />
              PANEL DE ADMINISTRACIÓN
            </span>
            <h1>Gestioná tu comunidad.</h1>
            <p>
              Organizá actividades, acompañá a los equipos y mantené toda la
              gestión municipal en un solo lugar.
            </p>
          </div>

          {isAdmin && <AdminProfile user={user} />}

          <section className="dashboard-activities">
            <div className="dashboard-activities-heading">
              <div>
                <span className="dashboard-eyebrow">GESTIÓN MUNICIPAL</span>
                <h2>Actividades</h2>
                <p>Administrá las propuestas y su estado.</p>
              </div>

              <div className="dashboard-activities-header-actions">
                {isAdmin && (
                  <button
                    ref={newActivityButtonRef}
                    className="dashboard-button dashboard-button--primary"
                    type="button"
                    onClick={handleNewActivity}
                  >
                    <Plus size={18} aria-hidden="true" />
                    Nueva actividad
                  </button>
                )}

                <button
                  className="dashboard-button dashboard-button--secondary"
                  type="button"
                  onClick={loadActivities}
                  disabled={loading}
                >
                  <RefreshCw
                    size={17}
                    aria-hidden="true"
                    className={loading ? "dashboard-icon-spinning" : ""}
                  />
                  Actualizar
                </button>
              </div>
            </div>

            {actionError && (
              <p role="alert" className="dashboard-action-error">
                {actionError}
              </p>
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

      {showForm && isAdmin && (
        <DashboardModal
          eyebrow="GESTIÓN MUNICIPAL"
          title={editingActivity ? "Editar actividad" : "Nueva actividad"}
          description={
            editingActivity
              ? "Actualizá la información de esta propuesta."
              : "Completá los datos para sumar una propuesta municipal."
          }
          onClose={handleCancelForm}
          closeButtonRef={modalCloseButtonRef}
          labelledBy="activity-modal-title"
        >
          <ActivityForm
            key={editingActivity?.id ?? "new-activity"}
            activity={editingActivity}
            onCreated={handleActivitySaved}
            onUpdated={handleActivitySaved}
            onCancel={handleCancelForm}
            modal
          />
        </DashboardModal>
      )}

      <SiteFooter />
    </>
  );
}
