import { CalendarDays } from "lucide-react";

export default function ActivityList({ activities, loading, error, onRetry }) {
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
      {activities.map((activity) => (
        <article className="dashboard-activity" key={activity.id}>
          <CalendarDays size={22} />
          <div>
            <h3>{activity.name || "Actividad sin nombre"}</h3>
            <p>{activity.description || "Sin descripción disponible."}</p>
            {activity.capacity != null && (
              <span>Capacidad: {activity.capacity}</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
