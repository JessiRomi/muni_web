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

  async updateRoles(id, roles) {
    const { data } = await api.patch(`/users/${id}/roles`, { roles });
    return data;
  },

  async updateStatus(id, status) {
    const { data } = await api.patch(`/users/${id}/status`, { status });
    return data;
  },

};



export default usersService;
