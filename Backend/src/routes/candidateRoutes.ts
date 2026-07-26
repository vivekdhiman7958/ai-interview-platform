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
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    extractToken,
  } from "../services/authService";
import { json, readJsonBody } from "../utils/http";

export async function handleCandidateRoutes(req:Request): Promise<Response>{
    const url = new URL(req.url);
    // const path = url.pathname;
    const path = url.pathname.replace(/\/$/, "");
    const method = req.method;

// POST /api/candidate/registr
    if(path==="/api/candidate/register" && req.method==="POST"){
        const parsed = await readJsonBody<{
            name:string;
            email:string;
            password:string;
        }>(req);
        if (!parsed.ok) return parsed.response;
        const body = parsed.body;

        if(!body.name || !body.email || !body.password){
            return json({error:"name, email and the password are required"},400);
        }

        const existing = getCandidateByEmail(body.email);
        if(existing){
            return json({error:"Email already registered"},409)
        }
        const id=crypto.randomUUID();
        const hashed = await hashPassword(body.password);
        createCandidate(id,body.name,body.email, hashed);

        const token = generateToken({ id, email: body.email, role: "candidate" });
        return json({token,candidate:{ id, name: body.name, email: body.email }},201);
    }

    //POST /api/candidate/login
    if(path==="/api/candidate/login" && method==="POST"){
        const parsed = await readJsonBody<{ email:string; password:string}>(req);
        if (!parsed.ok) return parsed.response;
        const body = parsed.body;

        if (!body.email || !body.password) {
            return json({ error: "email and password are required" }, 400);
          }

        const candidate = getCandidateByEmail(body.email);

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
            return json({error:"Invite token is required"},400)
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
            return json({error:"Invalid session ID"},400)
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
