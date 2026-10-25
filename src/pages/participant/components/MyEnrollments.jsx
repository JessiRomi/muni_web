import { useState } from "react";
import {
  CalendarDays,
  RefreshCw,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AttendanceMeeting from "./AttendanceMeeting";
import { formatDate } from "../participantUtils";
import { getActivityVisual } from "../../../utils/activityVisuals";
import "../../../styles/dashboard-section-heading.css";
import "../../../styles/meeting-cards.css";

const meetingStatuses = {
  SCHEDULED: "Programado",
  ACTIVE: "Activo",
  OPEN: "Abierto",
  CLOSED: "Cerrado",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

export default function MyEnrollments({
  enrollments,
  loading,
  error,
  user,
  attendanceHistory,
  refreshDashboard,
  loadEnrollments,
  loadAttendanceHistory,
  withdrawingId,
  handleWithdraw,
}) {
  const [expandedMeetingIds, setExpandedMeetingIds] = useState([]);
  return (
    <section className="participant-section">
      <div className="dashboard-activities-heading">
        <div>
          <span className="dashboard-eyebrow">MI ACTIVIDAD</span>
          <h2>Mis inscripciones</h2>
        </div>

        <div className="dashboard-activities-header-actions">
          <button
            className="dashboard-button dashboard-button--secondary"
            type="button"
            onClick={refreshDashboard}
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

      {loading ? (
        <article className="participant-card">
          <CalendarDays size={26} />
          <div>
            <h3>Cargando inscripciones...</h3>
            <p>Estamos buscando tus actividades.</p>
          </div>
        </article>
      ) : error ? (
        <article className="participant-card" role="alert">
          <div>
            <h3>No se pudieron cargar las inscripciones</h3>
            <p>{error}</p>
            <button
              className="participant-action"
              type="button"
              onClick={loadEnrollments}
            >
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        </article>
      ) : enrollments.length === 0 ? (
        <article className="participant-card">
          <CalendarDays size={26} />
          <div>
            <h3>Todavía no tenés inscripciones</h3>
            <p>
              Explorá los talleres disponibles más abajo y anotate en los que te
              interesen.
            </p>
          </div>
        </article>
      ) : (
        <div className="participant-enrollments">
          {enrollments.map((enrollment) => {
            const activity = enrollment.activity || {};
            const visual = getActivityVisual(activity);
            const meetings = Array.isArray(enrollment.activity?.meetings)
              ? enrollment.activity.meetings
              : [];
            console.table(
              meetings.map((meeting) => ({
                id: meeting.id,
                dateTime: meeting.dateTime,
                location: meeting.location,
                status: meeting.status,
              })),
            );

            const now = Date.now();

            const nextMeeting = meetings
              .filter((meeting) => {
                const meetingDate = new Date(meeting.dateTime).getTime();
                return Number.isFinite(meetingDate) && meetingDate >= now;
              })
              .sort(
                (a, b) =>
                  new Date(a.dateTime).getTime() -
                  new Date(b.dateTime).getTime(),
              )[0];

            const isActive = enrollment.status === "ACTIVE";

            const enrollmentStatus = {
              ACTIVE: "Inscripción activa",
              WITHDRAWN: "Inscripción retirada",
              DROPPED: "Baja por inasistencias",
            };

            return (
              <article
                className="dashboard-activity participant-activity-card"
                key={enrollment.id}
              >
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
                      isActive ? "is-active" : "is-finished"
                    }`}
                  >
                    {isActive ? "Inscripción activa" : "Inscripción finalizada"}
                  </span>
                </div>

                <div className="dashboard-activity-content participant-activity-content">
                  <span className="dashboard-activity-category">
                    <span className="dashboard-activity-category-icon">
                      <CalendarDays size={15} aria-hidden="true" />
                    </span>
                    {visual.label}
                  </span>

                  <div className="participant-activity-heading">
                    <h3>
                      {enrollment.activity?.name ||
                        `Actividad #${enrollment.activityId}`}
                    </h3>
                  </div>

                  <p className="participant-activity-description">
                    {enrollment.activity?.description ||
                      "Disfrutá de esta propuesta de la comunidad."}
                  </p>

                  {isActive && (
                    <>
                      <div className="participant-next-meeting">
                        <CalendarDays size={19} aria-hidden="true" />

                        <div>
                          <strong>
                            {nextMeeting
                              ? "Próximo encuentro"
                              : "Sin próximos encuentros"}
                          </strong>

                          {nextMeeting ? (
                            <>
                              <p>{formatDate(nextMeeting.dateTime)}</p>
                              <p className="participant-meeting-location">
                                <MapPin size={15} aria-hidden="true" />
                                {nextMeeting.location || "Lugar a confirmar"}
                              </p>
                            </>
                          ) : (
                            <p>
                              Todavía no hay encuentros futuros programados.
                            </p>
                          )}
                        </div>
                      </div>

                      {meetings.length > 0 && (
                        <details className="participant-attendance-details">
                          <summary>Consultar encuentros y asistencia</summary>

                          <div className="shared-meeting-list participant-meetings">
                            {meetings.map((meeting) => (
                              <div
                                className="shared-meeting-card participant-meeting"
                                key={meeting.id}
                              >
                                <button
                                  type="button"
                                  className="shared-meeting-summary participant-meeting-summary"
                                  aria-expanded={expandedMeetingIds.includes(
                                    meeting.id,
                                  )}
                                  onClick={() =>
                                    setExpandedMeetingIds((current) =>
                                      current.includes(meeting.id)
                                        ? current.filter(
                                            (id) => id !== meeting.id,
                                          )
                                        : [...current, meeting.id],
                                    )
                                  }
                                >
                                  <span className="shared-meeting-info">
                                    <CalendarDays
                                      size={18}
                                      aria-hidden="true"
                                    />

                                    <span className="shared-meeting-info-text">
                                      <strong>
                                        {formatDate(meeting.dateTime)}
                                      </strong>
                                      <span>
                                        {meeting.location ||
                                          "Lugar a confirmar"}
                                      </span>
                                    </span>
                                  </span>

                                  <span
                                    className={`shared-meeting-status shared-meeting-status--${String(
                                      meeting.status || "scheduled",
                                    ).toLowerCase()}`}
                                  >
                                    {meetingStatuses[meeting.status] ||
                                      meeting.status ||
                                      "Programado"}
                                  </span>

                                  {expandedMeetingIds.includes(meeting.id) ? (
                                    <ChevronUp size={19} aria-hidden="true" />
                                  ) : (
                                    <ChevronDown size={19} aria-hidden="true" />
                                  )}
                                </button>

                                {expandedMeetingIds.includes(meeting.id) && (
                                  <div className="shared-meeting-details">
                                    <AttendanceMeeting
                                      meeting={meeting}
                                      participantId={user?.id}
                                      attendanceHistory={attendanceHistory}
                                      onAttendanceUpdated={
                                        loadAttendanceHistory
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                      <button
                        className="participant-withdraw-button"
                        type="button"
                        onClick={() => handleWithdraw(enrollment)}
                        disabled={withdrawingId === enrollment.id}
                      >
                        {withdrawingId === enrollment.id
                          ? "Cancelando inscripción..."
                          : "Cancelar inscripción"}
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
