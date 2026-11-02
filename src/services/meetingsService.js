
import api from "../config/api";

const meetingsService = {
  // Obtener ubicaciones activas
  async findLocations() {
    const { data } = await api.get("/meeting-locations");
    return data;
  },

  // Registrar una nueva ubicación
  async createLocation(location) {
    const { data } = await api.post("/meeting-locations", location);
    return data;
  },

  // Desactivar una ubicación
  async deactivateLocation(id) {
    const { data } = await api.patch(
      `/meeting-locations/${Number(id)}/deactivate`,
    );
    return data;
  },

  // Crear un encuentro
  async create(activityId, meeting) {
    const { data } = await api.post(
      `/activities/${activityId}/meetings`,
      meeting,
    );
    return data;
  },

  // Actualizar un encuentro
  async update(id, meeting) {
    const { data } = await api.patch(`/meetings/${Number(id)}`, meeting);
    return data;
  },
};

export default meetingsService;
