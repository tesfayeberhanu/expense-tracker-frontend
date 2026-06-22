import { apiClient } from "./apiClient";

export const authService = {
  async checkSession() {
    try {
      const response = await apiClient.get("session");
      return response.data;
    } catch {
      return null;
    }
  },

  async signIn(credentials) {
    const response = await apiClient.post("login", credentials);
    return response.data;
  },

  async signOut() {
    const response = await apiClient.post("logout");
    return response.data;
  },

  async changePassword(passwords) {
    const response = await apiClient.put("password", passwords);
    return response.data;
  },
};
