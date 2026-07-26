import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage, safeJsonParse } from "../../services/api";

type Session = {
  id: string;
  candidate_name: string;
  candidate_email: string;
  github_username: string;
  created_at: string;
  ended_at: string | null;
  report: string | null;
};

export default function CandidatesList() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //const [roleName, setRoleName] = useState("");

  useEffect(() => {
    api.get(`/api/roles/${roleId}/sessions`)
      .then((res) => {
        setSessions(res.data.sessions ?? []);
      })
      .catch((err) => {
        console.error("Failed to load sessions for role", roleId, err);
        setError(getErrorMessage(err, "Failed to load candidates for this role"));
      })
      .finally(() => setLoading(false));
  }, [roleId]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
          onClick={() => navigate("/company/dashboard")}
          className="text-sm text-[#64748B] hover:text-[#0D1B2A] transition"
        >
          ← Back to dashboard
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
            Candidates
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            All interview sessions for this role
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#0D1B2A] mb-2">
              No candidates yet
            </h3>
            <p className="text-sm text-[#64748B]">
              Share the invite link from the dashboard to start receiving interviews
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">

            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <span className="col-span-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Candidate</span>
              <span className="col-span-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">GitHub</span>
              <span className="col-span-2 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Date</span>
              <span className="col-span-2 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Score</span>
              <span className="col-span-2 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Action</span>
            </div>

            {/* Table rows */}
            {sessions.map((session) => {
              const score = getScore(session.report);
              return (
                <div
                  key={session.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E2E8F0] last:border-b-0 items-center hover:bg-[#F8FAFC] transition"
                >
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-[#0D1B2A]">
                      {session.candidate_name}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {session.candidate_email}
                    </p>
                  </div>

                  <div className="col-span-3">
                    <span className="text-sm text-[#64748B]">
                      @{session.github_username}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm text-[#64748B]">
                      {formatDate(session.created_at)}
                    </span>
                  </div>

                  <div className="col-span-2">
                    {score !== null ? (
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${scoreColor(score)}`}>
                        {score}/10
                      </span>
                    ) : session.ended_at ? (
                      <span className="text-xs text-[#94A3B8]">No report</span>
                    ) : (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-lg">
                        In progress
                      </span>
                    )}
                  </div>

                  <div className="col-span-2">
                    {session.report && (
                      <button
                        onClick={() => navigate(`/company/sessions/${session.id}`)}
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