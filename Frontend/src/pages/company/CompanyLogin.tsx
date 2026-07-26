import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api, { getErrorMessage } from "../../services/api";

export default function CompanyLogin() {
  const navigate = useNavigate();
  const { login, user, isLoading} = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!isLoading && user) {
      if (user.role === "company") navigate("/company/dashboard");
      else navigate("/candidate/dashboard");
    }
  },[user, isLoading]);

  async function handleSubmit() {
    setError("");
    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/company/login", form);
      login({
        id: res.data.company.id,
        name: res.data.company.name,
        email: res.data.company.email,
        role: "company",
        token: res.data.token,
      });
      navigate("/company/dashboard");
    } catch (err: unknown) {
      console.error("company login failed", err);
      setError(getErrorMessage(err, "Login failed"));
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

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
              <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
            </svg>
          </div>
          <span className="font-bold text-[#0D1B2A] text-lg">InterviewAI</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-[#64748B] mb-6">
            Sign in to your company account
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">

            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                Work email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition placeholder:text-[#94A3B8]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#0D1B2A]">
                  Password
                </label>
              </div>
              <input
                type="password"
                placeholder="Your password"
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
              className="w-full bg-[#0052FF] hover:bg-[#0046DD] text-white font-semibold text-sm py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </div>

          <p className="text-sm text-center text-[#64748B] mt-6">
            Don't have an account?{" "}
            <Link to="/company/register" className="text-[#0052FF] font-medium hover:underline">
              Create one
            </Link>
          </p>
          <p className="text-sm text-center text-[#64748B] mt-2">
            Are you a candidate?{" "}
            <Link to="/candidate/login" className="text-[#0052FF] font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}