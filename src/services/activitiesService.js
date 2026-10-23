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

  async getMyEnrollments() {
    const { data } = await api.get("/participant/enrollments");
    return data;
  },

  async getActiveEnrollments(activityId) {
    const { data } = await api.get(
      `/activities/${Number(activityId)}/active-enrollments`,
    );
    return data;
  },

  async create(activity) {
    const { data } = await api.post("/activities", activity);
    return data;
  },

  async update(activityId, activity) {
    const { data } = await api.patch(
      `/activities/${Number(activityId)}`,
      activity,
    );
    return data;
  },

  async delete(activityId) {
    const { data } = await api.delete(`/activities/${Number(activityId)}`);
    return data;
  },

  async finish(activityId) {
    const { data } = await api.patch(
      `/activities/${Number(activityId)}/finish`,
    );
    return data;
  },
  
  async reactivate(activityId) {
    const { data } = await api.patch(
      `/activities/${Number(activityId)}/reactivate`,
    );
    return data;
  },

  async enroll(activityId) {
    const { data } = await api.post(
      `/activities/${activityId}/enrollments`,
      {},
    );
    return data;
  },

  async withdraw(activityId) {
    const { data } = await api.patch(
      `/activities/${activityId}/enrollments/withdraw`,
      {},
    );
    return data;
  },
};

export default activitiesService;
