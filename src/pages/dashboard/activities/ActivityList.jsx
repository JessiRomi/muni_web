import {
  CalendarDays,
  Clock3,
  Users,
  Pencil,
  Trash2,
  CheckCircle2,
  RotateCcw,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getActivityVisual } from "../../../utils/activityVisuals";

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
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-list-message" role="status">
        <RefreshCw className="dashboard-icon-spinning" size={19} />
        <span>Cargando actividades...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="dashboard-list-message dashboard-list-message--error"
        role="alert"
      >
        <p>{error}</p>
        <button
          className="dashboard-button dashboard-button--secondary"
          type="button"
          onClick={onRetry}
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="dashboard-list-message dashboard-list-message--empty">
        <CalendarDays size={28} />
        <h3>Todavía no hay actividades</h3>
        <p>Cuando se registren actividades, aparecerán en esta sección.</p>
      </div>
    );
  }

  const hasPendingAction =
    deletingId !== null || finishingId !== null || reactivatingId !== null;

  return (
    <div className="dashboard-activities-list">
      {activities.map((activity) => {
        const visual = getActivityVisual(activity);

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

              {activity.capacity != null && (
                <p className="dashboard-activity-detail">
                  <Users size={16} aria-hidden="true" />
                  <span>Capacidad: {activity.capacity}</span>
                </p>
              )}

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
                  className={`activity-enrollment-status ${enrollmentState.className}`}
                >
                  {enrollmentState.label}
                </span>
              </div>

              {isAdmin && (
                <div className="dashboard-activity-actions">
                  {!isFinished && (
                    <>
                      <button
                        className="dashboard-button dashboard-button--secondary"
                        type="button"
                        onClick={() => onEdit?.(activity)}
                        disabled={hasPendingAction}
                        aria-label={`Editar ${activity.name}`}
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      <button
                        className="dashboard-button dashboard-button--success"
                        type="button"
                        onClick={() => onFinish?.(activity)}
                        disabled={hasPendingAction}
                        aria-label={`Finalizar ${activity.name}`}
                      >
                        <CheckCircle2 size={15} />
                        {finishingId === activity.id
                          ? "Finalizando..."
                          : "Finalizar"}
                      </button>
                    </>
                  )}

                  {isFinished && (
                    <button
                      className="dashboard-button dashboard-button--success"
                      type="button"
                      onClick={() => onReactivate?.(activity)}
                      disabled={hasPendingAction}
                      aria-label={`Reactivar ${activity.name}`}
                    >
                      <RotateCcw size={15} />
                      {reactivatingId === activity.id
                        ? "Reactivando..."
                        : "Reactivar"}
                    </button>
                  )}

                  <button
                    className="dashboard-button dashboard-button--danger"
                    type="button"
                    onClick={() => onDelete?.(activity)}
                    disabled={hasPendingAction || isProcessing}
                    aria-label={`Eliminar ${activity.name}`}
                  >
                    <Trash2 size={15} />
                    {deletingId === activity.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              )}

              <button
                className="dashboard-activity-more"
                type="button"
                onClick={() => isAdmin && onEdit?.(activity)}
                aria-label={`Ver actividad: ${activity.name}`}
                disabled={!isAdmin}
              >
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
