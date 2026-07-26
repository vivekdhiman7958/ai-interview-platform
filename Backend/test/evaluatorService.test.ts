import { afterEach, describe, expect, test } from "bun:test";
import { evaluateInterview } from "../src/services/evaluatorService";
import { groqHandler, installFetchMock, restoreFetch } from "./helpers/fetchMock";

afterEach(restoreFetch);

const report = {
  overallScore: 7,
  communicationScore: 8,
  technicalScore: 6,
  problemSolvingScore: 7,
  strengths: ["clear", "curious", "structured"],
  improvements: ["depth", "examples", "brevity"],
  questionBreakdown: [
    { question: "What is a closure?", answer: "A function with state", feedback: "ok", score: 7 },
  ],
  summary: "Solid but shallow in places.",
};

const transcript = [
  { role: "system", content: "you are an interviewer" },
  { role: "assistant", content: "What is a closure?" },
  { role: "user", content: "A function with state" },
];

function mockGroq(reply: string) {
  return installFetchMock(groqHandler({ replies: [reply] }));
}

describe("evaluateInterview", () => {
  test("parses the report returned by Groq", async () => {
    mockGroq(JSON.stringify(report));
    expect(await evaluateInterview(transcript)).toEqual(report);
  });

  test("strips markdown code fences before parsing", async () => {
    mockGroq("```json\n" + JSON.stringify(report) + "\n```");
    expect(await evaluateInterview(transcript)).toEqual(report);
  });

  test("sends the transcript without system messages, prefixed by role", async () => {
    const requests = mockGroq(JSON.stringify(report));

    await evaluateInterview(transcript);

    expect(requests).toHaveLength(1);
    const sent = JSON.parse(requests[0]?.init?.body as string) as {
      messages: { role: string; content: string }[];
    };
    const [system, user] = sent.messages;
    expect(system?.role).toBe("system");
    expect(user?.role).toBe("user");
    expect(user?.content).toContain("ASSISTANT: What is a closure?");
    expect(user?.content).toContain("USER: A function with state");
    expect(user?.content).not.toContain("you are an interviewer");
  });

  test("throws when Groq returns something that is not JSON", async () => {
    mockGroq("I cannot evaluate this interview.");
    expect(evaluateInterview(transcript)).rejects.toThrow();
  });
});
