// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../../context/authContext";
// import api from "../../services/api";

// export default function CompanyRegister() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [form, setForm] = useState({ name: "", email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit() {
//     setError("");
//     if (!form.name || !form.email || !form.password) {
//       setError("All fields are required");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await api.post("/api/company/register", form);
//       login({
//         id: res.data.company.id,
//         name: res.data.company.name,
//         email: res.data.company.email,
//         role: "company",
//         token: res.data.token,
//       });
//       navigate("/company/dashboard");
//     } catch (err: unknown) {
//       setError(
//         (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Registration failed"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 font-['Inter',system-ui,sans-serif]">
//       <div style={{ width: "100%", maxWidth: 440 }}>

//         {/* Logo */}
//         <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 32 }}>
//           <div style={{ width: 32, height: 32, background: "#0052FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
//               <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
//               <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
//             </svg>
//           </div>
//           <span style={{ fontWeight: 700, fontSize: 18, color: "#0D1B2A" }}>InterviewAI</span>
//         </div>

//         {/* Card */}
//         <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
//           <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0D1B2A", marginBottom: 4, letterSpacing: "-0.02em" }}>
//             Create company account
//           </h1>
//           <p style={{ fontSize: 14, color: "#64748B", marginBottom: 24 }}>
//             Start hiring smarter with AI voice interviews
//           </p>

//           {error && (
//             <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
//               {error}
//             </div>
//           )}

//           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//             {/* Company name */}
//             <div>
//               <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#0D1B2A", marginBottom: 6 }}>
//                 Company name
//               </label>
//               <input
//                 type="text"
//                 placeholder="Acme Corp"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#0D1B2A", outline: "none", boxSizing: "border-box", background: "#fff" }}
//                 onFocus={(e) => e.target.style.borderColor = "#0052FF"}
//                 onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
//               />
//             </div>

//             {/* Email */}
//             <div>
//               <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#0D1B2A", marginBottom: 6 }}>
//                 Work email
//               </label>
//               <input
//                 type="email"
//                 placeholder="you@company.com"
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#0D1B2A", outline: "none", boxSizing: "border-box", background: "#fff" }}
//                 onFocus={(e) => e.target.style.borderColor = "#0052FF"}
//                 onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#0D1B2A", marginBottom: 6 }}>
//                 Password
//               </label>
//               <input
//                 type="password"
//                 placeholder="Min 8 characters"
//                 value={form.password}
//                 onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//                 style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#0D1B2A", outline: "none", boxSizing: "border-box", background: "#fff" }}
//                 onFocus={(e) => e.target.style.borderColor = "#0052FF"}
//                 onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
//               />
//             </div>

//             {/* Submit */}
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               style={{ width: "100%", background: loading ? "#94A3B8" : "#0052FF", color: "#fff", fontWeight: 600, fontSize: 14, padding: "11px 0", borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
//             >
//               {loading ? "Creating account..." : "Create account"}
//             </button>
//           </div>

//           <p style={{ fontSize: 13, textAlign: "center", color: "#64748B", marginTop: 20 }}>
//             Already have an account?{" "}
//             <Link to="/company/login" style={{ color: "#0052FF", fontWeight: 500, textDecoration: "none" }}>
//               Sign in
//             </Link>
//           </p>
//           <p style={{ fontSize: 13, textAlign: "center", color: "#64748B", marginTop: 8 }}>
//             Are you a candidate?{" "}
//             <Link to="/candidate/register" style={{ color: "#0052FF", fontWeight: 500, textDecoration: "none" }}>
//               Register here
//             </Link>
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../services/api";

export default function CompanyRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/company/register", form);
      login({
        id: res.data.company.id,
        name: res.data.company.name,
        email: res.data.company.email,
        role: "company",
        token: res.data.token,
      });
      navigate("/company/dashboard");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 font-['Inter',system-ui,sans-serif]">
      <div className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
              <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
            </svg>
          </div>
          <span className="font-bold text-lg text-[#0D1B2A]">InterviewAI</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h1 className="text-[22px] font-bold text-[#0D1B2A] mb-1 tracking-[-0.02em]">
            Create company account
          </h1>
          <p className="text-sm text-[#64748B] mb-6">
            Start hiring smarter with AI voice interviews
          </p>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[13px] rounded-lg px-3.5 py-2.5 mb-5">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Company name */}
            <div>
              <label className="block text-[13px] font-medium text-[#0D1B2A] mb-1.5">
                Company name
              </label>
              <input
                type="text"
                placeholder="Acme Corp"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none box-border bg-white focus:border-[#0052FF]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-[#0D1B2A] mb-1.5">
                Work email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none box-border bg-white focus:border-[#0052FF]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-medium text-[#0D1B2A] mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none box-border bg-white focus:border-[#0052FF]"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full text-white font-semibold text-sm py-[11px] rounded-lg border-none mt-1 ${
                loading ? "bg-[#94A3B8] cursor-not-allowed" : "bg-[#0052FF] cursor-pointer"
              }`}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="text-[13px] text-center text-[#64748B] mt-5">
            Already have an account?{" "}
            <Link to="/company/login" className="text-[#0052FF] font-medium no-underline">
              Sign in
            </Link>
          </p>
          <p className="text-[13px] text-center text-[#64748B] mt-2">
            Are you a candidate?{" "}
            <Link to="/candidate/register" className="text-[#0052FF] font-medium no-underline">
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}