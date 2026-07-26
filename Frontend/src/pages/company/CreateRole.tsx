import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AppHeader from "../../components/ui/AppHeader";
import BackButton from "../../components/ui/BackButton";
import RoleForm from "../../components/company/RoleForm";
import { getApiErrorMessage } from "../../utils/errors";
import type { RoleFormValues } from "../../types/interview";

export default function CreateRole() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RoleFormValues>({
    title: "",
    description: "",
    tech_stack: "",
    difficulty: "medium",
    num_questions: 5,
    custom_questions: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setError(getApiErrorMessage(err, "Failed to create role"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <AppHeader>
        <BackButton onClick={() => navigate("/company/dashboard")} />
      </AppHeader>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">
            Create interview role
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Define the role requirements and the AI will tailor questions accordingly
          </p>
        </div>

        <RoleForm
          values={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          submitLabel="Create role"
          submittingLabel="Creating role..."
          submitting={loading}
          error={error}
          withPlaceholders
          customQuestionsHint="These will be injected into the AI prompt and asked during the interview"
        />
      </div>
    </div>
  );
}
