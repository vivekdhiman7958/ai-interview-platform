import type { Report } from "../../types/interview";
import { scoreColor } from "../../utils/score";

type Props = {
  report: Report;
};

export default function ScoreBreakdown({ report }: Props) {
  const scores = [
    { label: "Communication", score: report.communicationScore },
    { label: "Technical", score: report.technicalScore },
    { label: "Problem Solving", score: report.problemSolvingScore },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {scores.map((s) => (
        <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl p-5 text-center">
          <p className={`text-2xl font-bold ${scoreColor(s.score)}`}>
            {s.score}<span className="text-sm font-normal text-[#94A3B8]">/10</span>
          </p>
          <p className="text-xs text-[#64748B] mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
