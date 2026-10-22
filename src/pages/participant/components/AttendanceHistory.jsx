import { CalendarDays, RefreshCw } from "lucide-react";
import { formatDate } from "../participantUtils";

export default function AttendanceHistory({
  records,
  loading,
  error,
  onRefresh,
}) {
  return (
    <section
      className="participant-section participant-history"
      aria-labelledby="participant-history-title"
    >
      <div className="participant-section-heading">
        <div>
          <span className="participant-eyebrow">MIS REGISTROS</span>
          <h2 id="participant-history-title">Historial de asistencia</h2>
        </div>

        <button
          className="participant-refresh"
          type="button"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Actualizando..." : "Actualizar historial"}
        </button>
      </div>

      {loading ? (
        <p role="status">Cargando tu historial de asistencia...</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <button
            className="participant-action"
            type="button"
            onClick={onRefresh}
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      ) : records.length === 0 ? (
        <article className="participant-card">
          <CalendarDays size={24} aria-hidden="true" />
          <div>
            <h3>Todavía no hay asistencias registradas</h3>
            <p>
              Cuando se registre una asistencia o se procese una ausencia,
              aparecerá en esta sección.
            </p>
          </div>
        </article>
      ) : (
        <div className="participant-history-list">
          {records.map((record, index) => {
            const isPresent = record.status === "PRESENT";
            const isAbsent = record.status === "ABSENT";

            const statusLabel = isPresent
              ? "Presente"
              : isAbsent
                ? "Ausente"
                : record.status || "Estado no disponible";

            return (
              <article
                className="participant-history-item"
                key={
                  record.id ?? `${record.sessionId}-${record.status}-${index}`
                }
              >
                <div className="participant-history-item-main">
                  <h3>{record.activityName}</h3>

                  <p>
                    <strong>Fecha del encuentro:</strong>{" "}
                    {formatDate(record.meetingDate)}
                  </p>

                  {record.meetingLocation && (
                    <p>
                      <strong>Lugar:</strong> {record.meetingLocation}
                    </p>
                  )}

                  {isPresent && record.checkInTime && (
                    <p>
                      <strong>Registro de asistencia:</strong>{" "}
                      {formatDate(record.checkInTime)}
                    </p>
                  )}

                  {isAbsent && (
                    <p>Ausencia registrada al cierre de la sesión.</p>
                  )}
                </div>

                <span
                  className={`participant-status ${
                    isPresent
                      ? "participant-status--active"
                      : isAbsent
                        ? "participant-status--absent"
                        : ""
                  }`}
                >
                  {statusLabel}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
