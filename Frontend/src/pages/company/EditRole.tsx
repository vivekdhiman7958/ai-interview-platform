import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import AppHeader from "../../components/ui/AppHeader";
import BackButton from "../../components/ui/BackButton";
import LoadingScreen from "../../components/ui/LoadingScreen";
import RoleForm from "../../components/company/RoleForm";
import { getApiErrorMessage, safeJsonParse } from "../../utils/errors";
import type { RoleFormValues } from "../../types/interview";

export default function EditRole() {
  const { roleId } = useParams();
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
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get(`/api/roles/${roleId}`)
      .then((res) => {
        const r = res.data.role;
        setForm({
          title: r.title,
          description: r.description ?? "",
          tech_stack: r.tech_stack,
          difficulty: r.difficulty,
          num_questions: r.num_questions,
          custom_questions:
            safeJsonParse<string[]>(r.custom_questions, "custom questions") ?? [],
        });
      })
      .catch((err) => {
        console.error("Failed to load role", roleId, err);
        setError(getApiErrorMessage(err, "Failed to load role"));
      })
      .finally(() => setFetching(false));
  }, [roleId]);

  async function handleSubmit() {
    setError("");
    if (!form.title || !form.tech_stack) {
      setError("Title and tech stack are required");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/api/roles/${roleId}`, form);
      navigate("/company/dashboard");
    } catch (err: unknown) {
      console.error("Failed to update role", roleId, err);
      setError(getApiErrorMessage(err, "Failed to update role"));
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <LoadingScreen />;

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
          <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">Edit role</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Update the interview configuration for this role
          </p>
        </div>

        <RoleForm
          values={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          submittingLabel="Saving changes..."
          submitting={loading}
          error={error}
        />
      </div>
    </div>
  );
}
