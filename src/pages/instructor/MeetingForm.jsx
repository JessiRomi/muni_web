import { useState } from "react";
import { X } from "lucide-react";
import meetingsService from "../../services/meetingsService";
import "./MeetingForm.css";
import { validateMeeting } from "./meetingValidation";

const initialMeeting = {
  dateTime: "",
  location: "",
  latitude: "",
  longitude: "",
  allowedRadius: "100",
};

export default function MeetingForm({ activity, onCreated, onCancel }) {
  const [form, setForm] = useState(initialMeeting);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

    const validationError = validateMeeting(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      await meetingsService.create(activity.id, {
        dateTime: new Date(form.dateTime).toISOString(),
        location: form.location.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        allowedRadius: Number(form.allowedRadius),
      });

      onCreated?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo crear el encuentro. Intentá nuevamente.",
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
          required
          disabled={saving}
        />
      </div>

      <div className="activity-form-field activity-form-field--full">
        <label htmlFor="meeting-location">Ubicación *</label>
        <input
          id="meeting-location"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Ej.: Centro Cultural Cipolletti"
          required
          disabled={saving}
        />
      </div>

      <div className="activity-form-field">
        <label htmlFor="meeting-latitude">Latitud *</label>
        <input
          id="meeting-latitude"
          name="latitude"
          type="number"
          min="-90"
          max="90"
          step="any"
          value={form.latitude}
          onChange={handleChange}
          required
          disabled={saving}
        />
      </div>

      <div className="activity-form-field">
        <label htmlFor="meeting-longitude">Longitud *</label>
        <input
          id="meeting-longitude"
          name="longitude"
          type="number"
          min="-180"
          max="180"
          step="any"
          value={form.longitude}
          onChange={handleChange}
          required
          disabled={saving}
        />
      </div>

      <div className="activity-form-field activity-form-field--full">
        <label htmlFor="meeting-radius">
          Radio permitido en metros *
        </label>
        <input
          id="meeting-radius"
          name="allowedRadius"
          type="number"
          min="1"
          step="1"
          value={form.allowedRadius}
          onChange={handleChange}
          required
          disabled={saving}
        />
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
          <X size={17} />
          Cancelar
        </button>

        <button
          className="activity-form-button activity-form-button--primary"
          type="submit"
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar encuentro"}
        </button>
      </div>
    </form>
  );
}