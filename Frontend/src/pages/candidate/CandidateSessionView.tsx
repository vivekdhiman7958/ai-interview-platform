import { useNavigate, useParams } from "react-router-dom";
import SessionDetail from "../../components/interview/SessionDetail";
import LoadingScreen from "../../components/ui/LoadingScreen";
import MessageScreen from "../../components/ui/MessageScreen";
import { useSessionDetail } from "../../hooks/useSessionDetail";

export default function CandidateSessionView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, messages, report, loading } = useSessionDetail(
    `/api/candidate/sessions/${sessionId}`
  );

  if (loading) return <LoadingScreen />;

  if (!session) return <MessageScreen message="Session not found" />;

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
    />
  );
}
