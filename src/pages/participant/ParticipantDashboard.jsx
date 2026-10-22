import { useCallback, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import SiteFooter from "../../components/layout/SiteFooter";
import ActivityDetailModal from "../home/ActivityDetailModal";

import AttendanceHistory from "./components/AttendanceHistory";
import ParticipantProfile from "./components/ParticipantProfile";
import MyEnrollments from "./components/MyEnrollments";
import ParticipantSummary from "./components/ParticipantSummary";

import ActivityCatalog from "./components/ActivityCatalog";
import useParticipantProfile from "./hooks/useParticipantProfile";
import useParticipantDashboard from "./hooks/useParticipantDashboard";
import "../role-pages.css";


export default function ParticipantDashboard() {
  const { user, logout } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState(null);

  const {
    profile,
    profileForm,
    setProfileForm,
    profileEditing,
    setProfileEditing,
    profileLoading,
    profileSaving,
    profileError,
    profileNotice,
    setProfileError,
    setProfileNotice,
    loadMyProfile,
    handleProfileSave,
    handleProfileCancel,
  } = useParticipantProfile();

  const {
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
  } = useParticipantDashboard();

  useEffect(() => {
    refreshDashboard();
    loadMyProfile();
  }, [refreshDashboard, loadMyProfile]);

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

        <ParticipantSummary
          loading={loading}
          error={error}
          activeEnrollmentsCount={activeEnrollmentsCount}
          activitiesLoading={activitiesLoading}
          activitiesError={activitiesError}
          availableActivitiesCount={availableActivities.length}
          attendanceHistoryLoading={attendanceHistoryLoading}
          attendanceHistoryError={attendanceHistoryError}
          attendanceSummary={attendanceSummary}
        />

        <AttendanceHistory
          records={attendanceHistoryRows}
          loading={attendanceHistoryLoading}
          error={attendanceHistoryError}
          onRefresh={loadAttendanceHistory}
        />
        <ParticipantProfile
          profile={profile}
          user={user}
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          profileEditing={profileEditing}
          setProfileEditing={setProfileEditing}
          profileLoading={profileLoading}
          profileSaving={profileSaving}
          profileError={profileError}
          profileNotice={profileNotice}
          setProfileError={setProfileError}
          setProfileNotice={setProfileNotice}
          loadMyProfile={loadMyProfile}
          handleProfileSave={handleProfileSave}
          handleProfileCancel={handleProfileCancel}
        />

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
