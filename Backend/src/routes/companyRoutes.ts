import {
    createCompany,
    getCompanyByEmail,
    createJobRole,
    getRolesByCompany,
    getRolesById,
    createInvite,
    getInviteByToken,
    createCandidate,
    getCandidateByEmail,
    getCandidateById,
    createSession,
    endSession,
    saveReport,
    saveMessage,
    updateJobRole,
    deleteJobRole,
    getSessionsByCandidate,
    getSessionsByRole,
    getSessionById,
    getMessagesBySession,
    getSessionOwnerCompanyId
} from "../services/dbService";
import {
    isNonEmptyString,
    isValidEmail,
    isValidPassword,
    normalizeEmail,
    sanitizeCustomQuestions,
    MAX_NAME_LENGTH,
    MAX_TEXT_LENGTH,
    MIN_PASSWORD_LENGTH,
} from "../services/validationService";
import {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken, 
    extractToken,
  } from "../services/authService";

export async function handleCompanyRoutes(req:Request):Promise<Response>{
    const url = new URL(req.url);
    // const path = url.pathname;
    const path = url.pathname.replace(/\/$/, "");
    const method = req.method;

//POST /api/company/register
    if(req.method==="POST" && path==="/api/company/register"){
        const body = await req.json() as {
            name:string;
            email:string;
            password:string;
        };

        if(!isNonEmptyString(body.name, MAX_NAME_LENGTH)){
            return json({ error: "name is required" }, 400);
        }
        if(!isValidEmail(body.email)){
            return json({ error: "A valid email is required" }, 400);
        }
        if(!isValidPassword(body.password)){
            return json({ error: `password must be at least ${MIN_PASSWORD_LENGTH} characters` }, 400);
        }

        const email = normalizeEmail(body.email);
        const name = body.name.trim();

        const existing = getCompanyByEmail(email);
        if (existing) {
            return json({ error: "Email already registered" }, 409);
          }

        const id = crypto.randomUUID();

        const hashed = await hashPassword(body.password);
        createCompany(id, name, email, hashed);

        const token = generateToken({ id, email, role: "company" });
        
        return json({ token, company: { id, name, email } }, 201);
    }


//POST /api/company/login

    if(req.method==="POST" && path==="/api/company/login"){
        const body = await req.json() as { email: string; password: string };
        if (!body.email || !body.password) {
            return json({ error: "email and password are required" }, 400);
          }
        
        const company = getCompanyByEmail(normalizeEmail(body.email));
          if (!company) {
            return json({ error: "Invalid credentials" }, 401);
          }
        
        const valid = await verifyPassword(body.password, company.password);
          if (!valid) {
            return json({ error: "Invalid credentials" }, 401);
          }

        const token = generateToken({
            id: company.id,
            email: company.email,
            role: "company",
          });
          return json({ token, company: { id: company.id, name: company.name, email: company.email } });
    }

    const token = extractToken(req);
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== "company") {
        return json({ error: "Unauthorized" }, 401);
      }

    const companyId = payload.id;

    // ── POST /api/roles
    if (path === "/api/roles" && method === "POST") {
    const body = await req.json() as {
      title: string;
      description: string;
      tech_stack: string;
      difficulty: string;
      num_questions: number;
      custom_questions: string[];
    };

    if (
      !isNonEmptyString(body.title, MAX_NAME_LENGTH) ||
      !isNonEmptyString(body.tech_stack, MAX_TEXT_LENGTH) ||
      !isNonEmptyString(body.difficulty, MAX_NAME_LENGTH)
    ) {
      return json({ error: "title, tech_stack and difficulty are required" }, 400);
    }
    if (body.description !== undefined && typeof body.description !== "string") {
      return json({ error: "description must be a string" }, 400);
    }

    const numQuestions = clampQuestionCount(body.num_questions);

    const id = crypto.randomUUID();
    createJobRole(
      id,
      companyId,
      body.title.trim(),
      (body.description || "").slice(0, MAX_TEXT_LENGTH),
      body.tech_stack.trim(),
      body.difficulty.trim(),
      numQuestions,
      JSON.stringify(sanitizeCustomQuestions(body.custom_questions))
    );

    return json({ id, message: "Job role created" }, 201);
  }


    if (path === "/api/roles" && method === "GET") {
      const roles = getRolesByCompany(companyId);
      return json({ roles });
    }

// ── POST /api/roles/:roleId/invite
    const inviteMatch = path.match(/^\/api\/roles\/([^/]+)\/invite$/);
    if(req.method==="POST" && inviteMatch){
        const roleId = inviteMatch[1];
        if (!roleId) {
            return new Response("Invalid role ID", { status: 400 });
        }
        const role = getRolesById(roleId);

        if (!role) {
            return json({ error: "Role not found" }, 404);
          }

        if (role.company_id !== companyId) {
            return json({ error: "Forbidden" }, 403);
          }

        const inviteId = crypto.randomUUID();
        const token = crypto.randomUUID();
        createInvite(inviteId, roleId, token);

        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
        const inviteLink = `${frontendUrl}/interview/${token}`;
        return json({ inviteLink, token }, 201);
    }



    // ── PUT /api/roles/:roleId ───────────────────────────────
