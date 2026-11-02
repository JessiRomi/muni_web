import { useEffect, useState } from "react";
import { X } from "lucide-react";
import meetingsService from "../../services/meetingsService";
import "./MeetingForm.css";
import { validateMeeting } from "./meetingValidation";

const initialMeeting = {
  dateTime: "",
  locationId: "",
};

function getMinDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function toLocalDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function MeetingForm({
  activity,
  meeting = null,
  onCreated,
  onCancel,
}) {
  const isEditing = Boolean(meeting?.id);

  const [form, setForm] = useState(initialMeeting);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await meetingsService.findLocations();
        setLocations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "No se pudieron cargar las ubicaciones.",
        );
      } finally {
        setLoadingLocations(false);
      }
    }

    loadLocations();
  }, []);

  useEffect(() => {
    if (!meeting) {
      setForm(initialMeeting);
      return;
    }

    const matchingLocation = locations.find(
      (location) =>
        Number(location.id) === Number(meeting.locationId) ||
        location.name === meeting.location,
    );

    setForm({
      dateTime: toLocalDateTime(meeting.dateTime),
      locationId: matchingLocation
        ? String(matchingLocation.id)
        : String(meeting.locationId ?? ""),
    });
  }, [meeting, locations]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationError = validateMeeting(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        dateTime: new Date(form.dateTime).toISOString(),
        locationId: Number(form.locationId),
      };

      if (isEditing) {
        await meetingsService.update(meeting.id, payload);
      } else {
        await meetingsService.create(activity.id, payload);
      }

      onCreated?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No se pudo ${isEditing ? "actualizar" : "crear"} el encuentro. Intentá nuevamente.`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="activity-form instructor-meeting-fields"
      onSubmit={handleSubmit}
    >
      <div className="activity-form-field activity-form-field--full">
        <label htmlFor="meeting-date">Fecha y hora *</label>
        <input
          id="meeting-date"
          name="dateTime"
          type="datetime-local"
          value={form.dateTime}
          onChange={handleChange}
          min={getMinDateTime()}
          required
          disabled={saving}
        />
      </div>

      <div className="activity-form-field activity-form-field--full">
        <label htmlFor="meeting-location">Ubicación *</label>
        <select
          id="meeting-location"
          name="locationId"
          value={form.locationId}
          onChange={handleChange}
          required
          disabled={
            saving || loadingLocations || locations.length === 0
          }
        >
          <option value="">
            {loadingLocations
              ? "Cargando ubicaciones..."
              : locations.length === 0
                ? "No hay ubicaciones disponibles"
                : "Seleccioná una ubicación"}
          </option>

          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="activity-form-error" role="alert">
          {error}
        </p>
      )}

      <div className="activity-form-actions">
        <button
          className="activity-form-button activity-form-button--secondary"
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          <X size={17} /> Cancelar
        </button>

        <button
          className="activity-form-button activity-form-button--primary"
          type="submit"
          disabled={saving || loadingLocations || locations.length === 0}
        >
          {saving
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Guardar encuentro"}
        </button>
      </div>
    </form>
  );
}