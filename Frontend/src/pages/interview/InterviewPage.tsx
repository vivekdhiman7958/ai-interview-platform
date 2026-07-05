import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";

type Message = { role: "user" | "assistant"; content: string };
type Status = "connecting" | "waiting-github" | "ai-speaking" | "user-speaking" | "thinking" | "evaluating" | "ended";
type Report = {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
};

export default function InterviewPage() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("connecting");
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [github, setGithub] = useState("");
  const [githubSubmitted, setGithubSubmitted] = useState(false);
  const [currentAiText, setCurrentAiText] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [timer, setTimer] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isListening, setIsListening] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll transcript only
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Timer
  useEffect(() => {
    if (status !== "connecting" && status !== "ended" && status !== "evaluating") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  // Camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraEnabled(true);
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          setVideoUrl(URL.createObjectURL(blob));
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
      } catch {
        setCameraEnabled(false);
      }
    }
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // WebSocket
  useEffect(() => {
    if (!user || !token) return;
    const ws = new WebSocket(`ws://localhost:3000/interview?token=${token}&authToken=${user.token}`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as { type: string; message?: string; report?: Report; sessionId?: string; };
      if (data.type === "connected") setStatus("waiting-github");

      // here is the change for the multiple interview on the same link
      if (data.type === "already-completed") {
        navigate(`/candidate/sessions/${data.sessionId}`);
        return;
      }

      if (data.type === "reply") {
        const text = data.message ?? "";
        setCurrentAiText(text);
        setTranscript((prev) => [...prev, { role: "assistant", content: text }]);
        speakText(text);
      }
      if (data.type === "evaluating") {
        setStatus("evaluating");
        if (timerRef.current) clearInterval(timerRef.current);
        mediaRecorderRef.current?.stop();
      }
      if (data.type === "report") { setReport(data.report ?? null); setStatus("ended"); }
    };
    return () => ws.close();
  }, [user, token]);

  function speakText(text: string) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    setStatus("ai-speaking");
    utterance.onend = () => { setStatus("user-speaking"); startListening(); };
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setIsListening(false);
      setStatus("thinking");
      setTranscript((prev) => [...prev, { role: "user", content: text }]);
      wsRef.current?.send(JSON.stringify({ type: "message", payload: text }));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function handleGithubSubmit() {
    if (!github.trim()) return;
    setGithubSubmitted(true);
    setStatus("thinking");
    wsRef.current?.send(JSON.stringify({ type: "init", payload: github.trim() }));
  }

  function handleEndInterview() {
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();

    if (!githubSubmitted) {
      navigate("/candidate/dashboard");
      return;
    }
    
    setStatus("evaluating");
    wsRef.current?.send(JSON.stringify({ type: "end" }));
  }

  function formatTimer(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  function scoreColor(score: number) {
    if (score >= 7) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-500";
  }

  // EVALUATING
  if (status === "evaluating") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-lg font-semibold text-[#0D1B2A] mb-1">Generating your report</h2>
          <p className="text-sm text-[#64748B]">This takes about 10 seconds...</p>
        </div>
      </div>
    );
  }

  // REPORT
  if (status === "ended" && report) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-10" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
                <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
              </svg>
            </div>
            <span className="font-bold text-[#0D1B2A] text-lg">InterviewAI</span>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mb-4 text-center">
            <h1 className="text-xl font-bold text-[#0D1B2A] mb-1">Interview complete!</h1>
            <p className="text-sm text-[#64748B] mb-4">Here's how you did</p>
            <p className={`text-5xl font-bold mb-1 ${scoreColor(report.overallScore)}`}>
              {report.overallScore}<span className="text-2xl text-[#94A3B8]">/10</span>
            </p>
            <p className="text-sm text-[#64748B]">Overall score</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Communication", score: report.communicationScore },
              { label: "Technical", score: report.technicalScore },
              { label: "Problem Solving", score: report.problemSolvingScore },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-center">
                <p className={`text-xl font-bold ${scoreColor(s.score)}`}>{s.score}/10</p>
                <p className="text-xs text-[#64748B] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-4">
            <p className="text-sm font-semibold text-[#0D1B2A] mb-2">Summary</p>
            <p className="text-sm text-[#64748B] leading-relaxed">{report.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
              <p className="text-sm font-semibold text-[#0D1B2A] mb-3">Strengths</p>
              <ul className="flex flex-col gap-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-[#64748B] flex items-start gap-2">
                    <span className="text-green-500 shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
              <p className="text-sm font-semibold text-[#0D1B2A] mb-3">To improve</p>
              <ul className="flex flex-col gap-2">
                {report.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-[#64748B] flex items-start gap-2">
                    <span className="text-orange-400 shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {videoUrl && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-4">
              <p className="text-sm font-semibold text-[#0D1B2A] mb-3">Your recording</p>
              <video src={videoUrl} controls className="w-full rounded-lg" />
              <a href={videoUrl} download="interview-recording.webm" className="mt-3 inline-block text-sm text-[#0052FF] font-medium hover:underline">
                Download recording
              </a>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/candidate/dashboard")}
            className="w-full bg-[#0052FF] hover:bg-[#0046DD] text-white font-semibold text-sm py-3 rounded-lg transition"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  // MAIN INTERVIEW
  return (
    <div
      className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >

      {/* Top bar — fixed */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0052FF] rounded-md flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
              <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
            </svg>
          </div>
          <span className="font-semibold text-[#0D1B2A] text-sm">InterviewAI</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#F1F5F9] px-3 py-1 rounded-lg">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs font-mono text-[#64748B]">{formatTimer(timer)}</span>
          </div>
          {cameraEnabled && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-500">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />REC
            </div>
          )}
          <button
            type="button"
            onClick={handleEndInterview}
            className="text-xs font-medium text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
          >
            End interview
          </button>
        </div>
      </div>

      {/* Body — flex row, fills remaining height */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — completely fixed, never scrolls */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 overflow-hidden">

          {/* GitHub input */}
          {status === "waiting-github" && !githubSubmitted && (
            <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-[#EBF1FF] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-[#0052FF]">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.395-.135-.345-.72-1.395-1.23-1.665-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </div>
              <h2 className="font-semibold text-[#0D1B2A] text-base mb-1">Enter your GitHub username</h2>
              <p className="text-xs text-[#64748B] mb-4">We'll personalize your interview based on your real projects</p>
              <input
                type="text"
                placeholder="e.g. vivekdhiman7958"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGithubSubmit()}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition placeholder:text-[#94A3B8] mb-3"
              />
              <button
                type="button"
                onClick={handleGithubSubmit}
                className="w-full bg-[#0052FF] hover:bg-[#0046DD] text-white font-semibold text-sm py-2.5 rounded-lg transition"
              >
                Start interview →
              </button>
            </div>
          )}

          {/* AI card — shown after github submitted */}
          {(githubSubmitted || status !== "waiting-github") && (
            <>
              <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">

                {/* AI avatar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    status === "ai-speaking" ? "bg-[#0052FF]" : "bg-[#EBF1FF]"
                  }`}>
                    {status === "thinking" ? (
                      <div className="flex gap-0.5">
                        {[0,1,2].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={status === "ai-speaking" ? "white" : "#0052FF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0D1B2A]">AI Interviewer</p>
                    <p className={`text-xs mt-0.5 ${
                      status === "ai-speaking" ? "text-[#0052FF]"
                      : status === "thinking" ? "text-[#64748B]"
                      : status === "user-speaking" ? "text-green-600"
                      : "text-[#94A3B8]"
                    }`}>
                      {status === "ai-speaking" && "Speaking..."}
                      {status === "thinking" && "Thinking..."}
                      {status === "user-speaking" && "Waiting for you"}
                      {status === "connecting" && "Connecting..."}
                      {status === "waiting-github" && githubSubmitted && "Loading your profile..."}
                    </p>
                  </div>
                </div>

                {/* Current AI question */}
                <p className="text-sm text-[#0D1B2A] leading-relaxed min-h-[60px]">
                  {currentAiText || (
                    <span className="text-[#94A3B8]">
                      {status === "connecting" ? "Connecting to server..." : "Waiting for interviewer..."}
                    </span>
                  )}
                </p>
              </div>

              {/* Mic button */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={status !== "user-speaking"}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                    isListening
                      ? "bg-green-500 scale-110 shadow-green-200"
                      : status === "user-speaking"
                      ? "bg-[#0052FF] hover:bg-[#0046DD] shadow-blue-100"
                      : "bg-[#E2E8F0]"
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
                <p className="text-xs text-[#94A3B8]">
                  {isListening ? "Listening... click to stop" : status === "user-speaking" ? "Click to speak" : "Wait for your turn"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* RIGHT — transcript scrolls, left stays fixed */}
        <div className="w-72 flex flex-col border-l border-[#E2E8F0] bg-white overflow-hidden">

          {/* Camera — fixed at top of right panel */}
          <div className="p-3 border-b border-[#E2E8F0] shrink-0">
            <div className="relative bg-[#0D1B2A] rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {cameraEnabled ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1.5 opacity-30">
                      <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <p className="text-xs text-white/30">Camera off</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-xs text-white">
                {user?.name ?? "You"}
              </div>
            </div>
          </div>

          {/* Transcript — ONLY this scrolls */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
              Transcript
            </p>

            {transcript.length === 0 && (
              <p className="text-xs text-[#94A3B8] text-center mt-8">
                Conversation will appear here
              </p>
            )}

            <div className="flex flex-col gap-4">
              {transcript.map((m, i) => (
                <div key={i}>
                  <p className={`text-xs font-semibold mb-1 ${
                    m.role === "assistant" ? "text-[#0052FF]" : "text-green-600"
                  }`}>
                    {m.role === "assistant" ? "AI Interviewer" : user?.name ?? "You"}
                  </p>
                  <p className="text-xs text-[#4A5568] leading-relaxed">{m.content}</p>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}