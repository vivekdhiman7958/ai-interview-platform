export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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
