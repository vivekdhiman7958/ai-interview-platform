import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import {
  buildUpgradeData,
  interviewWebSocketHandler,
} from "../src/routes/interviewSocket";
import {
  createCandidate,
  createCompany,
  createInvite,
  createJobRole,
  createSession,
  endSession,
  getMessagesBySession,
  getSessionById,
  initDB,
} from "../src/services/dbService";
import {
  githubHandler,
  groqHandler,
  installFetchMock,
  restoreFetch,
} from "./helpers/fetchMock";

const report = {
  overallScore: 7,
  communicationScore: 7,
  technicalScore: 7,
  problemSolvingScore: 7,
  strengths: [],
  improvements: [],
  questionBreakdown: [],
  summary: "ok",
};

const id = () => crypto.randomUUID();
const email = () => `${crypto.randomUUID()}@example.com`;

let groq: { replies: string[]; failWithStatus?: number };
let github: { failWithStatus?: number };

function fakeSocket(inviteId: string, candidateId: string) {
  const { data } = buildUpgradeData(candidateId, inviteId);
  const sent: Record<string, any>[] = [];
  return {
    data,
    sent,
    send(raw: string) {
      sent.push(JSON.parse(raw));
    },
    last() {
      return sent[sent.length - 1] as Record<string, any>;
    },
  };
}

type FakeSocket = ReturnType<typeof fakeSocket>;

const send = (ws: FakeSocket, type: string, payload = "") =>
  interviewWebSocketHandler.message(ws as any, JSON.stringify({ type, payload }));

function seedInvite(options: { roleId?: string } = {}) {
  const companyId = id();
  createCompany(companyId, "Acme", email(), "hashed");
  let roleId = options.roleId;
  if (!roleId) {
    roleId = id();
    createJobRole(roleId, companyId, "Backend Engineer", "Own the API", "Bun", "hard", 2, "[]");
  }
  const inviteId = id();
  createInvite(inviteId, roleId, id());
  const candidateId = id();
  createCandidate(candidateId, "Ada", email(), "hashed");
  return fakeSocket(inviteId, candidateId);
}

beforeAll(() => {
  initDB();
});

beforeEach(() => {
  groq = { replies: [] };
  github = {};
  installFetchMock(githubHandler(github), groqHandler(groq));
});

afterEach(restoreFetch);

describe("buildUpgradeData", () => {
  test("seeds a unique session id and empty state", () => {
    const first = buildUpgradeData("candidate-1", "invite-1").data;
    const second = buildUpgradeData("candidate-1", "invite-1").data;

    expect(first.candidateId).toBe("candidate-1");
    expect(first.inviteId).toBe("invite-1");
    expect(first.githubUsername).toBe("");
    expect(first.history).toEqual([]);
    expect(first.sessionId).not.toBe(second.sessionId);
  });
});

describe("open", () => {
  test("announces the session and asks for the GitHub username", async () => {
    const ws = seedInvite();
    await interviewWebSocketHandler.open(ws as any);
    expect(ws.last()).toEqual({
      type: "connected",
      sessionId: ws.data.sessionId,
      message: "Please send your GitHub username to start the interview.",
    });
  });
});

