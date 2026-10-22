import api from "../config/api";

const usersService = {
  async getAll() {
    const { data } = await api.get("/users");
    return data;
  },

  async getMyProfile() {
    const { data } = await api.get("/users/me");
    return data;
  },

  async updateMyProfile(profile) {
    const { data } = await api.patch("/users/me", profile);
    return data;
  },
};

export default usersService;
