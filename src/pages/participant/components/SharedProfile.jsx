import { useNavigate } from "react-router-dom";
import { Pencil, RefreshCw } from "lucide-react";
import { getRoleRoute } from "../../../utils/roleNavigation";
import ProfileEditForm from "./ProfileEditForm";
import "./SharedProfile.css";

const roleLabels = {
  ADMINISTRADOR: "Administración",
  INSTRUCTOR: "Instructor",
  PARTICIPANTE: "Participante",
};

export default function SharedProfile({
  profile,
  user,
  currentRole,
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
}) {
  const navigate = useNavigate();

  const firstName = profile?.firstName || roleLabels[currentRole];
  const initials =
    `${profile?.firstName?.[0] || ""}${profile?.lastName?.[0] || ""}`.toUpperCase() ||
    "US";

  const roles = user?.roles?.length ? user.roles : [currentRole];

  const startEditing = () => {
    setProfileEditing(true);
    setProfileError("");
    setProfileNotice("");
  };

  return (
    <section className="shared-profile" aria-label="Mi perfil">
      <div className="shared-profile-identity">
        <div className="shared-profile-avatar" aria-hidden="true">
          {initials}
        </div>

        <div className="shared-profile-greeting">
          <h2>Hola, {firstName}</h2>
          <span>{roleLabels[currentRole] || currentRole}</span>
        </div>
      </div>

      <div className="shared-profile-contact">
        <p>
          <span aria-hidden="true">✉</span>
          <span>{profile?.email || user?.email || "Correo no disponible"}</span>
        </p>
        <p>
          <span aria-hidden="true">♧</span>
          <span>{profile?.phone || "Sin teléfono informado"}</span>
        </p>
      </div>

      <div className="shared-profile-roles">
        <span className="shared-profile-roles-label">Tus roles</span>

        <div className="shared-profile-role-list">
          {roles.map((role) => {
            const isCurrentRole = role === currentRole;

            return (
              <button
                className={`shared-profile-role ${
                  isCurrentRole ? "is-current" : ""
                }`}
                key={role}
                type="button"
                aria-current={isCurrentRole ? "page" : undefined}
                disabled={isCurrentRole}
                onClick={() => {
                  const destination = getRoleRoute(role);

                  if (destination && destination !== "/") {
                    navigate(destination);
                  }
                }}
              >
                {role.replaceAll("_", " ")}
              </button>
            );
          })}
        </div>
      </div>

      {!profileEditing && !profileLoading && profile && (
        <button
          className="shared-profile-edit"
          type="button"
          onClick={startEditing}
        >
          <Pencil size={16} aria-hidden="true" />
          Editar perfil
        </button>
      )}

      {profileLoading && (
        <p className="shared-profile-status" role="status">
          Consultando tus datos...
        </p>
      )}

      {profileError && !profile && !profileLoading && (
        <div className="shared-profile-status" role="alert">
          <p>{profileError}</p>
          <button
            className="shared-profile-edit"
            type="button"
            onClick={loadMyProfile}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      )}

      {profileEditing && (
        <div className="shared-profile-edit-panel">
          <ProfileEditForm
            profile={profile}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            profileError={profileError}
            profileSaving={profileSaving}
            onSave={handleProfileSave}
            onCancel={handleProfileCancel}
          />
        </div>
      )}

      {profileNotice && (
        <p className="shared-profile-notice" role="status">
          {profileNotice}
        </p>
      )}

      {profileError && profile && !profileEditing && (
        <p className="shared-profile-status" role="alert">
          {profileError}
        </p>
      )}
    </section>
  );
}
