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
    getSessionsByCandidate,
    getSessionsByRole,
    getSessionById,
    getMessagesBySession
} from "../services/dbService";
import {
    isNonEmptyString,
    isValidEmail,
    isValidPassword,
    normalizeEmail,
    MAX_NAME_LENGTH,
    MIN_PASSWORD_LENGTH,
} from "../services/validationService";
import {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    extractToken,
  } from "../services/authService";

export async function handleCandidateRoutes(req:Request): Promise<Response>{
    const url = new URL(req.url);
    // const path = url.pathname;
    const path = url.pathname.replace(/\/$/, "");
    const method = req.method;

// POST /api/candidate/registr
    if(path==="/api/candidate/register" && req.method==="POST"){
        const body = await req.json() as {
            name:string;
            email:string;
            password:string;
        };

        if(!isNonEmptyString(body.name, MAX_NAME_LENGTH)){
            return json({error:"name is required"},400);
        }
        if(!isValidEmail(body.email)){
            return json({error:"A valid email is required"},400);
        }
        if(!isValidPassword(body.password)){
            return json({error:`password must be at least ${MIN_PASSWORD_LENGTH} characters`},400);
        }

        const email = normalizeEmail(body.email);
        const name = body.name.trim();

        const existing = getCandidateByEmail(email);
        if(existing){
            return json({error:"Email already registered"},409)
        }
        const id=crypto.randomUUID();
        const hashed = await hashPassword(body.password);
        createCandidate(id, name, email, hashed);

        const token = generateToken({ id, email, role: "candidate" });
        return json({token,candidate:{ id, name, email }},201);
    }

    //POST /api/candidate/login
    if(path==="/api/candidate/login" && method==="POST"){
        const body = await req.json() as { email:string; password:string};

        if (!body.email || !body.password) {
            return json({ error: "email and password are required" }, 400);
          }

        const candidate = getCandidateByEmail(normalizeEmail(body.email));

        if (!candidate) {
            return json({ error: "Invalid credentials" }, 401);
          }
        
        const valid = await verifyPassword(body.password, candidate.password);
        if (!valid) {
            return json({ error: "Invalid credentials" }, 401);
          }
        
        const token = generateToken({
            id: candidate.id,
            email: candidate.email,
            role: "candidate",
          });

        return json({
            token,
            candidate: { id: candidate.id, name: candidate.name, email: candidate.email },
          });
    }

    // ── GET /api/invite/:token
    const inviteMatch = path.match(/^\/api\/invite\/([^/]+)$/);
    if (inviteMatch && method === "GET") {
        const inviteToken = inviteMatch[1];

        if(!inviteToken){
            return json({error:""})
        }
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

  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "candidate") {
    return json({ error: "Unauthorized" }, 401);
  }

  const candidateId = payload.id;

// ── GET /api/candidate/sessions

    if (path === "/api/candidate/sessions" && method === "GET") {
        const sessions = getSessionsByCandidate(candidateId);
        return json({ sessions });
    }

// ── GET /api/candidate/sessions/:sessionId

    const sessionMatch = path.match(/^\/api\/candidate\/sessions\/([^/]+)$/);
      if (sessionMatch && method === "GET") {
        const sessionId = sessionMatch[1];
        if(!sessionId){
            return json({erorr:"Invalid sessionID"},403)
        }
        const session = getSessionById(sessionId);

        if (!session) return json({ error: "Session not found" }, 404);
        if (session.candidate_id !== candidateId) {
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