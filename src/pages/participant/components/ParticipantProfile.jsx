import { UserRound, Pencil, Check, X, RefreshCw } from "lucide-react";

export default function ParticipantProfile({
  profile,
  user,
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
  return (
    <section
      className="participant-profile"
      aria-labelledby="participant-profile-title"
    >
      <div className="participant-profile-heading">
        <UserRound size={28} aria-hidden="true" />

        <div>
          <span className="participant-eyebrow">MIS DATOS</span>
          <h2 id="participant-profile-title">Mi perfil</h2>
        </div>

        {!profileEditing && !profileLoading && (
          <button
            className="participant-action"
            type="button"
            onClick={() => {
              setProfileEditing(true);
              setProfileError("");
              setProfileNotice("");
            }}
          >
            <Pencil size={16} />
            Editar perfil
          </button>
        )}
      </div>

      {profileLoading ? (
        <p>Consultando tus datos...</p>
      ) : profileError && !profile ? (
        <div role="alert">
          <p>{profileError}</p>
          <button
            className="participant-action"
            type="button"
            onClick={loadMyProfile}
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      ) : profileEditing ? (
        <form className="participant-profile-form" onSubmit={handleProfileSave}>
          <label>
            Nombre
            <input
              type="text"
              autoComplete="given-name"
              value={profileForm.firstName}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
              maxLength={100}
              required
            />
          </label>

          <label>
            Apellido
            <input
              type="text"
              autoComplete="family-name"
              value={profileForm.lastName}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  lastName: event.target.value,
                }))
              }
              maxLength={100}
              required
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              value={profile?.email || ""}
              readOnly
              disabled
            />
            <small>El correo no se puede modificar desde esta sección.</small>
          </label>

          <label>
            Teléfono
            <input
              type="tel"
              autoComplete="tel"
              value={profileForm.phone}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              maxLength={30}
            />
          </label>

          {profileError && (
            <p role="alert" className="participant-attendance-error">
              {profileError}
            </p>
          )}

          <div className="participant-profile-actions">
            <button
              className="participant-action"
              type="submit"
              disabled={profileSaving}
            >
              <Check size={16} />
              {profileSaving ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              className="participant-refresh"
              type="button"
              onClick={handleProfileCancel}
              disabled={profileSaving}
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="participant-profile-details">
          <p>
            <strong>Nombre:</strong> {profile?.firstName || "Sin informar"}
          </p>

          <p>
            <strong>Apellido:</strong> {profile?.lastName || "Sin informar"}
          </p>

          <p>
            <strong>Correo:</strong>{" "}
            {profile?.email || user?.email || "Sin informar"}
          </p>

          <p>
            <strong>Teléfono:</strong> {profile?.phone || "Sin informar"}
          </p>

          {profileError && <p role="alert">{profileError}</p>}
          {profileNotice && <p role="status">{profileNotice}</p>}
        </div>
      )}
    </section>
  );
}
