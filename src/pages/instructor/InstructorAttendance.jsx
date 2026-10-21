import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  RefreshCw,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import attendanceService from "../../services/attendanceService";
import "./InstructorAttendance.css";

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

function getSessionState(session) {
  if (!session) return "Sin sesión";
  if (session.status === "CLOSED") return "Cerrada";

  const now = Date.now();
  const start = new Date(session.startTime).getTime();
  const end = new Date(session.endTime).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "Horario inválido";
  }

  if (now < start) return "Programada";
  if (now > end) return "Vencida";

  return "Abierta";
}

function getAttendanceLabel(status, session) {
  if (status === "PRESENT") return "Presente";
  if (status === "ABSENT") return "Ausente";

  if (session?.absencesProcessed) {
    return "Sin registro";
  }

  return "Pendiente";
}

export default function InstructorAttendance() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const meeting = location.state?.meeting;
  const activityName = location.state?.activityName;

  const enrollments = useMemo(
    () =>
      Array.isArray(location.state?.enrollments)
        ? location.state.enrollments.filter(
            (enrollment) => enrollment.status === "ACTIVE",
          )
        : [],
    [location.state?.enrollments],
  );

  const [session, setSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendanceError, setAttendanceError] = useState("");

  const hasLoadedRef = useRef(false);
  const sessionIdRef = useRef(null);

  const loadSession = useCallback(async () => {
    const isInitialLoad = !hasLoadedRef.current;

    if (isInitialLoad) {
      setLoading(true);
      setError("");
    } else {
      setAttendanceLoading(true);
      setAttendanceError("");
    }

    try {
      const data = await attendanceService.getSessionByMeeting(meetingId);
      const currentSession = data || null;

      if (!currentSession?.id) {
        setSession(null);
        setAttendanceRecords([]);
        sessionIdRef.current = null;
        hasLoadedRef.current = true;
        return;
      }

      const sessionChanged =
        sessionIdRef.current !== null &&
        Number(sessionIdRef.current) !== Number(currentSession.id);

      if (sessionChanged) {
        setAttendanceRecords([]);
      }

      setSession(currentSession);
      sessionIdRef.current = currentSession.id;
      hasLoadedRef.current = true;
      setError("");

      if (enrollments.length === 0) {
        setAttendanceRecords([]);
        return;
      }

      const previousRecords = sessionChanged ? [] : attendanceRecords;

      const results = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            const history = await attendanceService.getHistory(
              enrollment.participantId,
            );

            const records = Array.isArray(history) ? history : [];

            const record = records.find(
              (item) => Number(item.sessionId) === Number(currentSession.id),
            );

            return {
              participantId: enrollment.participantId,
              status: record?.status || null,
              checkInTime: record?.checkInTime || null,
              error: false,
            };
          } catch {
            const previousRecord = previousRecords.find(
              (item) =>
                Number(item.participantId) === Number(enrollment.participantId),
            );

            return previousRecord
              ? { ...previousRecord, error: true }
              : {
                  participantId: enrollment.participantId,
                  status: null,
                  checkInTime: null,
                  error: true,
                };
          }
        }),
      );

      setAttendanceRecords(results);

      if (results.some((record) => record.error)) {
        setAttendanceError(
          "No se pudieron actualizar todos los historiales. Se conservan los últimos datos disponibles cuando los había.",
        );
      } else {
        setAttendanceError("");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "No se pudo consultar la sesión de asistencia.";

      if (isInitialLoad) {
        setError(message);
      } else {
        setAttendanceError(
          `No se pudo actualizar la información. Se conservan los datos anteriores. ${message}`,
        );
      }
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
      setAttendanceLoading(false);
    }
  }, [meetingId, enrollments]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const sessionState = getSessionState(session);

  const presentCount = attendanceRecords.filter(
    (record) => record.status === "PRESENT",
  ).length;

  const absentCount = attendanceRecords.filter(
    (record) => record.status === "ABSENT",
  ).length;

  return (
    <main className="instructor-attendance-page">
      <button
        className="instructor-attendance-back"
        type="button"
        onClick={() => navigate("/instructor")}
      >
        <ArrowLeft size={18} />
        Volver a mis actividades
      </button>

      <header className="instructor-attendance-header">
        <span className="instructor-eyebrow">ESPACIO DOCENTE</span>
        <h1>Asistencia del encuentro</h1>
        <p>Consultá el estado de la sesión y los registros de asistencia.</p>
      </header>

      <section className="instructor-attendance-card">
        <div className="instructor-attendance-title">
          <CalendarDays size={26} />
          <div>
            <h2>{activityName || "Encuentro"}</h2>
            <p>Encuentro #{meetingId}</p>
          </div>
        </div>

        {meeting && (
          <div className="instructor-attendance-meta">
            <p>
              <CalendarDays size={17} />
              {formatDate(meeting.dateTime)}
            </p>
            <p>
              <MapPin size={17} />
              {meeting.location || "Ubicación no disponible"}
            </p>
          </div>
        )}

        <div className="instructor-attendance-session">
          <div>
            <span className="instructor-attendance-label">
              Estado de la sesión
            </span>
            <strong>{loading ? "Consultando..." : sessionState}</strong>
          </div>

          {session && (
            <div>
              <span className="instructor-attendance-label">
                Horario de la sesión
              </span>
              <strong>
                {formatDate(session.startTime)} – {formatDate(session.endTime)}
              </strong>
            </div>
          )}
        </div>

        {error && (
          <p className="instructor-attendance-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && !session && (
          <div className="instructor-attendance-empty">
            <CalendarDays size={28} />
            <h3>Todavía no hay una sesión</h3>
            <p>
              Cuando se abra la asistencia para este encuentro, su estado
              aparecerá aquí.
            </p>
          </div>
        )}

        {session && (
          <div className="instructor-attendance-summary">
            <div>
              <span>Presentes</span>
              <strong>{presentCount}</strong>
            </div>
            <div>
              <span>Ausentes</span>
              <strong>{absentCount}</strong>
            </div>
          </div>
        )}

        <div className="instructor-attendance-roster">
          <div className="instructor-attendance-roster-title">
            <Users size={21} />
            <h3>Participantes y asistencia</h3>
          </div>

          <p>Participantes con inscripción activa en esta actividad.</p>

          {enrollments.length === 0 ? (
            <div className="instructor-attendance-empty">
              <Users size={28} />
              <h3>No hay inscripciones activas disponibles</h3>
              <p>
                No se recibieron inscripciones activas para esta actividad.
                Volvé al panel y abrí el encuentro desde la tarjeta de la
                actividad.
              </p>
            </div>
          ) : (
            <div className="instructor-attendance-table-wrapper">
              <table className="instructor-attendance-table">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Inscripción</th>
                    <th>Asistencia</th>
                    <th>Hora de registro</th>
                  </tr>
                </thead>

                <tbody>
                  {enrollments.map((enrollment) => {
                    const record = attendanceRecords.find(
                      (item) =>
                        Number(item.participantId) ===
                        Number(enrollment.participantId),
                    );

                    return (
                      <tr key={enrollment.id}>
                        <td>Participante #{enrollment.participantId}</td>
                        <td>Activa</td>
                        <td>
                          {loading || attendanceLoading
                            ? record
                              ? getAttendanceLabel(record.status, session)
                              : "Consultando..."
                            : record?.error
                              ? "No disponible"
                              : getAttendanceLabel(record?.status, session)}
                        </td>
                        <td>
                          {record?.checkInTime
                            ? formatDate(record.checkInTime)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {attendanceError && (
            <p className="instructor-attendance-error" role="alert">
              {attendanceError}
            </p>
          )}

          <p className="instructor-attendance-note">
            Los totales se calculan con los registros encontrados en los
            historiales consultados. Una inscripción activa no confirma la
            presencia. Las ausencias deben estar registradas en el sistema para
            contarse como ausentes.
          </p>
        </div>

        <button
          className="instructor-attendance-refresh"
          type="button"
          onClick={loadSession}
          disabled={loading || attendanceLoading}
        >
          <RefreshCw
            size={17}
            className={attendanceLoading ? "attendance-refresh-icon" : ""}
          />
          {attendanceLoading
            ? "Actualizando..."
            : loading
              ? "Cargando..."
              : "Actualizar estado"}
        </button>
      </section>
    </main>
  );
}
