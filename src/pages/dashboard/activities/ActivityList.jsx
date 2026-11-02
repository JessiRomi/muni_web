
import { CalendarDays, RefreshCw } from "lucide-react";
import ActivityCard from "../../instructor/ActivityCard";

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
  onCreateMeeting,
  onEditMeeting,
}) {
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

  return (
    <div className="dashboard-activities-list">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          role={isAdmin ? "ADMINISTRADOR" : "INSTRUCTOR"}
          onCreateMeeting={onCreateMeeting}
          onEditMeeting={onEditMeeting}
          onEdit={onEdit}
          onDelete={onDelete}
          onFinish={onFinish}
          onReactivate={onReactivate}
          deletingId={deletingId}
          finishingId={finishingId}
          reactivatingId={reactivatingId}
        />
      ))}
    </div>
  );
}
