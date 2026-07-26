import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api, { getErrorMessage } from "../../services/api";

export default function CandidateRegister() {
  const navigate = useNavigate();
  const { login,user,isLoading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!isLoading && user){
    if (user.role === "company") navigate("/company/dashboard");
    else navigate("/candidate/dashboard");
    } 
})

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/candidate/register", form);
      login({
        id: res.data.candidate.id,
        name: res.data.candidate.name,
        email: res.data.candidate.email,
        role: "candidate",
        token: res.data.token,
      });
      navigate("/candidate/dashboard");
    } catch (err: unknown) {
      console.error("candidate registration failed", err);
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">

        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
              <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
            </svg>
          </div>
          <span className="font-bold text-[#0D1B2A] text-lg">InterviewAI</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1 tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-[#64748B] mb-6">
            Join to start taking AI voice interviews
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">Full name</label>
              <input
                type="text"
                placeholder="Vivek Dhiman"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition placeholder:text-[#94A3B8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition placeholder:text-[#94A3B8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition placeholder:text-[#94A3B8]"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#0052FF] hover:bg-[#0046DD] text-white font-semibold text-sm py-2.5 rounded-lg transition disabled:opacity-60 mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="text-sm text-center text-[#64748B] mt-6">
            Already have an account?{" "}
            <Link to="/candidate/login" className="text-[#0052FF] font-medium hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-center text-[#64748B] mt-2">
            Are you a company?{" "}
            <Link to="/company/register" className="text-[#0052FF] font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}