import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  RefreshCw,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import attendanceService from "../../services/attendanceService";
import activitiesService from "../../services/activitiesService";
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
    return "Ausente";
  }

  return "Pendiente";
}

export default function InstructorAttendance() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const meeting = location.state?.meeting;
  const activityName = location.state?.activityName;
  const activityId = location.state?.activityId;

  const [session, setSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeEnrollments, setActiveEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendanceError, setAttendanceError] = useState("");
  const [processingAbsences, setProcessingAbsences] = useState(false);
  const [absenceNotice, setAbsenceNotice] = useState("");
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
      const enrollmentsData = activityId
        ? await activitiesService.getActiveEnrollments(activityId)
        : [];

      const currentEnrollments = Array.isArray(enrollmentsData)
        ? enrollmentsData.filter((enrollment) => enrollment.status === "ACTIVE")
        : [];

      setActiveEnrollments(currentEnrollments);

      const data = await attendanceService.getSessionByMeeting(meetingId);
      const currentSession = data || null;

      if (!currentSession?.id) {
        setSession(null);
        setAttendanceRecords([]);
        sessionIdRef.current = null;
        setAttendanceError("");
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
      setError("");

      if (currentEnrollments.length === 0) {
        setAttendanceRecords([]);
        setAttendanceError("");
        return;
      }

      const records = await attendanceService.getSessionAttendances(
        currentSession.id,
      );

      const sessionRecords = Array.isArray(records) ? records : [];

      const results = currentEnrollments.map((enrollment) => {
        const record = sessionRecords.find(
          (item) =>
            Number(item.participantId) === Number(enrollment.participantId),
        );

        return {
          participantId: enrollment.participantId,
          status: record?.status || null,
          checkInTime: record?.checkInTime || null,
        };
      });

      setAttendanceRecords(results);
      setAttendanceError("");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "No se pudo consultar la sesión de asistencia.";

      if (isInitialLoad) {
        setError(message);
      } else {
        setAttendanceError(`No se pudo actualizar la información. ${message}`);
      }
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
      setAttendanceLoading(false);
    }
  }, [meetingId, activityId]);

  const handleProcessAbsences = useCallback(async () => {
    if (
      !session?.id ||
      session.status !== "CLOSED" ||
      session.absencesProcessed ||
      processingAbsences ||
      loading ||
      attendanceLoading
    ) {
      return;
    }

    setProcessingAbsences(true);
    setAbsenceNotice("");
    setAttendanceError("");

    try {
      const result = await attendanceService.processAbsences(session.id);

      await loadSession();

      setAbsenceNotice(
        result?.message || `Ausencias procesadas: ${result?.processed ?? 0}.`,
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "No se pudieron procesar las ausencias.";

      await loadSession();
      setAttendanceError(message);
    } finally {
      setProcessingAbsences(false);
    }
  }, [session, processingAbsences, loading, attendanceLoading, loadSession]);

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

          {activeEnrollments.length === 0 ? (
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
                  {activeEnrollments.map((enrollment) => {
                    const record = attendanceRecords.find(
                      (item) =>
                        Number(item.participantId) ===
                        Number(enrollment.participantId),
                    );

                    return (
                      <tr key={enrollment.id}>
                        <td>
                          {enrollment.participant
                            ? `${enrollment.participant.firstName} ${enrollment.participant.lastName}`
                            : `Participante #${enrollment.participantId}`}
                        </td>
                        <td>Activa</td>
                        <td>
                          {loading || attendanceLoading
                            ? record
                              ? getAttendanceLabel(record.status, session)
                              : "Consultando..."
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
          disabled={loading || attendanceLoading || processingAbsences}
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
        {session?.status === "CLOSED" && !session.absencesProcessed && (
          <button
            className="instructor-attendance-refresh"
            type="button"
            onClick={handleProcessAbsences}
            disabled={processingAbsences || loading || attendanceLoading}
          >
            {processingAbsences
              ? "Procesando ausencias..."
              : "Procesar ausencias"}
          </button>
        )}

        {session?.absencesProcessed && (
          <p className="instructor-attendance-note" role="status">
            Las ausencias de esta sesión ya fueron procesadas.
          </p>
        )}

        {absenceNotice && (
          <p className="instructor-attendance-note" role="status">
            {absenceNotice}
          </p>
        )}
      </section>
    </main>
  );
}
