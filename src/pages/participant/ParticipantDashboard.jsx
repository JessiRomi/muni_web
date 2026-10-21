import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LogOut,
  CalendarDays,
  UserRound,
  RefreshCw,
  Compass,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import activitiesService from "../../services/activitiesService";
import attendanceService from "../../services/attendanceService";
import SiteFooter from "../../components/layout/SiteFooter";
import ActivityDetailModal from "../home/ActivityDetailModal";
import "../role-pages.css";

const enrollmentStatus = {
  ACTIVE: "Inscripción activa",
  WITHDRAWN: "Inscripción retirada",
  DROPPED: "Baja por inasistencias",
};

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(". ") : message || fallback;
}

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

function getSessionState(session, now) {
  if (!session) return "Sin sesión";

  if (session.status === "CLOSED") return "Cerrada";

  const start = new Date(session.startTime).getTime();
  const end = new Date(session.endTime).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "Horario inválido";
  }

  if (now < start) return "Programada";
  if (now > end) return "Vencida";

  return "Abierta";
}

function AttendanceMeeting({ meeting }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(Date.now());
  const [registered, setRegistered] = useState(false);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await attendanceService.getSessionByMeeting(meeting.id);
      setSession(data || null);
    } catch (err) {
      setError(
        getErrorMessage(err, "No se pudo consultar la sesión de asistencia."),
      );
    } finally {
      setLoading(false);
    }
  }, [meeting.id]);

  useEffect(() => {
    loadSession();

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15_000);

    return () => clearInterval(timer);
  }, [loadSession]);

  async function handleCheckIn() {
    if (!session || submitting || registered) return;

    if (!navigator.geolocation) {
      setError("Este navegador no admite geolocalización.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await attendanceService.checkIn(
            session.id,
            coords.latitude,
            coords.longitude,
          );

          setRegistered(true);
          setNotice("¡Tu asistencia se registró correctamente!");
        } catch (err) {
          setError(getErrorMessage(err, "No se pudo registrar la asistencia."));
        } finally {
          setSubmitting(false);
        }
      },
      (geoError) => {
        const messages = {
          1: "Necesitás permitir el acceso a tu ubicación para registrar asistencia.",
          2: "No se pudo determinar tu ubicación. Revisá el GPS o la conexión.",
          3: "La consulta de ubicación tardó demasiado. Intentá nuevamente.",
        };

        setError(messages[geoError.code] || "No se pudo obtener tu ubicación.");
        setSubmitting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0,
      },
    );
  }

  const state = getSessionState(session, now);
  const canCheckIn =
    session && state === "Abierta" && session.status === "OPEN" && !registered;

  return (
    <div className="participant-attendance">
      <p>
        <strong>Asistencia:</strong> {loading ? "Consultando..." : state}
      </p>

      {session && (
        <>
          <p>
            <strong>Inicio:</strong> {formatDate(session.startTime)}
          </p>
          <p>
            <strong>Fin:</strong> {formatDate(session.endTime)}
          </p>
        </>
      )}

      {!loading && !session && (
        <p>Todavía no hay una sesión de asistencia disponible.</p>
      )}

      {error && (
        <p className="participant-attendance-error" role="alert">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}

      {canCheckIn && (
        <button
          className="participant-action"
          type="button"
          onClick={handleCheckIn}
          disabled={submitting}
        >
          <MapPin size={16} />
          {submitting ? "Registrando..." : "Registrar asistencia"}
        </button>
      )}

      {registered && <p>Tu asistencia ya fue registrada en esta sesión.</p>}
    </div>
  );
}

