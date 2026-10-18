import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  UsersRound,
  X,
} from "lucide-react";
import activitiesService from "../../services/activitiesService";
import "./ActivityDetailModal.css";

function formatDate(value) {
  if (!value) return "Fecha a confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha a confirmar";
  return date.toLocaleDateString("es-AR");
}
function getErrorMessage(error) {
  const message = error.response?.data?.message;
  return Array.isArray(message)
    ? message.join(". ")
    : message || error.message || "No se pudo completar la inscripción.";
}
export default function ActivityDetailModal({
  activity,
  onClose,
  onContinue,
  isAuthenticated,
  user,
}) {
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [enrollmentError, setEnrollmentError] = useState(false);
  useEffect(() => {
    setEnrolling(false);
    setEnrollmentMessage("");
    setEnrollmentError(false);
  }, [activity?.id]);
  useEffect(() => {
    if (!activity) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape" && !enrolling) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activity, onClose, enrolling]);
  if (!activity) return null;
  async function handleEnroll() {
    if (!isAuthenticated) {
      onContinue();
      return;
    }
    if (
      !user?.id ||
      !user.roles?.includes("PARTICIPANTE") ||
      !Number.isSafeInteger(Number(user.id)) ||
      Number(user.id) <= 0
    ) {
      setEnrollmentError(true);
      setEnrollmentMessage(
        "Se necesita un usuario válido con el rol PARTICIPANTE para inscribirse.",
      );
      return;
    }
    setEnrolling(true);
    setEnrollmentMessage("");
    setEnrollmentError(false);
    try {
      await activitiesService.enroll(activity.id);
      setEnrollmentMessage("¡Ya estás inscripto en esta actividad!");
    } catch (error) {
      console.error("Error al inscribirse:", error);
      setEnrollmentMessage(getErrorMessage(error));
      setEnrollmentError(true);
    } finally {
      setEnrolling(false);
    }
  }
  return (
    <div
      className="activity-detail-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !enrolling) onClose();
      }}
    >
      <section
        className="activity-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-detail-title"
      >
        <button
          className="activity-detail-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          disabled={enrolling}
        >
          <X size={22} />
        </button>
        <span className="activity-detail-kicker">DETALLE DE LA ACTIVIDAD</span>
        <h2 id="activity-detail-title">{activity.name || "Actividad"}</h2>
        <p className="activity-detail-description">
          {activity.description || "Conocé esta propuesta de la comunidad."}
        </p>
        <div className="activity-detail-info">
          <div>
            <CalendarDays size={19} aria-hidden="true" />
            <span>
              <strong>Inicio de inscripción</strong>
              {formatDate(activity.enrollmentStart)}
            </span>
          </div>
          <div>
            <Clock3 size={19} aria-hidden="true" />
            <span>
              <strong>Fin de inscripción</strong>
              {formatDate(activity.enrollmentEnd)}
            </span>
          </div>
          {activity.capacity != null && (
            <div>
              <UsersRound size={19} aria-hidden="true" />
              <span>
                <strong>Capacidad</strong>
                {activity.capacity} personas
              </span>
            </div>
          )}
          <div>
            <MapPin size={19} aria-hidden="true" />
            <span>
              <strong>Ubicación</strong>Cipolletti
            </span>
          </div>
        </div>
        {enrollmentMessage && (
          <p
            role={enrollmentError ? "alert" : "status"}
            aria-live="polite"
            style={{
              marginTop: "1rem",
              color: enrollmentError ? "#b42318" : "#16803c",
            }}
          >
            {enrollmentMessage}
          </p>
        )}
        <button
          className="activity-detail-cta"
          type="button"
          onClick={handleEnroll}
          disabled={enrolling || Boolean(enrollmentMessage && !enrollmentError)}
        >
          {enrolling
            ? "Inscribiendo..."
            : !isAuthenticated
              ? "Ingresar para continuar"
              : enrollmentMessage && !enrollmentError
                ? "Inscripción confirmada"
                : "Inscribirme"}
          <ArrowUpRight size={19} />
        </button>
        <p className="activity-detail-note">
          La inscripción está sujeta a la disponibilidad de cupos y al período
          establecido para cada actividad.
        </p>
      </section>
    </div>
  );
}
