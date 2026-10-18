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

  async create(activity) {
    const { data } = await api.post("/activities", activity);
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
