import {
  getRolesById,
  getInviteByToken,
  getSessionsByCandidate,
  getSessionById,
  getMessagesBySession,
} from "../services/dbService";
import { authenticateRequest } from "../services/authService";
import { loginAccount, registerAccount } from "../services/accountService";
import { json, matchParam, normalizePath } from "../utils/http";

export async function handleCandidateRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = normalizePath(url);
  const method = req.method;

  // ── POST /api/candidate/register
  if (path === "/api/candidate/register" && method === "POST") {
    return registerAccount(req, "candidate");
  }

  // ── POST /api/candidate/login
  if (path === "/api/candidate/login" && method === "POST") {
    return loginAccount(req, "candidate");
  }

  // ── GET /api/invite/:token
  const inviteToken = matchParam(path, /^\/api\/invite\/([^/]+)$/);
  if (inviteToken && method === "GET") {
    const invite = getInviteByToken(inviteToken);
    if (!invite) {
      return json({ error: "Invalid or expired invite link" }, 404);
    }

    const role = getRolesById(invite.role_id);
    if (!role) {
      return json({ error: "Role not found" }, 404);
    }

    return json({
      invite: { id: invite.id, token: inviteToken },
      role: {
        title: role.title,
        description: role.description,
        tech_stack: role.tech_stack,
        difficulty: role.difficulty,
        num_questions: role.num_questions,
      },
    });
  }

  const payload = authenticateRequest(req, "candidate");
  if (!payload) {
    return json({ error: "Unauthorized" }, 401);
  }

  const candidateId = payload.id;

  // ── GET /api/candidate/sessions
  if (path === "/api/candidate/sessions" && method === "GET") {
    return json({ sessions: getSessionsByCandidate(candidateId) });
  }

  // ── GET /api/candidate/sessions/:sessionId
  const sessionId = matchParam(path, /^\/api\/candidate\/sessions\/([^/]+)$/);
  if (sessionId && method === "GET") {
    const session = getSessionById(sessionId);

    if (!session) return json({ error: "Session not found" }, 404);
    if (session.candidate_id !== candidateId) {
      return json({ error: "Forbidden" }, 403);
    }

    return json({ session, messages: getMessagesBySession(sessionId) });
  }

  return json({ error: "Not found" }, 404);
}
