import type { Report } from "../../types/interview";
import { scoreColor } from "../../utils/score";
import ScoreBreakdown from "./ScoreBreakdown";

type Props = {
  report: Report;
  answerLabel: string;
};

function FeedbackList({
  title,
  icon,
  iconClass,
  bulletClass,
  items,
}: {
  title: string;
  icon: string;
  iconClass: string;
  bulletClass: string;
  items: string[];
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
      <h2 className="text-sm font-semibold text-[#0D1B2A] mb-4 flex items-center gap-2">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${iconClass}`}>
          {icon}
        </span>
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-[#64748B] flex items-start gap-2">
            <span className={`mt-0.5 shrink-0 ${bulletClass}`}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReportPanel({ report, answerLabel }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <ScoreBreakdown report={report} />

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-[#0D1B2A] mb-3">Summary</h2>
        <p className="text-sm text-[#64748B] leading-relaxed">{report.summary}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FeedbackList
          title="Strengths"
          icon="✓"
          iconClass="bg-green-100 text-green-600"
          bulletClass="text-green-500"
          items={report.strengths}
        />
        <FeedbackList
          title="To improve"
          icon="↑"
          iconClass="bg-orange-100 text-orange-600"
          bulletClass="text-orange-400"
          items={report.improvements}
        />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-[#0D1B2A] mb-5">Question breakdown</h2>
        <div className="flex flex-col gap-5">
          {report.questionBreakdown.map((q, i) => (
            <div key={i} className="border border-[#E2E8F0] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm font-medium text-[#0D1B2A]">
                  Q{i + 1}: {q.question}
                </p>
                <span className={`text-sm font-bold shrink-0 ${scoreColor(q.score)}`}>
                  {q.score}/10
                </span>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-3 mb-3">
                <p className="text-xs text-[#94A3B8] mb-1">{answerLabel}</p>
                <p className="text-sm text-[#64748B]">{q.answer}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-[#94A3B8] mb-1">Feedback</p>
                <p className="text-sm text-[#64748B]">{q.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
