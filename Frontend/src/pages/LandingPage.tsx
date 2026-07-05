// import { useNavigate } from "react-router-dom";

// export default function LandingPage() {
//   const navigate = useNavigate();

//   return (
//     <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: "#0D1B2A", background: "#fff", lineHeight: 1.6, WebkitFontSmoothing: "antialiased" }}>

//       {/* Header */}
//       <header style={{ padding: "20px 0", borderBottom: "1px solid #E2E8F0" }}>
//         <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: "1.125rem" }}>
//             <div style={{ width: 32, height: 32, background: "#0052FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
//                 <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
//                 <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
//               </svg>
//             </div>
//             InterviewAI
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//             <button onClick={() => navigate("/company/login")} style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#4A5568", background: "none", border: "none", cursor: "pointer" }}>
//               Sign in
//             </button>
//             <button onClick={() => navigate("/company/register")} style={{ fontSize: "0.9375rem", fontWeight: 600, background: "#0052FF", color: "#fff", padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer" }}>
//               Get started
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Hero */}
//       <section style={{ padding: "72px 0 96px" }}>
//         <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 48, alignItems: "center" }}>

//           {/* Left */}
//           <div>
//             <span style={{ display: "inline-block", background: "#E8EFFF", color: "#0052FF", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 100, marginBottom: 20 }}>
//               AI Voice Interview Platform
//             </span>
//             <h1 style={{ color:"black", fontSize: "2.75rem", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20 }}>
//               AI Voice Interviews for Modern Hiring
//             </h1>
//             <p style={{ fontSize: "1.0625rem", color: "#4A5568", maxWidth: 440, marginBottom: 32, lineHeight: 1.7 }}>
//               Create interview roles, invite candidates, conduct AI voice interviews, and get detailed evaluation reports.
//             </p>
//             <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
//               <button onClick={() => navigate("/company/register")} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", fontWeight: 600, background: "#0052FF", color: "#fff", padding: "14px 24px", borderRadius: 8, border: "none", cursor: "pointer" }}>
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
//                 </svg>
//                 I'm a Company
//               </button>
//               <button onClick={() => navigate("/candidate/register")} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1rem", fontWeight: 600, background: "#fff", color: "#0D1B2A", padding: "14px 24px", borderRadius: 8, border: "1.5px solid #E2E8F0", cursor: "pointer" }}>
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
//                 </svg>
//                 I'm a Candidate
//               </button>
//             </div>
//             <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//               {[
//                 { label: "Browser Based", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> },
//                 { label: "Secure & Private", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
//                 { label: "No Downloads", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
//               ].map((b) => (
//                 <span key={b.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#E8EFFF", color: "#4A5568", fontSize: "0.8125rem", fontWeight: 500, padding: "6px 12px", borderRadius: 100 }}>
//                   {b.icon}{b.label}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Right — Dashboard Mockup */}
//           <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06), 0 24px 56px -8px rgba(0,0,0,0.14)", border: "1px solid #E2E8F0", overflow: "hidden" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "14px 18px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
//               <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57", display: "inline-block" }} />
//               <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E", display: "inline-block" }} />
//               <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28CA41", display: "inline-block" }} />
//             </div>
//             <div style={{ display: "flex", minHeight: 440 }}>
//               {/* Sidebar */}
//               <nav style={{ width: 172, background: "#F8FAFC", borderRight: "1px solid #E2E8F0", padding: "20px 0", flexShrink: 0 }}>
//                 {[
//                   { label: "Dashboard", active: true, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
//                   { label: "Roles", active: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
//                   { label: "Candidates", active: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
//                   { label: "Reports", active: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
//                 ].map((item) => (
//                   <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", fontSize: "0.8125rem", fontWeight: 500, color: item.active ? "#0052FF" : "#4A5568", background: item.active ? "#EBF1FF" : "transparent", borderRight: item.active ? "2px solid #0052FF" : "none" }}>
//                     {item.icon}<span>{item.label}</span>
//                   </div>
//                 ))}
//               </nav>

