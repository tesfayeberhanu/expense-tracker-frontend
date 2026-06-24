import { apiClient } from "./apiClient";

const createTransaction = async (transaction) => {
  const response = await apiClient.post("transactions", transaction);
  return response.data;
};

export const transactionsService = {
  async getTransactions() {
    const response = await apiClient.get("transactions");
    return response.data;
  },

  createTransaction,

  async updateTransaction(id, transaction) {
    const response = await apiClient.put(`transactions/${id}`, transaction);
    return response.data;
  },

  async createTransactions(transactions) {
    const savedTransactions = [];

    for (const transaction of transactions) {
      savedTransactions.push(await createTransaction(transaction));
    }

    return savedTransactions;
  },
};
