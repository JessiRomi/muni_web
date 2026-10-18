import { useCallback, useEffect, useState } from "react";
import { LogOut, CalendarDays, UserRound, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import activitiesService from "../../services/activitiesService";
import SiteFooter from "../../components/layout/SiteFooter";
import "../role-pages.css";

const enrollmentStatus = {
  ACTIVE: "Inscripción activa",
  WITHDRAWN: "Inscripción retirada",
  DROPPED: "Baja por inasistencias",
};

export default function ParticipantDashboard() {
  const { user, logout } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await activitiesService.getMyEnrollments();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No pudimos cargar tus inscripciones. Intentá nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWithdraw = async (enrollment) => {
    const confirmed = window.confirm(
      `¿Querés retirarte de "${enrollment.activity?.name || "esta actividad"}"?`,
    );

    if (!confirmed) return;

    setWithdrawingId(enrollment.id);
    setError("");

    try {
      await activitiesService.withdraw(enrollment.activityId);
      await loadEnrollments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No pudimos retirar tu inscripción. Intentá nuevamente.",
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  return (
    <div className="participant-page">
      <main className="participant-main">
        <span className="participant-eyebrow">MI ESPACIO</span>
        <h1>¡Bienvenido!</h1>
        <p className="participant-description">
          Encontrá tus actividades y gestioná tus inscripciones.
        </p>

        <section className="participant-profile">
          <UserRound size={28} />
          <div>
            <h2>{user?.email || "Participante"}</h2>
            <p>Rol: PARTICIPANTE</p>
          </div>
        </section>

        <section className="participant-section">
          <span className="participant-eyebrow">MI ACTIVIDAD</span>
          <h2>Mis inscripciones</h2>

          {loading ? (
            <article className="participant-card">
              <CalendarDays size={26} />
              <div>
                <h3>Cargando inscripciones...</h3>
                <p>Estamos buscando tus actividades.</p>
              </div>
            </article>
          ) : error ? (
            <article className="participant-card">
              <div>
                <h3>No se pudieron cargar las inscripciones</h3>
                <p>{error}</p>
                <button type="button" onClick={loadEnrollments}>
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
                  Explorá las actividades disponibles y anotate en las que te
                  interesen.
                </p>
              </div>
            </article>
          ) : (
            <div className="participant-enrollments">
              {enrollments.map((enrollment) => (
                <article className="participant-card" key={enrollment.id}>
                  <CalendarDays size={26} />
                  <div>
                    <h3>
                      {enrollment.activity?.name ||
                        `Actividad #${enrollment.activityId}`}
                    </h3>
                    <p>
                      {enrollment.activity?.description ||
                        "Sin descripción disponible."}
                    </p>

                    <span>
                      {enrollmentStatus[enrollment.status] || enrollment.status}
                    </span>

                    {enrollment.status === "ACTIVE" && (
                      <button
                        className="participant-logout"
                        type="button"
                        onClick={() => handleWithdraw(enrollment)}
                        disabled={withdrawingId === enrollment.id}
                      >
                        {withdrawingId === enrollment.id
                          ? "Retirando..."
                          : "Retirarme"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <button className="participant-logout" type="button" onClick={logout}>
          <LogOut size={19} />
          Cerrar sesión
        </button>
      </main>

      <SiteFooter />
    </div>
  );
}