export default function ParticipantDashboard() {
  const { user, logout } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState("");
  const [activitiesError, setActivitiesError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await activitiesService.getMyEnrollments();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "No pudimos cargar tus inscripciones. Intentá nuevamente.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setActivitiesLoading(true);
    setActivitiesError("");

    try {
      const data = await activitiesService.getPublic();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      setActivitiesError(
        getErrorMessage(
          err,
          "No pudimos cargar los talleres disponibles. Intentá nuevamente.",
        ),
      );
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([loadEnrollments(), loadActivities()]);
  }, [loadEnrollments, loadActivities]);

  async function handleWithdraw(enrollment) {
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
        getErrorMessage(
          err,
          "No pudimos retirar tu inscripción. Intentá nuevamente.",
        ),
      );
    } finally {
      setWithdrawingId(null);
    }
  }

  const enrolledActivityIds = useMemo(
    () =>
      new Set(
        enrollments
          .filter((enrollment) => enrollment.status === "ACTIVE")
          .map((enrollment) => String(enrollment.activityId)),
      ),
    [enrollments],
  );

  const availableActivities = useMemo(
    () =>
      activities.filter(
        (activity) =>
          activity.status === "ACTIVE" &&
          !enrolledActivityIds.has(String(activity.id)),
      ),
    [activities, enrolledActivityIds],
  );

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const handleModalClose = useCallback(() => {
    setSelectedActivity(null);
  }, []);

  const handleEnrollmentSuccess = useCallback(async () => {
    await refreshDashboard();
  }, [refreshDashboard]);

  const handleEnrollmentContinue = useCallback(() => {
    setSelectedActivity(null);
  }, []);

  return (
    <div className="participant-page">
      <main className="participant-main">
        <span className="participant-eyebrow">MI ESPACIO</span>
        <h1>¡Bienvenido!</h1>
        <p className="participant-description">
          Encontrá tus actividades, descubrí nuevos talleres y gestioná tus
          inscripciones desde un solo lugar.
        </p>

        <section className="participant-profile">
          <UserRound size={28} />
          <div>
            <h2>{user?.email || "Participante"}</h2>
            <p>Rol: PARTICIPANTE</p>
          </div>
        </section>

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
              disabled={loading || activitiesLoading}
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
                  Explorá los talleres disponibles más abajo y anotate en los
                  que te interesen.
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
                          {enrollmentStatus[enrollment.status] ||
                            enrollment.status}
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
                                    {nextMeeting.location ||
                                      "Lugar a confirmar"}
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
                              <summary>
                                Consultar encuentros y asistencia
                              </summary>

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

                                    <AttendanceMeeting meeting={meeting} />
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

        <section className="participant-section participant-discover">
          <span className="participant-eyebrow">NUEVAS PROPUESTAS</span>
          <h2>Descubrí más talleres</h2>
          <p className="participant-discover-description">
            Encontrá actividades que te interesen y conocé sus detalles antes de
            inscribirte.
          </p>

          {activitiesLoading ? (
            <article className="participant-card">
              <Compass size={26} />
              <div>
                <h3>Cargando talleres...</h3>
                <p>Estamos buscando las propuestas disponibles.</p>
              </div>
            </article>
          ) : activitiesError ? (
            <article className="participant-card">
              <div>
                <h3>No se pudieron cargar los talleres</h3>
                <p>{activitiesError}</p>
                <button
                  className="participant-action"
                  type="button"
                  onClick={loadActivities}
                >
                  <RefreshCw size={16} />
                  Reintentar
                </button>
              </div>
            </article>
          ) : availableActivities.length === 0 ? (
            <article className="participant-card">
              <Compass size={26} />
              <div>
                <h3>No hay nuevos talleres disponibles</h3>
                <p>
                  Por el momento no hay otras actividades activas para
                  descubrir. Volvé a consultar más adelante.
                </p>
              </div>
            </article>
          ) : (
            <div className="participant-catalog">
              {availableActivities.map((activity) => (
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
                        "Conocé esta propuesta de la comunidad."}
                    </p>
                    <button
                      className="participant-action"
                      type="button"
                      onClick={() => setSelectedActivity(activity)}
                    >
                      Ver detalles e inscribirme
                    </button>
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

      <ActivityDetailModal
        activity={selectedActivity}
        onClose={handleModalClose}
        onContinue={handleEnrollmentContinue}
        onEnrolled={handleEnrollmentSuccess}
        isAuthenticated={true}
        user={user}
      />
    </div>
  );
}
