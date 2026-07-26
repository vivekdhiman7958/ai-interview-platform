import { beforeAll, describe, expect, test } from "bun:test";
import { handleCandidateRoutes } from "../src/routes/candidateRoutes";
import { generateToken, hashPassword } from "../src/services/authService";
import {
  createCandidate,
  createCompany,
  createInvite,
  createJobRole,
  createSession,
  initDB,
  saveMessage,
} from "../src/services/dbService";

const id = () => crypto.randomUUID();
const email = () => `${crypto.randomUUID()}@example.com`;

function request(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
) {
  return new Request(`http://localhost:3000${path}`, {
    method: options.method ?? "GET",
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : {},
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

async function call(path: string, options?: { method?: string; body?: unknown; token?: string }) {
  const response = await handleCandidateRoutes(request(path, options));
  return { status: response.status, body: (await response.json()) as Record<string, any> };
}

async function registeredCandidate(password = "secret123") {
  const candidateId = id();
  const candidateEmail = email();
  createCandidate(candidateId, "Ada", candidateEmail, await hashPassword(password));
  return {
    candidateId,
    candidateEmail,
    token: generateToken({ id: candidateId, email: candidateEmail, role: "candidate" }),
  };
}

function seedInvite() {
  const companyId = id();
  createCompany(companyId, "Acme", email(), "hashed");
  const roleId = id();
  createJobRole(
    roleId,
    companyId,
    "Backend Engineer",
    "Own the API",
    "Bun, SQLite",
    "hard",
    4,
    JSON.stringify([])
  );
  const inviteId = id();
  const inviteToken = id();
  createInvite(inviteId, roleId, inviteToken);
  return { inviteId, inviteToken, roleId };
}

beforeAll(() => {
  initDB();
});

describe("POST /api/candidate/register", () => {
  test("creates a candidate and returns a usable token", async () => {
    const candidateEmail = email();
    const { status, body } = await call("/api/candidate/register", {
      method: "POST",
      body: { name: "Ada", email: candidateEmail, password: "secret123" },
    });

    expect(status).toBe(201);
    expect(body.candidate.email).toBe(candidateEmail);
    expect(body.token).toBeString();

    const sessions = await call("/api/candidate/sessions", { token: body.token });
    expect(sessions.status).toBe(200);
  });

  test("rejects missing fields", async () => {
    const { status, body } = await call("/api/candidate/register", {
      method: "POST",
      body: { email: email() },
    });
    expect(status).toBe(400);
    expect(body.error).toContain("required");
  });

  test("rejects a duplicate email", async () => {
    const { candidateEmail } = await registeredCandidate();
    const { status, body } = await call("/api/candidate/register", {
      method: "POST",
      body: { name: "Ada", email: candidateEmail, password: "secret123" },
    });
    expect(status).toBe(409);
    expect(body.error).toBe("Email already registered");
  });
});

describe("POST /api/candidate/login", () => {
  test("returns a token for valid credentials", async () => {
    const { candidateId, candidateEmail } = await registeredCandidate();
    const { status, body } = await call("/api/candidate/login", {
      method: "POST",
      body: { email: candidateEmail, password: "secret123" },
    });

    expect(status).toBe(200);
    expect(body.candidate.id).toBe(candidateId);
    expect(body.token).toBeString();
  });

  test("rejects a wrong password", async () => {
    const { candidateEmail } = await registeredCandidate();
    const { status } = await call("/api/candidate/login", {
      method: "POST",
      body: { email: candidateEmail, password: "wrong" },
    });
    expect(status).toBe(401);
  });

  test("rejects an unknown email", async () => {
    const { status } = await call("/api/candidate/login", {
      method: "POST",
      body: { email: "nobody@example.com", password: "secret123" },
    });
    expect(status).toBe(401);
  });

  test("rejects missing fields", async () => {
    const { status } = await call("/api/candidate/login", { method: "POST", body: {} });
    expect(status).toBe(400);
  });
});

describe("GET /api/invite/:token", () => {
  test("returns the invite and its role without auth", async () => {
    const { inviteId, inviteToken } = seedInvite();

    const { status, body } = await call(`/api/invite/${inviteToken}`);

    expect(status).toBe(200);
    expect(body.invite).toEqual({ id: inviteId, token: inviteToken });
    expect(body.role).toEqual({
      title: "Backend Engineer",
      description: "Own the API",
      tech_stack: "Bun, SQLite",
      difficulty: "hard",
      num_questions: 4,
    });
  });

  test("tolerates a trailing slash", async () => {
    const { inviteToken } = seedInvite();
    const { status } = await call(`/api/invite/${inviteToken}/`);
    expect(status).toBe(200);
  });

  test("404s for an unknown invite", async () => {
    const { status, body } = await call("/api/invite/missing");
    expect(status).toBe(404);
    expect(body.error).toBe("Invalid or expired invite link");
  });
});

describe("authentication guard", () => {
  test("401s without a token", async () => {
    const { status, body } = await call("/api/candidate/sessions");
    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  test("401s for an invalid token", async () => {
    const { status } = await call("/api/candidate/sessions", { token: "garbage" });
    expect(status).toBe(401);
  });

  test("401s for a company token", async () => {
    const token = generateToken({ id: id(), email: email(), role: "company" });
    const { status } = await call("/api/candidate/sessions", { token });
    expect(status).toBe(401);
  });
});

describe("candidate sessions", () => {
  async function seedSession() {
    const candidate = await registeredCandidate();
    const { inviteId } = seedInvite();
    const sessionId = id();
    createSession(sessionId, inviteId, candidate.candidateId, "octocat");
    return { ...candidate, sessionId };
  }

  test("lists only the caller's sessions", async () => {
    const { token, sessionId } = await seedSession();
    const other = await seedSession();

    const { status, body } = await call("/api/candidate/sessions", { token });

    expect(status).toBe(200);
    expect(body.sessions.map((s: { id: string }) => s.id)).toEqual([sessionId]);
    expect(body.sessions.map((s: { id: string }) => s.id)).not.toContain(other.sessionId);
  });

  test("returns a session with its messages", async () => {
    const { token, sessionId } = await seedSession();
    saveMessage(sessionId, "assistant", "What is a closure?");

    const { status, body } = await call(`/api/candidate/sessions/${sessionId}`, { token });

    expect(status).toBe(200);
    expect(body.session.id).toBe(sessionId);
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].content).toBe("What is a closure?");
  });

  test("404s for an unknown session", async () => {
    const { token } = await seedSession();
    const { status, body } = await call("/api/candidate/sessions/missing", { token });
    expect(status).toBe(404);
    expect(body.error).toBe("Session not found");
  });

  test("403s when the session belongs to another candidate", async () => {
    const { token } = await seedSession();
    const other = await seedSession();

    const { status, body } = await call(`/api/candidate/sessions/${other.sessionId}`, { token });

    expect(status).toBe(403);
    expect(body.error).toBe("Forbidden");
  });
});

describe("unknown routes", () => {
  test("404s for an authenticated unknown path", async () => {
    const { token } = await registeredCandidate();
    const { status, body } = await call("/api/candidate/nope", { token });
    expect(status).toBe(404);
    expect(body.error).toBe("Not found");
  });
});
