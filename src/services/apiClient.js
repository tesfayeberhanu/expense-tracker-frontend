import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required.");
}

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  return data?.error || data?.message || error.message || "Request failed.";
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = new Error(getErrorMessage(error));
    apiError.status = error.response?.status;
    apiError.details = error.response?.data?.details;
    apiError.data = error.response?.data;
    return Promise.reject(apiError);
  },
);
