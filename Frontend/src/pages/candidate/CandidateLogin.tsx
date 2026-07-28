import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { authenticate, dashboardPath } from "../../services/auth";
import { useRedirectIfAuthenticated } from "../../hooks/useRedirectIfAuthenticated";
import { getApiErrorMessage } from "../../utils/errors";
import AuthLayout from "../../components/ui/AuthLayout";
import PrimaryButton from "../../components/ui/PrimaryButton";
import TextField from "../../components/ui/TextField";

export default function CandidateLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useRedirectIfAuthenticated();

  async function handleSubmit() {
    setError("");
    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      login(await authenticate("candidate", "login", form));
      navigate(dashboardPath("candidate"));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your candidate account"
      error={error}
      footerLinks={[
        { prompt: "Don't have an account?", to: "/candidate/register", label: "Create one" },
        { prompt: "Are you a company?", to: "/company/login", label: "Sign in here" },
      ]}
    >
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
        placeholder="Your password"
        value={form.password}
        onChange={(password) => setForm({ ...form, password })}
        onEnter={handleSubmit}
      />
      <PrimaryButton onClick={handleSubmit} disabled={loading} className="py-2.5 mt-1">
        {loading ? "Signing in..." : "Sign in"}
      </PrimaryButton>
    </AuthLayout>
  );
}
