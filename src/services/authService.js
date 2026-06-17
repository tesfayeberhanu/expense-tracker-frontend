import { apiClient } from "./apiClient";

export const authService = {
  async checkSession() {
    try {
      await apiClient.get("session");
      return true;
    } catch {
      return false;
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
