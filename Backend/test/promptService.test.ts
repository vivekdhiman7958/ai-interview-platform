import { describe, expect, test } from "bun:test";
import { buildSystemPromopt } from "../src/services/promptService";
import { type GithubProfileSummary } from "../src/services/githubService";

const profile: GithubProfileSummary = {
  username: "octocat",
  name: "The Octocat",
  bio: "builds things",
  topRepos: [
    { name: "hello-world", description: "a greeter", language: "TypeScript" },
    { name: "bare-repo", description: null, language: null },
  ],
};

const role = {
  title: "Backend Engineer",
  description: "Own the API",
  tech_stack: "Bun, SQLite",
  difficulty: "hard",
  num_questions: 3,
  custom_questions: JSON.stringify(["Explain event loops", "Describe an outage you fixed"]),
};

describe("buildSystemPromopt", () => {
  test("includes role details and question count", () => {
    const prompt = buildSystemPromopt(profile, role);
    expect(prompt).toContain("Backend Engineer");
    expect(prompt).toContain("Own the API");
    expect(prompt).toContain("Bun, SQLite");
    expect(prompt).toContain("hard");
    expect(prompt).toContain("Ask exactly 3 technical questions");
    expect(prompt).toContain('"Thank you, that concludes our interview. I will now generate your report."');
  });

  test("includes profile fields and formats repos with language and description", () => {
    const prompt = buildSystemPromopt(profile, role);
    expect(prompt).toContain("Username: octocat");
    expect(prompt).toContain("Name: The Octocat");
    expect(prompt).toContain("Bio: builds things");
    expect(prompt).toContain("- hello-world (TypeScript) — a greeter");
    expect(prompt).toContain("- bare-repo");
    expect(prompt).not.toContain("bare-repo (");
  });

  test("numbers custom questions", () => {
    const prompt = buildSystemPromopt(profile, role);
    expect(prompt).toContain("1. Explain event loops");
    expect(prompt).toContain("2. Describe an outage you fixed");
  });

  test("falls back to placeholders for missing profile and description", () => {
    const prompt = buildSystemPromopt(
      { username: "ghost", name: null, bio: null, topRepos: [] },
      { ...role, description: "" }
    );
    expect(prompt).toContain("Name: Not provided");
    expect(prompt).toContain("Bio: Not provided");
    expect(prompt).toContain("Description: Not provided");
  });

  test("omits the custom question section when there are none", () => {
    expect(buildSystemPromopt(profile, { ...role, custom_questions: "[]" })).not.toContain(
      "has also requested these specific questions"
    );
    expect(buildSystemPromopt(profile, { ...role, custom_questions: "" })).not.toContain(
      "has also requested these specific questions"
    );
  });

  test("ignores invalid custom question JSON instead of throwing", () => {
    const prompt = buildSystemPromopt(profile, { ...role, custom_questions: "{not json" });
    expect(prompt).toContain("Backend Engineer");
    expect(prompt).not.toContain("has also requested these specific questions");
  });
});
