import { CalendarDays, Clock3, Users } from "lucide-react";
import { useEffect, useState } from "react";

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
    return {
      label: "Fechas no disponibles",
      className: "activity-enrollment-status--unknown",
    };
  }

  if (now < start) {
    return {
      label: "Inscripción pendiente",
      className: "activity-enrollment-status--pending",
    };
  }

  if (now > end) {
    return {
      label: "Inscripción vencida",
      className: "activity-enrollment-status--expired",
    };
  }

  return {
    label: "Inscripción abierta",
    className: "activity-enrollment-status--open",
  };
}

export default function ActivityList({ activities, loading, error, onRetry }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(Date.now());
    }, 0);

    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return <p>Cargando actividades...</p>;
  }

  if (error) {
    return (
      <div role="alert">
        <p>{error}</p>
        <button className="dashboard-logout" type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return <p>Todavía no hay actividades registradas.</p>;
  }
  return (
    <div className="dashboard-activities-list">
      {activities.map((activity) => {
        const enrollmentState =
          now === null
            ? {
                label: "Calculando estado...",
                className: "activity-enrollment-status--unknown",
              }
            : getEnrollmentState(activity, now);

        return (
          <article className="dashboard-activity" key={activity.id}>
            <CalendarDays size={22} aria-hidden="true" />

            <div>
              <h3>{activity.name || "Actividad sin nombre"}</h3>

              <p>{activity.description || "Sin descripción disponible."}</p>

              {activity.capacity != null && (
                <p className="dashboard-activity-detail">
                  <Users size={15} aria-hidden="true" />
                  Capacidad: {activity.capacity}
                </p>
              )}

              <p className="dashboard-activity-detail">
                <Clock3 size={15} aria-hidden="true" />
                Inicio de inscripción: {formatDate(activity.enrollmentStart)}
              </p>

              <p className="dashboard-activity-detail">
                <Clock3 size={15} aria-hidden="true" />
                Fin de inscripción: {formatDate(activity.enrollmentEnd)}
              </p>

              <span
                className={`activity-enrollment-status ${enrollmentState.className}`}
              >
                {enrollmentState.label}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
