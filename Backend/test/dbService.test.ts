import { beforeAll, describe, expect, test } from "bun:test";
import {
  createCandidate,
  createCompany,
  createInvite,
  createJobRole,
  createSession,
  deleteJobRole,
  endSession,
  getCandidateByEmail,
  getCandidateById,
  getCompanyByEmail,
  getCompletedSessionByInviteAndCandidate,
  getInviteById,
  getInviteByToken,
  getMessagesBySession,
  getRolesByCompany,
  getRolesById,
  getSessionById,
  getSessionsByCandidate,
  getSessionsByRole,
  initDB,
  saveMessage,
  saveReport,
  updateJobRole,
} from "../src/services/dbService";

const id = () => crypto.randomUUID();
const email = () => `${crypto.randomUUID()}@example.com`;

function makeCompany() {
  const companyId = id();
  const companyEmail = email();
  createCompany(companyId, "Acme", companyEmail, "hashed");
  return { companyId, companyEmail };
}

function makeRole(companyId: string, overrides: { numQuestions?: number } = {}) {
  const roleId = id();
  createJobRole(
    roleId,
    companyId,
    "Backend Engineer",
    "Own the API",
    "Bun, SQLite",
    "hard",
    overrides.numQuestions ?? 5,
    JSON.stringify(["Why Bun?"])
  );
  return roleId;
}

function makeCandidate() {
  const candidateId = id();
  const candidateEmail = email();
  createCandidate(candidateId, "Ada", candidateEmail, "hashed");
  return { candidateId, candidateEmail };
}

beforeAll(() => {
  initDB();
});

describe("companies", () => {
  test("creates and looks up a company by email", () => {
    const { companyId, companyEmail } = makeCompany();
    const company = getCompanyByEmail(companyEmail);
    expect(company?.id).toBe(companyId);
    expect(company?.name).toBe("Acme");
    expect(company?.password).toBe("hashed");
  });

  test("returns null for an unknown email", () => {
    expect(getCompanyByEmail("nobody@example.com")).toBeNull();
  });

  test("rejects a duplicate email", () => {
    const { companyEmail } = makeCompany();
    expect(() => createCompany(id(), "Acme 2", companyEmail, "hashed")).toThrow();
  });
});

describe("job roles", () => {
  test("creates a role and reads it back", () => {
    const { companyId } = makeCompany();
    const roleId = makeRole(companyId, { numQuestions: 3 });

    const role = getRolesById(roleId);
    expect(role?.company_id).toBe(companyId);
    expect(role?.title).toBe("Backend Engineer");
    expect(role?.num_questions).toBe(3);
    expect(JSON.parse(role?.custom_questions ?? "[]")).toEqual(["Why Bun?"]);
  });

  test("lists only the roles of the given company", () => {
    const { companyId } = makeCompany();
    const other = makeCompany();
    const roleId = makeRole(companyId);
    makeRole(other.companyId);

    expect(getRolesByCompany(companyId).map((r) => r.id)).toEqual([roleId]);
  });

  test("updates a role", () => {
    const { companyId } = makeCompany();
    const roleId = makeRole(companyId);

    updateJobRole(roleId, "Staff Engineer", "Lead", "Go", "easy", 8, JSON.stringify([]));

    const role = getRolesById(roleId);
    expect(role?.title).toBe("Staff Engineer");
    expect(role?.tech_stack).toBe("Go");
    expect(role?.difficulty).toBe("easy");
    expect(role?.num_questions).toBe(8);
    expect(role?.custom_questions).toBe("[]");
  });

  test("deleting a role also deletes its invites", () => {
    const { companyId } = makeCompany();
    const roleId = makeRole(companyId);
    const inviteId = id();
    const token = id();
    createInvite(inviteId, roleId, token);

    deleteJobRole(roleId);

    expect(getRolesById(roleId)).toBeNull();
    expect(getInviteById(inviteId)).toBeNull();
    expect(getInviteByToken(token)).toBeNull();
  });

  test("returns null for an unknown role", () => {
    expect(getRolesById("missing")).toBeNull();
  });
});

