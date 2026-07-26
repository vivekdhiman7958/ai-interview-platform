import { afterEach, describe, expect, test } from "bun:test";
import { fetchGithubProfile } from "../src/services/githubService";
import { installFetchMock, restoreFetch } from "./helpers/fetchMock";

afterEach(restoreFetch);

const user = { login: "octocat", name: "The Octocat", bio: "builds things", public_repos: 9 };

const repo = (name: string, fork = false) => ({
  name,
  description: `${name} desc`,
  language: "TypeScript",
  stargazers_count: 1,
  fork,
});

function mockGithub(options: { userStatus?: number; reposStatus?: number; repos?: unknown[] } = {}) {
  return installFetchMock((url) => {
    if (url.includes("/repos")) {
      return { status: options.reposStatus ?? 200, body: options.repos ?? [repo("a")] };
    }
    return { status: options.userStatus ?? 200, body: user };
  });
}

describe("fetchGithubProfile", () => {
  test("requests the user then their most recently updated repos", async () => {
    const requests = mockGithub();

    await fetchGithubProfile("octocat");

    expect(requests.map((r) => r.url)).toEqual([
      "https://api.github.com/users/octocat",
      "https://api.github.com/users/octocat/repos?sort=updated&per_page=10",
    ]);
  });

  test("maps the profile and keeps at most five non-fork repos", async () => {
    mockGithub({
      repos: [
        repo("one"),
        repo("forked", true),
        repo("two"),
        repo("three"),
        repo("four"),
        repo("five"),
        repo("six"),
      ],
    });

    const profile = await fetchGithubProfile("octocat");

    expect(profile.username).toBe("octocat");
    expect(profile.name).toBe("The Octocat");
    expect(profile.bio).toBe("builds things");
    expect(profile.topRepos.map((r) => r.name)).toEqual(["one", "two", "three", "four", "five"]);
    expect(profile.topRepos[0]).toEqual({
      name: "one",
      description: "one desc",
      language: "TypeScript",
    });
  });

  test("throws when the user request fails", async () => {
    mockGithub({ userStatus: 404 });
    expect(fetchGithubProfile("nobody")).rejects.toThrow(
      "GitHub user fetch failed with status 404"
    );
  });

  test("throws when the repos request fails", async () => {
    mockGithub({ reposStatus: 403 });
    expect(fetchGithubProfile("octocat")).rejects.toThrow(
      "GitHub repos fetch failed with status 403"
    );
  });
});
