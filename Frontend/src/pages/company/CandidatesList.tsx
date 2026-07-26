import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import AppHeader from "../../components/ui/AppHeader";
import BackButton from "../../components/ui/BackButton";
import InlineLoader from "../../components/ui/InlineLoader";
import EmptyState from "../../components/ui/EmptyState";
import ErrorCard from "../../components/ui/ErrorCard";
import { getApiErrorMessage } from "../../utils/errors";
import { formatShortDate } from "../../utils/format";
import { parseOverallScore, scoreBadgeColor } from "../../utils/score";

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
      .then((res) => setSessions(res.data.sessions ?? []))
      .catch((err) => {
        console.error("Failed to load sessions for role", roleId, err);
        setError(getApiErrorMessage(err, "Failed to load candidates for this role"));
      })
      .finally(() => setLoading(false));
  }, [roleId]);

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <AppHeader>
        <BackButton onClick={() => navigate("/company/dashboard")} />
      </AppHeader>

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
          <InlineLoader />
        ) : error ? (
          <ErrorCard message={error} />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            title="No candidates yet"
            description="Share the invite link from the dashboard to start receiving interviews"
          />
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
              const score = parseOverallScore(session.report);
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
                      {formatShortDate(session.created_at)}
                    </span>
                  </div>

                  <div className="col-span-2">
                    {score !== null ? (
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${scoreBadgeColor(score)}`}>
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