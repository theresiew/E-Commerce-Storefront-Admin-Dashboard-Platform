import axios from "axios";
import { AUTH_STORAGE_KEY, readStorage } from "../lib/storage";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://e-commas-apis-production.up.railway.app/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const session = readStorage(AUTH_STORAGE_KEY, null);
  const token = session?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function requestWithFallback(method, urls, data, config) {
  let latestError;

  for (const url of urls) {
    try {
      const response = await apiClient.request({
        method,
        url,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      latestError = error;

      if (error?.response?.status && error.response.status !== 404) {
        throw error;
      }
    }
  }

  throw latestError;
}
