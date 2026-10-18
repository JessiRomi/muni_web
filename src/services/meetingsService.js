import api from "../config/api";

const meetingsService = {
  async create(activityId, meeting) {
    const { data } = await api.post(
      `/activities/${activityId}/meetings`,
      meeting,
    );

    return data;
  },
};

export default meetingsService;