describe("invites", () => {
  test("looks an invite up by token and by id", () => {
    const { companyId } = makeCompany();
    const roleId = makeRole(companyId);
    const inviteId = id();
    const token = id();
    createInvite(inviteId, roleId, token);

    expect(getInviteByToken(token)?.id).toBe(inviteId);
    expect(getInviteById(inviteId)?.role_id).toBe(roleId);
  });

  test("rejects a duplicate token", () => {
    const { companyId } = makeCompany();
    const roleId = makeRole(companyId);
    const token = id();
    createInvite(id(), roleId, token);
    expect(() => createInvite(id(), roleId, token)).toThrow();
  });

  test("returns null for unknown invites", () => {
    expect(getInviteByToken("missing")).toBeNull();
    expect(getInviteById("missing")).toBeNull();
  });
});

describe("candidates", () => {
  test("looks a candidate up by email and by id", () => {
    const { candidateId, candidateEmail } = makeCandidate();
    expect(getCandidateByEmail(candidateEmail)?.id).toBe(candidateId);
    expect(getCandidateById(candidateId)?.email).toBe(candidateEmail);
  });

  test("returns null for unknown candidates", () => {
    expect(getCandidateByEmail("nobody@example.com")).toBeNull();
    expect(getCandidateById("missing")).toBeNull();
  });
});

describe("sessions and messages", () => {
  function makeSession() {
    const { companyId } = makeCompany();
    const roleId = makeRole(companyId);
    const inviteId = id();
    createInvite(inviteId, roleId, id());
    const { candidateId } = makeCandidate();
    const sessionId = id();
    createSession(sessionId, inviteId, candidateId, "octocat");
    return { sessionId, inviteId, candidateId, roleId };
  }

  test("creates a session with no end time or report", () => {
    const { sessionId, candidateId } = makeSession();
    const session = getSessionById(sessionId);
    expect(session?.candidate_id).toBe(candidateId);
    expect(session?.github_username).toBe("octocat");
    expect(session?.ended_at).toBeNull();
    expect(session?.report).toBeNull();
  });

  test("endSession stamps ended_at and saveReport stores the report", () => {
    const { sessionId } = makeSession();

    endSession(sessionId);
    saveReport(sessionId, JSON.stringify({ overallScore: 9 }));

    const session = getSessionById(sessionId);
    expect(session?.ended_at).toBeTruthy();
    expect(JSON.parse(session?.report ?? "{}")).toEqual({ overallScore: 9 });
  });

  test("saves messages in insertion order", () => {
    const { sessionId } = makeSession();

    saveMessage(sessionId, "assistant", "What is a closure?");
    saveMessage(sessionId, "user", "A function with state");

    const messages = getMessagesBySession(sessionId) as { role: string; content: string }[];
    expect(messages.map((m) => [m.role, m.content])).toEqual([
      ["assistant", "What is a closure?"],
      ["user", "A function with state"],
    ]);
  });

  test("getSessionsByCandidate joins role and company names", () => {
    const { sessionId, candidateId } = makeSession();

    const sessions = getSessionsByCandidate(candidateId) as {
      id: string;
      role_title: string;
      company_name: string;
    }[];

    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.id).toBe(sessionId);
    expect(sessions[0]?.role_title).toBe("Backend Engineer");
    expect(sessions[0]?.company_name).toBe("Acme");
  });

  test("getSessionsByRole joins candidate details", () => {
    const { sessionId, roleId } = makeSession();

    const sessions = getSessionsByRole(roleId) as {
      id: string;
      candidate_name: string;
      candidate_email: string;
    }[];

    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.id).toBe(sessionId);
    expect(sessions[0]?.candidate_name).toBe("Ada");
    expect(sessions[0]?.candidate_email).toContain("@example.com");
  });

  test("getCompletedSessionByInviteAndCandidate only matches ended sessions", () => {
    const { sessionId, inviteId, candidateId } = makeSession();

    expect(getCompletedSessionByInviteAndCandidate(inviteId, candidateId)).toBeNull();

    endSession(sessionId);

    expect(getCompletedSessionByInviteAndCandidate(inviteId, candidateId)?.id).toBe(sessionId);
    expect(getCompletedSessionByInviteAndCandidate(inviteId, "someone-else")).toBeNull();
  });

  test("returns null and no messages for unknown sessions", () => {
    expect(getSessionById("missing")).toBeNull();
    expect(getMessagesBySession("missing")).toEqual([]);
  });
});
