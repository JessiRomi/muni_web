import { useEffect } from "react";
import useParticipantProfile from "../participant/hooks/useParticipantProfile";
import SharedProfile from "../participant/components/SharedProfile";

export default function AdminProfile({ user }) {
  const profileState = useParticipantProfile();
  const { loadMyProfile } = profileState;

  useEffect(() => {
    loadMyProfile();
  }, [loadMyProfile]);

  return (
    <SharedProfile {...profileState} user={user} currentRole="ADMINISTRADOR" />
  );
}
