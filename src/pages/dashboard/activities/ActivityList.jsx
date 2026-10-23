import {
  CalendarDays,
  Clock3,
  Users,
  Pencil,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
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
  if (activity.status === "FINISHED") {
    return {
      label: "Inscripciones cerradas",
      className: "activity-enrollment-status--expired",
    };
  }

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

export default function ActivityList({
  activities,
  loading,
  error,
  onRetry,
  isAdmin = false,
  deletingId = null,
  finishingId = null,
  reactivatingId = null,
  onEdit,
  onDelete,
  onFinish,
  onReactivate,
}) {
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

  const hasPendingAction =
    deletingId !== null || finishingId !== null || reactivatingId !== null;

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

        const isFinished = activity.status === "FINISHED";

        const isProcessing =
          deletingId === activity.id ||
          finishingId === activity.id ||
          reactivatingId === activity.id;

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

              <span
                className={`activity-enrollment-status ${
                  isFinished
                    ? "activity-enrollment-status--expired"
                    : "activity-enrollment-status--open"
                }`}
              >
                {isFinished ? "Actividad finalizada" : "Actividad activa"}
              </span>

              {isAdmin && (
                <div className="dashboard-activity-actions">
                  {!isFinished && (
                    <>
                      <button
                        className="dashboard-logout"
                        type="button"
                        onClick={() => onEdit?.(activity)}
                        disabled={hasPendingAction}
                        aria-label={`Editar ${activity.name}`}
                      >
                        <Pencil size={16} />
                        Editar
                      </button>

                      <button
                        className="dashboard-logout"
                        type="button"
                        onClick={() => onFinish?.(activity)}
                        disabled={hasPendingAction}
                        aria-label={`Finalizar ${activity.name}`}
                      >
                        <CheckCircle2 size={16} />
                        {finishingId === activity.id
                          ? "Finalizando..."
                          : "Finalizar"}
                      </button>
                    </>
                  )}

                  {isFinished && (
                    <button
                      className="dashboard-logout"
                      type="button"
                      onClick={() => onReactivate?.(activity)}
                      disabled={hasPendingAction}
                      aria-label={`Reactivar ${activity.name}`}
                    >
                      <RotateCcw size={16} />
                      {reactivatingId === activity.id
                        ? "Reactivando..."
                        : "Reactivar"}
                    </button>
                  )}

                  <button
                    className="dashboard-logout"
                    type="button"
                    onClick={() => onDelete?.(activity)}
                    disabled={hasPendingAction || isProcessing}
                    aria-label={`Eliminar ${activity.name}`}
                  >
                    <Trash2 size={16} />
                    {deletingId === activity.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
