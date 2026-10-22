import { CalendarDays, Compass } from "lucide-react";

export default function ParticipantSummary({
  loading,
  error,
  activeEnrollmentsCount,
  activitiesLoading,
  activitiesError,
  availableActivitiesCount,
  attendanceHistoryLoading,
  attendanceHistoryError,
  attendanceSummary,
}) {
  return (
    <section
      className="participant-section"
      aria-labelledby="participant-summary-title"
    >
      <div className="participant-section-heading">
        <div>
          <span className="participant-eyebrow">RESUMEN PERSONAL</span>
          <h2 id="participant-summary-title">Mi actividad</h2>
        </div>
      </div>

      <div className="participant-enrollments">
        <article className="participant-card">
          <CalendarDays size={26} aria-hidden="true" />
          <div>
            <h3>Mis inscripciones activas</h3>
            <p>
              {loading
                ? "Consultando..."
                : error
                  ? "No disponible"
                  : activeEnrollmentsCount}
            </p>
          </div>
        </article>

        <article className="participant-card">
          <Compass size={26} aria-hidden="true" />
          <div>
            <h3>Talleres disponibles</h3>
            <p>
              {activitiesLoading
                ? "Consultando..."
                : activitiesError
                  ? "No disponible"
                  : availableActivitiesCount}
            </p>
          </div>
        </article>

        <article className="participant-card">
          <CalendarDays size={26} aria-hidden="true" />
          <div>
            <h3>Asistencias registradas</h3>
            <p>
              {attendanceHistoryLoading
                ? "Consultando..."
                : attendanceHistoryError
                  ? "No disponible"
                  : attendanceSummary.present}
            </p>
            <span>Presentes</span>
          </div>
        </article>

        <article className="participant-card">
          <CalendarDays size={26} aria-hidden="true" />
          <div>
            <h3>Ausencias registradas</h3>
            <p>
              {attendanceHistoryLoading
                ? "Consultando..."
                : attendanceHistoryError
                  ? "No disponible"
                  : attendanceSummary.absent}
            </p>
            <span>Ausencias confirmadas en el historial</span>
          </div>
        </article>
      </div>
    </section>
  );
}
