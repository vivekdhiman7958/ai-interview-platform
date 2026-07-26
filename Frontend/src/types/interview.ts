export type TranscriptMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export type QuestionBreakdown = {
  question: string;
  answer: string;
  feedback: string;
  score: number;
};

export type Report = {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  strengths: string[];
  improvements: string[];
  questionBreakdown: QuestionBreakdown[];
  summary: string;
};

export type Session = {
  id: string;
  candidate_id?: string;
  github_username: string;
  created_at: string;
  ended_at: string | null;
  report: string | null;
};

export type RoleInfo = {
  title: string;
  description: string;
  tech_stack: string;
  difficulty: string;
  num_questions: number;
};

export type RoleFormValues = {
  title: string;
  description: string;
  tech_stack: string;
  difficulty: string;
  num_questions: number;
  custom_questions: string[];
};
