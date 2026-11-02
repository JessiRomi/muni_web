
import { useEffect, useState } from "react";
import { MapPin, Plus, RefreshCw, Trash2 } from "lucide-react";
import meetingsService from "../../../services/meetingsService";
import "./LocationManager.css";

const initialForm = {
  name: "",
  latitude: "",
  longitude: "",
};

export default function LocationManager() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadLocations() {
    setLoading(true);
    setError("");

    try {
      const data = await meetingsService.findLocations();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar las ubicaciones.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLocations();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (
      !form.name.trim() ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError("Completá los datos con un nombre y coordenadas válidas.");
      return;
    }

    setSaving(true);

    try {
      await meetingsService.createLocation({
        name: form.name.trim(),
        latitude,
        longitude,
      });

      setForm(initialForm);
      setSuccess("Ubicación registrada correctamente.");
      await loadLocations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo registrar la ubicación.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(location) {
    if (!window.confirm(`¿Desactivar la ubicación "${location.name}"?`)) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await meetingsService.deactivateLocation(location.id);
      setSuccess("Ubicación desactivada correctamente.");
      await loadLocations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo desactivar la ubicación.",
      );
    }
  }

  return (
    <section className="location-manager">
      <div className="location-manager-heading">
        <div>
          <span className="dashboard-eyebrow">GESTIÓN MUNICIPAL</span>
          <h2>Ubicaciones</h2>
          <p>Administrá los lugares donde se realizan los encuentros.</p>
        </div>

        <button
          type="button"
          className="dashboard-button dashboard-button--secondary"
          onClick={loadLocations}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      <form className="location-manager-form" onSubmit={handleSubmit}>
        <h3><Plus size={18} /> Nueva ubicación</h3>

        <label htmlFor="location-name">Nombre *</label>
        <input
          id="location-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ej.: Centro comunitario"
          required
          disabled={saving}
        />

        <label htmlFor="location-latitude">Latitud *</label>
        <input
          id="location-latitude"
          name="latitude"
          type="number"
          step="any"
          min="-90"
          max="90"
          value={form.latitude}
          onChange={handleChange}
          required
          disabled={saving}
        />

        <label htmlFor="location-longitude">Longitud *</label>
        <input
          id="location-longitude"
          name="longitude"
          type="number"
          step="any"
          min="-180"
          max="180"
          value={form.longitude}
          onChange={handleChange}
          required
          disabled={saving}
        />

        <button
          type="submit"
          className="dashboard-button dashboard-button--primary"
          disabled={saving}
        >
          <Plus size={17} />
          {saving ? "Guardando..." : "Registrar ubicación"}
        </button>
      </form>

      {error && <p className="location-manager-error" role="alert">{error}</p>}
      {success && <p className="location-manager-success" role="status">{success}</p>}

      <div className="location-manager-list">
        <h3><MapPin size={18} /> Ubicaciones disponibles</h3>

        {loading ? (
          <p>Cargando ubicaciones...</p>
        ) : locations.length === 0 ? (
          <p>No hay ubicaciones registradas.</p>
        ) : (
          locations.map((location) => (
            <article key={location.id} className="location-manager-item">
              <div>
                <strong>{location.name}</strong>
                <p>
                  Latitud: {location.latitude} | Longitud: {location.longitude}
                </p>
              </div>

              <button
                type="button"
                className="dashboard-button dashboard-button--danger"
                onClick={() => handleDeactivate(location)}
                aria-label={`Desactivar ${location.name}`}
              >
                <Trash2 size={15} />
                Desactivar
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
