import { initDB } from "./services/dbService";
import { verifyToken, extractToken } from "./services/authService";
import { getInviteByToken } from "./services/dbService";
import {
  interviewWebSocketHandler,
  buildUpgradeData,
  type SocketData,
} from "./routes/interviewSocket";
import { handleCompanyRoutes } from "./routes/companyRoutes";
import { handleCandidateRoutes } from "./routes/candidateRoutes";
import { checkRateLimit } from "./services/rateLimitService";

initDB();

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const AUTH_ENDPOINTS = new Set([
  "/api/company/login",
  "/api/company/register",
  "/api/candidate/login",
  "/api/candidate/register",
]);

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

const server = Bun.serve<SocketData>({
  port: Number(process.env.PORT) || 3000,

  async fetch(req, server) {
    const url = new URL(req.url);

    // ── CORS headers (needed later for React frontend)
    const corsHeaders = buildCorsHeaders(req.headers.get("Origin"));

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── Rate limit authentication endpoints (brute-force protection)
    if (req.method === "POST" && AUTH_ENDPOINTS.has(url.pathname.replace(/\/$/, ""))) {
      const clientIp = server.requestIP(req)?.address ?? "unknown";
      const { allowed, retryAfterSeconds } = checkRateLimit(
        `auth:${clientIp}:${url.pathname}`,
        10,
        60_000
      );
      if (!allowed) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Retry-After": String(retryAfterSeconds),
            },
          }
        );
      }
    }

    // ── WebSocket upgrade 
    if (url.pathname === "/interview") {
      const inviteToken = url.searchParams.get("token");
      const authToken = url.searchParams.get("authToken");

      if (!inviteToken || !authToken) {
        return new Response(
          JSON.stringify({ error: "token and authToken are required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const payload = verifyToken(authToken);
      if (!payload || payload.role !== "candidate") {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: corsHeaders }
        );
      }

      const invite = getInviteByToken(inviteToken);
      if (!invite) {
        return new Response(
          JSON.stringify({ error: "Invalid invite token" }),
          { status: 404, headers: corsHeaders }
        );
      }

      const upgraded = server.upgrade(req, {
        ...buildUpgradeData(payload.id, invite.id),
        headers: corsHeaders,
      });

      if (upgraded) return undefined;
    }

    // ── HTTP routes 
    let response: Response;

    try {
      if (
        url.pathname.startsWith("/api/company") ||
        url.pathname.startsWith("/api/roles") ||
        url.pathname.startsWith("/api/sessions")
      ) {
        response = await handleCompanyRoutes(req);
      } else if (
        url.pathname.startsWith("/api/candidate") ||
        url.pathname.startsWith("/api/invite")
      ) {
        response = await handleCandidateRoutes(req);
      } else {
        response = new Response(
          JSON.stringify({ message: "Voice Agent Interviewer API" }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.error("Request handling error:", error);
      response = new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Attach CORS headers to every response 
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },

  websocket: interviewWebSocketHandler,
});

console.log(`Server running at http://localhost:${server.port}`);