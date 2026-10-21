import api from "../config/api";

const AUTH_ENDPOINT = "/auth/login";
const REGISTER_ENDPOINT = "/auth/register";

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

  async register(userData) {
    const { data } = await api.post(REGISTER_ENDPOINT, {
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      ...(userData.phone?.trim() && {
        phone: userData.phone.trim(),
      }),
    });

    return data;
  },
};

export default authService;
