import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../services/api";

type Role = {
  id: string;
  title: string;
  description: string;
  tech_stack: string;
  difficulty: string;
  num_questions: number;
};

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  useEffect(() => {
    api.get("/api/roles")
      .then((res) => setRoles(res.data.roles))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function generateInvite(roleId: string) {
    try {
      const res = await api.post(`/api/roles/${roleId}/invite`);
      setInviteLink(res.data.inviteLink);
      setInviteRole(roleId);
    } catch {
      alert("Failed to generate invite link");
    }
  }

  async function handleDelete(roleId: string) {
    if (!confirm("Are you sure you want to delete this role? This will also delete all invite links for this role.")) return;
    try {
      await api.delete(`/api/roles/${roleId}`);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch {
      alert("Failed to delete role");
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const difficultyColor: Record<string, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

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
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#64748B]">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-[#64748B] hover:text-[#0D1B2A] transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Manage your interview roles and candidates
            </p>
          </div>
          <button
            onClick={() => navigate("/company/roles/create")}
            className="flex items-center gap-2 bg-[#0052FF] hover:bg-[#0046DD] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Role
          </button>
        </div>

        {/* Invite link popup */}
        {inviteLink && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#0D1B2A] mb-1">Invite link generated</p>
              <p className="text-xs text-[#64748B] break-all">{inviteLink}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { navigator.clipboard.writeText(inviteLink); alert("Copied!"); }}
                className="text-xs bg-[#0052FF] text-white px-3 py-1.5 rounded-lg font-medium"
              >
                Copy
              </button>
              <button
                onClick={() => { setInviteLink(""); setInviteRole(""); }}
                className="text-xs text-[#64748B] px-3 py-1.5 rounded-lg border border-[#E2E8F0]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Roles */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : roles.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-16 text-center">
            <div className="w-12 h-12 bg-[#EBF1FF] rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#0D1B2A] mb-2">No roles yet</h3>
            <p className="text-sm text-[#64748B] mb-6">
              Create your first interview role to start hiring
            </p>
            <button
              onClick={() => navigate("/company/roles/create")}
              className="bg-[#0052FF] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0046DD] transition"
            >
              Create your first role
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[#0D1B2A] text-base">
                      {role.title}
                    </h3>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${difficultyColor[role.difficulty] ?? "bg-gray-100 text-gray-600"}`}>
                      {role.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B] truncate mb-2">
                    {role.tech_stack}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {role.num_questions} questions
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/company/roles/${role.id}/edit`)}
                      className="text-sm text-[#64748B] border border-[#E2E8F0] px-3.5 py-2 rounded-lg hover:bg-[#F8FAFC] transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(role.id)}
                      className="text-sm text-red-500 border border-red-200 px-3.5 py-2 rounded-lg hover:bg-red-50 transition font-medium"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/company/roles/${role.id}/candidates`)}
                      className="text-sm text-[#0052FF] border border-[#0052FF] px-3.5 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                    >
                      View candidates
                    </button>
                    <button
                      type="button"
                      onClick={() => generateInvite(role.id)}
                      className="text-sm bg-[#0052FF] text-white px-3.5 py-2 rounded-lg hover:bg-[#0046DD] transition font-medium"
                    >
                      {inviteRole === role.id ? "Regenerate link" : "Get invite link"}
                    </button>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}