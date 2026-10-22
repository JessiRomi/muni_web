import { CalendarDays, Compass, RefreshCw } from "lucide-react";
import { formatDate } from "../participantUtils";

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
    return {
      label: "Fechas de inscripción no disponibles",
      canEnroll: false,
      buttonLabel: "Fechas no disponibles",
    };
  }

  if (now < start) {
    return {
      label: "Las inscripciones todavía no comenzaron",
      canEnroll: false,
      buttonLabel: "Inscripciones próximamente",
    };
  }

  if (now > end) {
    return {
      label: "Inscripción vencida",
      canEnroll: false,
      buttonLabel: "Inscripciones cerradas",
    };
  }

  return {
    label: "Inscripción abierta",
    canEnroll: true,
    buttonLabel: "Ver detalles e inscribirme",
  };
}

export default function ActivityCatalog({
  activities,
  loading,
  error,
  onRetry,
  onSelectActivity,
}) {
  return (
    <section className="participant-section participant-discover">
      <span className="participant-eyebrow">NUEVAS PROPUESTAS</span>
      <h2>Descubrá más talleres</h2>
      <p className="participant-discover-description">
        Encontrá actividades que te interesen y conoce sus detalles antes de
        inscribirte.
      </p>

      {loading ? (
        <article className="participant-card">
          <Compass size={26} />
          <div>
            <h3>Cargando talleres...</h3>
            <p>Estamos buscando las propuestas disponibles.</p>
          </div>
        </article>
      ) : error ? (
        <article className="participant-card">
          <div>
            <h3>No se pudieron cargar los talleres</h3>
            <p>{error}</p>
            <button
              className="participant-action"
              type="button"
              onClick={onRetry}
            >
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        </article>
      ) : activities.length === 0 ? (
        <article className="participant-card">
          <Compass size={26} />
          <div>
            <h3>No hay nuevos talleres disponibles</h3>
            <p>
              Por el momento no hay otras actividades activas para descubrir.
              Volvé a consultar más adelante.
            </p>
          </div>
        </article>
      ) : (
        <div className="participant-catalog">
          {activities.map((activity) => {
            const state = getEnrollmentState(activity);

            return (
              <article className="participant-catalog-card" key={activity.id}>
                <div className="participant-catalog-icon">
                  <CalendarDays size={24} />
                </div>

                <div className="participant-catalog-content">
                  <span className="participant-catalog-label">
                    TALLER DISPONIBLE
                  </span>

                  <h3>{activity.name || "Actividad sin nombre"}</h3>

                  <p>
                    {activity.description ||
                      "Conoce esta propuesta de la comunidad."}
                  </p>

                  <p>
                    <strong>Inicio de inscripción:</strong>{" "}
                    {formatDate(activity.enrollmentStart)}
                  </p>

                  <p>
                    <strong>Fin de inscripción:</strong>{" "}
                    {formatDate(activity.enrollmentEnd)}
                  </p>

                  <p>{state.label}</p>

                  <button
                    className="participant-action"
                    type="button"
                    onClick={() => onSelectActivity(activity)}
                    disabled={!state.canEnroll}
                  >
                    {state.buttonLabel}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
