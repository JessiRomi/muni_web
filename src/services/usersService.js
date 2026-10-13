import api from "../config/api";

const usersService = {
  async getAll() {
    const { data } = await api.get("/users");
    return data;
  },
};

export default usersService;
