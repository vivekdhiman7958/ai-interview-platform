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
