import { useNavigate, useParams } from "react-router-dom";
import SessionDetail from "../../components/interview/SessionDetail";
import LoadingScreen from "../../components/ui/LoadingScreen";
import MessageScreen from "../../components/ui/MessageScreen";
import { useSessionDetail } from "../../hooks/useSessionDetail";

export default function CompanySessionView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, messages, report, loading, error } = useSessionDetail(
    `/api/sessions/${sessionId}`,
    "The report for this session is corrupted and could not be displayed."
  );

  if (loading) return <LoadingScreen />;

  if (!session) {
    return (
      <MessageScreen
        message={error || "Session not found"}
        actionLabel="Back to dashboard"
        onAction={() => navigate("/company/dashboard")}
      />
    );
  }

  return (
    <SessionDetail
      title="Interview Report"
      session={session}
      messages={messages}
      report={report}
      answerLabel="Answer"
      candidateInitial="C"
      onBack={() => navigate(-1)}
      backLabel="← Back"
      missingReportMessage="No report generated yet — interview may still be in progress."
      error={error}
    />
  );
}
