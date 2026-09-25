import axios, { isAxiosError } from "axios";

import { useAuthStore } from "@/store/auth";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(undefined, (error: unknown) => {
  // An expired or revoked session sends the user back to the login page.
  if (isAxiosError(error) && error.response?.status === 401 && useAuthStore.getState().token) {
    useAuthStore.getState().clear();
  }
  return Promise.reject(error);
});

type ErrorBody = {
  error?: string;
  fields?: Record<string, string>;
};

/** Human-readable message from an API error. */
export function errorMessage(error: unknown, fallback = "Something went wrong.") {
  if (isAxiosError<ErrorBody>(error)) {
    return error.response?.data?.error ?? error.message ?? fallback;
  }
  return fallback;
}

/** Field → message map from a 409/422 API error. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (isAxiosError<ErrorBody>(error)) {
    return error.response?.data?.fields ?? {};
  }
  return {};
}
