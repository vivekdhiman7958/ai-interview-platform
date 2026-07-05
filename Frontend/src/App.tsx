import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext";

//ALL THE PAGES ARE HERE
import LandingPage from "./pages/LandingPage";
import CompanyRegister from "./pages/company/CompanyRegister";
import CompanyLogin from "./pages/company/CompanyLogin";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CreateRole from "./pages/company/CreateRole";
import CandidatesList from "./pages/company/CandidatesList";
import CompanySessionView from "./pages/company/CompanySessionView";
import CandidateRegister from "./pages/candidate/CandidateRegister";
import CandidateLogin from "./pages/candidate/CandidateLogin";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateSessionView from "./pages/candidate/CandidateSessionView";
import InviteLanding from "./pages/interview/InviteLanding";
import InterviewPage from "./pages/interview/InterviewPage";
import EditRole from "./pages/company/EditRole";

import ProtectedRoute from "./components/ui/ProtectedRoute";

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/company/register" element={<CompanyRegister />} />
      <Route path="/company/login" element={<CompanyLogin />} />
      <Route path="/candidate/register" element={<CandidateRegister />} />
      <Route path="/candidate/login" element={<CandidateLogin />} />
      <Route path="/interview/:token" element={<InviteLanding />} />

      {/* company protected */}
      <Route element={<ProtectedRoute allowedRole="company" />}>
        <Route path="/company/roles/:roleId/edit" element={<EditRole />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/roles/create" element={<CreateRole />} />
        <Route path="/company/roles/:roleId/candidates" element={<CandidatesList />} />
        <Route path="/company/sessions/:sessionId" element={<CompanySessionView />} />
      </Route>

      {/* candidate protected */}
      <Route element={<ProtectedRoute allowedRole="candidate" />}>
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate/sessions/:sessionId" element={<CandidateSessionView />} />
        <Route path="/interview/:token/start" element={<InterviewPage />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}