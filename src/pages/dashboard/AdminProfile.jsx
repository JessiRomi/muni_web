import { useEffect, useState } from "react";
import { UserRound, Pencil, Check, X, RefreshCw } from "lucide-react";
import usersService from "../../services/usersService";

export default function AdminProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const data = await usersService.getMyProfile();

      setProfile(data);
      setForm({
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        phone: data?.phone || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo cargar el perfil. Intentá nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();

    if (!firstName || !lastName) {
      setError("El nombre y el apellido son obligatorios.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updated = await usersService.updateMyProfile({
        firstName,
        lastName,
        phone: form.phone.trim() || null,
      });

      setProfile(updated);
      setForm({
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        phone: updated.phone || "",
      });
      setEditing(false);
      setNotice("Tus datos se actualizaron correctamente.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudieron guardar los cambios. Intentá nuevamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
    });

    setEditing(false);
    setError("");
    setNotice("");
  }

  return (
    <section
      className="participant-profile"
      aria-labelledby="admin-profile-title"
    >
      <div className="participant-profile-heading">
        <UserRound size={28} aria-hidden="true" />

        <div>
          <span className="participant-eyebrow">MIS DATOS</span>
          <h2 id="admin-profile-title">Mi perfil</h2>
        </div>

        {!editing && !loading && profile && (
          <button
            className="participant-action"
            type="button"
            onClick={() => {
              setEditing(true);
              setError("");
              setNotice("");
            }}
          >
            <Pencil size={16} />
            Editar perfil
          </button>
        )}
      </div>

      {loading ? (
        <p>Consultando tus datos...</p>
      ) : error && !profile ? (
        <div role="alert">
          <p>{error}</p>

          <button
            className="participant-action"
            type="button"
            onClick={loadProfile}
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      ) : editing ? (
        <form className="participant-profile-form" onSubmit={handleSave}>
          <label>
            Nombre
            <input
              type="text"
              autoComplete="given-name"
              maxLength={100}
              required
              value={form.firstName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Apellido
            <input
              type="text"
              autoComplete="family-name"
              maxLength={100}
              required
              value={form.lastName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  lastName: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              value={profile?.email || user?.email || ""}
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
              maxLength={30}
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
            />
          </label>

          {error && (
            <p role="alert" className="participant-attendance-error">
              {error}
            </p>
          )}

          <div className="participant-profile-actions">
            <button
              className="participant-action"
              type="submit"
              disabled={saving}
            >
              <Check size={16} />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              className="participant-refresh"
              type="button"
              onClick={handleCancel}
              disabled={saving}
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

          {error && <p role="alert">{error}</p>}
          {notice && <p role="status">{notice}</p>}
        </div>
      )}
    </section>
  );
}
