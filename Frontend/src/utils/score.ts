import { safeJsonParse } from "./errors";

export function scoreColor(score: number): string {
  if (score >= 7) return "text-green-600";
  if (score >= 5) return "text-yellow-600";
  return "text-red-500";
}

export function scoreBadgeColor(score: number): string {
  if (score >= 7) return "text-green-600 bg-green-50";
  if (score >= 5) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

export function scoreBg(score: number): string {
  if (score >= 7) return "bg-green-50 border-green-200";
  if (score >= 5) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

export function parseOverallScore(report: string | null): number | null {
  const parsed = safeJsonParse<{ overallScore?: number }>(
    report,
    "session report"
  );
  return parsed?.overallScore ?? null;
}

export const difficultyBadgeColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export function difficultyColor(difficulty: string): string {
  return difficultyBadgeColor[difficulty] ?? "bg-gray-100 text-gray-600";
}
