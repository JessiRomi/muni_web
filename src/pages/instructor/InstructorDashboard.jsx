import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { activitiesService } from "../../services/activitiesService";
import ActivityCard from "./ActivityCard";
import MeetingForm from "./MeetingForm";
import SiteFooter from "../../components/layout/SiteFooter";
import "../role-pages.css";
import SharedProfile from "../participant/components/SharedProfile";
import useParticipantProfile from "../participant/hooks/useParticipantProfile";
import MunicipalHeader from "../../components/layout/MunicipalHeader";
import MunicipalHero from "../../components/layout/MunicipalHero";
import DashboardModal from "../../components/layout/DashboardModal";
import "../../styles/dashboard-section-heading.css";
import "../../styles/activity-cards.css";
import "./InstructorDashboard.css";

export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const profileState = useParticipantProfile();
  useEffect(() => {
    profileState.loadMyProfile();
  }, [profileState.loadMyProfile]);

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [success, setSuccess] = useState("");

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (!user?.id) {
        throw new Error("No se pudo identificar al instructor.");
      }

      const data = await activitiesService.getAll();
      const allActivities = Array.isArray(data) ? data : [];

      setActivities(
        allActivities.filter(
          (activity) => Number(activity.responsibleId) === Number(user.id),
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "No se pudieron cargar las actividades.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  function handleMeetingCreated() {
    const wasEditing = Boolean(selectedMeeting);

    setSelectedActivity(null);
    setSelectedMeeting(null);

    setSuccess(
      wasEditing
        ? "El encuentro se actualizó correctamente."
        : "El encuentro se creó correctamente.",
    );

    loadActivities();
  }

  function handleCreateMeeting(activity) {
    setSelectedActivity(activity);
    setSelectedMeeting(null);
    setSuccess("");
  }

  function handleEditMeeting(activity, meeting) {
    setSelectedActivity(activity);
    setSelectedMeeting(meeting);
    setSuccess("");
  }

  function handleCancelMeeting() {
    setSelectedActivity(null);
    setSelectedMeeting(null);
  }

  return (
    <div className="instructor-page">
      <MunicipalHeader onLogout={logout} />

      <MunicipalHero
        variant="compact"
        eyebrow="ESPACIO INSTRUCTOR"
        title="Enseñá, compartí y conectá."
        description="Consultá tus actividades, organizá encuentros y acompañá la participación de la comunidad."
      />

      <main className="instructor-main">
        <SharedProfile {...profileState} user={user} currentRole="INSTRUCTOR" />

        <section className="instructor-section">
          <div className="dashboard-activities-heading">
            <div>
              <span className="dashboard-eyebrow">MI TRABAJO</span>
              <h2>Mis actividades</h2>
              <p>Gestioná tus actividades y los próximos encuentros.</p>
            </div>

            <div className="dashboard-activities-header-actions">
              <button
                className="dashboard-button dashboard-button--secondary"
                type="button"
                onClick={loadActivities}
                disabled={loading}
              >
                <RefreshCw
                  size={17}
                  aria-hidden="true"
                  className={loading ? "instructor-icon-spinning" : ""}
                />
                Actualizar actividades
              </button>
            </div>
          </div>

          {selectedActivity && (
            <DashboardModal
              eyebrow="ESPACIO INSTRUCTOR"
              title={selectedMeeting ? "Editar encuentro" : "Nuevo encuentro"}
              description={
                selectedMeeting
                  ? `Modificá el encuentro de ${selectedActivity.name}.`
                  : `Programá un encuentro para ${selectedActivity.name}.`
              }
              onClose={handleCancelMeeting}
              labelledBy="meeting-modal-title"
              variant="instructor"
            >
              <MeetingForm
                key={`${selectedActivity.id}-${selectedMeeting?.id ?? "new"}`}
                activity={selectedActivity}
                meeting={selectedMeeting}
                onCreated={handleMeetingCreated}
                onCancel={handleCancelMeeting}
              />
            </DashboardModal>
          )}

          {loading && <p>Cargando actividades...</p>}

          {!loading && error && (
            <div className="instructor-card" role="alert">
              <div>
                <h3>No se pudieron cargar las actividades</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && activities.length === 0 && (
            <div className="instructor-card" role="status">
              <div>
                <h3>No tenés actividades asignadas</h3>
                <p>
                  Cuando tengas actividades asignadas, vas a poder gestionarlas
                  desde este espacio.
                </p>
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onCreateMeeting={handleCreateMeeting}
                onEditMeeting={handleEditMeeting}
              />
            ))}

          {success && (
            <p className="instructor-success" role="status">
              {success}
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
