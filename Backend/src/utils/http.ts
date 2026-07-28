export const frontendOrigin =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";

export const corsHeaders = {
  "Access-Control-Allow-Origin": frontendOrigin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

export function normalizePath(url: URL): string {
  return url.pathname.replace(/\/$/, "");
}

export function matchParam(path: string, pattern: RegExp): string | null {
  return path.match(pattern)?.[1] ?? null;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export type BodyResult<T> =
  | { ok: true; body: T }
  | { ok: false; response: Response };

export async function readJsonBody<T>(req: Request): Promise<BodyResult<T>> {
  try {
    const body = (await req.json()) as unknown;
    if (body === null || typeof body !== "object") {
      return {
        ok: false,
        response: json({ error: "Request body must be a JSON object" }, 400),
      };
    }
    return { ok: true, body: body as T };
  } catch (error) {
    console.error("Failed to parse request body:", errorMessage(error));
    return { ok: false, response: json({ error: "Invalid JSON body" }, 400) };
  }
}

/** Parses a stored JSON array column, tolerating malformed data. */
export function parseCustomQuestions(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch (error) {
    console.error(
      "Stored custom_questions is not valid JSON:",
      errorMessage(error)
    );
    return [];
  }
}
