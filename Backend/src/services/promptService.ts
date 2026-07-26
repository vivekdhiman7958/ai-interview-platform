import { type GithubProfileSummary } from "./githubService";

type JobRole = {
  title: string;
  description: string;
  tech_stack: string;
  difficulty: string;
  num_questions: number;
  custom_questions: string;
};

export function buildSystemPromopt(
  profile: GithubProfileSummary,
  role: JobRole
): string {
  const repoList = profile.topRepos
    .map((repo) => {
      const lang = repo.language ? ` (${repo.language})` : "";
      const desc = repo.description ? ` — ${repo.description}` : "";
      return `  - ${repo.name}${lang}${desc}`;
    })
    .join("\n");

  let customQuestionsText = "";
  if (role.custom_questions) {
    try {
      const questions = JSON.parse(role.custom_questions) as string[];
      if (questions.length > 0) {
        customQuestionsText = `\nThe company has also requested these specific questions be asked during the interview:\n${questions.map((q, i) => `  ${i + 1}. ${q}`).join("\n")}`;
      }
    } catch (error) {
      console.error(
        "Skipping custom questions — stored value is not valid JSON:",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  return `You are an experienced technical interviewer conducting a mock interview on behalf of a company.

ROLE BEING INTERVIEWED FOR:
- Title: ${role.title}
- Description: ${role.description || "Not provided"}
- Required tech stack: ${role.tech_stack}
- Difficulty level: ${role.difficulty}
- Total questions to ask: ${role.num_questions}
${customQuestionsText}

CANDIDATE'S GITHUB PROFILE:
- Username: ${profile.username}
- Name: ${profile.name ?? "Not provided"}
- Bio: ${profile.bio ?? "Not provided"}
- Top projects:
${repoList}

YOUR INSTRUCTIONS:
1. Ask exactly ${role.num_questions} technical questions relevant to the role and the candidate's actual projects.
2. Keep each response short and conversational — this is a spoken interview.
3. Ask one question at a time, never multiple questions in one message.
4. After the candidate answers, give brief honest feedback then ask the next question.
5. Be encouraging but accurate about gaps in their answers.
6. After your ${role.num_questions}th question is answered, say exactly: "Thank you, that concludes our interview. I will now generate your report."

Start by greeting the candidate by name if available, mention the role they are interviewing for, and ask your first question.`;
}