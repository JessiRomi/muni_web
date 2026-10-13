import api from "../config/api";

export const activitiesService = {
  async getAll() {
    const { data } = await api.get("/activities");
    return data;
  },

  async getPublic() {
    const { data } = await api.get("/public/activities");
    return data;
  },

  async create(activity) {
    const { data } = await api.post("/activities", activity);
    return data;
  },

  async enroll(activityId, participantId) {
    const { data } = await api.post(`/activities/${activityId}/enrollments`, {
      participantId,
    });

    return data;
  },

  async withdraw(activityId, participantId) {
    const { data } = await api.patch(
      `/activities/${activityId}/enrollments/withdraw`,
      { participantId },
    );

    return data;
  },
};

export default activitiesService;
