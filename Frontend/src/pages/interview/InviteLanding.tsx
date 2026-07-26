import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../services/api";
import BrandMark from "../../components/ui/BrandMark";
import DifficultyBadge from "../../components/ui/DifficultyBadge";
import LoadingScreen from "../../components/ui/LoadingScreen";
import PrimaryButton from "../../components/ui/PrimaryButton";
import type { RoleInfo } from "../../types/interview";

export default function InviteLanding() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [role, setRole] = useState<RoleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadyCompleted, setAlreadyCompleted] = useState<string | null>(null);

  // useEffect(() => {
  //   api.get(`/api/invite/${token}`)
  //     .then((res) => setRole(res.data.role))
  //     .catch(() => setError("This invite link is invalid or has expired."))
  //     .finally(() => setLoading(false));
  // }, [token]);

  useEffect(() => {
    api.get(`/api/invite/${token}`)
      .then(async (res) => {
        setRole(res.data.role);
  
        // If candidate is logged in, check if they already completed this
        if (user && user.role === "candidate") {
          try {
            const sessions = await api.get("/api/candidate/sessions");
            const alreadyDone = sessions.data.sessions.find(
              (s: { invite_id?: string; ended_at: string | null }) =>
                s.invite_id === res.data.invite.id && s.ended_at !== null
            );
            if (alreadyDone) {
              setAlreadyCompleted(alreadyDone.id);
            }
          } catch {
            // silently ignore
          }
        }
      })
      .catch(() => setError("This invite link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [token, user]);

  function handleStart() {
    if (!user) {
      // save token so we can redirect back after login
      sessionStorage.setItem("pending_invite", token ?? "");
      navigate("/candidate/login");
      return;
    }
    navigate(`/interview/${token}/start`);
  }

  if (loading) return <LoadingScreen />;

  if (error || !role) {
    return (
      <div
        className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#0D1B2A] mb-2">Invalid invite link</h2>
          <p className="text-sm text-[#64748B]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-lg">

        <div className="flex justify-center mb-8">
          <BrandMark size="lg" />
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#EBF1FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#0D1B2A] mb-1">
              You've been invited to interview
            </h1>
            <p className="text-sm text-[#64748B]">
              Complete this AI voice interview at your own pace
            </p>
          </div>

          {/* Role details */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 mb-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-semibold text-[#0D1B2A] text-base">{role.title}</h2>
              <DifficultyBadge difficulty={role.difficulty} />
            </div>
            {role.description && (
              <p className="text-sm text-[#64748B] mb-3">{role.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                {role.tech_stack}
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {role.num_questions} questions
              </span>
            </div>
          </div>

          {/* What to expect */}
          <div className="flex flex-col gap-3 mb-6">
            {[
              { icon: "🎙️", text: "Speak naturally — the AI listens and responds in real time" },
              { icon: "🐙", text: "Enter your GitHub username to personalize the interview" },
              { icon: "📊", text: "Receive a detailed report card when you're done" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-base">{item.icon}</span>
                <p className="text-sm text-[#64748B]">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Auth state */}
          {user ? (
              <div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-4">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-sm text-green-700">
                    Signed in as <span className="font-medium">{user.name}</span>
                  </p>
                </div>

                {alreadyCompleted ? (
                  <div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                      <p className="text-sm text-amber-700 font-medium mb-1">
                        You've already completed this interview
                      </p>
                      <p className="text-xs text-amber-600">
                        You can view your report below
                      </p>
                    </div>
                    <PrimaryButton
                      onClick={() => navigate(`/candidate/sessions/${alreadyCompleted}`)}
                      className="py-3"
                    >
                      View my report →
                    </PrimaryButton>
                  </div>
                ) : (
                  <PrimaryButton onClick={handleStart} className="py-3">
                    Start interview →
                  </PrimaryButton>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-center text-[#64748B] mb-4">
                  You need to sign in before starting
                </p>
                <PrimaryButton onClick={handleStart} className="py-3">
                  Sign in to start →
                </PrimaryButton>
              </div>
            )}
        </div>

      </div>
    </div>
  );
}