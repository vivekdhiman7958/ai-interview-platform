import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage, safeJsonParse } from "../../services/api";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type Report = {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  strengths: string[];
  improvements: string[];
  questionBreakdown: {
    question: string;
    answer: string;
    feedback: string;
    score: number;
  }[];
  summary: string;
};

type Session = {
  id: string;
  candidate_id: string;
  github_username: string;
  created_at: string;
  ended_at: string | null;
  report: string | null;
};

export default function CompanySessionView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"report" | "transcript">("report");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/sessions/${sessionId}`)
      .then((res) => {
        setSession(res.data.session);
        setMessages(res.data.messages ?? []);
        const parsedReport = safeJsonParse<Report>(
          res.data.session?.report ?? null,
          "session report"
        );
        setReport(parsedReport);
        if (res.data.session?.report && !parsedReport) {
          setError("The report for this session is corrupted and could not be displayed.");
        }
      })
      .catch((err) => {
        console.error("Failed to load session", sessionId, err);
        setError(getErrorMessage(err, "Failed to load this interview session"));
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  function scoreColor(score: number) {
    if (score >= 7) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-500";
  }

  function scoreBg(score: number) {
    if (score >= 7) return "bg-green-50 border-green-200";
    if (score >= 5) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[#64748B]">{error || "Session not found"}</p>
        <button
          type="button"
          onClick={() => navigate("/company/dashboard")}
          className="text-sm font-semibold text-white bg-[#0052FF] px-4 py-2 rounded-lg"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Navbar */}
      <header className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0052FF] rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
              <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
            </svg>
          </div>
          <span className="font-bold text-[#0D1B2A]">InterviewAI</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#64748B] hover:text-[#0D1B2A] transition"
        >
          ← Back
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Session header */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#0D1B2A] tracking-tight mb-1">
                Interview Report
              </h1>
              <p className="text-sm text-[#64748B]">
                @{session.github_username} · {formatDate(session.created_at)}
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
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${
                tab === t
                  ? "bg-[#0052FF] text-white"
                  : "text-[#64748B] hover:text-[#0D1B2A]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Report tab */}
        {tab === "report" && report && (
          <div className="flex flex-col gap-6">

            {/* Score cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Communication", score: report.communicationScore },
                { label: "Technical", score: report.technicalScore },
                { label: "Problem Solving", score: report.problemSolvingScore },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl p-5 text-center">
                  <p className={`text-2xl font-bold ${scoreColor(s.score)}`}>
                    {s.score}<span className="text-sm font-normal text-[#94A3B8]">/10</span>
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
              <h2 className="text-sm font-semibold text-[#0D1B2A] mb-3">Summary</h2>
              <p className="text-sm text-[#64748B] leading-relaxed">{report.summary}</p>
            </div>

            {/* Strengths + Improvements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[#0D1B2A] mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs">✓</span>
                  Strengths
                </h2>
                <ul className="flex flex-col gap-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-[#64748B] flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[#0D1B2A] mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs">↑</span>
                  To improve
                </h2>
                <ul className="flex flex-col gap-2">
                  {report.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-[#64748B] flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Question breakdown */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
              <h2 className="text-sm font-semibold text-[#0D1B2A] mb-5">
                Question breakdown
              </h2>
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
                      <p className="text-xs text-[#94A3B8] mb-1">Answer</p>
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
        )}

        {/* No report yet */}
        {tab === "report" && !report && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-16 text-center">
            <p className="text-[#64748B] text-sm">
              {error || "No report generated yet — interview may still be in progress."}
            </p>
          </div>
        )}

        {/* Transcript tab */}
        {tab === "transcript" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[#0D1B2A] mb-5">
              Interview transcript
            </h2>
            <div className="flex flex-col gap-4">
            {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      m.role === "assistant"
                        ? "bg-[#EBF1FF] text-[#0052FF]"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}>
                      {m.role === "assistant" ? "AI" : "C"}
                    </div>
                    <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "assistant"
                        ? "bg-[#F8FAFC] text-[#0D1B2A]"
                        : "bg-[#EBF1FF] text-[#0D1B2A]"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}