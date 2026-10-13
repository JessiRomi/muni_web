import api from "../config/api";

const AUTH_ENDPOINT = "/auth/login";

export const authService = {
  async login(credentials) {
    const { data } = await api.post(AUTH_ENDPOINT, {
      email: credentials.email,
      password: credentials.password,
    });

    if (!data?.access_token) {
      throw new Error("El servidor no devolvió un token de acceso.");
    }

    return data;
  },
};

export default authService;
