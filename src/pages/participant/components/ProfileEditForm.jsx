import { Check, X } from "lucide-react";

export default function ProfileEditForm({
  profile,
  profileForm,
  setProfileForm,
  profileError,
  profileSaving,
  onSave,
  onCancel,
}) {
  function handleChange(event) {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <form className="participant-profile-form" onSubmit={onSave}>
      <label>
        Nombre
        <input
          name="firstName"
          type="text"
          autoComplete="given-name"
          value={profileForm.firstName}
          onChange={handleChange}
          maxLength={100}
          required
          disabled={profileSaving}
        />
      </label>

      <label>
        Apellido
        <input
          name="lastName"
          type="text"
          autoComplete="family-name"
          value={profileForm.lastName}
          onChange={handleChange}
          maxLength={100}
          required
          disabled={profileSaving}
        />
      </label>

      <label>
        Correo electrónico
        <input type="email" value={profile?.email || ""} readOnly disabled />
        <small>El correo no se puede modificar desde esta sección.</small>
      </label>

      <label>
        Teléfono
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          value={profileForm.phone}
          onChange={handleChange}
          maxLength={30}
          disabled={profileSaving}
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
          <Check size={16} aria-hidden="true" />
          {profileSaving ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          className="participant-action participant-action--secondary"
          type="button"
          onClick={onCancel}
          disabled={profileSaving}
        >
          <X size={16} aria-hidden="true" />
          Cancelar
        </button>
      </div>
    </form>
  );
}
