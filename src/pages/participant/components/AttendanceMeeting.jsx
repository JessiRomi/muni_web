import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import attendanceService from "../../../services/attendanceService";
import { formatDate, getErrorMessage } from "../participantUtils";

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

export default function AttendanceMeeting({
  meeting,
  participantId,
  attendanceHistory,
  onAttendanceUpdated,
}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(Date.now());

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await attendanceService.getSessionByMeeting(meeting.id);
      setSession(data || null);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "No se pudo consultar la información de asistencia.",
        ),
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

  const attendance = useMemo(() => {
    if (!session || !Array.isArray(attendanceHistory)) return null;

    return (
      attendanceHistory.find(
        (item) => Number(item.sessionId) === Number(session.id),
      ) || null
    );
  }, [session, attendanceHistory]);

  async function handleCheckIn() {
    if (!session || submitting || attendance || !participantId) return;

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

          await Promise.all([loadSession(), onAttendanceUpdated()]);
          setNotice("¡Tu asistencia se registró correctamente!");
        } catch (err) {
          setError(getErrorMessage(err, "No se pudo registrar la asistencia."));
        } finally {
          setSubmitting(false);
        }
      },
      (geoError) => {
        const messages = {
          1: "Permitir el acceso a tu ubicación para registrar asistencia.",
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

  const attendanceLabel = attendance
    ? attendance.status === "PRESENT"
      ? "Presente"
      : attendance.status === "ABSENT"
        ? "Ausente"
        : attendance.status
    : null;

  const canCheckIn =
    session &&
    state === "Abierta" &&
    session.status === "OPEN" &&
    !attendance &&
    !loading;

  return (
    <div className="participant-attendance">
      <p>
        <strong>Estado de la sesión:</strong>{" "}
        {loading ? "Consultando..." : state}
      </p>

      <p>
        <strong>Mi asistencia:</strong>{" "}
        {loading
          ? "Consultando..."
          : attendanceLabel || "Pendiente de registro"}
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

      {attendance?.status === "PRESENT" && (
        <p>Tu asistencia ya fue registrada en esta sesión.</p>
      )}
    </div>
  );
}
