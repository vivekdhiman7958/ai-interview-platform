import { useState } from "react";
import AppHeader from "../ui/AppHeader";
import BackButton from "../ui/BackButton";
import ReportPanel from "./ReportPanel";
import TranscriptPanel from "./TranscriptPanel";
import { formatLongDate } from "../../utils/format";
import { scoreBg, scoreColor } from "../../utils/score";
import type { Report, Session, TranscriptMessage } from "../../types/interview";

type Props = {
  title: string;
  session: Session;
  messages: TranscriptMessage[];
  report: Report | null;
  answerLabel: string;
  candidateInitial: string;
  onBack: () => void;
  backLabel?: string;
  missingReportMessage: string;
  error?: string;
};

export default function SessionDetail({
  title,
  session,
  messages,
  report,
  answerLabel,
  candidateInitial,
  onBack,
  backLabel,
  missingReportMessage,
  error,
}: Props) {
  const [tab, setTab] = useState<"report" | "transcript">("report");

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <AppHeader>
        <BackButton onClick={onBack} label={backLabel} />
      </AppHeader>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Session header */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#0D1B2A] tracking-tight mb-1">
                {title}
              </h1>
              <p className="text-sm text-[#64748B]">
                @{session.github_username} · {formatLongDate(session.created_at)}
              </p>
            </div>
            {report && (
              <div className={`text-center px-5 py-3 rounded-xl border ${scoreBg(report.overallScore)}`}>
                <p className={`text-3xl font-bold ${scoreColor(report.overallScore)}`}>
                  {report.overallScore}
                  <span className="text-base font-normal">/10</span>
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">Overall</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-[#E2E8F0] rounded-xl p-1 mb-6 w-fit">
          {(["report", "transcript"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${
                tab === t ? "bg-[#0052FF] text-white" : "text-[#64748B] hover:text-[#0D1B2A]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "report" && report && (
          <ReportPanel report={report} answerLabel={answerLabel} />
        )}

        {tab === "report" && !report && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-16 text-center">
            <p className="text-[#64748B] text-sm">{error || missingReportMessage}</p>
          </div>
        )}

        {tab === "transcript" && (
          <TranscriptPanel messages={messages} candidateInitial={candidateInitial} />
        )}

      </div>
    </div>
  );
}
