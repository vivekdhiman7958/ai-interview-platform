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
import { errorMessage } from "../utils/http";

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

function sendError(ws: Bun.ServerWebSocket<SocketData>, message: string) {
  ws.send(JSON.stringify({ type: "error", message }));
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
      parsed = JSON.parse(raw) as { type: string; payload: string };
    } catch (error) {
      console.error("Invalid WebSocket frame:", errorMessage(error));
      sendError(ws, "Malformed message. Expected JSON.");
      return;
    }

    if (typeof parsed?.type !== "string") {
      sendError(ws, "Message is missing a 'type' field.");
      return;
    }

    if (parsed.type === "init") {
      const githubUsername = parsed.payload;
      ws.data.githubUsername = githubUsername;

      try {
        const profile = await fetchGithubProfile(githubUsername);

        const invite = getInviteById(ws.data.inviteId);
        if (!invite) {
          sendError(ws, "Invalid invite. Please use a valid interview link.");
          return;
        }

        const role = getRolesById(invite.role_id);
        if (!role) {
          sendError(ws, "Job role not found.");
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
        console.error(
          `Init error (session ${ws.data.sessionId}, github "${githubUsername}"):`,
          errorMessage(error)
        );
        ws.data.githubUsername = "";
        sendError(
          ws,
          "Could not start interview. Please check your GitHub username and try again."
        );
      }

      return;
    }

    if (parsed.type === "message") {
      const userText = parsed.payload;

      if (!ws.data.githubUsername) {
        sendError(ws, "Interview has not started yet. Send your GitHub username first.");
        return;
      }

      const historyLength = ws.data.history.length;
      try {
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
      } catch (error) {
        console.error(
          `Reply error (session ${ws.data.sessionId}):`,
          errorMessage(error)
        );
        // Drop the unanswered turn so a retry does not duplicate it.
        ws.data.history.length = historyLength;
        sendError(ws, "The interviewer could not respond. Please repeat your answer.");
      }

      return;
    }

    if (parsed.type === "end") {
      try {
        ws.send(JSON.stringify({
          type: "evaluating",
          message: "Interview ended. Generating your report card...",
        }));

        if (!ws.data.githubUsername) {
          sendError(ws, "No interview in progress to evaluate.");
          return;
        }

        const report = await evaluateInterview(ws.data.history);

        endSession(ws.data.sessionId);
        saveReport(ws.data.sessionId, JSON.stringify(report));

        ws.send(JSON.stringify({
          type: "report",
          sessionId: ws.data.sessionId,
          report: report,
        }));

      } catch (error) {
        console.error(
          `Evaluation error (session ${ws.data.sessionId}):`,
          errorMessage(error)
        );
        sendError(ws, "Failed to generate report. Please try again.");
      }

      return;
    }

    sendError(ws, `Unknown message type: ${parsed.type}`);
  },

  close(ws: Bun.ServerWebSocket<SocketData>) {
    console.log(`Client disconnected — session: ${ws.data.sessionId}`);
    if (!ws.data.githubUsername) return;
    try {
      endSession(ws.data.sessionId);
    } catch (error) {
      console.error(
        `Failed to end session ${ws.data.sessionId} on disconnect:`,
        errorMessage(error)
      );
    }
  },
};