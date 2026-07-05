import { askGroq } from "./groqService";

export type EvaluationReport={
    overallScore:number;
    communicationScore:number;
    technicalScore: number;
    problemSolvingScore:number;
    strengths:string[];
    improvements: string[];
    questionBreakdown:{
        question:string;
        answer:string;
        feedback:string;
        score:number;
    }[];
    summary:string;
};

export async function evaluateInterview(
    transcript: { role: string; content: string }[]
  ): Promise<EvaluationReport> {
    const conversationText = transcript
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
  
    const evaluationPrompt = [
      {
        role: "system" as const,
        content: `You are an expert and strict interview evaluator. 
                  Base your evaluation ONLY on what the candidate actually said. Do not assume knowledge that was not demonstrated.
                  Give honest criticism. If an answer lacks technical depth, reduce the score. 
                  If the candidate gives only partial or superficial answers, mention exactly what is missing.
                  Analyze the interview transcript and return ONLY a valid JSON object — no explanation,
                  no markdown, no code blocks, just raw JSON.`,
      },
      {
        role: "user" as const,
        content: `Evaluate this mock interview transcript and return a JSON object with exactly this structure:
  {
    "overallScore": <number 1-10>,
    "communicationScore": <number 1-10>,
    "technicalScore": <number 1-10>,
    "problemSolvingScore": <number 1-10>,
    "strengths": [<string>, <string>, <string>],
    "improvements": [<string>, <string>, <string>],
    "questionBreakdown": [
      {
        "question": <interviewer question>,
        "answer": <candidate answer>,
        "feedback": <specific feedback>,
        "score": <number 1-10>
      }
    ],
    "summary": <2-3 sentence overall summary>
  }
  
  TRANSCRIPT:
  ${conversationText}`,
      },
    ];
  
    const rawResponse = await askGroq(evaluationPrompt);
  
    const cleaned = rawResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  
    const report = JSON.parse(cleaned) as EvaluationReport;
    return report;
  }