describe("init", () => {
  test("creates the session and sends the first question", async () => {
    const ws = seedInvite();
    groq.replies = ["What is a closure?"];

    await send(ws, "init", "octocat");

    expect(ws.last()).toEqual({
      type: "reply",
      sessionId: ws.data.sessionId,
      message: "What is a closure?",
    });
    expect(ws.data.githubUsername).toBe("octocat");
    expect(ws.data.history[0]?.role).toBe("system");
    expect(ws.data.history[0]?.content).toContain("Backend Engineer");
    expect(ws.data.history[0]?.content).toContain("hello-world");
    expect(ws.data.history[1]).toEqual({ role: "assistant", content: "What is a closure?" });
    expect(getSessionById(ws.data.sessionId)?.github_username).toBe("octocat");
    expect(getMessagesBySession(ws.data.sessionId)).toHaveLength(1);
  });

  test("errors on an unknown invite without creating a session", async () => {
    const ws = fakeSocket("missing-invite", id());

    await send(ws, "init", "octocat");

    expect(ws.last()).toEqual({
      type: "error",
      message: "Invalid invite. Please use a valid interview link.",
    });
    expect(getSessionById(ws.data.sessionId)).toBeNull();
  });

  test("refuses a second interview on the same invite", async () => {
    const ws = seedInvite();
    const completedId = id();
    createSession(completedId, ws.data.inviteId, ws.data.candidateId, "octocat");
    endSession(completedId);

    await send(ws, "init", "octocat");

    expect(ws.last()).toEqual({
      type: "already-completed",
      sessionId: completedId,
      message: "You have already completed this interview.",
    });
    expect(getSessionById(ws.data.sessionId)).toBeNull();
  });

  test("errors when the invite points at a missing role", async () => {
    const ws = seedInvite({ roleId: "deleted-role" });

    await send(ws, "init", "octocat");

    expect(ws.last()).toEqual({ type: "error", message: "Job role not found." });
    expect(getSessionById(ws.data.sessionId)).toBeNull();
  });

  test("reports a generic error when the GitHub lookup fails", async () => {
    const ws = seedInvite();
    github.failWithStatus = 404;

    await send(ws, "init", "octocat");

    expect(ws.last()).toEqual({
      type: "error",
      message: "Could not start interview. Please check your GitHub username.",
    });
    expect(getSessionById(ws.data.sessionId)).toBeNull();
  });
});

describe("message", () => {
  test("appends the answer, replies, and persists both turns", async () => {
    const ws = seedInvite();
    groq.replies = ["What is a closure?", "Nice. Next question?"];
    await send(ws, "init", "octocat");

    await send(ws, "message", "A function with state");

    expect(ws.last()).toEqual({
      type: "reply",
      sessionId: ws.data.sessionId,
      message: "Nice. Next question?",
    });
    expect(ws.data.history.map((m) => m.role)).toEqual([
      "system",
      "assistant",
      "user",
      "assistant",
    ]);
    expect(getMessagesBySession(ws.data.sessionId)).toHaveLength(3);
  });
});

describe("end", () => {
  test("evaluates the interview, stores the report, and ends the session", async () => {
    const ws = seedInvite();
    groq.replies = ["What is a closure?", JSON.stringify(report)];
    await send(ws, "init", "octocat");

    await send(ws, "end");

    expect(ws.sent.map((m) => m.type)).toContain("evaluating");
    expect(ws.last()).toEqual({
      type: "report",
      sessionId: ws.data.sessionId,
      report,
    });
    const session = getSessionById(ws.data.sessionId);
    expect(session?.ended_at).toBeTruthy();
    expect(JSON.parse(session?.report ?? "{}")).toEqual(report);
  });

  test("reports a failure when evaluation returns unparseable output", async () => {
    const ws = seedInvite();
    groq.replies = ["What is a closure?", "I cannot evaluate this interview."];
    await send(ws, "init", "octocat");

    await send(ws, "end");

    expect(ws.last()).toEqual({
      type: "error",
      message: "Failed to generate report. Please try again.",
    });
    expect(getSessionById(ws.data.sessionId)?.report).toBeNull();
  });
});

describe("unknown message types", () => {
  test("echoes the unknown type back as an error", async () => {
    const ws = seedInvite();
    await send(ws, "shout", "hello");
    expect(ws.last()).toEqual({ type: "error", message: "Unknown message type: shout" });
  });
});

describe("close", () => {
  test("ends the session once the interview started", async () => {
    const ws = seedInvite();
    await send(ws, "init", "octocat");

    interviewWebSocketHandler.close(ws as any);

    expect(getSessionById(ws.data.sessionId)?.ended_at).toBeTruthy();
  });

  test("does nothing when no GitHub username was ever sent", () => {
    const ws = seedInvite();
    createSession(ws.data.sessionId, ws.data.inviteId, ws.data.candidateId, "octocat");

    interviewWebSocketHandler.close(ws as any);

    expect(getSessionById(ws.data.sessionId)?.ended_at).toBeNull();
  });
});
