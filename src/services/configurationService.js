import { apiClient } from "./apiClient";

export const configurationService = {
  async getConfiguration() {
    const response = await apiClient.get("configuration");
    return response.data;
  },
};
