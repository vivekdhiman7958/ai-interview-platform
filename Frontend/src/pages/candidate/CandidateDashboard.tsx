import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../services/api";
import UserHeader from "../../components/ui/UserHeader";
import InlineLoader from "../../components/ui/InlineLoader";
import EmptyState from "../../components/ui/EmptyState";
import ScoreBadge from "../../components/interview/ScoreBadge";
import { formatShortDate } from "../../utils/format";
import { parseOverallScore } from "../../utils/score";

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

  useEffect(() => {
    api.get("/api/candidate/sessions")
      .then((res) => setSessions(res.data.sessions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <UserHeader
        name={user?.name}
        onSignOut={() => { logout(); navigate("/"); }}
      />

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
          <InlineLoader />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            }
            title="No interviews yet"
            description="Open an invite link from a company to start your first interview"
          />
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
              const score = parseOverallScore(session.report);
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
                    <p className="text-sm text-[#64748B]">{formatShortDate(session.created_at)}</p>
                  </div>
                  <div className="col-span-1">
                    <ScoreBadge score={score} />
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