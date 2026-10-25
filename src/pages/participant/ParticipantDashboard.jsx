import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import SiteFooter from "../../components/layout/SiteFooter";
import ActivityDetailModal from "../home/ActivityDetailModal";

import ParticipantProfile from "./components/ParticipantProfile";
import MyEnrollments from "./components/MyEnrollments";
import ActivityCatalog from "./components/ActivityCatalog";
import MunicipalHeader from "../../components/layout/MunicipalHeader";

import MunicipalHero from "../../components/layout/MunicipalHero";
import useParticipantProfile from "./hooks/useParticipantProfile";
import useParticipantDashboard from "./hooks/useParticipantDashboard";
import "../../styles/activity-cards.css";
import "../role-pages.css";

export default function ParticipantDashboard() {
  const { user, logout } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState(null);

  const profileState = useParticipantProfile();

  const {
    enrollments,
    attendanceHistory,
    loading,
    activitiesLoading,
    error,
    activitiesError,
    withdrawingId,
    loadEnrollments,
    loadActivities,
    loadAttendanceHistory,
    refreshDashboard,
    handleWithdraw,
    availableActivities,
  } = useParticipantDashboard();

  useEffect(() => {
    refreshDashboard();
    profileState.loadMyProfile();
  }, [refreshDashboard, profileState.loadMyProfile]);

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
      <MunicipalHeader onLogout={logout} />
      <MunicipalHero
        variant="compact"
        eyebrow="ESPACIO DEL PARTICIPANTE"
        title="Tu comunidad, tus actividades."
        description="Consultá tus inscripciones, revisá tus asistencias y descubrí nuevas propuestas municipales."
      />
      <main className="participant-main">
        <ParticipantProfile {...profileState} user={user} />

        <MyEnrollments
          enrollments={enrollments}
          loading={loading}
          error={error}
          user={user}
          attendanceHistory={attendanceHistory}
          refreshDashboard={refreshDashboard}
          loadEnrollments={loadEnrollments}
          loadAttendanceHistory={loadAttendanceHistory}
          withdrawingId={withdrawingId}
          handleWithdraw={handleWithdraw}
        />

        <ActivityCatalog
          activities={availableActivities}
          loading={activitiesLoading}
          error={activitiesError}
          onRetry={loadActivities}
          onSelectActivity={setSelectedActivity}
        />

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
