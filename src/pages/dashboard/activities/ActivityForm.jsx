import { useEffect, useState } from "react";
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

export default function ActivityForm({ onCreated, onCancel }) {
  const { user } = useAuth();
  
  const [form, setForm] = useState(initialForm);
  const [instructors, setInstructors] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function loadInstructors() {
      try {
        const users = await usersService.getAll();
        if (active) {
          setInstructors(
            users.filter(
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
    setSaving(true);
    
    try {
      const created = await activitiesService.create(prepareActivityData(form));
      setForm(initialForm);
      setSuccess("La actividad se creó correctamente.");
      onCreated?.(created);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo crear la actividad. Verificá los datos e intentá nuevamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="activity-form-section">
      <h2>Nueva actividad</h2>
      <p>Completá los datos para registrar una actividad.</p>
      <form className="activity-form" onSubmit={handleSubmit}>
        <label htmlFor="activity-name">Nombre *</label>
        <input
          id="activity-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          maxLength={150}
          required
          disabled={saving}
        />
        <label htmlFor="activity-description">Descripción</label>
        <textarea
          id="activity-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          disabled={saving}
        />
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
              {instructor.firstName} {instructor.lastName} — {instructor.email}
            </option>
          ))}
        </select>
        {instructors.length === 0 && !loadingUsers && (
          <p>No se encontraron instructores activos.</p>
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
            <button type="button" onClick={onCancel} disabled={saving}>
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving || loadingUsers || instructors.length === 0}
          >
            {saving ? "Guardando..." : "Crear actividad"}
          </button>
        </div>
      </form>
    </section>
  );
}
