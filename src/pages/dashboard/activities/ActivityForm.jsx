import { useEffect, useState } from "react";
import { LoaderCircle, Save, Plus, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import activitiesService from "../../../services/activitiesService";
import usersService from "../../../services/usersService";
import { prepareActivityData, validateActivityForm } from "./activityFormUtils";
import "./ActivityForm.css";

const initialForm = {
  name: "",
  description: "",
  capacity: "20",
  enrollmentStart: "",
  enrollmentEnd: "",
  responsibleId: "",
};

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 16);
}

function getActivityForm(activity) {
  if (!activity) return { ...initialForm };

  return {
    name: activity.name ?? "",
    description: activity.description ?? "",
    capacity: String(activity.capacity ?? 20),
    enrollmentStart: toDateTimeLocal(activity.enrollmentStart),
    enrollmentEnd: toDateTimeLocal(activity.enrollmentEnd),
    responsibleId: String(activity.responsibleId ?? ""),
  };
}

export default function ActivityForm({
  activity = null,
  onCreated,
  onUpdated,
  onCancel,
  modal = false,
}) {
  const { user } = useAuth();
  const isEditing = activity !== null;

  const [form, setForm] = useState(() => getActivityForm(activity));
  const [instructors, setInstructors] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm(getActivityForm(activity));
    setError("");
    setSuccess("");
  }, [activity]);

  useEffect(() => {
    let active = true;

    async function loadInstructors() {
      try {
        const users = await usersService.getAll();

        if (active) {
          setInstructors(
            (Array.isArray(users) ? users : []).filter(
              (item) =>
                item.roles?.includes("INSTRUCTOR") && item.status === "ACTIVE",
            ),
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "No se pudieron cargar los instructores.",
          );
        }
      } finally {
        if (active) setLoadingUsers(false);
      }
    }

    loadInstructors();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateActivityForm(form, user);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (isEditing && !Number.isInteger(Number(activity.id))) {
      setError("No se pudo identificar la actividad que querés editar.");
      return;
    }

    setSaving(true);

    try {
      const data = prepareActivityData(form);

      if (isEditing) {
        const updated = await activitiesService.update(activity.id, data);
        setSuccess("La actividad se actualizó correctamente.");
        onUpdated?.(updated);
      } else {
        const created = await activitiesService.create(data);
        setForm({ ...initialForm });
        setSuccess("La actividad se creó correctamente.");
        onCreated?.(created);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No se pudo ${
            isEditing ? "actualizar" : "crear"
          } la actividad. Verificá los datos e intentá nuevamente.`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={`activity-form-section${
        modal ? " activity-form-section--modal" : ""
      }`}
    >
      {!modal && (
        <>
          <h2>{isEditing ? "Editar actividad" : "Nueva actividad"}</h2>
          <p>
            {isEditing
              ? "Modificá los datos de la actividad."
              : "Completá los datos para registrar una actividad."}
          </p>
        </>
      )}

      <form className="activity-form" onSubmit={handleSubmit}>
        <div className="activity-form-field activity-form-field--full">
          <label htmlFor="activity-name">Nombre *</label>
          <input
            id="activity-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={150}
            required
            disabled={saving}
            autoFocus={modal}
          />
        </div>

        <div className="activity-form-field activity-form-field--full">
          <label htmlFor="activity-description">Descripción</label>
          <textarea
            id="activity-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            disabled={saving}
          />
        </div>

        <div className="activity-form-field">
          <label htmlFor="activity-capacity">Capacidad *</label>
          <input
            id="activity-capacity"
            name="capacity"
            type="number"
            min="1"
            step="1"
            value={form.capacity}
            onChange={handleChange}
            required
            disabled={saving}
          />
        </div>

        <div className="activity-form-field">
          <label htmlFor="activity-start">Inicio de inscripción *</label>
          <input
            id="activity-start"
            name="enrollmentStart"
            type="datetime-local"
            value={form.enrollmentStart}
            onChange={handleChange}
            required
            disabled={saving}
          />
        </div>

        <div className="activity-form-field">
          <label htmlFor="activity-end">Fin de inscripción *</label>
          <input
            id="activity-end"
            name="enrollmentEnd"
            type="datetime-local"
            value={form.enrollmentEnd}
            onChange={handleChange}
            min={form.enrollmentStart || undefined}
            required
            disabled={saving}
          />
        </div>

        <div className="activity-form-field activity-form-field--full">
          <label htmlFor="activity-responsible">Instructor responsable *</label>
          <select
            id="activity-responsible"
            name="responsibleId"
            value={form.responsibleId}
            onChange={handleChange}
            required
            disabled={saving || loadingUsers}
          >
            <option value="">
              {loadingUsers
                ? "Cargando instructores..."
                : "Seleccioná un instructor"}
            </option>

            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.firstName} {instructor.lastName} —{" "}
                {instructor.email}
              </option>
            ))}
          </select>
        </div>

        {instructors.length === 0 && !loadingUsers && (
          <p className="activity-form-info">
            No se encontraron instructores activos.
          </p>
        )}

        {error && (
          <p className="activity-form-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="activity-form-success" role="status">
            {success}
          </p>
        )}

        <div className="activity-form-actions">
          {onCancel && (
            <button
              className="activity-form-button activity-form-button--secondary"
              type="button"
              onClick={onCancel}
              disabled={saving}
            >
              <X size={17} />
              Cancelar
            </button>
          )}

          <button
            className="activity-form-button activity-form-button--primary"
            type="submit"
            disabled={saving || loadingUsers || instructors.length === 0}
          >
            {saving ? (
              <LoaderCircle className="dashboard-icon-spinning" size={17} />
            ) : isEditing ? (
              <Save size={17} />
            ) : (
              <Plus size={17} />
            )}
            {saving
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear actividad"}
          </button>
        </div>
      </form>
    </section>
  );
}
