import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api, { getErrorMessage, safeJsonParse } from "../../services/api";

type Session = {
  id: string;
  role_title: string;
  company_name: string;
  github_username: string;
  created_at: string;
  ended_at: string | null;
  report: string | null;
};

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/candidate/sessions")
      .then((res) => setSessions(res.data.sessions ?? []))
      .catch((err) => {
        console.error("Failed to load candidate sessions", err);
        setError(getErrorMessage(err, "Failed to load your interviews"));
      })
      .finally(() => setLoading(false));
  }, []);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  }

  function getScore(report: string | null): number | null {
    const parsed = safeJsonParse<{ overallScore?: number }>(report, "session report");
    return parsed?.overallScore ?? null;
  }

  function scoreColor(score: number) {
    if (score >= 7) return "text-green-600 bg-green-50";
    if (score >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  }

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#64748B]">{user?.name}</span>
          <button
            type="button"
            onClick={() => { logout(); navigate("/"); }}
            className="text-sm text-[#64748B] hover:text-[#0D1B2A] transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
            My interviews
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            All your past interview sessions
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm font-semibold text-white bg-[#0052FF] px-4 py-2 rounded-lg"
            >
              Try again
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-16 text-center">
            <div className="w-12 h-12 bg-[#EBF1FF] rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#0D1B2A] mb-2">No interviews yet</h3>
            <p className="text-sm text-[#64748B]">
              Open an invite link from a company to start your first interview
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <span className="col-span-4 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Role</span>
              <span className="col-span-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Company</span>
              <span className="col-span-2 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Date</span>
              <span className="col-span-1 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Score</span>
              <span className="col-span-2 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Action</span>
            </div>

            {sessions.map((session) => {
              const score = getScore(session.report);
              return (
                <div
                  key={session.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E2E8F0] last:border-b-0 items-center hover:bg-[#F8FAFC] transition"
                >
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-[#0D1B2A]">{session.role_title}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-[#64748B]">{session.company_name}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[#64748B]">{formatDate(session.created_at)}</p>
                  </div>
                  <div className="col-span-1">
                    {score !== null ? (
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${scoreColor(score)}`}>
                        {score}/10
                      </span>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">—</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {session.report && (
                      <button
                        type="button"
                        onClick={() => navigate(`/candidate/sessions/${session.id}`)}
                        className="text-xs text-[#0052FF] border border-[#0052FF] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition font-medium"
                      >
                        View report
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}