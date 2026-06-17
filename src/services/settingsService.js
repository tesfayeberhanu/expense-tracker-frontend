import { apiClient } from "./apiClient";

export const settingsService = {
  async getSettings() {
    const response = await apiClient.get("settings");
    return response.data;
  },

  async updateSettings(settings) {
    const response = await apiClient.put("settings", settings);
    return response.data;
  },
};