//               {/* Main */}
//               <div style={{ flex: 1, padding: 28 }}>
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
//                   <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Dashboard</h3>
//                   <button style={{ fontSize: "0.8125rem", fontWeight: 600, background: "#0052FF", color: "#fff", padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}>+ Create Role</button>
//                 </div>
//                 <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
//                   {[0, 1, 2, 3].map((i) => (
//                     <div key={i} style={{ background: "#F8FAFC", borderRadius: 8, padding: 16, border: "1px solid #E2E8F0" }}>
//                       <div style={{ height: 8, background: "#E2E8F0", borderRadius: 4, marginBottom: 8 }} />
//                       <div style={{ height: 8, background: "#E2E8F0", borderRadius: 4, width: "60%", marginBottom: 8 }} />
//                       <div style={{ height: 8, background: "#0052FF", opacity: 0.3, borderRadius: 4, width: "40%" }} />
//                     </div>
//                   ))}
//                 </div>
//                 <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A5568", marginBottom: 16 }}>Recent Interviews</p>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//                   {[0, 1, 2].map((i) => (
//                     <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
//                       <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EBF1FF", flexShrink: 0 }} />
//                       <div style={{ flex: 1 }}>
//                         <div style={{ height: 7, background: "#E2E8F0", borderRadius: 4, marginBottom: 7 }} />
//                         <div style={{ height: 7, background: "#E2E8F0", borderRadius: 4, width: "70%" }} />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       </section>

//       {/* How it works */}
//       <section style={{ padding: "80px 0" }}>
//         <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>
//           <h2 style={{ textAlign: "center",color:"black", fontSize: "1.75rem", fontWeight: 700, marginBottom: 56, letterSpacing: "-0.02em" }}>How it works</h2>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
//             {[
//               { title: "Create Role", desc: "Define job requirements and interview questions for your open positions.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg> },
//               { title: "Invite Candidate", desc: "Send interview invitations to candidates via unique link with one click.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> },
//               { title: "AI Interview", desc: "Candidates complete voice interviews powered by advanced AI technology.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg> },
//               { title: "Receive Report", desc: "Get detailed evaluation reports with scores and insights instantly.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
//             ].map((s, i) => (
//               <div key={s.title} style={{ textAlign: "center", position: "relative" }}>
//                 {i < 3 && <span style={{ position: "absolute", right: -12, top: 16, color: "#94A3B8", fontSize: "1.25rem" }}>→</span>}
//                 <div style={{ width: 56, height: 56, background: "#EBF1FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#0052FF" }}>
//                   {s.icon}
//                 </div>
//                 <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
//                 <p style={{ fontSize: "0.8125rem", color: "#4A5568", lineHeight: 1.6, maxWidth: 180, margin: "0 auto" }}>{s.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section style={{ background: "#F8FAFC", padding: "80px 0" }}>
//         <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
//             {[
//               {
//                 title: "Voice Interviews",
//                 desc: "Conduct natural, conversational AI voice interviews that feel human and engaging for every candidate.",
//                 icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
//               },
//               {
//                 title: "GitHub Integration",
//                 desc: "Connect GitHub profiles to evaluate candidates' coding skills and project contributions automatically.",
//                 icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.395-.135-.345-.72-1.395-1.23-1.665-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
//               },
//               {
//                 title: "Detailed Reports",
//                 desc: "Receive comprehensive evaluation reports with scores, transcripts, and actionable hiring insights.",
//                 icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
//               },
//             ].map((f) => (
//               <div key={f.title} style={{ background: "#fff", borderRadius: 12, padding: 32, border: "1px solid #E2E8F0" }}>
//                 <div style={{ width: 48, height: 48, background: "#EBF1FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#0052FF", marginBottom: 20 }}>
//                   {f.icon}
//                 </div>
//                 <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, marginBottom: 10 }}>{f.title}</h3>
//                 <p style={{ fontSize: "0.875rem", color: "#4A5568", lineHeight: 1.65 }}>{f.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0", padding: "28px 0" }}>
//         <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "0.9375rem" }}>
//             <div style={{ width: 28, height: 28, background: "#0052FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
//                 <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
//                 <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
//               </svg>
//             </div>
//             InterviewAI
//           </div>
//           <div style={{ display: "flex", gap: 24 }}>
//             {["GitHub", "Documentation", "Privacy", "Terms"].map((l) => (
//               <span key={l} style={{ fontSize: "0.875rem", color: "#4A5568", cursor: "pointer" }}>{l}</span>
//             ))}
//           </div>
//           <span style={{ fontSize: "0.875rem", color: "#94A3B8" }}>© 2025 InterviewAI</span>
//         </div>
//       </footer>

