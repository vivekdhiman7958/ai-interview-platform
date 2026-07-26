import { beforeAll, describe, expect, test } from "bun:test";
import { handleCompanyRoutes } from "../src/routes/companyRoutes";
import { generateToken, hashPassword } from "../src/services/authService";
import {
  createCandidate,
  createCompany,
  createInvite,
  createJobRole,
  createSession,
  getInviteByToken,
  getRolesById,
  initDB,
  saveMessage,
} from "../src/services/dbService";

const id = () => crypto.randomUUID();
const email = () => `${crypto.randomUUID()}@example.com`;

async function call(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
) {
  const response = await handleCompanyRoutes(
    new Request(`http://localhost:3000${path}`, {
      method: options.method ?? "GET",
      headers: options.token ? { Authorization: `Bearer ${options.token}` } : {},
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  );
  const text = await response.text();
  let body: Record<string, any> = {};
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  return { status: response.status, body };
}

async function registeredCompany(password = "secret123") {
  const companyId = id();
  const companyEmail = email();
  createCompany(companyId, "Acme", companyEmail, await hashPassword(password));
  return {
    companyId,
    companyEmail,
    token: generateToken({ id: companyId, email: companyEmail, role: "company" }),
  };
}

function seedRole(companyId: string) {
  const roleId = id();
  createJobRole(
    roleId,
    companyId,
    "Backend Engineer",
    "Own the API",
    "Bun, SQLite",
    "hard",
    4,
    JSON.stringify(["Why Bun?"])
  );
  return roleId;
}

beforeAll(() => {
  initDB();
});

describe("POST /api/company/register", () => {
  test("creates a company and returns a usable token", async () => {
    const companyEmail = email();
    const { status, body } = await call("/api/company/register", {
      method: "POST",
      body: { name: "Acme", email: companyEmail, password: "secret123" },
    });

    expect(status).toBe(201);
    expect(body.company.email).toBe(companyEmail);

    const roles = await call("/api/roles", { token: body.token });
    expect(roles.status).toBe(200);
    expect(roles.body.roles).toEqual([]);
  });

  test("rejects missing fields", async () => {
    const { status } = await call("/api/company/register", {
      method: "POST",
      body: { name: "Acme" },
    });
    expect(status).toBe(400);
  });

  test("rejects a duplicate email", async () => {
    const { companyEmail } = await registeredCompany();
    const { status, body } = await call("/api/company/register", {
      method: "POST",
      body: { name: "Acme", email: companyEmail, password: "secret123" },
    });
    expect(status).toBe(409);
    expect(body.error).toBe("Email already registered");
  });
});

describe("POST /api/company/login", () => {
  test("returns a token for valid credentials", async () => {
    const { companyId, companyEmail } = await registeredCompany();
    const { status, body } = await call("/api/company/login", {
      method: "POST",
      body: { email: companyEmail, password: "secret123" },
    });
    expect(status).toBe(200);
    expect(body.company.id).toBe(companyId);
  });

  test("rejects a wrong password and an unknown email", async () => {
    const { companyEmail } = await registeredCompany();
    expect(
      (await call("/api/company/login", { method: "POST", body: { email: companyEmail, password: "nope" } })).status
    ).toBe(401);
    expect(
      (await call("/api/company/login", { method: "POST", body: { email: "nobody@example.com", password: "x" } })).status
    ).toBe(401);
  });

  test("rejects missing fields", async () => {
    const { status } = await call("/api/company/login", { method: "POST", body: {} });
    expect(status).toBe(400);
  });
});

describe("authentication guard", () => {
  test("401s without a token, with a bad token, or with a candidate token", async () => {
    expect((await call("/api/roles")).status).toBe(401);
    expect((await call("/api/roles", { token: "garbage" })).status).toBe(401);
    const candidateToken = generateToken({ id: id(), email: email(), role: "candidate" });
    expect((await call("/api/roles", { token: candidateToken })).status).toBe(401);
  });
});

describe("job roles", () => {
  test("creates a role with defaults for optional fields", async () => {
    const { token } = await registeredCompany();

    const { status, body } = await call("/api/roles", {
      method: "POST",
      token,
      body: { title: "Backend Engineer", tech_stack: "Bun", difficulty: "hard" },
    });

    expect(status).toBe(201);
    const role = getRolesById(body.id);
    expect(role?.description).toBe("");
    expect(role?.num_questions).toBe(5);
    expect(role?.custom_questions).toBe("[]");
  });

  test("rejects a role without required fields", async () => {
    const { token } = await registeredCompany();
    const { status, body } = await call("/api/roles", {
      method: "POST",
      token,
      body: { title: "Backend Engineer" },
    });
    expect(status).toBe(400);
    expect(body.error).toContain("required");
  });

  test("lists only the caller's roles", async () => {
    const { companyId, token } = await registeredCompany();
    const roleId = seedRole(companyId);
    const other = await registeredCompany();
    seedRole(other.companyId);

    const { body } = await call("/api/roles", { token });
    expect(body.roles.map((r: { id: string }) => r.id)).toEqual([roleId]);
  });

  test("returns a single role, and hides other companies' roles", async () => {
    const { companyId, token } = await registeredCompany();
    const roleId = seedRole(companyId);
    const other = await registeredCompany();
    const otherRoleId = seedRole(other.companyId);

    const mine = await call(`/api/roles/${roleId}`, { token });
    expect(mine.status).toBe(200);
    expect(mine.body.role.title).toBe("Backend Engineer");

    expect((await call(`/api/roles/${otherRoleId}`, { token })).status).toBe(403);
    expect((await call("/api/roles/missing", { token })).status).toBe(404);
  });

  test("updates only the supplied fields", async () => {
    const { companyId, token } = await registeredCompany();
    const roleId = seedRole(companyId);

    const { status } = await call(`/api/roles/${roleId}`, {
      method: "PUT",
      token,
      body: { title: "Staff Engineer" },
    });

    expect(status).toBe(200);
    const role = getRolesById(roleId);
    expect(role?.title).toBe("Staff Engineer");
    expect(role?.tech_stack).toBe("Bun, SQLite");
    expect(role?.num_questions).toBe(4);
    expect(JSON.parse(role?.custom_questions ?? "[]")).toEqual(["Why Bun?"]);
  });

  test("refuses to update another company's role", async () => {
    const { token } = await registeredCompany();
    const other = await registeredCompany();
    const otherRoleId = seedRole(other.companyId);

    const { status } = await call(`/api/roles/${otherRoleId}`, {
      method: "PUT",
      token,
      body: { title: "Hijacked" },
    });

    expect(status).toBe(403);
    expect(getRolesById(otherRoleId)?.title).toBe("Backend Engineer");
  });

  test("deletes a role and its invites", async () => {
    const { companyId, token } = await registeredCompany();
    const roleId = seedRole(companyId);
    const inviteToken = id();
    createInvite(id(), roleId, inviteToken);

    const { status } = await call(`/api/roles/${roleId}`, { method: "DELETE", token });

    expect(status).toBe(200);
    expect(getRolesById(roleId)).toBeNull();
    expect(getInviteByToken(inviteToken)).toBeNull();
  });

  test("refuses to delete another company's role", async () => {
    const { token } = await registeredCompany();
    const other = await registeredCompany();
    const otherRoleId = seedRole(other.companyId);

    const { status } = await call(`/api/roles/${otherRoleId}`, { method: "DELETE", token });

    expect(status).toBe(403);
    expect(getRolesById(otherRoleId)).not.toBeNull();
  });
});

describe("POST /api/roles/:roleId/invite", () => {
  test("creates an invite pointing at the role", async () => {
    const { companyId, token } = await registeredCompany();
    const roleId = seedRole(companyId);

    const { status, body } = await call(`/api/roles/${roleId}/invite`, { method: "POST", token });

    expect(status).toBe(201);
    expect(body.inviteLink).toBe(`http://localhost:5173/interview/${body.token}`);
    expect(getInviteByToken(body.token)?.role_id).toBe(roleId);
  });

  test("404s for an unknown role and 403s for another company's role", async () => {
    const { token } = await registeredCompany();
    const other = await registeredCompany();
    const otherRoleId = seedRole(other.companyId);

    expect((await call("/api/roles/missing/invite", { method: "POST", token })).status).toBe(404);
    expect((await call(`/api/roles/${otherRoleId}/invite`, { method: "POST", token })).status).toBe(403);
  });
});

describe("sessions", () => {
  async function seedSession(companyId: string) {
    const roleId = seedRole(companyId);
    const inviteId = id();
    createInvite(inviteId, roleId, id());
    const candidateId = id();
    createCandidate(candidateId, "Ada", email(), await hashPassword("secret123"));
    const sessionId = id();
    createSession(sessionId, inviteId, candidateId, "octocat");
    return { roleId, sessionId };
  }

  test("lists the sessions of a role with candidate details", async () => {
    const { companyId, token } = await registeredCompany();
    const { roleId, sessionId } = await seedSession(companyId);

    const { status, body } = await call(`/api/roles/${roleId}/sessions`, { token });

    expect(status).toBe(200);
    expect(body.sessions).toHaveLength(1);
    expect(body.sessions[0].id).toBe(sessionId);
    expect(body.sessions[0].candidate_name).toBe("Ada");
  });

  test("403s for another company's role sessions", async () => {
    const { token } = await registeredCompany();
    const other = await registeredCompany();
    const { roleId } = await seedSession(other.companyId);

    expect((await call(`/api/roles/${roleId}/sessions`, { token })).status).toBe(403);
  });

  test("returns a session with its messages", async () => {
    const { companyId, token } = await registeredCompany();
    const { sessionId } = await seedSession(companyId);
    saveMessage(sessionId, "user", "A function with state");

    const { status, body } = await call(`/api/sessions/${sessionId}`, { token });

    expect(status).toBe(200);
    expect(body.session.id).toBe(sessionId);
    expect(body.messages[0].content).toBe("A function with state");
  });

  test("404s for an unknown session", async () => {
    const { token } = await registeredCompany();
    const { status, body } = await call("/api/sessions/missing", { token });
    expect(status).toBe(404);
    expect(body.error).toBe("Session not found");
  });
});

describe("unknown routes", () => {
  test("404s for an authenticated unknown path", async () => {
    const { token } = await registeredCompany();
    const { status, body } = await call("/api/company/nope", { token });
    expect(status).toBe(404);
    expect(body.error).toBe("Not found");
  });
});
