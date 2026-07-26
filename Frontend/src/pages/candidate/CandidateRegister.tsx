import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { authenticate, dashboardPath } from "../../services/auth";
import { useRedirectIfAuthenticated } from "../../hooks/useRedirectIfAuthenticated";
import { getApiErrorMessage } from "../../utils/errors";
import AuthLayout from "../../components/ui/AuthLayout";
import PrimaryButton from "../../components/ui/PrimaryButton";
import TextField from "../../components/ui/TextField";

export default function CandidateRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useRedirectIfAuthenticated();

  async function handleSubmit() {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      login(await authenticate("candidate", "register", form));
      navigate(dashboardPath("candidate"));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join to start taking AI voice interviews"
      error={error}
      footerLinks={[
        { prompt: "Already have an account?", to: "/candidate/login", label: "Sign in" },
        { prompt: "Are you a company?", to: "/company/register", label: "Register here" },
      ]}
    >
      <TextField
        label="Full name"
        placeholder="Vivek Dhiman"
        value={form.name}
        onChange={(name) => setForm({ ...form, name })}
      />
      <TextField
        label="Email"
        type="email"
        placeholder="you@email.com"
        value={form.email}
        onChange={(email) => setForm({ ...form, email })}
      />
      <TextField
        label="Password"
        type="password"
        placeholder="Min 8 characters"
        value={form.password}
        onChange={(password) => setForm({ ...form, password })}
        onEnter={handleSubmit}
      />
      <PrimaryButton onClick={handleSubmit} disabled={loading} className="py-2.5 mt-1">
        {loading ? "Creating account..." : "Create account"}
      </PrimaryButton>
    </AuthLayout>
  );
}
