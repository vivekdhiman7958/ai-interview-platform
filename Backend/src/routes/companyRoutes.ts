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
    getMessagesBySession
} from "../services/dbService";
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

        if(!body.name || !body.email || !body.password){
            return json({ error: "name, email and password are required" }, 400);
        }

        const existing = getCompanyByEmail(body.email);
        if (existing) {
            return json({ error: "Email already registered" }, 409);
          }

        const id = crypto.randomUUID();

        const hashed = await hashPassword(body.password);
        createCompany(id,body.name, body.email, hashed);

        const token = generateToken({ id, email: body.email, role: "company" });
        
        return json({ token, company: { id, name: body.name, email: body.email } }, 201);
    }


//POST /api/company/login

    if(req.method==="POST" && path==="/api/company/login"){
        const body = await req.json() as { email: string; password: string };
        if (!body.email || !body.password) {
            return json({ error: "email and password are required" }, 400);
          }
        
        const company = getCompanyByEmail(body.email);
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

        const inviteLink = `http://localhost:5173/interview/${token}`;
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

  updateJobRole(
    roleId,
    body.title ?? role.title,
    body.description ?? role.description,
    body.tech_stack ?? role.tech_stack,
    body.difficulty ?? role.difficulty,
    body.num_questions ?? role.num_questions,
    JSON.stringify(body.custom_questions ?? JSON.parse(role.custom_questions || "[]"))
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