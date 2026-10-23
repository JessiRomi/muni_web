import { useCallback, useEffect, useState } from "react";
import { LogOut, GraduationCap, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { activitiesService } from "../../services/activitiesService";
import ActivityCard from "./ActivityCard";
import MeetingForm from "./MeetingForm";
import SiteFooter from "../../components/layout/SiteFooter";
import "../role-pages.css";
import ParticipantProfile from "../participant/components/ParticipantProfile";
import useParticipantProfile from "../participant/hooks/useParticipantProfile";
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
    setSelectedActivity(null);
    setSuccess("El encuentro se creó correctamente.");
    loadActivities();
  }

  function handleCreateMeeting(activity) {
    setSelectedActivity(activity);
    setSuccess("");
  }

  function handleCancelMeeting() {
    setSelectedActivity(null);
  }

  return (
    <div className="instructor-page">
      <main className="instructor-main">
        <span className="instructor-eyebrow">ESPACIO DOCENTE</span>

        <h1>¡Bienvenido!</h1>

        <p className="instructor-description">
          Consultá tus actividades y organizá los próximos encuentros.
        </p>

        <ParticipantProfile {...profileState} user={user} />

        <section className="instructor-section">
          <span className="instructor-eyebrow">MI TRABAJO</span>

          <h2>Mis actividades asignadas</h2>

          <button
            className="instructor-logout"
            type="button"
            onClick={loadActivities}
            disabled={loading}
          >
            <RefreshCw size={18} />
            Actualizar actividades
          </button>

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
            <div className="instructor-card">
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
              />
            ))}

          {success && (
            <p className="instructor-success" role="status">
              {success}
            </p>
          )}
        </section>

        {selectedActivity && (
          <MeetingForm
            key={selectedActivity.id}
            activity={selectedActivity}
            onCreated={handleMeetingCreated}
            onCancel={handleCancelMeeting}
          />
        )}

        <button className="instructor-logout" type="button" onClick={logout}>
          <LogOut size={19} />
          Cerrar sesión
        </button>
      </main>

      <SiteFooter />
    </div>
  );
}
