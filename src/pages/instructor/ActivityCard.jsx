import { useCallback, useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import attendanceService from "../../services/attendanceService";
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

function formatDate(value) {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getSessionState(session, now) {
  if (session.status === "CLOSED") {
    return { label: "Cerrada", kind: "closed" };
  }

  const start = new Date(session.startTime).getTime();
  const end = new Date(session.endTime).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return { label: "Horario inválido", kind: "invalid" };
  }

  if (now < start) {
    return { label: "Programada", kind: "scheduled" };
  }

  if (now > end) {
    return { label: "Vencida · pendiente de cierre", kind: "expired" };
  }

  return { label: "Abierta", kind: "open" };
}

function AttendanceStatus({ meetingId }) {
  const [session, setSession] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSession = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) setLoading(true);
      setError("");

      try {
        const result = await attendanceService.getSessionByMeeting(meetingId);

        setSession(result || null);
      } catch (err) {
        setError(
          err.response?.data?.message || "No se pudo consultar la asistencia.",
        );
      } finally {
        setLoading(false);
      }
    },
    [meetingId],
  );

  useEffect(() => {
    loadSession();

    const refreshInterval = setInterval(() => {
      setNow(Date.now());
      loadSession({ showLoading: false });
    }, 30_000);

    return () => clearInterval(refreshInterval);
  }, [loadSession]);

  async function handleOpen() {
    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      await attendanceService.open(meetingId, new Date().toISOString());
      await loadSession({ showLoading: false });
      setNow(Date.now());
      setNotice("La sesión de asistencia se abrió correctamente.");
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo abrir la asistencia.",
      );
      await loadSession({ showLoading: false });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClose() {
    if (!session) return;

    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      await attendanceService.close(session.id);
      await loadSession({ showLoading: false });
      setNotice("La sesión se cerró. Las ausencias no se procesaron.");
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cerrar la sesión.");
      await loadSession({ showLoading: false });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <p>Consultando asistencia...</p>;
  }

  const state = session ? getSessionState(session, now) : null;
  const canOpenNew =
    !session || state?.kind === "expired" || state?.kind === "closed";

  return (
    <section className="instructor-attendance-status" aria-label="Asistencia">
      <p className="instructor-attendance-heading">
        <strong>Asistencia</strong>
        <span
          className={`attendance-state attendance-state--${state?.kind || "none"}`}
        >
          {state?.label || "Sin sesión"}
        </span>
      </p>

      {session && (
        <dl className="instructor-attendance-details">
          <div>
            <dt>Inicio</dt>
            <dd>{formatDate(session.startTime)}</dd>
          </div>
          <div>
            <dt>Fin</dt>
            <dd>{formatDate(session.endTime)}</dd>
          </div>
          <div>
            <dt>ID de sesión</dt>
            <dd>{session.id}</dd>
          </div>
        </dl>
      )}

      {error && (
        <p
          className="attendance-feedback attendance-feedback--error"
          role="alert"
        >
          {error}
        </p>
      )}
      {notice && (
        <p className="attendance-feedback" role="status">
          {notice}
        </p>
      )}

      <div className="attendance-actions">
        {canOpenNew && (
          <button
            className="attendance-button"
            type="button"
            onClick={handleOpen}
            disabled={actionLoading}
          >
            {actionLoading
              ? "Abriendo..."
              : session
                ? "Abrir nueva sesión"
                : "Abrir asistencia"}
          </button>
        )}

        {state?.kind === "expired" && (
          <button
            className="attendance-button attendance-button--secondary"
            type="button"
            onClick={handleClose}
            disabled={actionLoading}
          >
            {actionLoading ? "Procesando..." : "Cerrar sesión vencida"}
          </button>
        )}
      </div>

      {state?.kind === "open" && (
        <p className="attendance-help">
          La sesión está dentro de su horario. El cierre y el procesamiento de
          ausencias son acciones independientes.
        </p>
      )}
    </section>
  );
}

export default function ActivityCard({ activity, onCreateMeeting }) {
  const navigate = useNavigate();
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
                <strong>Fecha:</strong> {formatDate(meeting.dateTime)}
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

              <AttendanceStatus meetingId={meeting.id} />

              <button
                className="attendance-button"
                type="button"
                onClick={() =>
                  navigate(`/instructor/encuentros/${meeting.id}/asistencia`, {
                    state: {
                      meeting,
                      activityName: activity.name,
                      enrollments: activity.enrollments || [],
                    },
                  })
                }
              >
                Ver asistencia
              </button>
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
