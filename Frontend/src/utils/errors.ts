export function getApiErrorMessage(error: unknown, fallback: string): string {
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
