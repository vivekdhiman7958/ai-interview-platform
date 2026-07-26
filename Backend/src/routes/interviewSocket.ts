import { askGroq, type ChatMessage } from "../services/groqService";
import { fetchGithubProfile } from "../services/githubService";
import { buildSystemPromopt } from "../services/promptService";
import { evaluateInterview } from "../services/evaluatorService";
import {
  createSession,
  saveMessage,
  endSession,
  saveReport,
  getInviteByToken,
  getInviteById,
  getRolesById,
  getCompletedSessionByInviteAndCandidate,
} from "../services/dbService";
import { MAX_TRANSCRIPT_MESSAGE_LENGTH } from "../services/validationService";

export type SocketData = {
  sessionId: string;
  candidateId: string;
  inviteId: string;
  githubUsername: string;
  history: ChatMessage[];
};

export function buildUpgradeData(
  candidateId: string,
  inviteId: string
): { data: SocketData } {
  return {
    data: {
      sessionId: crypto.randomUUID(),
      candidateId,
      inviteId,
      githubUsername: "",
      history: [],
    },
  };
}

export const interviewWebSocketHandler = {
  async open(ws: Bun.ServerWebSocket<SocketData>) {
    console.log(`Client connected — session: ${ws.data.sessionId}`);
    ws.send(
      JSON.stringify({
        type: "connected",
        sessionId: ws.data.sessionId,
        message: "Please send your GitHub username to start the interview.",
      })
    );
  },

  async message(
    ws: Bun.ServerWebSocket<SocketData>,
    message: string | Buffer
  ) {
    const raw = message.toString();

    let parsed: { type: string; payload: string };
    try {
      const candidate = JSON.parse(raw) as { type?: unknown; payload?: unknown };
      if (
        typeof candidate.type !== "string" ||
        (candidate.payload !== undefined && typeof candidate.payload !== "string")
      ) {
        throw new Error("invalid message shape");
      }
      parsed = { type: candidate.type, payload: (candidate.payload as string) ?? "" };
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid message format." }));
      return;
    }

    if (parsed.payload.length > MAX_TRANSCRIPT_MESSAGE_LENGTH) {
      ws.send(JSON.stringify({ type: "error", message: "Message too long." }));
      return;
    }

    if (parsed.type === "init") {
      const githubUsername = parsed.payload;
      ws.data.githubUsername = githubUsername;

      try {
        const profile = await fetchGithubProfile(githubUsername);

        const invite = getInviteById(ws.data.inviteId);
        if (!invite) {
          ws.send(JSON.stringify({
            type: "error",
            message: "Invalid invite. Please use a valid interview link.",
          }));
          return;
        }

        const role = getRolesById(invite.role_id);
        if (!role) {
          ws.send(JSON.stringify({
            type: "error",
            message: "Job role not found.",
          }));
          return;
        }

        // here is the change for the not having multiple interview on the same link
        const existing = getCompletedSessionByInviteAndCandidate(
          invite.id,
          ws.data.candidateId
        );
    
        if (existing) {
          ws.send(JSON.stringify({
            type: "already-completed",
            sessionId: existing.id,
            message: "You have already completed this interview.",
          }));
          return;
        }

        const systemPrompt = buildSystemPromopt(profile,role);
        ws.data.history = [{ role: "system", content: systemPrompt }];

        createSession(
          ws.data.sessionId,
          ws.data.inviteId,
          ws.data.candidateId,
          githubUsername
        );

        const firstQuestion = await askGroq(ws.data.history);
        ws.data.history.push({ role: "assistant", content: firstQuestion });
        saveMessage(ws.data.sessionId, "assistant", firstQuestion);

        ws.send(JSON.stringify({
          type: "reply",
          sessionId: ws.data.sessionId,
          message: firstQuestion,
        }));

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Init error:", message);
        ws.send(JSON.stringify({
          type: "error",
          //message: `Debug: ${message}`,
          message: "Could not start interview. Please check your GitHub username."
        }));
      }

      return;
    }

    if (parsed.type === "message") {
      if (ws.data.history.length === 0) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Interview not started. Send your GitHub username first.",
        }));
        return;
      }

      const userText = parsed.payload;

      ws.data.history.push({ role: "user", content: userText });
      saveMessage(ws.data.sessionId, "user", userText);

      const aiReply = await askGroq(ws.data.history);
      ws.data.history.push({ role: "assistant", content: aiReply });
      saveMessage(ws.data.sessionId, "assistant", aiReply);

      ws.send(JSON.stringify({
        type: "reply",
        sessionId: ws.data.sessionId,
        message: aiReply,
      }));

      return;
    }

    if (parsed.type === "end") {
      try {
        ws.send(JSON.stringify({
          type: "evaluating",
          message: "Interview ended. Generating your report card...",
        }));

        const report = await evaluateInterview(ws.data.history);

        endSession(ws.data.sessionId);
        saveReport(ws.data.sessionId, JSON.stringify(report));

        ws.send(JSON.stringify({
          type: "report",
          sessionId: ws.data.sessionId,
          report: report,
        }));

      } catch (error) {
        console.error("Evaluation error:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: "Failed to generate report. Please try again.",
        }));
      }

      return;
    }

    ws.send(JSON.stringify({
      type: "error",
      message: `Unknown message type: ${parsed.type}`,
    }));
  },

  close(ws: Bun.ServerWebSocket<SocketData>) {
    console.log(`Client disconnected — session: ${ws.data.sessionId}`);
    if (ws.data.githubUsername) {
      endSession(ws.data.sessionId);
    }
  },
};