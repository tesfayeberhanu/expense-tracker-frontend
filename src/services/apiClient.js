import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isExternalApiUrl = /^https?:\/\//i.test(configuredBaseUrl || "");
const API_BASE_URL =
  import.meta.env.PROD && isExternalApiUrl
    ? "/api/"
    : configuredBaseUrl || "/api/";

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
