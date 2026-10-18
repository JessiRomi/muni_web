import { CalendarDays, MapPin } from "lucide-react";
import "./ActivityCard.css";

const activityStatuses = {
  ACTIVE: "Activa",
  INACTIVE: "Inactiva",
  CANCELLED: "Cancelada",
  COMPLETED: "Finalizada",
};

const meetingStatuses = {
  SCHEDULED: "Programado",
  ACTIVE: "Activo",
  OPEN: "Abierto",
  CLOSED: "Cerrado",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

export default function ActivityCard({ activity, onCreateMeeting }) {
  const meetings = Array.isArray(activity.meetings) ? activity.meetings : [];

  return (
    <article className="instructor-card instructor-activity-card">
      <CalendarDays
        className="instructor-activity-icon"
        size={26}
        aria-hidden="true"
      />

      <div className="instructor-activity-content">
        <h3>{activity.name || "Actividad sin nombre"}</h3>

        <p>{activity.description || "Sin descripción disponible."}</p>

        <p>
          <strong>Estado:</strong>{" "}
          {activityStatuses[activity.status] || activity.status || "Sin estado"}
        </p>

        <p>
          <strong>Capacidad:</strong> {activity.capacity ?? "No definida"}
        </p>

        <p>
          <strong>Encuentros:</strong> {meetings.length}
        </p>

        <div className="instructor-meetings-list">
          {meetings.map((meeting) => (
            <div className="instructor-meeting-item" key={meeting.id}>
              <p>
                <strong>Fecha:</strong>{" "}
                {meeting.dateTime
                  ? new Date(meeting.dateTime).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "Sin fecha"}
              </p>

              <p className="instructor-meeting-location">
                <MapPin size={16} aria-hidden="true" />
                {meeting.location || "Sin ubicación"}
              </p>

              <span>
                {meetingStatuses[meeting.status] ||
                  meeting.status ||
                  "Programado"}
              </span>
            </div>
          ))}
        </div>

        <button
          className="instructor-logout"
          type="button"
          onClick={() => onCreateMeeting(activity)}
        >
          Crear encuentro
        </button>
      </div>
    </article>
  );
}
