type Handler = (url: string, init?: RequestInit) => { status?: number; body?: unknown } | undefined;

const realFetch = globalThis.fetch;

export type RecordedRequest = { url: string; init?: RequestInit };

/**
 * Replaces globalThis.fetch with a router over the given handlers. The first
 * handler that returns a response wins; an unhandled URL fails the test loudly.
 */
export function installFetchMock(...handlers: Handler[]) {
  const requests: RecordedRequest[] = [];

  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    requests.push({ url, init });

    for (const handler of handlers) {
      const result = handler(url, init);
      if (result) {
        const status = result.status ?? 200;
        const text = typeof result.body === "string" ? result.body : JSON.stringify(result.body);
        return Promise.resolve({
          ok: status >= 200 && status < 300,
          status,
          json: () => Promise.resolve(result.body),
          text: () => Promise.resolve(text ?? ""),
        } as Response);
      }
    }

    return Promise.reject(new Error(`unexpected fetch to ${url}`));
  }) as typeof fetch;

  return requests;
}

export function restoreFetch() {
  globalThis.fetch = realFetch;
}

/** Answers Groq chat completions with the queued replies, in order. */
export function groqHandler(state: { replies: string[]; failWithStatus?: number }): Handler {
  return (url) => {
    if (!url.startsWith("https://api.groq.com")) return undefined;
    if (state.failWithStatus) return { status: state.failWithStatus, body: "groq is down" };
    const content = state.replies.shift() ?? "next question?";
    return { body: { choices: [{ message: { role: "assistant", content } }] } };
  };
}

/** Answers the two GitHub calls made by fetchGithubProfile. */
export function githubHandler(state: { failWithStatus?: number } = {}): Handler {
  return (url) => {
    if (!url.startsWith("https://api.github.com")) return undefined;
    if (state.failWithStatus) return { status: state.failWithStatus, body: { message: "nope" } };
    if (url.includes("/repos")) {
      return {
        body: [
          {
            name: "hello-world",
            description: "a greeter",
            language: "TypeScript",
            stargazers_count: 1,
            fork: false,
          },
        ],
      };
    }
    return { body: { login: "octocat", name: "The Octocat", bio: "builds things", public_repos: 1 } };
  };
}
