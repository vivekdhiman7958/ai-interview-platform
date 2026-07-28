import { initDB } from "./services/dbService";
import { verifyToken } from "./services/authService";
import { getInviteByToken } from "./services/dbService";
import {
  interviewWebSocketHandler,
  buildUpgradeData,
  type SocketData,
} from "./routes/interviewSocket";
import { handleCompanyRoutes } from "./routes/companyRoutes";
import { handleCandidateRoutes } from "./routes/candidateRoutes";
import { corsHeaders, errorMessage, json, withCors } from "./utils/http";

initDB();

const server = Bun.serve<SocketData>({
  port: Number(process.env.PORT) || 3000,

  async fetch(req, server) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── WebSocket upgrade
    if (url.pathname === "/interview") {
      const inviteToken = url.searchParams.get("token");
      const authToken = url.searchParams.get("authToken");

      if (!inviteToken || !authToken) {
        return withCors(json({ error: "token and authToken are required" }, 400));
      }

      const payload = verifyToken(authToken);
      if (!payload || payload.role !== "candidate") {
        return withCors(json({ error: "Unauthorized" }, 401));
      }

      const invite = getInviteByToken(inviteToken);
      if (!invite) {
        return withCors(json({ error: "Invalid invite token" }, 404));
      }

      const upgraded = server.upgrade(req, {
        ...buildUpgradeData(payload.id, invite.id),
        headers: corsHeaders,
      });

      if (upgraded) return undefined;

      return withCors(json({ error: "WebSocket upgrade failed" }, 400));
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
        response = json({ message: "Voice Agent Interviewer API" });
      }
    } catch (error) {
      console.error(
        `Unhandled error while handling ${req.method} ${url.pathname}:`,
        errorMessage(error)
      );
      response = json({ error: "Internal server error" }, 500);
    }

    return withCors(response);
  },

  websocket: interviewWebSocketHandler,
});

console.log(`Server running at http://localhost:${server.port}`);
