import { CalendarDays, RefreshCw, MapPin } from "lucide-react";
import AttendanceMeeting from "./AttendanceMeeting";
import { formatDate } from "../participantUtils";

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
  return (
    <section className="participant-section">
      <div className="participant-section-heading">
        <div>
          <span className="participant-eyebrow">MI ACTIVIDAD</span>
          <h2>Mis inscripciones</h2>
        </div>

        <button
          className="participant-refresh"
          type="button"
          onClick={refreshDashboard}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
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
            const meetings = Array.isArray(enrollment.activity?.meetings)
              ? enrollment.activity.meetings
              : [];

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
                className="participant-activity-card"
                key={enrollment.id}
              >
                <div className="participant-activity-icon">
                  <CalendarDays size={25} aria-hidden="true" />
                </div>

                <div className="participant-activity-content">
                  <div className="participant-activity-heading">
                    <div>
                      <span className="participant-activity-label">
                        MI ACTIVIDAD
                      </span>

                      <h3>
                        {enrollment.activity?.name ||
                          `Actividad #${enrollment.activityId}`}
                      </h3>
                    </div>

                    <span
                      className={`participant-status ${
                        isActive ? "participant-status--active" : ""
                      }`}
                    >
                      {enrollmentStatus[enrollment.status] || enrollment.status}
                    </span>
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

                          <div className="participant-meetings">
                            {meetings.map((meeting) => (
                              <div
                                className="participant-meeting"
                                key={meeting.id}
                              >
                                <p>
                                  <strong>Fecha:</strong>{" "}
                                  {formatDate(meeting.dateTime)}
                                </p>

                                <p>
                                  <strong>Lugar:</strong>{" "}
                                  {meeting.location || "Lugar a confirmar"}
                                </p>

                                <AttendanceMeeting
                                  meeting={meeting}
                                  participantId={user?.id}
                                  attendanceHistory={attendanceHistory}
                                  onAttendanceUpdated={loadAttendanceHistory}
                                />
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