const updateRoleMatch = path.match(/^\/api\/roles\/([^/]+)$/);
if (updateRoleMatch && method === "PUT") {
  const roleId = updateRoleMatch[1];
  if(!roleId){
    return json({erorr:"Invalid role ID"},400);
  }
  const role = getRolesById(roleId);

  if (!role) return json({ error: "Role not found" }, 404);
  if (role.company_id !== companyId) return json({ error: "Forbidden" }, 403);

  const body = await req.json() as {
    title?: string;
    description?: string;
    tech_stack?: string;
    difficulty?: string;
    num_questions?: number;
    custom_questions?: string[];
  };

  if (body.title !== undefined && !isNonEmptyString(body.title, MAX_NAME_LENGTH)) {
    return json({ error: "title must be a non-empty string" }, 400);
  }
  if (body.tech_stack !== undefined && !isNonEmptyString(body.tech_stack, MAX_TEXT_LENGTH)) {
    return json({ error: "tech_stack must be a non-empty string" }, 400);
  }
  if (body.difficulty !== undefined && !isNonEmptyString(body.difficulty, MAX_NAME_LENGTH)) {
    return json({ error: "difficulty must be a non-empty string" }, 400);
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    return json({ error: "description must be a string" }, 400);
  }

  updateJobRole(
    roleId,
    body.title?.trim() ?? role.title,
    (body.description ?? role.description ?? "").slice(0, MAX_TEXT_LENGTH),
    body.tech_stack?.trim() ?? role.tech_stack,
    body.difficulty?.trim() ?? role.difficulty,
    body.num_questions === undefined
      ? role.num_questions
      : clampQuestionCount(body.num_questions),
    JSON.stringify(
      body.custom_questions === undefined
        ? sanitizeCustomQuestions(safeParseQuestions(role.custom_questions))
        : sanitizeCustomQuestions(body.custom_questions)
    )
  );

  return json({ message: "Role updated" });
}

// ── DELETE /api/roles/:roleId ────────────────────────────
const deleteRoleMatch = path.match(/^\/api\/roles\/([^/]+)$/);
if (deleteRoleMatch && method === "DELETE") {
  const roleId = deleteRoleMatch[1];
  if(!roleId){
    return json({erorr:"Invalid role ID"},400);
  }
  const role = getRolesById(roleId);

  if (!role) return json({ error: "Role not found" }, 404);
  if (role.company_id !== companyId) return json({ error: "Forbidden" }, 403);

  deleteJobRole(roleId);
  return json({ message: "Role deleted" });
}

// ── POST /api/roles/:roleId/invite
    const sessionsMatch = path.match(/^\/api\/roles\/([^/]+)\/sessions$/);
    if (sessionsMatch && method === "GET") {
        const roleId = sessionsMatch[1];
        if (!roleId) {
            return new Response("Invalid role ID", { status: 400 });
        }
        const role = getRolesById(roleId);

        if (!role) return json({ error: "Role not found" }, 404);
        if (role.company_id !== companyId) return json({ error: "Forbidden" }, 403);

        const sessions = getSessionsByRole(roleId);
        return json({ sessions });
    }


    // ── GET /api/roles/:roleId ───────────────────────────────
const getRoleMatch = path.match(/^\/api\/roles\/([^/]+)$/);
if (getRoleMatch && method === "GET") {
  const roleId = getRoleMatch[1];
  if(!roleId){
    return json({error:"Invalid role ID"},400);
  }
  const role = getRolesById(roleId);
  if (!role) return json({ error: "Role not found" }, 404);
  if (role.company_id !== companyId) return json({ error: "Forbidden" }, 403);
  return json({ role });
}

// ── GET /api/sessions/:sessionId ────────────────────────
    const sessionMatch = path.match(/^\/api\/sessions\/([^/]+)$/);
        if (sessionMatch && method === "GET") {
            const sessionId = sessionMatch[1];
            if (!sessionId) {
                return new Response("Invalid role ID", { status: 400 });
            }

            const session = getSessionById(sessionId);

            if (!session) return json({ error: "Session not found" }, 404);
            if (getSessionOwnerCompanyId(sessionId) !== companyId) {
                return json({ error: "Forbidden" }, 403);
            }

            const messages = getMessagesBySession(sessionId);
            return json({ session, messages });
        }

        return json({ error: "Not found" }, 404);
    }

    function json(data: unknown, status = 200): Response {
        return new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" },
    });

}

function clampQuestionCount(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 5;
    return Math.min(20, Math.max(1, Math.floor(parsed)));
}

function safeParseQuestions(raw: string | null): string[] {
    if (!raw) return [];
    try {
        return JSON.parse(raw) as string[];
    } catch {
        return [];
    }
}