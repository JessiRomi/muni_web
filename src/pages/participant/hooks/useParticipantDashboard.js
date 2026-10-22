import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import activitiesService from "../../../services/activitiesService";
import attendanceService from "../../../services/attendanceService";
import { getErrorMessage } from "../participantUtils";

export default function useParticipantDashboard() {
  const { user } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [attendanceHistoryLoading, setAttendanceHistoryLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [activitiesError, setActivitiesError] = useState("");
  const [attendanceHistoryError, setAttendanceHistoryError] = useState("");
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

  const loadAttendanceHistory = useCallback(async () => {
    if (!user?.id) {
      setAttendanceHistory([]);
      setAttendanceHistoryError("");
      setAttendanceHistoryLoading(false);
      return;
    }

    setAttendanceHistoryLoading(true);
    setAttendanceHistoryError("");

    try {
      const data = await attendanceService.getHistory(user.id);
      setAttendanceHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setAttendanceHistoryError(
        getErrorMessage(err, "No se pudo cargar tu historial de asistencia."),
      );
    } finally {
      setAttendanceHistoryLoading(false);
    }
  }, [user?.id]);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      loadEnrollments(),
      loadActivities(),
      loadAttendanceHistory(),
    ]);
  }, [loadEnrollments, loadActivities, loadAttendanceHistory]);

  const handleWithdraw = useCallback(
    async (enrollment) => {
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
    },
    [loadEnrollments],
  );

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

  const activeEnrollmentsCount = useMemo(
    () =>
      enrollments.filter((enrollment) => enrollment.status === "ACTIVE").length,
    [enrollments],
  );

  const attendanceSummary = useMemo(() => {
    const records = Array.isArray(attendanceHistory) ? attendanceHistory : [];

    return {
      present: records.filter((record) => record.status === "PRESENT").length,
      absent: records.filter((record) => record.status === "ABSENT").length,
    };
  }, [attendanceHistory]);

  const attendanceHistoryRows = useMemo(() => {
    const meetingsById = new Map();

    enrollments.forEach((enrollment) => {
      const meetings = Array.isArray(enrollment.activity?.meetings)
        ? enrollment.activity.meetings
        : [];

      meetings.forEach((meeting) => {
        meetingsById.set(String(meeting.id), {
          meeting,
          activityName:
            enrollment.activity?.name || `Actividad #${enrollment.activityId}`,
        });
      });
    });

    return attendanceHistory
      .map((record) => {
        const meetingId = record.session?.meetingId;
        const match =
          meetingId != null ? meetingsById.get(String(meetingId)) : null;

        return {
          ...record,
          activityName: match?.activityName || "Actividad no identificada",
          meetingDate:
            match?.meeting?.dateTime ||
            record.session?.startTime ||
            record.checkInTime,
          meetingLocation: match?.meeting?.location || "",
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.meetingDate || a.checkInTime).getTime();
        const dateB = new Date(b.meetingDate || b.checkInTime).getTime();

        return (
          (Number.isFinite(dateB) ? dateB : 0) -
          (Number.isFinite(dateA) ? dateA : 0)
        );
      });
  }, [attendanceHistory, enrollments]);

  return {
    enrollments,
    activities,
    attendanceHistory,
    loading,
    activitiesLoading,
    attendanceHistoryLoading,
    error,
    activitiesError,
    attendanceHistoryError,
    withdrawingId,
    loadEnrollments,
    loadActivities,
    loadAttendanceHistory,
    refreshDashboard,
    handleWithdraw,
    availableActivities,
    activeEnrollmentsCount,
    attendanceSummary,
    attendanceHistoryRows,
  };
}
