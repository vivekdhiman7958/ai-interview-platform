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

initDB();

const server = Bun.serve<SocketData>({
  port: Number(process.env.PORT) || 3000,

  async fetch(req, server) {
    const url = new URL(req.url);

    // ── CORS headers (needed later for React frontend)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
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