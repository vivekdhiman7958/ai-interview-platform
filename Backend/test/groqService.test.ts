import { afterEach, describe, expect, test } from "bun:test";
import { askGroq, type ChatMessage } from "../src/services/groqService";
import { installFetchMock, restoreFetch } from "./helpers/fetchMock";

afterEach(restoreFetch);

const messages: ChatMessage[] = [
  { role: "system", content: "be terse" },
  { role: "user", content: "hi" },
];

describe("askGroq", () => {
  test("posts the messages to Groq with auth and model", async () => {
    const requests = installFetchMock(() => ({
      body: { choices: [{ message: { role: "assistant", content: "hello" } }] },
    }));

    const answer = await askGroq(messages);

    expect(answer).toBe("hello");
    expect(requests).toHaveLength(1);
    const request = requests[0]!;
    expect(request.url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(request.init?.method).toBe("POST");
    expect((request.init?.headers as Record<string, string>).Authorization).toBe(
      `Bearer ${process.env.GROQ_API_KEY}`
    );
    expect(JSON.parse(request.init?.body as string)).toEqual({
      model: "llama-3.3-70b-versatile",
      messages,
    });
  });

  test("returns an empty string when the response has no choices", async () => {
    installFetchMock(() => ({ body: { choices: [] } }));
    expect(await askGroq(messages)).toBe("");
  });

  test("throws with the status when Groq fails", async () => {
    installFetchMock(() => ({ status: 500, body: "boom" }));
    expect(askGroq(messages)).rejects.toThrow("Groq API failed with status 500");
  });
});
