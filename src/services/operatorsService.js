import { apiClient } from "./apiClient";

export const operatorsService = {
  async getOperators() {
    const response = await apiClient.get("operators");
    return response.data;
  },

  async createOperator(operator) {
    const response = await apiClient.post("operators", operator);
    return response.data;
  },

  async updateOperator(id, operator) {
    const response = await apiClient.put(`operators/${id}`, operator);
    return response.data;
  },

  async deactivateOperator(id) {
    const response = await apiClient.delete(`operators/${id}`);
    return response.data;
  },
};
