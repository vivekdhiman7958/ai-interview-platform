import {
  createJobRole,
  getRolesByCompany,
  getRolesById,
  createInvite,
  getInviteById,
  updateJobRole,
  deleteJobRole,
  getSessionsByRole,
  getSessionById,
  getMessagesBySession,
  type JobRoleRow,
} from "../services/dbService";
import { authenticateRequest } from "../services/authService";
import { loginAccount, registerAccount } from "../services/accountService";
import {
  frontendOrigin,
  json,
  matchParam,
  normalizePath,
  parseCustomQuestions,
  readJsonBody,
} from "../utils/http";

const ROLE_PATH = /^\/api\/roles\/([^/]+)$/;

function findOwnedRole(
  roleId: string,
  companyId: string
): JobRoleRow | Response {
  const role = getRolesById(roleId);
  if (!role) return json({ error: "Role not found" }, 404);
  if (role.company_id !== companyId) return json({ error: "Forbidden" }, 403);
  return role;
}

export async function handleCompanyRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = normalizePath(url);
  const method = req.method;

  // ── POST /api/company/register
  if (path === "/api/company/register" && method === "POST") {
    return registerAccount(req, "company");
  }

  // ── POST /api/company/login
  if (path === "/api/company/login" && method === "POST") {
    return loginAccount(req, "company");
  }

  const payload = authenticateRequest(req, "company");
  if (!payload) {
    return json({ error: "Unauthorized" }, 401);
  }

  const companyId = payload.id;

  // ── POST /api/roles
  if (path === "/api/roles" && method === "POST") {
    const parsed = await readJsonBody<{
      title: string;
      description: string;
      tech_stack: string;
      difficulty: string;
      num_questions: number;
      custom_questions: string[];
    }>(req);
    if (!parsed.ok) return parsed.response;
    const body = parsed.body;

    if (!body.title || !body.tech_stack || !body.difficulty) {
      return json({ error: "title, tech_stack and difficulty are required" }, 400);
    }

    const id = crypto.randomUUID();
    createJobRole(
      id,
      companyId,
      body.title,
      body.description || "",
      body.tech_stack,
      body.difficulty,
      body.num_questions || 5,
      JSON.stringify(body.custom_questions || [])
    );

    return json({ id, message: "Job role created" }, 201);
  }

  // ── GET /api/roles
  if (path === "/api/roles" && method === "GET") {
    return json({ roles: getRolesByCompany(companyId) });
  }

  // ── POST /api/roles/:roleId/invite
  const inviteRoleId = matchParam(path, /^\/api\/roles\/([^/]+)\/invite$/);
  if (inviteRoleId && method === "POST") {
    const role = findOwnedRole(inviteRoleId, companyId);
    if (role instanceof Response) return role;

    const inviteId = crypto.randomUUID();
    const token = crypto.randomUUID();
    createInvite(inviteId, role.id, token);

    return json({ inviteLink: `${frontendOrigin}/interview/${token}`, token }, 201);
  }

  // ── GET /api/roles/:roleId/sessions
  const sessionsRoleId = matchParam(path, /^\/api\/roles\/([^/]+)\/sessions$/);
  if (sessionsRoleId && method === "GET") {
    const role = findOwnedRole(sessionsRoleId, companyId);
    if (role instanceof Response) return role;

    return json({ sessions: getSessionsByRole(role.id) });
  }

  // ── GET | PUT | DELETE /api/roles/:roleId
  const roleId = matchParam(path, ROLE_PATH);
  if (roleId && (method === "GET" || method === "PUT" || method === "DELETE")) {
    const role = findOwnedRole(roleId, companyId);
    if (role instanceof Response) return role;

    if (method === "GET") {
      return json({ role });
    }

    if (method === "PUT") {
      const parsed = await readJsonBody<{
        title?: string;
        description?: string;
        tech_stack?: string;
        difficulty?: string;
        num_questions?: number;
        custom_questions?: string[];
      }>(req);
      if (!parsed.ok) return parsed.response;
      const body = parsed.body;

      updateJobRole(
        role.id,
        body.title ?? role.title,
        body.description ?? role.description,
        body.tech_stack ?? role.tech_stack,
        body.difficulty ?? role.difficulty,
        body.num_questions ?? role.num_questions,
        JSON.stringify(
          body.custom_questions ?? parseCustomQuestions(role.custom_questions)
        )
      );

      return json({ message: "Role updated" });
    }

    deleteJobRole(role.id);
    return json({ message: "Role deleted" });
  }

  // ── GET /api/sessions/:sessionId
  const sessionId = matchParam(path, /^\/api\/sessions\/([^/]+)$/);
  if (sessionId && method === "GET") {
    const session = getSessionById(sessionId);
    if (!session) return json({ error: "Session not found" }, 404);

    const invite = getInviteById(session.invite_id);
    const sessionRole = invite ? getRolesById(invite.role_id) : null;
    if (!sessionRole || sessionRole.company_id !== companyId) {
      return json({ error: "Forbidden" }, 403);
    }

    return json({ session, messages: getMessagesBySession(sessionId) });
  }

  return json({ error: "Not found" }, 404);
}
