import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api";

export default function CreateRole() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    tech_stack: "",
    difficulty: "medium",
    num_questions: 5,
    custom_questions: [] as string[],
  });
  const [newQuestion, setNewQuestion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addQuestion() {
    if (!newQuestion.trim()) return;
    setForm({
      ...form,
      custom_questions: [...form.custom_questions, newQuestion.trim()],
    });
    setNewQuestion("");
  }

  function removeQuestion(index: number) {
    setForm({
      ...form,
      custom_questions: form.custom_questions.filter((_, i) => i !== index),
    });
  }

  async function handleSubmit() {
    setError("");
    if (!form.title || !form.tech_stack) {
      setError("Title and tech stack are required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/roles", form);
      navigate("/company/dashboard");
    } catch (err: unknown) {
      console.error("role creation failed", err);
      setError(getErrorMessage(err, "Failed to create role"));
    } finally {
      setLoading(false);
    }
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

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
            Create interview role
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Define the role requirements and the AI will tailor questions accordingly
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                Job title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Engineer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition placeholder:text-[#94A3B8]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                Description
              </label>
              <textarea
                placeholder="e.g. React-heavy role, 2+ years experience required"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition placeholder:text-[#94A3B8] resize-none"
              />
            </div>

            {/* Tech stack */}
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                Tech stack <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
                value={form.tech_stack}
                onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition placeholder:text-[#94A3B8]"
              />
            </div>

            {/* Difficulty + Questions row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                  Difficulty
                </label>
                <select
                  aria-label="Difficulty level"
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition bg-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                  Number of questions
                </label>
                <input
                  aria-label="Number of questions"
                  type="number"
                  min={1}
                  max={10}
                  value={form.num_questions}
                  onChange={(e) => setForm({ ...form, num_questions: Number(e.target.value) })}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition"
                />
              </div>
            </div>

            {/* Custom questions */}
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                Custom questions
                <span className="text-[#94A3B8] font-normal ml-1">(optional)</span>
              </label>
              <p className="text-xs text-[#94A3B8] mb-3">
                These will be injected into the AI prompt and asked during the interview
              </p>

              {form.custom_questions.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {form.custom_questions.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5"
                    >
                      <span className="text-xs text-[#94A3B8] mt-0.5 shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-sm text-[#0D1B2A] flex-1">{q}</span>
                      <button
                        onClick={() => removeQuestion(i)}
                        className="text-[#94A3B8] hover:text-red-500 transition shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a custom question and press Add"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                  className="flex-1 border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#0052FF] transition placeholder:text-[#94A3B8]"
                />
                <button
                  onClick={addQuestion}
                  className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0D1B2A] text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#0052FF] hover:bg-[#0046DD] text-white font-semibold text-sm py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating role..." : "Create role"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}