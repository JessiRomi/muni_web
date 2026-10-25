import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import attendanceService from "../../services/attendanceService";
import { getActivityVisual } from "../../utils/activityVisuals";
import "../../styles/meeting-cards.css";
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

function getEnrollmentState(activity, now = Date.now()) {
  const start = new Date(activity.enrollmentStart).getTime();
  const end = new Date(activity.enrollmentEnd).getTime();

  if (
    !activity.enrollmentStart ||
    !activity.enrollmentEnd ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  ) {
    return { label: "Fechas no disponibles", kind: "unknown" };
  }

  if (now < start) {
    return { label: "Inscripción pendiente", kind: "pending" };
  }

  if (now > end) {
    return { label: "Inscripción vencida", kind: "expired" };
  }

  return { label: "Inscripción abierta", kind: "open" };
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
    return (
      <p className="instructor-attendance-loading">Consultando asistencia...</p>
    );
  }

  const state = session ? getSessionState(session, now) : null;
  const canOpenNew =
    !session || state?.kind === "expired" || state?.kind === "closed";

  return (
    <section className="instructor-attendance-status" aria-label="Asistencia">
      <div className="instructor-attendance-heading">
        <strong>Asistencia</strong>
        <span
          className={`attendance-state attendance-state--${state?.kind || "none"}`}
        >
          {state?.label || "Sin sesión"}
        </span>
      </div>

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
  const [meetingsExpanded, setMeetingsExpanded] = useState(false);
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);

  const meetings = Array.isArray(activity.meetings) ? activity.meetings : [];
  const visual = getActivityVisual(activity);
  const enrollment = getEnrollmentState(activity);
  const isFinished = activity.status === "COMPLETED";

  return (
    <article className="dashboard-activity instructor-activity-card">
      <div className="dashboard-activity-cover">
        <img
          src={visual.image}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />

        <span
          className={`dashboard-activity-status ${
            isFinished ? "is-finished" : "is-active"
          }`}
        >
          {isFinished ? "Finalizada" : "Activa"}
        </span>
      </div>

      <div className="dashboard-activity-content">
        <span className="dashboard-activity-category">
          <span className="dashboard-activity-category-icon">
            <CalendarDays size={15} aria-hidden="true" />
          </span>
          {visual.label}
        </span>

        <h3>{activity.name || "Actividad sin nombre"}</h3>

        <p className="dashboard-activity-description">
          {activity.description || "Sin descripción disponible."}
        </p>

        <p className="dashboard-activity-detail">
          <Users size={16} aria-hidden="true" />
          <span>Capacidad: {activity.capacity ?? "No definida"}</span>
        </p>

        <p className="dashboard-activity-detail">
          <Clock3 size={16} aria-hidden="true" />
          <span>Inicio: {formatDate(activity.enrollmentStart)}</span>
        </p>

        <p className="dashboard-activity-detail">
          <CalendarDays size={16} aria-hidden="true" />
          <span>Fin: {formatDate(activity.enrollmentEnd)}</span>
        </p>

        <div className="dashboard-activity-statuses">
          <span
            className={`activity-enrollment-status ${
              enrollment.kind === "open"
                ? "activity-enrollment-status--open"
                : enrollment.kind === "pending"
                  ? "activity-enrollment-status--pending"
                  : enrollment.kind === "expired"
                    ? "activity-enrollment-status--expired"
                    : "activity-enrollment-status--unknown"
            }`}
          >
            {enrollment.label}
          </span>
        </div>

        <div className="instructor-activity-meetings-toggle">
          <button
            type="button"
            className="instructor-meetings-toggle"
            aria-expanded={meetingsExpanded}
            onClick={() => setMeetingsExpanded((expanded) => !expanded)}
          >
            <span>
              {meetings.length}{" "}
              {meetings.length === 1 ? "encuentro" : "encuentros"}
            </span>
            {meetingsExpanded ? (
              <ChevronUp size={19} aria-hidden="true" />
            ) : (
              <ChevronDown size={19} aria-hidden="true" />
            )}
          </button>
        </div>

        {meetingsExpanded && (
          <div className="instructor-meetings-list">
            {meetings.length === 0 ? (
              <p className="instructor-meetings-empty">
                Todavía no hay encuentros programados.
              </p>
            ) : (
              meetings.map((meeting) => (
                <div
                  className="shared-meeting-card instructor-meeting-item"
                  key={meeting.id}
                >
                  <button
                    type="button"
                    className="instructor-meeting-summary-button"
                    aria-expanded={expandedMeetingId === meeting.id}
                    onClick={() =>
                      setExpandedMeetingId((current) =>
                        current === meeting.id ? null : meeting.id,
                      )
                    }
                  >
                    <span className="instructor-meeting-summary">
                      <span>
                        <CalendarDays size={16} aria-hidden="true" />
                        <span>
                          <strong>{formatDate(meeting.dateTime)}</strong>
                          {meeting.location || "Sin ubicación"}
                        </span>
                      </span>

                      <span
                        className={`instructor-meeting-status instructor-meeting-status--${String(
                          meeting.status || "scheduled",
                        ).toLowerCase()}`}
                      >
                        {meetingStatuses[meeting.status] ||
                          meeting.status ||
                          "Programado"}
                      </span>
                    </span>

                    {expandedMeetingId === meeting.id ? (
                      <ChevronUp size={19} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={19} aria-hidden="true" />
                    )}
                  </button>

                  {expandedMeetingId === meeting.id && (
                    <div className="instructor-meeting-details">
                      <AttendanceStatus meetingId={meeting.id} />

                      <button
                        className="dashboard-button dashboard-button--secondary instructor-view-attendance"
                        type="button"
                        onClick={() =>
                          navigate(
                            `/instructor/encuentros/${meeting.id}/asistencia`,
                            {
                              state: {
                                meeting,
                                activityId: activity.id,
                                activityName: activity.name,
                                enrollments: activity.enrollments || [],
                              },
                            },
                          )
                        }
                      >
                        Ver asistencia
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <div className="dashboard-activity-actions instructor-activity-actions">
          <button
            className="dashboard-button dashboard-button--secondary"
            type="button"
            onClick={() => onCreateMeeting(activity)}
          >
            Crear encuentro
          </button>
        </div>
      </div>
    </article>
  );
}