//     </div>
//   );
// }


import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user ,isLoading} = useAuth();


  useEffect(()=>{
       if(!isLoading && user){
        if(user.role==="company")navigate("/company/dashboard");
        else navigate("/candidate/dashboard");
       }
  }, [user, isLoading, navigate]);

  return (
    <div className="font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] text-[#0D1B2A] bg-white leading-[1.6] antialiased">

      {/* Header */}
      <header className="py-5 border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-lg">
            <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
                <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
              </svg>
            </div>
            InterviewAI
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/company/login")} className="text-[0.9375rem] font-medium text-[#4A5568] bg-transparent border-none cursor-pointer">
              Sign in
            </button>
            <button onClick={() => navigate("/company/register")} className="text-[0.9375rem] font-semibold bg-[#0052FF] text-white px-5 py-2.5 rounded-lg border-none cursor-pointer">
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-[72px] pb-24">
        <div className="max-w-[1240px] mx-auto px-6 grid grid-cols-[1fr_1.25fr] gap-12 items-center">

          {/* Left */}
          <div>
            <span className="inline-block bg-[#E8EFFF] text-[#0052FF] text-[0.6875rem] font-bold tracking-[0.08em] uppercase px-3.5 py-1.5 rounded-full mb-5">
              AI Voice Interview Platform
            </span>
            <h1 className="text-black text-[2.75rem] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
              AI Voice Interviews for Modern Hiring
            </h1>
            <p className="text-[1.0625rem] text-[#4A5568] max-w-[440px] mb-8 leading-[1.7]">
              Create interview roles, invite candidates, conduct AI voice interviews, and get detailed evaluation reports.
            </p>
            <div className="flex gap-3 mb-8 flex-wrap">
              <button onClick={() => navigate("/company/register")} className="inline-flex items-center gap-2 text-base font-semibold bg-[#0052FF] text-white px-6 py-3.5 rounded-lg border-none cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                I'm a Company
              </button>
              <button onClick={() => navigate("/candidate/register")} className="inline-flex items-center gap-2 text-base font-semibold bg-white text-[#0D1B2A] px-6 py-3.5 rounded-lg border-[1.5px] border-[#E2E8F0] cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                I'm a Candidate
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: "Browser Based", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> },
                { label: "Secure & Private", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
                { label: "No Downloads", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 bg-[#E8EFFF] text-[#4A5568] text-[0.8125rem] font-medium px-3 py-1.5 rounded-full">
                  {b.icon}{b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="bg-white rounded-[14px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.06),0_24px_56px_-8px_rgba(0,0,0,0.14)] border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center gap-[7px] px-[18px] py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#28CA41] inline-block" />
            </div>
            <div className="flex min-h-[440px]">
              {/* Sidebar */}
              <nav className="w-[172px] bg-[#F8FAFC] border-r border-[#E2E8F0] py-5 flex-shrink-0">
                {[
                  { label: "Dashboard", active: true, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
                  { label: "Roles", active: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
                  { label: "Candidates", active: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
                  { label: "Reports", active: false, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-[18px] py-2.5 text-[0.8125rem] font-medium ${
                      item.active
                        ? "text-[#0052FF] bg-[#EBF1FF] border-r-2 border-[#0052FF]"
                        : "text-[#4A5568] bg-transparent"
                    }`}
                  >
                    {item.icon}<span>{item.label}</span>
                  </div>
                ))}
              </nav>

              {/* Main */}
              <div className="flex-1 p-7">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Dashboard</h3>
                  <button className="text-[0.8125rem] font-semibold bg-[#0052FF] text-white px-4 py-2 rounded-lg border-none cursor-pointer">+ Create Role</button>
                </div>
                <div className="grid grid-cols-4 gap-3.5 mb-7">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0]">
                      <div className="h-2 bg-[#E2E8F0] rounded mb-2" />
                      <div className="h-2 bg-[#E2E8F0] rounded w-[60%] mb-2" />
                      <div className="h-2 bg-[#0052FF] opacity-30 rounded w-[40%]" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-[#4A5568] mb-4">Recent Interviews</p>
                <div className="flex flex-col gap-3.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#EBF1FF] flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-[7px] bg-[#E2E8F0] rounded mb-[7px]" />
                        <div className="h-[7px] bg-[#E2E8F0] rounded w-[70%]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-[1240px] mx-auto px-6">
          <h2 className="text-center text-black text-[1.75rem] font-bold mb-14 tracking-[-0.02em]">How it works</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { title: "Create Role", desc: "Define job requirements and interview questions for your open positions.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg> },
              { title: "Invite Candidate", desc: "Send interview invitations to candidates via unique link with one click.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> },
              { title: "AI Interview", desc: "Candidates complete voice interviews powered by advanced AI technology.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg> },
              { title: "Receive Report", desc: "Get detailed evaluation reports with scores and insights instantly.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
            ].map((s, i) => (
              <div key={s.title} className="text-center relative">
                {i < 3 && <span className="absolute -right-3 top-4 text-[#94A3B8] text-xl">→</span>}
                <div className="w-14 h-14 bg-[#EBF1FF] rounded-lg flex items-center justify-center mx-auto mb-4 text-[#0052FF]">
                  {s.icon}
                </div>
                <h3 className="text-[0.9375rem] font-semibold mb-2">{s.title}</h3>
                <p className="text-[0.8125rem] text-[#4A5568] leading-[1.6] max-w-[180px] mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                title: "Voice Interviews",
                desc: "Conduct natural, conversational AI voice interviews that feel human and engaging for every candidate.",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
              },
              {
                title: "GitHub Integration",
                desc: "Connect GitHub profiles to evaluate candidates' coding skills and project contributions automatically.",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.395-.135-.345-.72-1.395-1.23-1.665-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
              },
              {
                title: "Detailed Reports",
                desc: "Receive comprehensive evaluation reports with scores, transcripts, and actionable hiring insights.",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-8 border border-[#E2E8F0]">
                <div className="w-12 h-12 bg-[#EBF1FF] rounded-lg flex items-center justify-center text-[#0052FF] mb-5">
                  {f.icon}
                </div>
                <h3 className="text-[1.0625rem] font-semibold mb-2.5">{f.title}</h3>
                <p className="text-sm text-[#4A5568] leading-[1.65]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

         {/* Footer */}
<footer style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0", padding: "28px 0" }}>
  <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
    
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "0.9375rem" }}>
      <div style={{ width: 28, height: 28, background: "#0052FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
          <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
        </svg>
      </div>
      InterviewAI
    </div>

    {/* Links */}
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <a href="#" style={{ fontSize: "0.875rem", color: "#4A5568", textDecoration: "none" }}>Documentation</a>
      <a href="#" style={{ fontSize: "0.875rem", color: "#4A5568", textDecoration: "none" }}>Privacy</a>
      <a href="#" style={{ fontSize: "0.875rem", color: "#4A5568", textDecoration: "none" }}>Terms</a>
    </div>

    {/* Social links */}
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>

      {/* GitHub */}
      <a
        href="https://github.com/vivekdhiman7958"
        target="_blank"
        rel="noreferrer"
        style={{ color: "#4A5568", display: "flex", alignItems: "center" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.395-.135-.345-.72-1.395-1.23-1.665-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href="https://www.linkedin.com/in/vivek-dhiman-29a74136a/"
        target="_blank"
        rel="noreferrer"
        style={{ color: "#4A5568", display: "flex", alignItems: "center" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/vivek.dhiman12/"
        target="_blank"
        rel="noreferrer"
        style={{ color: "#4A5568", display: "flex", alignItems: "center" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      </a>
    </div>

    <span style={{ fontSize: "0.875rem", color: "#94A3B8" }}>© 2025 InterviewAI</span>
  </div>
</footer>

    </div>
  );
}