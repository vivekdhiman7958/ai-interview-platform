import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("auth_user");
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.error("Stored auth_user is corrupted, clearing it", error);
      localStorage.removeItem("auth_user");
    }
  }
  return config;
});

export function getErrorMessage(error: unknown, fallback: string): string {
  const serverError = (error as { response?: { data?: { error?: string } } })
    ?.response?.data?.error;
  if (serverError) return serverError;
  if ((error as { code?: string })?.code === "ERR_NETWORK") {
    return "Could not reach the server. Is the backend running?";
  }
  return fallback;
}

/** Parses a stored report/JSON column without throwing on malformed data. */
export function safeJsonParse<T>(raw: string | null, what: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to parse ${what}`, error);
    return null;
  }
}

export default api;
