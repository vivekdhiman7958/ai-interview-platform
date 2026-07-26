import { useNavigate, useParams } from "react-router-dom";
import SessionDetail from "../../components/interview/SessionDetail";
import LoadingScreen from "../../components/ui/LoadingScreen";
import MessageScreen from "../../components/ui/MessageScreen";
import { useSessionDetail } from "../../hooks/useSessionDetail";

export default function CandidateSessionView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, messages, report, loading, error } = useSessionDetail(
    `/api/candidate/sessions/${sessionId}`,
    "Your report is corrupted and could not be displayed."
  );

  if (loading) return <LoadingScreen />;

  if (!session) return <MessageScreen message={error || "Session not found"} />;

  return (
    <SessionDetail
      title="Your Interview Report"
      session={session}
      messages={messages}
      report={report}
      answerLabel="Your answer"
      candidateInitial="Me"
      onBack={() => navigate("/candidate/dashboard")}
      missingReportMessage="No report generated yet."
      error={error}
    />
  );
}
