import { useCallback, useState } from "react";
import usersService from "../../../services/usersService";
import { getErrorMessage } from "../participantUtils";

export default function useParticipantProfile() {

  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");

  const loadMyProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const data = await usersService.getMyProfile();

      setProfile(data);
      setProfileForm({
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        phone: data?.phone || "",
      });
    } catch (err) {
      setProfileError(
        getErrorMessage(
          err,
          "No se pudo cargar tu perfil. Intentá nuevamente.",
        ),
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const handleProfileSave = useCallback(
    async (event) => {
      event.preventDefault();

      if (profileSaving) return;

      const firstName = profileForm.firstName.trim();
      const lastName = profileForm.lastName.trim();

      if (!firstName || !lastName) {
        setProfileError("El nombre y el apellido son obligatorios.");
        return;
      }

      setProfileSaving(true);
      setProfileError("");
      setProfileNotice("");

      try {
        const updatedProfile = await usersService.updateMyProfile({
          firstName,
          lastName,
          phone: profileForm.phone.trim() || null,
        });

        setProfile(updatedProfile);
        setProfileForm({
          firstName: updatedProfile.firstName || "",
          lastName: updatedProfile.lastName || "",
          phone: updatedProfile.phone || "",
        });
        setProfileEditing(false);
        setProfileNotice("Tus datos se actualizaron correctamente.");
      } catch (err) {
        setProfileError(
          getErrorMessage(
            err,
            "No se pudieron guardar los cambios. Intentá nuevamente.",
          ),
        );
      } finally {
        setProfileSaving(false);
      }
    },
    [profileForm, profileSaving],
  );

  const handleProfileCancel = useCallback(() => {
    setProfileForm({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
    });
    setProfileEditing(false);
    setProfileError("");
    setProfileNotice("");
  }, [profile]);

  return {
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
  };
}
